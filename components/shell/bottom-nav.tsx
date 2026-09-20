import Link from "next/link";

export function BottomNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-3 text-center text-sm">
        <Link className="grid place-items-center" href="/">Home</Link>
        <Link className="grid place-items-center" href="/explore">Explore</Link>
        <Link className="grid place-items-center" href="/community">Community</Link>
      </div>
    </nav>
  );
}
