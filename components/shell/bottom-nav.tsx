import Link from "next/link";

export function BottomNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] md:hidden"
    >
      <div className="mx-auto grid min-h-16 max-w-md grid-cols-4 text-center text-xs">
        <Link className="grid place-items-center" href="/">Home</Link>
        <Link className="grid min-h-12 place-items-center" href="/search">Search</Link>
        <Link className="grid min-h-12 place-items-center" href="/data">Data</Link>
        <Link className="grid min-h-12 place-items-center px-1" href="/verification">Verification</Link>
      </div>
    </nav>
  );
}
