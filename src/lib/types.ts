export type Frequency = "once" | "monthly";

export type ObjectiveType =
  | "max_advantage"
  | "donation_target"
  | "net_cost_target";

export type ObjectiveInput =
  | { type: "max_advantage" }
  | { type: "donation_target"; amount: number }
  | { type: "net_cost_target"; cost: number };

export type Inputs = {
  year: number;
  taxableIncome: number;
  frequency: Frequency;
  objective: ObjectiveInput;
  expertMode: boolean;
  trFaceValue: number;
  trQuantity: number;
  trEmployerRate: number; // expressed as percentage (0-100)
  trEmployeeRate: number; // expressed as percentage (0-100)
};

export type TaxConfig = {
  year: number;
  cap75Euros: number;
  cap20Rate: number;
  rate75: number;
  rate66: number;
};

export type CalculationDetails = {
  base75: number;
  base66Theoretical: number;
  baseTotalBefore20: number;
  baseTotalRetained: number;
  base66: number;
  reduction: number;
  report: number;
};

export type CalculationObjectiveState = {
  type: ObjectiveType;
  targetAnnual?: number;
  targetPeriodic?: number;
  achieved: boolean;
  minCostAnnual?: number;
  maxCostAnnual?: number;
  message?: string;
};

export type Result = {
  inputs: Inputs;
  config: TaxConfig;
  multiplier: number;
  donation: {
    total: number;
    totalPeriodic: number;
    cash: number;
    trNominal: number;
    trUsed: number;
  };
  tr: {
    enabled: boolean;
    faceValue: number;
    quantity: number;
    employeePart: number;
    employerPart: number;
    employeeRate: number;
    employerRate: number;
    isSplitValid: boolean;
  };
  costs: {
    beforeReduction: number;
    afterReduction: number;
    includingEmployer?: number;
  };
  caps: {
    cap75: number;
    cap20: number;
    cap75Usage: number;
    cap20Usage: number;
  };
  details: CalculationDetails;
  warnings: string[];
  infoMessages: string[];
  objective: CalculationObjectiveState;
  steps: string[];
};

