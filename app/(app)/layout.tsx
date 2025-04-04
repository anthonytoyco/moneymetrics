import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "MoneyMetrics - Dashboard",
  description: "Your personal AI financial savings assistant",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const mappedUser = {
    name: user.user?.user_metadata?.full_name,
    email: user.user?.user_metadata?.email,
    avatar:
      user.user?.user_metadata?.avatar_url ||
      "https://api.dicebear.com/9.x/initials/svg?backgroundColor=90a484&seed=" +
        user.user?.email,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={mappedUser} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
