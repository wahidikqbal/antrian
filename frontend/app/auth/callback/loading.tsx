import PageShellSkeleton from "../../_components/PageShellSkeleton";

export default function AuthCallbackLoading() {
  return (
    <PageShellSkeleton
      titleWidthClass="w-52"
      subtitleWidthClass="w-72"
      blockCount={1}
      centered
    />
  );
}
