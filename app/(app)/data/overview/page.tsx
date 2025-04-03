import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { ChartTransactions } from "@/components/charts/chart-transactions";

export default async function Page() {
  return (
    <>
      <BreadcrumbHeader currentPage="Overview" parentPage="Data" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col gap-4">
          <ChartTransactions />
        </div>
      </div>
    </>
  );
}
