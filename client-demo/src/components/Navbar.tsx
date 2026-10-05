"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/data/site";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { ButtonLink, Container } from "./ui";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-semibold tracking-tight ${inverse ? "text-white" : "text-ink"}`}
      aria-label={`${site.name} home`}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-white">
        <Icon name="wave" className="size-5" strokeWidth={2.25} />
      </span>
      <span className="text-[17px]">{site.name}</span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => !href.includes("#") && pathname === href;

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled || open ? "border-line bg-paper/90 backdrop-blur" : "border-transparent bg-paper"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-sm transition-colors hover:text-ink ${
                    isActive(l.href) ? "font-medium text-ink" : "text-ink-2"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="hidden sm:block">
            <ButtonLink href="/demo" icon>
              Try the AI demo
            </ButtonLink>
          </span>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "x" : "menu"} className="size-5" />
          </button>
        </div>
      </Container>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-paper lg:hidden">
          <Container className="py-3">
            <ul className="flex flex-col">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className="flex items-center justify-between rounded-lg px-2 py-3 text-base text-ink hover:bg-ink/5"
                  >
                    {l.label}
                    <Icon name="arrowRight" className="size-4 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink href="/demo" size="lg" className="mt-3 w-full" icon>
              Try the AI demo
            </ButtonLink>
          </Container>
        </nav>
      )}
    </header>
  );
}
