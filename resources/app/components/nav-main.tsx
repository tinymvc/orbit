import { Link, usePage } from "@inertiajs/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
} from "@/components/ui/sidebar";
import { MenuItem, SubMenuItem } from "@/types/context";

interface NavMainProps {
  items: MenuItem[];
}

export function NavMain({ items }: NavMainProps) {
  const { url } = usePage();
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
