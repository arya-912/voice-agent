import type { CallStatus } from "@/types";

/**
 * CSS-only waveform. Amplitude and speed follow the call state; there is
 * no audio analysis, so it costs nothing at runtime. Decorative — state is
 * always announced in text elsewhere.
 */
const BAR_HEIGHTS = [0.35, 0.55, 0.8, 0.5, 0.95, 0.65, 0.4, 0.85, 1, 0.6, 0.75, 0.45, 0.9, 0.55, 0.7, 0.4, 0.8, 0.5, 0.65, 0.35];

const stateStyle: Record<CallStatus, { active: boolean; max: number; speed: number }> = {
  ready: { active: false, max: 0, speed: 0 },
  connecting: { active: true, max: 0.3, speed: 1400 },
  listening: { active: true, max: 0.45, speed: 1300 },
  thinking: { active: true, max: 0.18, speed: 1600 },
  speaking: { active: true, max: 1, speed: 780 },
  ended: { active: false, max: 0, speed: 0 },
  error: { active: false, max: 0, speed: 0 },
};

export function VoiceVisualizer({
  status,
  bars = 20,
  className = "",
  barClassName = "bg-live",
}: {
  status: CallStatus;
  bars?: number;
  className?: string;
  barClassName?: string;
}) {
  const st = stateStyle[status];
  return (
    <div
      aria-hidden
      className={`flex h-16 items-center justify-center gap-[3px] ${st.active ? "vv-active" : ""} ${className}`}
    >
      {Array.from({ length: bars }, (_, i) => {
        const h = BAR_HEIGHTS[i % BAR_HEIGHTS.length];
        return (
          <span
            key={i}
            className={`vv-bar h-full w-[3px] rounded-full sm:w-1 ${barClassName}`}
            style={
              {
                "--vv-max": Math.max(0.12, h * st.max),
                "--vv-min": 0.1,
                "--vv-speed": `${st.speed + (i % 5) * 90}ms`,
                animationDelay: `${(i * 73) % 600}ms`,
                opacity: st.active ? 1 : 0.4,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
