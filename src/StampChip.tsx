import { fmt } from "./solve";
import s from "./StampCalculator.module.css";

interface StampChipProps {
  value: number;
  count: number;
  variant: "picked" | "needed";
}

export function StampChip({ value, count, variant }: StampChipProps) {
  return (
    <div className={`${s.chip} ${variant === "picked" ? s.chipPicked : s.chipNeeded}`}>
      <span className={s.chipVal}>{fmt(value)}</span>
      <span className={s.chipCount}>x {count}</span>
    </div>
  );
}
