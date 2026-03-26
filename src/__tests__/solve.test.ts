import { solve, fmt, DEFAULT_STAMPS } from '../solve';
import {describe, it, expect} from '@jest/globals';


describe('fmt', () => {
  it('formats whole dollar amounts', () => {
    expect(fmt(100)).toBe('$1.00');
    expect(fmt(1000)).toBe('$10.00');
    expect(fmt(10000)).toBe('$100.00');
  });

  it('formats cents-only amounts', () => {
    expect(fmt(1)).toBe('$0.01');
    expect(fmt(50)).toBe('$0.50');
    expect(fmt(99)).toBe('$0.99');
  });

  it('formats mixed dollar and cent amounts', () => {
    expect(fmt(599)).toBe('$5.99');
    expect(fmt(101)).toBe('$1.01');
    expect(fmt(1075)).toBe('$10.75');
  });

  it('formats zero', () => {
    expect(fmt(0)).toBe('$0.00');
  });
});

// ---------------------------------------------------------------------------
// solve — early-return for non-positive targets
// ---------------------------------------------------------------------------
describe('solve - target ≤ 0', () => {
  it('returns zero result for target = 0', () => {
    expect(solve([25, 43], 0)).toEqual({ total: 0, count: 0, used: {} });
  });

  it('returns zero result for negative target', () => {
    expect(solve([25, 43], -10)).toEqual({ total: 0, count: 0, used: {} });
  });
});

// ---------------------------------------------------------------------------
// solve — exact matches
// ---------------------------------------------------------------------------
describe('solve - exact matches', () => {
  it('handles a single stamp matching the target', () => {
    const result = solve([25], 25);
    expect(result).not.toBeNull();
    expect(result!.total).toBe(25);
    expect(result!.count).toBe(1);
    expect(result!.used[25]).toBe(1);
  });

  it('uses multiple of the same stamp for exact match', () => {
    const result = solve([20], 40);
    expect(result).not.toBeNull();
    expect(result!.total).toBe(40);
    expect(result!.count).toBe(2);
    expect(result!.used[20]).toBe(2);
  });

  it('selects minimum stamps among multiple options', () => {
    // 25+5 = 30 (2 stamps) vs 10+10+10 = 30 (3 stamps)
    const result = solve([5, 10, 25], 30);
    expect(result).not.toBeNull();
    expect(result!.total).toBe(30);
    expect(result!.count).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// solve — DP beats greedy
// ---------------------------------------------------------------------------
describe('solve - DP optimality', () => {
  it('finds 2-stamp solution that greedy misses', () => {
    // Greedy would pick 10 first → 10+1+1 = 3 stamps; DP picks 6+6 = 2 stamps
    const result = solve([1, 6, 10], 12);
    expect(result).not.toBeNull();
    expect(result!.count).toBe(2);
    expect(result!.total).toBe(12);
  });

  it('prefers fewer stamps over smaller denominations', () => {
    // stamps: 1¢, 3¢, 4¢  target: 6
    // greedy: 4+1+1 = 3; optimal: 3+3 = 2
    const result = solve([1, 3, 4], 6);
    expect(result).not.toBeNull();
    expect(result!.count).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// solve — overpay
// ---------------------------------------------------------------------------
describe('solve - overpay', () => {
  it('overpays by the smallest possible amount', () => {
    // stamps=[20, 50], target=30 → cheapest ≥30 is 40 (2×20)
    const result = solve([20, 50], 30);
    expect(result).not.toBeNull();
    expect(result!.total).toBe(40);
    expect(result!.count).toBe(2);
  });

  it('overpays with a single stamp when target < smallest stamp', () => {
    // stamps=[3], target=1 → must use one 3¢ stamp
    const result = solve([3], 1);
    expect(result).not.toBeNull();
    expect(result!.total).toBe(3);
    expect(result!.count).toBe(1);
    expect(result!.used[3]).toBe(1);
  });

  it('finds minimal overpay among multiple stamp sizes', () => {
    // stamps=[3], target=5 → two 3¢ stamps = 6¢
    const result = solve([3], 5);
    expect(result).not.toBeNull();
    expect(result!.total).toBe(6);
    expect(result!.count).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// solve — result structure integrity
// ---------------------------------------------------------------------------
describe('solve - result structure', () => {
  it('used values sum to total', () => {
    const stamps = [15, 43, 75];
    const target = 100;
    const result = solve(stamps, target);
    expect(result).not.toBeNull();
    const sum = Object.entries(result!.used).reduce(
      (acc, [val, cnt]) => acc + Number(val) * cnt,
      0,
    );
    expect(sum).toBe(result!.total);
  });

  it('count equals sum of quantities in used', () => {
    const result = solve([10, 25, 50], 60);
    expect(result).not.toBeNull();
    const totalCount = Object.values(result!.used).reduce((a, b) => a + b, 0);
    expect(totalCount).toBe(result!.count);
  });

  it('total is >= target', () => {
    const result = solve([17, 34], 50);
    expect(result).not.toBeNull();
    expect(result!.total).toBeGreaterThanOrEqual(50);
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_STAMPS
// ---------------------------------------------------------------------------
describe('DEFAULT_STAMPS', () => {
  it('is a non-empty array of numbers', () => {
    expect(Array.isArray(DEFAULT_STAMPS)).toBe(true);
    expect(DEFAULT_STAMPS.length).toBeGreaterThan(0);
  });

  it('has 9 entries', () => {
    expect(DEFAULT_STAMPS).toHaveLength(9);
  });

  it('all entries are positive numbers', () => {
    DEFAULT_STAMPS.forEach(v => {
      expect(typeof v).toBe('number');
      expect(v).toBeGreaterThan(0);
    });
  });
});
