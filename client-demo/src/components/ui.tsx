import Link from "next/link";
import { availabilityHelp, availabilityLabel } from "@/data/site";
import type { Availability } from "@/types";
import { Icon } from "./Icon";

/* Small shared primitives. Kept together because each is a few lines. */

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
}) {
  const center = align === "center";
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="text-sm font-semibold tracking-wide text-brand">{eyebrow}</p>
      <h2
        id={id}
        className="mt-2 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

const badgeStyles: Record<Availability, string> = {
  live: "bg-brand-soft text-brand-strong ring-brand/20 dark:ring-brand/40",
  preview: "bg-amber-50 text-amber-800 ring-amber-700/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
  demo: "bg-violet-50 text-violet-800 ring-violet-700/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25",
  custom: "bg-sky-50 text-sky-800 ring-sky-700/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25",
  roadmap: "bg-slate-200/70 text-slate-700 ring-slate-500/30 dark:bg-slate-400/20 dark:text-slate-200 dark:ring-slate-400/40",
};

const badgeDot: Record<Availability, string> = {
  live: "bg-brand",
  preview: "bg-amber-600 dark:bg-amber-400",
  demo: "bg-violet-600 dark:bg-violet-400",
  custom: "bg-sky-600 dark:bg-sky-400",
  roadmap: "border border-slate-500 bg-transparent",
};

/** Availability is always text + shape, never colour alone. */
export function AvailabilityBadge({ value }: { value: Availability }) {
  return (
    <span
      title={availabilityHelp[value]}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeStyles[value]}`}
    >
      <span className={`size-1.5 rounded-full ${badgeDot[value]}`} aria-hidden />
      {availabilityLabel[value]}
    </span>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink-2 shadow-sm",
  secondary:
    "bg-surface text-ink ring-1 ring-inset ring-line-strong hover:bg-paper",
  ghost: "text-ink hover:bg-ink/5",
  inverse: "bg-white text-console hover:bg-white/90",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon,
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: "md" | "lg";
  className?: string;
  icon?: boolean;
}) {
  const sizing = size === "lg" ? "h-12 px-6 text-base" : "h-10 px-4 text-sm";
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors ${sizing} ${buttonStyles[variant]} ${className}`}
    >
      {children}
      {icon && (
        <Icon
          name="arrowRight"
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      )}
    </Link>
  );
}

export function IconTile({
  name,
  tone = "brand",
}: {
  name: React.ComponentProps<typeof Icon>["name"];
  tone?: "brand" | "muted";
}) {
  return (
    <span
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${
        tone === "brand"
          ? "bg-brand-tint text-brand ring-brand/15"
          : "bg-slate-50 text-slate-500 ring-slate-300/60 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20"
      }`}
    >
      <Icon name={name} className="size-5" />
    </span>
  );
}
