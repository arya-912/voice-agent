import { callResultMeta } from "@/lib/format";
import type { CallResult } from "@/types";
import { Icon } from "./Icon";

const toneStyle = {
  good: "bg-green-50 text-green-800 ring-green-700/20",
  neutral: "bg-slate-50 text-slate-700 ring-slate-500/20",
  warn: "bg-amber-50 text-amber-800 ring-amber-700/20",
  bad: "bg-red-50 text-red-800 ring-red-700/20",
} as const;

const toneIcon = { good: "check", neutral: "phone", warn: "clock", bad: "ban" } as const;

/** Call result: icon + label + colour, so it never relies on colour alone. */
export function ResultBadge({ result }: { result: CallResult }) {
  const m = callResultMeta[result];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${toneStyle[m.tone]}`}>
      <Icon name={toneIcon[m.tone]} className="size-3" strokeWidth={2.25} />
      {m.label}
    </span>
  );
}
