import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/theme-toggle";

interface BreadcrumbHeaderProps {
  currentPage: string;
  parentPage?: string;
}

export function BreadcrumbHeader({
  currentPage,
  parentPage,
}: BreadcrumbHeaderProps) {
  return (
    <header className="flex h-16 min-h-16 justify-between shrink-0 items-center gap-2 sticky top-0 bg-background z-50">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {currentPage === "Dashboard" ? null : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="" />
              </>
            )}
            {parentPage && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbPage>{parentPage}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="" />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex align-top px-4">
        <ModeToggle />
      </div>
    </header>
  );
}
