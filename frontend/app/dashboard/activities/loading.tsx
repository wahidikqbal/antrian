import DashboardPageSkeleton from "../_components/DashboardPageSkeleton";

export default function DashboardActivitiesLoading() {
  return (
    <DashboardPageSkeleton
      titleWidthClass="w-44"
      subtitleWidthClass="w-80"
      cardCount={4}
      showTable
    />
  );
}
