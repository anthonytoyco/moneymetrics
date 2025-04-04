import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { BarAmount } from "@/components/charts/bar-amount";
import { BarIncome } from "@/components/charts/bar-income";
import { LineTransactions } from "@/components/charts/line-transactions";
import { PieAmount } from "@/components/charts/pie-amount";
import { PieTransactions } from "@/components/charts/pie-transactions";
import { RadarExpenses } from "@/components/charts/radar-expenses";

export default async function Page() {
  return (
    <>
      <BreadcrumbHeader currentPage="Charts" parentPage="Data" />
      <div className="flex flex-wrap flex-col gap-4 p-4 pt-0">
        <div className="flex-1 min-w-[300px]">
          <LineTransactions />
        </div>
        <div className="flex flex-wrap gap-4 w-full">
          <div className="flex-1 min-w-[300px]">
            <PieTransactions />
          </div>
          <div className="flex-1 min-w-[300px]">
            <PieAmount />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 w-full">
          <div className="flex-1 min-w-[300px]">
            <BarAmount />
          </div>
          <div className="flex-1 min-w-[300px]">
            <BarIncome />
          </div>
          <div className="flex-1 min-w-[300px]">
            <RadarExpenses />
          </div>
        </div>
      </div>
    </>
  );
}
