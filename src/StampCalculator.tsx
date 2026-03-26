import { useState, useMemo } from "react";
import { DEFAULT_STAMPS, fmt, solve } from "./solve";
import { StampChip } from "./StampChip";
import type { PickedStamp, Result } from "./types";
import s from "./StampCalculator.module.css";

export default function StampCalculator(): JSX.Element {
  const [stamps, setStamps] = useState<number[]>(DEFAULT_STAMPS.map(v => Math.round(v * 100)));
  const [stampAddVal, setStampAddVal] = useState<string>("");
  const [postage, setPostage] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string>("");
  const [picked, setPicked] = useState<PickedStamp[]>([]);
  const [pickVal, setPickVal] = useState<string>("");
  const [pickCount, setPickCount] = useState<number>(1);

  const addStamp = (): void => {
    const v = Math.round(parseFloat(stampAddVal) * 100);
    if (isNaN(v) || v <= 0) return;
    setStamps(prev => prev.includes(v) ? prev : [...prev, v].sort((a, b) => a - b));
    setStampAddVal("");
    setResult(null);
  };

  const removeStamp = (v: number): void => {
    setStamps(prev => prev.filter(d => d !== v));
    setResult(null);
  };

  const pickedTotal = useMemo<number>(
    () => picked.reduce((sum, p) => sum + p.value * p.count, 0),
    [picked]
  );

  const pickedStampCount = useMemo<number>(
    () => picked.reduce((acc, p) => acc + p.count, 0),
    [picked]
  );

  const addPicked = (): void => {
    const v = Math.round(parseFloat(pickVal) * 100);
    if (isNaN(v) || v <= 0) return;
    const cnt = Math.trunc(pickCount);
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
    if (stamps.length === 0) { setError("Please enter at least one stamp value."); return; }
    const target = Math.round(parseFloat(postage) * 100);
    if (isNaN(target) || target <= 0) { setError("Please enter a valid postage amount."); return; }

    const remainder = target - pickedTotal;

    if (remainder <= 0) {
      setResult({ total: pickedTotal, count: pickedStampCount, used: {}, target, remainder: 0 });
      return;
    }

    const res = solve(stamps, remainder);
    if (!res) { setError("No solution found with these stamp values."); return; }
    setResult({ ...res, target, remainder });
  };

  const totalPaid = result ? pickedTotal + (result.remainder > 0 ? result.total : 0) : 0;

  return (
    <div className={s.wrapper}>
      <h2 className={s.title}>Stamp Calculator</h2>
      <p className={s.subtitle}>Find the minimum postage that covers your required amount.</p>

      <label className={s.label}>Available Stamp Values</label>
      <div className={s.stampTiles}>
        {stamps.map(v => (
          <div key={v} className={s.stampTile}>
            <span>{fmt(v)}</span>
            <button onClick={() => removeStamp(v)} className={s.stampTileRemove}>×</button>
          </div>
        ))}
        <div className={s.stampAddTile}>
          <input
            type="number"
            value={stampAddVal}
            onChange={e => setStampAddVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addStamp()}
            placeholder="0.00"
            min={0.01} step={0.01}
            className={s.stampAddInput}
          />
          <button onClick={addStamp} className={s.stampAddBtn}>+</button>
        </div>
      </div>

      <div className={s.pickedSection}>
        <div className={s.pickedHeader}>Stamps already picked</div>
        <div className={s.addRow}>
          <input
            type="number" value={pickVal} onChange={e => setPickVal(e.target.value)}
            placeholder="Value (e.g. 0.17)" min={0.01} step={0.01}
            className={s.input} style={{ flex: 2 }}
          />
          <input
            type="number" value={pickCount} onChange={e => setPickCount(+e.target.value)}
            placeholder="Qty" min={1}
            className={s.input} style={{ flex: 1 }}
          />
          <button onClick={addPicked} className={s.addBtn}>Add</button>
        </div>

        {picked.length === 0
          ? <div className={s.pickedEmpty}>No stamps picked yet. Add stamps you've already set aside.</div>
          : (
            <div className={s.pickedList}>
              {picked.map(p => (
                <div key={p.value} className={s.pickedItem}>
                  <span className={s.pickedValue}>{fmt(p.value)}</span>
                  <span className={s.pickedSep}>×</span>
                  <input
                    type="number" value={p.count} min={1}
                    onChange={e => {
                      const raw = e.target.value;
                      const nextCount = Math.trunc(Number(raw));
                      updatePickedCount(p.value, isNaN(nextCount) ? 0 : nextCount);
                    }}
                    className={s.qtyInput}
                  />
                  <span className={s.pickedLineTotal}>= {fmt(p.value * p.count)}</span>
                  <button onClick={() => removePicked(p.value)} className={s.removeBtn}>×</button>
                </div>
              ))}
              <div className={s.pickedSubtotal}>Subtotal: {fmt(pickedTotal)}</div>
            </div>
          )
        }
      </div>

      <label className={s.labelTop}>
        Required Postage ($)
      </label>
      <div className={s.postageRow}>
        <input
          type="number" value={postage}
          onChange={e => { setPostage(e.target.value); setResult(null); }}
          onKeyDown={e => e.key === "Enter" && calculate()}
          className={s.postageInput}
          placeholder="e.g. 3.65" min={0.01} step={0.01}
        />
        <button onClick={calculate} className={s.calcBtn}>Calculate</button>
      </div>

      {error && <div className={s.error}>{error}</div>}

      {result && (
        <div className={s.result}>
          <div className={s.stats}>
            <div>
              <div className={s.statLabel}>You pay</div>
              <div className={`${s.statValue} ${s.colorGreen}`}>{fmt(totalPaid)}</div>
            </div>
            <div className={s.statCenter}>
              <div className={s.statLabel}>Total stamps</div>
              <div className={`${s.statValue} ${s.colorBlue}`}>{pickedStampCount + result.count}</div>
            </div>
            <div className={s.statRight}>
              <div className={s.statLabel}>Overpay</div>
              <div className={`${s.statValue} ${totalPaid === result.target ? s.colorGreen : s.colorAmber}`}>
                +{fmt(totalPaid - result.target)}
              </div>
            </div>
          </div>

          <div className={s.resultDetail}>
            {picked.length > 0 && (
              <>
                <div className={`${s.sectionLabel} ${s.colorIndigo}`}>
                  Already picked ({fmt(pickedTotal)}):
                </div>
                <div className={s.chipRowMb}>
                  {picked.map(p => <StampChip key={p.value} value={p.value} count={p.count} variant="picked" />)}
                </div>
              </>
            )}

            {result.remainder > 0 && (
              <>
                <div className={`${s.sectionLabel} ${s.colorGreen}`}>
                  Still needed for remaining {fmt(result.remainder)}:
                </div>
                <div className={s.chipRow}>
                  {Object.entries(result.used)
                    .filter(([, c]) => c > 0)
                    .sort((a, b) => +b[0] - +a[0])
                    .map(([val, cnt]) => <StampChip key={val} value={+val} count={cnt} variant="needed" />)}
                </div>
              </>
            )}

            {result.remainder <= 0 && (
              <div className={`${s.coveredMsg} ${s.colorGreen}`}>
                Your picked stamps already cover the postage!
              </div>
            )}
          </div>
        </div>
      )}

      <p className={s.footer}>
        All values in dollars. The calculator subtracts your picked stamps from the required postage and finds the optimal combination for the remainder.
      </p>
    </div>
  );
}
