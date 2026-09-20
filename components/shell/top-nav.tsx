import Link from "next/link";

export function TopNav() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-semibold tracking-tight">
          PUBLIC RECEIPT
        </Link>
        <nav aria-label="Primary" className="hidden gap-6 text-sm md:flex">
          <Link href="/">Home</Link>
          <Link href="/explore">Explore</Link>
          <Link href="/community">My Community</Link>
          <Link href="/data">About the Data</Link>
        </nav>
      </div>
    </header>
  );
}
