"use client";

import { Bot, ChartArea, CircleDollarSign } from "lucide-react";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavHeader } from "@/components/sidebar/nav-header";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";

const data = {
  navMain: [
    {
      title: "Data",
      url: "#",
      icon: ChartArea,
      isActive: true,
      items: [
        {
          title: "Charts",
          url: "/data/charts",
        },
      ],
    },
    {
      title: "Financials",
      url: "#",
      icon: CircleDollarSign,
      isActive: true,
      items: [
        {
          title: "Transactions",
          url: "/financials/transactions",
        },
        {
          title: "Import",
          url: "/financials/import",
        },
      ],
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string };
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="transition-[padding] group-has-[[data-collapsible=icon]]/sidebar-wrapper:pt-4">
        <NavHeader name="MoneyMetrics" favicon="/favicon.ico" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
