import { testimonials } from "@/data/testimonials";
import { Container, SectionHeading } from "../ui";

/** Renders nothing until real, permissioned quotes are added to data/testimonials.ts. */
export function Testimonials() {
  if (!testimonials.length) return null;
  return (
    <section aria-labelledby="testimonials-title" className="py-20 sm:py-24">
      <Container>
        <SectionHeading id="testimonials-title" eyebrow="Clients" title="What our clients say." />
        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {testimonials.map((t) => (
            <li key={t.name}>
              <figure className="h-full rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line">
                <blockquote className="text-base leading-relaxed text-ink">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-muted">
                  <span className="font-medium text-ink">{t.name}</span>, {t.role}, {t.company}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
