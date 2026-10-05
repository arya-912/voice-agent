"use client";

import { useId, useState } from "react";
import { industries } from "@/data/industries";
import { Icon } from "./Icon";

type Fields = {
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  useCase: string;
  message: string;
};

const empty: Fields = { name: "", company: "", email: "", phone: "", industry: "", useCase: "", message: "" };

export const industryOptions = [...industries.map((i) => i.name), "Other"];

export const useCaseOptions = [
  "Calling and following up with new leads",
  "Qualifying leads",
  "Appointment, visit or booking calls",
  "Reminders and customer notifications",
  "Payment or recovery follow-ups",
  "Customer feedback and service follow-ups",
  "AI chatbot",
  "Website, software or dashboard",
  "Not sure yet",
];

/** Optional. When unset, the form validates and shows a demo-mode confirmation without sending. */
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "";

const FREE_MAIL = /@(gmail|yahoo|hotmail|outlook|live|icloud|aol|proton|protonmail|rediffmail)\./i;

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!f.company.trim()) e.company = "Please enter your company.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  else if (FREE_MAIL.test(f.email)) e.email = "Please use your work email.";
  if (f.phone.trim() && !/^\+?[\d\s()-]{8,16}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number, or leave it blank.";
  if (!f.industry) e.industry = "Choose your industry, or Other.";
  if (!f.useCase) e.useCase = "Choose the closest option.";
  if (f.message.length > 2000) e.message = "Please keep the message under 2,000 characters.";
  return e;
}

export function ContactForm() {
  const uid = useId();
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "demo" | "failed">("idle");

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = validate(fields);
    setErrors(v);
    const first = Object.keys(v)[0];
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    if (!ENDPOINT) {
      setState("demo");
      return;
    }
    setState("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      setState(res.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  if (state === "sent" || state === "demo") {
    return (
      <div role="status" className="rounded-2xl bg-surface p-8 text-center shadow-card ring-1 ring-line">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon name="check" className="size-6" strokeWidth={2.25} />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-ink">
          {state === "sent" ? "Thanks, we'll be in touch." : "Your request looks good."}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          {state === "sent"
            ? "Our team will reply to your work email within one business day."
            : "Demo mode: this form isn't connected to a backend yet, so nothing was sent. Please share your details with your contact on our team directly."}
        </p>
        <button
          type="button"
          onClick={() => {
            setFields(empty);
            setState("idle");
          }}
          className="mt-6 text-sm font-medium text-brand hover:text-brand-strong"
        >
          Start over
        </button>
      </div>
    );
  }

  const field = (k: keyof Fields) => ({
    id: `${uid}-${k}`,
    name: k,
    value: fields[k],
    onChange: set(k),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${uid}-${k}-err` : undefined,
    className: `mt-1.5 block w-full rounded-lg bg-surface px-3.5 text-sm text-ink ring-1 ring-inset placeholder:text-muted/60 focus:ring-2 focus:ring-brand focus:outline-none focus-visible:outline-none ${
      errors[k] ? "ring-bad" : "ring-line-strong"
    }`,
  });

  const Err = ({ k }: { k: keyof Fields }) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="mt-1.5 flex items-center gap-1 text-xs text-bad">
        <Icon name="alert" className="size-3.5" />
        {errors[k]}
      </p>
    ) : null;

  const Label = ({ k, children, optional }: { k: keyof Fields; children: React.ReactNode; optional?: boolean }) => (
    <label htmlFor={`${uid}-${k}`} className="text-sm font-medium text-ink">
      {children}
      {optional ? <span className="ml-1 font-normal text-muted">(optional)</span> : <span className="sr-only"> (required)</span>}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label k="name">Full name</Label>
          <input {...field("name")} autoComplete="name" className={`${field("name").className} h-11`} />
          <Err k="name" />
        </div>
        <div>
          <Label k="company">Company</Label>
          <input {...field("company")} autoComplete="organization" className={`${field("company").className} h-11`} />
          <Err k="company" />
        </div>
        <div>
          <Label k="email">Work email</Label>
          <input {...field("email")} type="email" autoComplete="email" inputMode="email" placeholder="you@company.com" className={`${field("email").className} h-11`} />
          <Err k="email" />
        </div>
        <div>
          <Label k="phone" optional>Phone</Label>
          <input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" placeholder="+91 98xxx xxxxx" className={`${field("phone").className} h-11`} />
          <Err k="phone" />
        </div>
        <div>
          <Label k="industry">Industry</Label>
          <select {...field("industry")} className={`${field("industry").className} h-11`}>
            <option value="" disabled>
              Choose one
            </option>
            {industryOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <Err k="industry" />
        </div>
        <div>
          <Label k="useCase">What do you want to automate?</Label>
          <select {...field("useCase")} className={`${field("useCase").className} h-11`}>
            <option value="" disabled>
              Choose one
            </option>
            {useCaseOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <Err k="useCase" />
        </div>
        <div className="sm:col-span-2">
          <Label k="message" optional>Message</Label>
          <textarea
            {...field("message")}
            rows={4}
            placeholder="What does your team do by phone today? Roughly how many calls a week, and what tools do you use?"
            className={`${field("message").className} py-2.5`}
          />
          <Err k="message" />
        </div>
      </div>

      {state === "failed" && (
        <p role="alert" className="mt-5 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-700/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/25">
          <Icon name="alert" className="size-4" />
          We couldn&apos;t send your request. Please try again in a moment.
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">We only use these details to reply to your request.</p>
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium whitespace-nowrap text-paper hover:bg-ink-2 disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Discuss your use case"}
          <Icon name="arrowRight" className="size-4" />
        </button>
      </div>
    </form>
  );
}
