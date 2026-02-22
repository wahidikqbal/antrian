type PageShellSkeletonProps = {
  titleWidthClass?: string;
  subtitleWidthClass?: string;
  blockCount?: number;
  centered?: boolean;
};

export default function PageShellSkeleton({
  titleWidthClass = "w-56",
  subtitleWidthClass = "w-80",
  blockCount = 3,
  centered = false,
}: PageShellSkeletonProps) {
  return (
    <div className={centered ? "flex min-h-screen items-center justify-center bg-zinc-50 px-6" : "min-h-screen bg-zinc-50 px-6 py-10"}>
      <main className={centered ? "w-full max-w-xl" : "mx-auto w-full max-w-5xl"}>
        <header className="mb-6">
          <div className="h-3 w-16 animate-pulse rounded bg-zinc-200" />
          <div className={`mt-2 h-8 animate-pulse rounded bg-zinc-200 ${titleWidthClass}`} />
          <div className={`mt-2 h-4 animate-pulse rounded bg-zinc-100 ${subtitleWidthClass}`} />
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: blockCount }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
