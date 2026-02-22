import DashboardPageSkeleton from "../_components/DashboardPageSkeleton";

export default function DashboardWebsitesLoading() {
  return (
    <DashboardPageSkeleton
      titleWidthClass="w-44"
      subtitleWidthClass="w-80"
      cardCount={2}
      showTable={false}
    />
  );
}
