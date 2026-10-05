import Link from "next/link";
import { navLinks, site } from "@/data/site";
import { Logo } from "./Navbar";
import { Container } from "./ui";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid gap-10 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">{site.tagline}. Custom AI voice agents for outbound calls, lead follow-up and customer conversations, plus the chatbots, websites and software around them.</p>
        </div>
        <nav aria-label="Footer">
          <p className="text-sm font-semibold text-ink">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {[...navLinks, { label: "Try the AI demo", href: "/demo" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold text-ink">About this site</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The interactive demo is a scripted simulation that runs in your browser; it doesn&apos;t call our production AI. Dashboard figures in the case study are illustrative sample data. Features are labelled Live, Partially built, Demo, Custom build or Roadmap.
          </p>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Businesses and customers in examples are fictional.</p>
        </Container>
      </div>
    </footer>
  );
}
