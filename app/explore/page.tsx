export default function ExplorePage() {
  return <Placeholder title="Explore Public Receipts" note="Project discovery is implemented in M2." />;
}

function Placeholder({ title, note }: { title: string; note: string }) {
  return <section className="py-12"><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-3 text-[var(--muted)]">{note}</p></section>;
}
