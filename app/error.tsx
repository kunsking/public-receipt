"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto max-w-xl py-16">
      <h1 className="text-2xl font-semibold">Something went wrong.</h1>
      <p className="mt-3 text-[var(--muted)]">
        Public records have not been altered. Try the request again.
      </p>
      <button className="mt-6 rounded-lg bg-[var(--foreground)] px-4 py-3 text-white" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
