"use client";

import {
  Bot,
  ChartArea,
  CircleDollarSign,
  Frame,
  HelpCircle,
  Info,
  Mail,
  Map,
  PieChart,
} from "lucide-react";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavInfo } from "@/components/sidebar/nav-info";
import { NavHeader } from "@/components/sidebar/nav-header";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavUser } from "@/components/sidebar/nav-user";

const data = {
  navInfo: [
    {
      name: "About Us",
      url: "/about",
      icon: Info,
    },
    {
      name: "Contact",
      url: "/contact",
      icon: Mail,
    },
    {
      name: "Help & Support",
      url: "/help",
      icon: HelpCircle,
    },
  ],
  navMain: [
    {
      title: "Data",
      url: "#",
      icon: ChartArea,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/data/overview",
        },
        {
          title: "Charts",
          url: "/data/charts",
        },
        {
          title: "Trends",
          url: "/data/trends",
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
        {
          title: "Export",
          url: "/financials/export",
        },
      ],
    },
    {
      title: "MMAI",
      url: "#",
      icon: Bot,
      isActive: false,
      items: [
        {
          title: "1",
          url: "/ai/1",
        },
        {
          title: "2",
          url: "/ai/2",
        },
        {
          title: "3",
          url: "/ai/3",
        },
        {
          title: "4",
          url: "/ai/4",
        },
      ],
    },
  ],
  navProjects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
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
        <NavHeader name="MoneyMentor" favicon="/favicon.ico" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.navProjects} />
        <NavInfo links={data.navInfo} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
