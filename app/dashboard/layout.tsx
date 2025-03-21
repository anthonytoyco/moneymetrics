import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { AppSidebar } from "../../components/app-sidebar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "MoneyMentor - Dashboard",
  description: "Your personal AI financial savings assistant",
};

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
    <SidebarProvider>
      <AppSidebar user={mappedUser} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
