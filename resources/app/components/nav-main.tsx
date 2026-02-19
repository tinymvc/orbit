import { Link, usePage } from "@inertiajs/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ChevronRight } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { MenuItem, SubMenuItem } from "@/types/context";

interface NavMainProps {
  items: MenuItem[];
}

export function NavMain({ items }: NavMainProps) {
  const { url } = usePage();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = url.split("?")[0] || "";

  const isActive = (itemUrl?: string): boolean =>
    (!!itemUrl && pathname === itemUrl) ||
    (!!itemUrl &&
      itemUrl.includes(":") &&
      pathname.startsWith(itemUrl.split("/:")[0] || ""));

  const hasActiveGrandChild = (items: SubMenuItem[]): boolean =>
    items?.some((child) => isActive(child.url)) ?? false;

  const hasActiveChild = (items: SubMenuItem[]): boolean =>
    items?.some(
      (subItem) =>
        isActive(subItem.url) || hasActiveGrandChild(subItem.children || []),
    ) ?? false;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) =>
            item?.items ? (
              isCollapsed ? (
                // ── Collapsed: popover flyout ──────────────────────────
                <SidebarMenuItem key={item.title}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={hasActiveChild(item.items || [])}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      align="start"
                      sideOffset={8}
                      className="w-48 p-1"
                    >
                      <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {item.title}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.url || "#"}
                            className={[
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                              "hover:bg-accent hover:text-accent-foreground",
                              isActive(subItem.url) ||
                              hasActiveGrandChild(subItem.children || [])
                                ? "bg-accent text-accent-foreground font-medium"
                                : "text-foreground",
                            ].join(" ")}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </SidebarMenuItem>
              ) : (
                // ── Expanded: collapsible accordion ───────────────────
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={hasActiveChild(item.items || [])}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={hasActiveChild(item.items || [])}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={
                                isActive(subItem.url) ||
                                hasActiveGrandChild(subItem.children || [])
                              }
                            >
                              <Link href={subItem.url || "#"}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={
                    isActive(item.url) || hasActiveChild(item.children || [])
                  }
                >
                  <Link href={item.url || "#"}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
