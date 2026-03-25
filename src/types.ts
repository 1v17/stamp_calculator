export interface SolveResult {
  total: number;
  count: number;
  used: Record<number, number>;
}

export interface PickedStamp {
  value: number;
  count: number;
}

export interface Result extends SolveResult {
  target: number;
  remainder: number;
}
