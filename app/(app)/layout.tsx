import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
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

  if (!user) {
    return redirect("/sign-in");
  }

  const mappedUser = user
    ? {
        name: user.user?.user_metadata?.sub || user.user?.user_metadata?.sub,
        email: user.user?.user_metadata?.email,
        avatar:
          user.user?.user_metadata?.avatar_url ||
          "https://api.dicebear.com/9.x/initials/svg?backgroundColor=90a484&seed=" +
            user.user?.email,
      }
    : {
        name: "Guest",
        email: "guest@example.com",
        avatar: "/avatars/default.jpg",
      };

  return (
    <SidebarProvider>
      <AppSidebar user={mappedUser} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
