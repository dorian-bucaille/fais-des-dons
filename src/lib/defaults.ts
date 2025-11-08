import type { Inputs } from "./types";

export const DEFAULT_INPUTS: Inputs = {
  year: 2025,
  taxableIncome: 0,
  frequency: "once",
  objective: { type: "max_advantage" },
  expertMode: false,
  trFaceValue: 8.5,
  trQuantity: 0,
  trEmployerRate: 60,
  trEmployeeRate: 40,
};
