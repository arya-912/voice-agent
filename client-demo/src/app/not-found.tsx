import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-28 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">This page doesn&apos;t exist.</h1>
      <p className="mt-3 text-muted">The link may be out of date.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/demo" variant="secondary">Try the demo</ButtonLink>
      </div>
    </Container>
  );
}
