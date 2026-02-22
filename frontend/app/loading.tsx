import PageShellSkeleton from "./_components/PageShellSkeleton";

export default function AppLoading() {
  return (
    <PageShellSkeleton
      titleWidthClass="w-64"
      subtitleWidthClass="w-96"
      blockCount={3}
    />
  );
}
