import { Container, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 font-display text-[var(--text-3xl)] font-extrabold text-ink-900">
        This van has left the forecourt
      </h1>
      <p className="mt-3 max-w-md text-[var(--text-md)] text-ink-500">
        The listing you&apos;re after may have sold or been removed. Try browsing current stock instead.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/" variant="primary">Back to home</Button>
        <Button href="/vans/volkswagen/transporter" variant="outline">Browse Transporters</Button>
      </div>
    </Container>
  );
}
