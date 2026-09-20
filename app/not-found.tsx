import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl py-16">
      <h1 className="text-3xl font-semibold">We couldn’t find that receipt.</h1>
      <p className="mt-3 text-[var(--muted)]">
        A missing result does not mean a public project does not exist. It means Public Receipt does not have that record at this address.
      </p>
      <Link className="mt-6 inline-block underline" href="/">Search public records</Link>
    </section>
  );
}
