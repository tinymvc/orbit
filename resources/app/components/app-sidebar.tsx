import * as React from "react";

import { Link } from "@inertiajs/react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useApp } from "@/contexts/app";
import { siteIdentity } from "@/config/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { app, menu, user } = useApp();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href={siteIdentity.home_url}>
                {siteIdentity.icon && <siteIdentity.icon className="size-5!" />}
                {siteIdentity.image && (
                  <img
                    src={siteIdentity.image}
                    alt={siteIdentity.name}
                    className="size-5! rounded-full object-cover"
                  />
                )}
                <span className="text-base font-bold">
                  {app.name || siteIdentity.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menu.navMain && <NavMain items={menu.navMain} />}
        {menu.navSecondary && (
          <NavSecondary items={menu.navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: user?.avatar_url || null,
            name: user?.display_name || user?.username || "Guest",
            email: user?.email || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
