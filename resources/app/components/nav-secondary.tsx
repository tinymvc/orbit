"use client";
import * as React from "react";
import { Link, usePage } from "@inertiajs/react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { MenuItem } from "@/types/context";

interface NavSecondaryProps extends React.ComponentPropsWithoutRef<
  typeof SidebarGroup
> {
  items: MenuItem[];
}

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  const { url } = usePage();
  const pathname = url.split("?")[0];

  const isActive = (itemUrl?: string): boolean =>
    !!itemUrl && pathname === itemUrl;

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <Link href={item.url || "#"}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
