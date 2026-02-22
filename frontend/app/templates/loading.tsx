import PageShellSkeleton from "../_components/PageShellSkeleton";

export default function TemplatesLoading() {
  return (
    <PageShellSkeleton
      titleWidthClass="w-40"
      subtitleWidthClass="w-72"
      blockCount={2}
    />
  );
}
