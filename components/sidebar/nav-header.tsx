"use client";

import type * as React from "react";
import { useRouter } from "next/navigation";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavHeader({
  name = "Dashboard",
  favicon,
}: {
  name?: string;
  favicon?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/data/charts");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" onClick={handleClick}>
          <div className="flex justify-center items-center size-8 min-w-7 pl-[3px]">
            <img className="flex justify-center items-center" src={favicon} />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
