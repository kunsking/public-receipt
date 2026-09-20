import Link from "next/link";

export default function ReceiptNotFound() {
  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--caution)]">Public Receipt not found</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">We don&apos;t currently have a verified record for this receipt ID.</h1>
      <p className="mt-4 leading-7 text-[var(--muted)]">No replacement record has been inferred or generated.</p>
      <Link className="mt-7 inline-grid min-h-12 place-items-center rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-white" href="/">
        Search Public Records
      </Link>
    </section>
  );
}
