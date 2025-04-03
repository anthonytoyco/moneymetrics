import { BreadcrumbHeader } from "@/components/breadcrumb-header";

export default async function Page() {
  return (
    <>
      <BreadcrumbHeader currentPage="Overview" parentPage="Data" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <p>Data Overview</p>
      </div>
    </>
  );
}
