import { round2 } from "./format";
import type {
  CalculationDetails,
  CalculationObjectiveState,
  Inputs,
  ObjectiveInput,
  Result,
  TaxConfig,
} from "./types";

export const TAX_CONFIGS: TaxConfig[] = [
  {
    year: 2025,
    cap75Euros: 1000,
    cap20Rate: 0.2,
    rate75: 0.75,
    rate66: 0.66,
  },
];

export function getTaxConfig(year: number): TaxConfig {
  return TAX_CONFIGS.find((config) => config.year === year) ?? TAX_CONFIGS[0];
}

type Sanitized = Inputs & {
  objective: ObjectiveInput;
};

const clampNumber = (value: number, min = 0, max = Number.POSITIVE_INFINITY) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const sanitizeInputs = (inputs: Inputs): Sanitized => {
  const objective = inputs.objective ?? { type: "max_advantage" as const };
  let sanitizedObjective: ObjectiveInput = objective;
  if (objective.type === "donation_target") {
    sanitizedObjective = { type: "donation_target", amount: Math.max(0, objective.amount ?? 0) };
  } else if (objective.type === "net_cost_target") {
    sanitizedObjective = { type: "net_cost_target", cost: Math.max(0, objective.cost ?? 0) };
  }

  return {
    year: Math.round(inputs.year) || getTaxConfig(inputs.year).year,
    taxableIncome: Math.max(0, inputs.taxableIncome ?? 0),
    frequency: inputs.frequency === "monthly" ? "monthly" : "once",
    objective: sanitizedObjective,
    expertMode: Boolean(inputs.expertMode),
    trFaceValue: Math.max(0, inputs.trFaceValue ?? 0),
    trQuantity: Math.max(0, inputs.trQuantity ?? 0),
    trEmployerRate: clampNumber(inputs.trEmployerRate ?? 0, 0, 100),
    trEmployeeRate: clampNumber(inputs.trEmployeeRate ?? 0, 0, 100),
  };
};

const computeDonationTotal = (
  inputs: Sanitized,
  config: TaxConfig,
  multiplier: number,
  computeCost: (donation: number) => number,
): {
  donation: number;
  objective: CalculationObjectiveState;
  warnings: string[];
} => {
  const cap20 = inputs.taxableIncome * config.cap20Rate;
  const warnings: string[] = [];
  let donation = 0;
  const objective: CalculationObjectiveState = {
    type: inputs.objective.type,
    achieved: true,
  };

  if (inputs.objective.type === "max_advantage") {
    donation = cap20;
  } else if (inputs.objective.type === "donation_target") {
    donation = inputs.objective.amount * multiplier;
    objective.targetAnnual = donation;
    objective.targetPeriodic = inputs.objective.amount;
  } else if (inputs.objective.type === "net_cost_target") {
    const target = inputs.objective.cost * multiplier;
    objective.targetAnnual = target;
    objective.targetPeriodic = inputs.objective.cost;

    const tolerance = 0.5;
    const maxIterations = 80;
    let low = 0;
    let high = Math.max(cap20 * 2, target * 3 + 1000, 1000);

    const costAt = (donationValue: number) => computeCost(donationValue);
    let lowCost = costAt(low);
    let highCost = costAt(high);

    const maxCap = inputs.taxableIncome * 0.5 + target + 1000;
    let safetyIterations = 0;
    while (highCost < target && high < maxCap && safetyIterations < 32) {
      high *= 2;
      highCost = costAt(high);
      safetyIterations += 1;
    }

    if (highCost < target) {
      objective.achieved = false;
      objective.maxCostAnnual = highCost;
      warnings.push("objective_unreachable");
      donation = high;
    } else if (lowCost > target) {
      objective.achieved = false;
      objective.minCostAnnual = lowCost;
      warnings.push("objective_unreachable_low");
      donation = low;
    } else {
      for (let i = 0; i < maxIterations; i += 1) {
        const mid = (low + high) / 2;
        const midCost = costAt(mid);
        if (Math.abs(midCost - target) <= tolerance) {
          donation = mid;
          break;
        }
        if (midCost < target) {
          low = mid;
          lowCost = midCost;
        } else {
          high = mid;
        }
        donation = mid;
      }
      donation = Math.max(0, donation);
    }
  }

  return { donation, objective, warnings };
};

type BaseComputation = CalculationDetails & {
  cap75Usage: number;
  cap20Usage: number;
};

const computeBases = (donation: number, config: TaxConfig, taxableIncome: number): BaseComputation => {
  const cap75 = config.cap75Euros;
  const cap20 = taxableIncome * config.cap20Rate;

  const base75 = Math.min(cap75, donation);
  const base66Theoretical = Math.max(0, donation - base75);
  const baseTotalBefore20 = base75 + base66Theoretical;
  const baseTotalRetained = Math.min(baseTotalBefore20, cap20);
  const base66 = Math.max(0, baseTotalRetained - base75);
  const report = Math.max(0, baseTotalBefore20 - cap20);
  const reduction = base75 * config.rate75 + base66 * config.rate66;

  const cap75Usage = cap75 === 0 ? 0 : Math.min(1, base75 / cap75);
  const cap20Usage = cap20 === 0 ? 0 : Math.min(1, baseTotalRetained / cap20);

  return {
    base75,
    base66Theoretical,
    baseTotalBefore20,
    baseTotalRetained,
    base66,
    reduction,
    report,
    cap75Usage,
    cap20Usage,
  };
};

export function calculate(inputs: Inputs): Result {
  const sanitized = sanitizeInputs(inputs);
  const config = getTaxConfig(sanitized.year);
  const multiplier = sanitized.frequency === "monthly" ? 12 : 1;

  const rawEmployeeRate = sanitized.trEmployeeRate / 100;
  const rawEmployerRate = sanitized.trEmployerRate / 100;
  const ratesSum = rawEmployeeRate + rawEmployerRate;
  const isSplitValid = Math.abs(ratesSum - 1) < 1e-4;
  const normEmployeeRate = ratesSum > 0 ? rawEmployeeRate / ratesSum : 0;
  const normEmployerRate = ratesSum > 0 ? rawEmployerRate / ratesSum : 0;

  const trNominal = sanitized.expertMode
    ? sanitized.trFaceValue * sanitized.trQuantity * multiplier
    : 0;

  const donationPreview = (donationValue: number) => {
    const trUsed = Math.min(trNominal, Math.max(0, donationValue));
    const cash = Math.max(0, donationValue - trUsed);
    const employeePart = trUsed * normEmployeeRate;
    const beforeReduction = cash + employeePart;
    const bases = computeBases(donationValue, config, sanitized.taxableIncome);
    const costAfterReduction = beforeReduction - bases.reduction;
    return costAfterReduction;
  };

  const { donation, objective, warnings } = computeDonationTotal(
    sanitized,
    config,
    multiplier,
    donationPreview,
  );

  const trUsed = Math.min(trNominal, Math.max(0, donation));
  const cashDonation = Math.max(0, donation - trUsed);
  const employeePart = trUsed * normEmployeeRate;
  const employerPart = trUsed * normEmployerRate;

  const bases = computeBases(donation, config, sanitized.taxableIncome);

  const beforeReduction = cashDonation + employeePart;
  const afterReduction = beforeReduction - bases.reduction;
  const includingEmployer = sanitized.expertMode
    ? beforeReduction + employerPart - bases.reduction
    : undefined;

  const infoMessages: string[] = [];
  if (bases.report > 0) {
    infoMessages.push("report");
  }
  if (trNominal > 0 && trUsed < trNominal - 1e-6) {
    infoMessages.push("tr_not_fully_used");
  }

  if (!isSplitValid && sanitized.expertMode) {
    warnings.push("tr_split_invalid");
  }
  if (bases.baseTotalBefore20 > sanitized.taxableIncome * config.cap20Rate) {
    warnings.push("cap20_reached");
  }

  const steps: string[] = [];
  steps.push(
    `Base 75% = min(${config.cap75Euros.toFixed(2)}, ${donation.toFixed(2)}) = ${bases.base75.toFixed(2)}`,
  );
  steps.push(
    `Base 66% théorique = max(0, ${donation.toFixed(2)} − ${bases.base75.toFixed(2)}) = ${bases.base66Theoretical.toFixed(2)}`,
  );
  steps.push(
    `Plafond global 20% = ${sanitized.taxableIncome.toFixed(2)} × ${(config.cap20Rate * 100).toFixed(0)}% = ${(sanitized.taxableIncome * config.cap20Rate).toFixed(2)}`,
  );
  steps.push(
    `Base retenue avant 20% = ${bases.base75.toFixed(2)} + ${bases.base66Theoretical.toFixed(2)} = ${bases.baseTotalBefore20.toFixed(2)}`,
  );
  steps.push(
    `Base retenue après 20% = min(${bases.baseTotalBefore20.toFixed(2)}, ${(sanitized.taxableIncome * config.cap20Rate).toFixed(2)}) = ${bases.baseTotalRetained.toFixed(2)}`,
  );
  steps.push(
    `Base 66% finale = max(0, ${bases.baseTotalRetained.toFixed(2)} − ${bases.base75.toFixed(2)}) = ${bases.base66.toFixed(2)}`,
  );
  steps.push(
    `Réduction = ${bases.base75.toFixed(2)} × ${(config.rate75 * 100).toFixed(0)}% + ${bases.base66.toFixed(2)} × ${(config.rate66 * 100).toFixed(0)}% = ${bases.reduction.toFixed(2)}`,
  );

  const result: Result = {
    inputs: sanitized,
    config,
    multiplier,
    donation: {
      total: round2(donation),
      totalPeriodic: round2(donation / multiplier),
      cash: round2(cashDonation),
      trNominal: round2(trNominal),
      trUsed: round2(trUsed),
    },
    tr: {
      enabled: sanitized.expertMode,
      faceValue: sanitized.trFaceValue,
      quantity: sanitized.trQuantity,
      employeePart: round2(employeePart),
      employerPart: round2(employerPart),
      employeeRate: normEmployeeRate,
      employerRate: normEmployerRate,
      isSplitValid,
    },
    costs: {
      beforeReduction: round2(beforeReduction),
      afterReduction: round2(afterReduction),
      includingEmployer: sanitized.expertMode ? round2(includingEmployer ?? afterReduction) : undefined,
    },
    caps: {
      cap75: config.cap75Euros,
      cap20: sanitized.taxableIncome * config.cap20Rate,
      cap75Usage: bases.cap75Usage,
      cap20Usage: bases.cap20Usage,
    },
    details: {
      base75: round2(bases.base75),
      base66Theoretical: round2(bases.base66Theoretical),
      baseTotalBefore20: round2(bases.baseTotalBefore20),
      baseTotalRetained: round2(bases.baseTotalRetained),
      base66: round2(bases.base66),
      reduction: round2(bases.reduction),
      report: round2(bases.report),
    },
    warnings,
    infoMessages,
    objective,
    steps,
  };

  return result;
}

