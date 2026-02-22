import DashboardPageSkeleton from "../_components/DashboardPageSkeleton";

export default function DashboardAdminLoading() {
  return (
    <DashboardPageSkeleton
      titleWidthClass="w-52"
      subtitleWidthClass="w-72"
      cardCount={6}
      showTable
    />
  );
}
