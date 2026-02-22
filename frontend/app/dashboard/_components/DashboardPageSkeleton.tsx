type DashboardPageSkeletonProps = {
  titleWidthClass?: string;
  subtitleWidthClass?: string;
  cardCount?: number;
  showTable?: boolean;
};

export default function DashboardPageSkeleton({
  titleWidthClass = "w-48",
  subtitleWidthClass = "w-72",
  cardCount = 4,
  showTable = true,
}: DashboardPageSkeletonProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-6">
        <div className="h-3 w-16 animate-pulse rounded bg-zinc-200" />
        <div className={`mt-2 h-8 animate-pulse rounded bg-zinc-200 ${titleWidthClass}`} />
        <div className={`mt-2 h-4 animate-pulse rounded bg-zinc-100 ${subtitleWidthClass}`} />
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: cardCount }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      </section>

      {showTable ? (
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-52 animate-pulse rounded bg-zinc-200" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
