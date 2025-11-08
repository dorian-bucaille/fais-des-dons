import { describe, expect, it } from "vitest";
import { calculate } from "./calc";
import type { Inputs } from "./types";

const baseInputs = (): Inputs => ({
  year: 2025,
  taxableIncome: 40_000,
  frequency: "once",
  objective: { type: "donation_target", amount: 0 },
  expertMode: false,
  trFaceValue: 8,
  trQuantity: 0,
  trEmployerRate: 60,
  trEmployeeRate: 40,
});

describe("calculate — fiscal rules", () => {
  it("applies 75% then 66% with reduction and cost", () => {
    const inputs: Inputs = {
      ...baseInputs(),
      objective: { type: "donation_target", amount: 8000 },
    };
    const result = calculate(inputs);

    expect(result.details.base75).toBeCloseTo(1000, 2);
    expect(result.details.base66).toBeCloseTo(7000, 2);
    expect(result.details.reduction).toBeCloseTo(5370, 2);
    expect(result.costs.afterReduction).toBeCloseTo(2630, 1);
    expect(result.donation.total).toBeCloseTo(8000, 1);
  });

  it("finds donation that matches a target net cost", () => {
    const inputs: Inputs = {
      ...baseInputs(),
      objective: { type: "net_cost_target", cost: 2630 },
    };
    const result = calculate(inputs);

    expect(result.donation.total).toBeCloseTo(8000, 0);
    expect(result.costs.afterReduction).toBeCloseTo(2630, 1);
    expect(result.objective.achieved).toBe(true);
  });

  it("computes report when donation exceeds 20% cap", () => {
    const inputs: Inputs = {
      ...baseInputs(),
      objective: { type: "donation_target", amount: 10_000 },
    };
    const result = calculate(inputs);

    expect(result.details.baseTotalRetained).toBeCloseTo(8000, 2);
    expect(result.details.report).toBeCloseTo(2000, 2);
    expect(result.infoMessages).toContain("report");
  });

  it("handles TR mix with employee and employer cost", () => {
    const inputs: Inputs = {
      ...baseInputs(),
      expertMode: true,
      trQuantity: 50,
      objective: { type: "donation_target", amount: 2000 },
    };
    const result = calculate(inputs);

    expect(result.tr.enabled).toBe(true);
    expect(result.donation.trUsed).toBeGreaterThan(0);
    expect(result.costs.beforeReduction).toBeCloseTo(result.donation.cash + result.tr.employeePart, 2);
    expect(result.costs.includingEmployer).toBeDefined();
    expect(result.costs.includingEmployer).not.toBe(result.costs.afterReduction);
  });

  it("flags invalid TR split when rates do not sum to 100%", () => {
    const inputs: Inputs = {
      ...baseInputs(),
      expertMode: true,
      trEmployerRate: 80,
      trEmployeeRate: 10,
      trQuantity: 10,
      objective: { type: "donation_target", amount: 1000 },
    };
    const result = calculate(inputs);

    expect(result.tr.isSplitValid).toBe(false);
    expect(result.warnings).toContain("tr_split_invalid");
  });
});

