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
  Settings,
} from "lucide-react";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavAbout } from "./nav-about";
import { NavHeader } from "./nav-header";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";

const data = {
  aboutLinks: [
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
          title: "Charts",
          url: "/dashboard/data/charts",
        },
        {
          title: "Trends",
          url: "/dashboard/data/trends",
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
          title: "Overview",
          url: "/dashboard/financials/overview",
        },
        {
          title: "Manual Upload",
          url: "/dashboard/financials/manual",
        },
        {
          title: "Automatic Upload",
          url: "/dashboard/financials/automatic",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      isActive: true,
      items: [
        {
          title: "General",
          url: "/dashboard/settings/general",
        },
        {
          title: "Profile",
          url: "/dashboard/settings/profile",
        },
        {
          title: "App",
          url: "/dashboard/settings/app",
        },
      ],
    },
    {
      title: "MoneyMentor AI",
      url: "#",
      icon: Bot,
      isActive: false,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
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
        <NavAbout links={data.aboutLinks} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
