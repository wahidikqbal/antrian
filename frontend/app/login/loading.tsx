import PageShellSkeleton from "../_components/PageShellSkeleton";

export default function LoginLoading() {
  return (
    <PageShellSkeleton
      titleWidthClass="w-44"
      subtitleWidthClass="w-64"
      blockCount={2}
      centered
    />
  );
}
