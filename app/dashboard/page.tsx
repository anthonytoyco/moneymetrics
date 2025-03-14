import { AppSidebar } from "../../components/app-sidebar";
import HeaderAuth from "@/components/header-auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  const defaultUser = {
    name: "Guest",
    email: "guest@example.com",
    avatar: "/avatars/default.jpg",
  };

  const mappedUser = user
    ? {
        name: user.user?.user_metadata?.sub || "Anonymous",
        email: user.user?.user_metadata?.email || "test@gmail.com",
        avatar: user.user?.user_metadata?.avatar_url || "/avatars/default.jpg",
      }
    : defaultUser;

  return (
    <SidebarProvider>
      <AppSidebar user={mappedUser} />
      <SidebarInset>
        <header className="flex h-16 justify-between shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>CHANGE</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex align-top px-4">
            <HeaderAuth />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="flex items-center justify-center aspect-video rounded-xl bg-green-200">
              1
            </div>
            <div className="flex items-center justify-center aspect-video rounded-xl bg-green-200">
              2
            </div>
            <div className="flex items-center justify-center aspect-video rounded-xl bg-green-200">
              3
            </div>
          </div>
          <div className="flex justify-center items-center min-h-[100vh] flex-1 rounded-xl bg-green-200 md:min-h-min">
            4
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
