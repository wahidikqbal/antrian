import DashboardPageSkeleton from "../_components/DashboardPageSkeleton";

export default function DashboardUsersLoading() {
  return (
    <DashboardPageSkeleton
      titleWidthClass="w-56"
      subtitleWidthClass="w-96"
      cardCount={3}
      showTable={false}
    />
  );
}
