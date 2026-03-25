import { useState } from "react";

const DEFAULT_STAMPS: number[] = [0.43, 0.54, 0.75, 0.46, 0.15, 0.17, 0.52, 0.55];

interface SolveResult {
  total: number;
  count: number;
  used: Record<number, number>;
}

interface PickedStamp {
  value: number;
  count: number;
}

interface Result extends SolveResult {
  target: number;
  pickedTotal: number;
  remainder: number;
}

function solve(stamps: number[], target: number): SolveResult | null {
  if (target <= 0) return { total: 0, count: 0, used: {} };
  const maxStamp = Math.max(...stamps);
  const limit = target + maxStamp;
  const dp: number[] = new Array(limit + 1).fill(Infinity);
  const from: number[] = new Array(limit + 1).fill(-1);
  dp[0] = 0;
  for (let i = 1; i <= limit; i++) {
    for (const s of stamps) {
      if (s <= i && dp[i - s] + 1 < dp[i]) {
        dp[i] = dp[i - s] + 1;
        from[i] = s;
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
    const s = from[cur];
    used[s] = (used[s] || 0) + 1;
    cur -= s;
  }
  return { total: best, count: dp[best], used };
}

const fmt = (v: number): string => `$${(v / 100).toFixed(2)}`;

export default function StampCalculator(): JSX.Element {
  const [stampInput, setStampInput] = useState<string>(DEFAULT_STAMPS.join(", "));
  const [postage, setPostage] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string>("");
  const [picked, setPicked] = useState<PickedStamp[]>([]);
  const [pickVal, setPickVal] = useState<string>("");
  const [pickCount, setPickCount] = useState<number>(1);

  const parsedStamps: number[] = [...new Set(
    stampInput.split(/[\s,]+/).map(s => Math.round(parseFloat(s) * 100)).filter(n => !isNaN(n) && n > 0)
  )].sort((a, b) => a - b);

  const pickedTotal: number = picked.reduce((sum, p) => sum + p.value * p.count, 0);

  const addPicked = (): void => {
    const v = Math.round(parseFloat(pickVal) * 100);
    if (isNaN(v) || v <= 0) return;
    const cnt = parseInt(String(pickCount));
    if (isNaN(cnt) || cnt <= 0) return;
    setPicked(prev => {
      const existing = prev.find(p => p.value === v);
      if (existing) return prev.map(p => p.value === v ? { ...p, count: p.count + cnt } : p);
      return [...prev, { value: v, count: cnt }];
    });
    setPickVal("");
    setPickCount(1);
    setResult(null);
  };

  const removePicked = (val: number): void => {
    setPicked(prev => prev.filter(p => p.value !== val));
    setResult(null);
  };

  const updatePickedCount = (val: number, cnt: number): void => {
    if (cnt <= 0) { removePicked(val); return; }
    setPicked(prev => prev.map(p => p.value === val ? { ...p, count: cnt } : p));
    setResult(null);
  };

  const calculate = (): void => {
    setError("");
    setResult(null);
    if (parsedStamps.length === 0) { setError("Please enter at least one stamp value."); return; }
    const target = Math.round(parseFloat(postage) * 100);
    if (isNaN(target) || target <= 0) { setError("Please enter a valid postage amount."); return; }

    const remainder = target - pickedTotal;

    if (remainder <= 0) {
      setResult({ total: pickedTotal, count: picked.reduce((s, p) => s + p.count, 0), used: {}, target, pickedTotal, remainder: 0 });
      return;
    }

    const res = solve(parsedStamps, remainder);
    if (!res) { setError("No solution found with these stamp values."); return; }
    setResult({ ...res, target, pickedTotal, remainder });
  };

  const totalPaid: number = result ? pickedTotal + (result.remainder > 0 ? result.total : 0) : 0;

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 520, margin: "40px auto", padding: "0 16px" }}>
      <h2 style={{ marginBottom: 4 }}>📮 Stamp Calculator</h2>
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>Find the minimum postage that covers your required amount.</p>

      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        Available Stamp Values ($, comma or space separated)
      </label>
      <textarea
        value={stampInput}
        onChange={e => { setStampInput(e.target.value); setResult(null); }}
        rows={2}
        style={{ width: "100%", padding: 8, fontSize: 14, borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box", resize: "vertical" }}
        placeholder="e.g. 0.15, 0.17, 0.43, 0.55"
      />

      <div style={{ marginTop: 20, padding: 14, background: "#f8faff", border: "1px solid #c7d7f9", borderRadius: 10 }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>📌 Stamps already picked</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
          <input
            type="number" value={pickVal} onChange={e => setPickVal(e.target.value)}
            placeholder="Value (e.g. 0.17)" min={0.01} step={0.01}
            style={{ flex: 2, padding: 7, fontSize: 14, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <input
            type="number" value={pickCount} onChange={e => setPickCount(+e.target.value)}
            placeholder="Qty" min={1}
            style={{ flex: 1, padding: 7, fontSize: 14, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <button onClick={addPicked} style={{
            padding: "7px 14px", background: "#4f46e5", color: "#fff",
            border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", fontWeight: 600
          }}>Add</button>
        </div>

        {picked.length === 0
          ? <div style={{ color: "#aaa", fontSize: 13 }}>No stamps picked yet. Add stamps you've already set aside.</div>
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {picked.map(p => (
                <div key={p.value} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #c7d7f9", borderRadius: 8, padding: "6px 10px" }}>
                  <span style={{ fontSize: 16 }}>🏷️</span>
                  <span style={{ fontWeight: 700, minWidth: 48 }}>{fmt(p.value)}</span>
                  <span style={{ color: "#666", fontSize: 13 }}>×</span>
                  <input
                    type="number" value={p.count} min={1}
                    onChange={e => updatePickedCount(p.value, parseInt(e.target.value))}
                    style={{ width: 52, padding: "3px 6px", borderRadius: 5, border: "1px solid #ccc", fontSize: 14 }}
                  />
                  <span style={{ color: "#888", fontSize: 13, marginLeft: 2 }}>= {fmt(p.value * p.count)}</span>
                  <button onClick={() => removePicked(p.value)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
              ))}
              <div style={{ textAlign: "right", fontSize: 13, fontWeight: 600, color: "#4f46e5", marginTop: 2 }}>
                Subtotal: {fmt(pickedTotal)}
              </div>
            </div>
          )
        }
      </div>

      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, marginTop: 20 }}>
        Required Postage ($)
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number" value={postage}
          onChange={e => { setPostage(e.target.value); setResult(null); }}
          onKeyDown={e => e.key === "Enter" && calculate()}
          style={{ flex: 1, padding: 8, fontSize: 16, borderRadius: 6, border: "1px solid #ccc" }}
          placeholder="e.g. 3.65" min={0.01} step={0.01}
        />
        <button onClick={calculate} style={{
          padding: "8px 20px", background: "#2563eb", color: "#fff",
          border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer", fontWeight: 600
        }}>Calculate</button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: "#fee2e2", borderRadius: 8, color: "#b91c1c" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 20, padding: 16, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: "#666" }}>You pay</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#15803d" }}>{fmt(totalPaid)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#666" }}>Total stamps</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1d4ed8" }}>
                {picked.reduce((s, p) => s + p.count, 0) + result.count}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "#666" }}>Overpay</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: totalPaid === result.target ? "#15803d" : "#d97706" }}>
                +{fmt(totalPaid - result.target)}
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: 12 }}>
            {picked.length > 0 && (
              <>
                <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#4f46e5" }}>
                  Already picked ({fmt(pickedTotal)}):
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {picked.map(p => (
                    <div key={p.value} style={{ display: "flex", alignItems: "center", gap: 6, background: "#ede9fe", border: "1px solid #a5b4fc", borderRadius: 8, padding: "6px 12px", fontSize: 14 }}>
                      <span>📌</span>
                      <span style={{ fontWeight: 700 }}>{fmt(p.value)}</span>
                      <span style={{ color: "#666" }}>× {p.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {result.remainder > 0 && (
              <>
                <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#15803d" }}>
                  Still needed for remaining {fmt(result.remainder)} ({fmt(result.total)} covered):
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(result.used).filter(([, c]) => c > 0).sort((a, b) => +b[0] - +a[0]).map(([val, cnt]) => (
                    <div key={val} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #86efac", borderRadius: 8, padding: "6px 12px", fontSize: 14 }}>
                      <span>🏷️</span>
                      <span style={{ fontWeight: 700 }}>{fmt(+val)}</span>
                      <span style={{ color: "#666" }}>× {cnt}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {result.remainder <= 0 && (
              <div style={{ color: "#15803d", fontWeight: 600, fontSize: 14 }}>
                ✅ Your picked stamps already cover the postage!
              </div>
            )}
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, color: "#aaa", marginTop: 20 }}>
        All values in dollars. The calculator subtracts your picked stamps from the required postage and finds the optimal combination for the remainder.
      </p>
    </div>
  );
}