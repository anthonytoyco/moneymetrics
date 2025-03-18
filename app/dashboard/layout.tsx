import { Geist } from "next/font/google";
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

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "MoneyMentor - Dashboard",
  description: "Your personal AI financial savings assistant",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
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
                        <BreadcrumbLink href="/dashboard">
                          Dashboard
                        </BreadcrumbLink>
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
              {children}
            </SidebarInset>
          </SidebarProvider>
        </main>
      </body>
    </html>
  );
}
