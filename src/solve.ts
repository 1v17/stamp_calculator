import type { SolveResult } from "./types";

export const DEFAULT_STAMPS: number[] = [0.01, 0.04, 0.07, 0.1, 0.15, 0.35, 0.45, 0.52, 0.54, 0.59, 0.65, 0.67];

export function solve(stamps: number[], target: number): SolveResult | null {
  if (!Number.isFinite(target) || !Number.isInteger(target)) return null;
  if (target <= 0) return { total: 0, count: 0, used: {} };
  if (stamps.length === 0) return null;
  if (stamps.some(st => !Number.isFinite(st) || !Number.isInteger(st) || st <= 0)) return null;

  const maxStamp = Math.max(...stamps);
  const limit = target + maxStamp;
  const dp: number[] = new Array(limit + 1).fill(Infinity);
  const from: number[] = new Array(limit + 1).fill(-1);
  dp[0] = 0;
  for (let i = 1; i <= limit; i++) {
    for (const st of stamps) {
      if (st <= i && dp[i - st] + 1 < dp[i]) {
        dp[i] = dp[i - st] + 1;
        from[i] = st;
      }
    }
  }
  let best = -1;
  for (let i = target; i <= limit; i++) {
    if (dp[i] < Infinity) { best = i; break; }
  }
  if (best === -1) return null;
  const used: Record<number, number> = {};
  let cur = best;
  while (cur > 0) {
    const st = from[cur];
    used[st] = (used[st] || 0) + 1;
    cur -= st;
  }
  return { total: best, count: dp[best], used };
}

export const fmt = (v: number): string => `$${(v / 100).toFixed(2)}`;
