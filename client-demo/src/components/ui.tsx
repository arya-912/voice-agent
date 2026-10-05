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
  live: "bg-brand-soft text-brand-strong ring-brand/20",
  preview: "bg-amber-50 text-amber-800 ring-amber-700/20",
  roadmap: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const badgeDot: Record<Availability, string> = {
  live: "bg-brand",
  preview: "bg-amber-600",
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
    "bg-ink text-white hover:bg-ink-2 shadow-sm",
  secondary:
    "bg-surface text-ink ring-1 ring-inset ring-line-strong hover:bg-paper",
  ghost: "text-ink hover:bg-ink/5",
  inverse: "bg-white text-ink hover:bg-white/90",
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
          : "bg-slate-50 text-slate-500 ring-slate-300/60"
      }`}
    >
      <Icon name={name} className="size-5" />
    </span>
  );
}
