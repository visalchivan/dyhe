import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link, useRouterState } from "@tanstack/react-router"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check exact match
          const isExactMatch = currentPath === item.url
          // Check if it's a child route
          const isChildRoute = currentPath.startsWith(item.url + '/')
          // Check if any child item matches exactly
          const hasExactChildMatch = item.items?.some(child => currentPath === child.url)
          
          // Parent is active only if exact match AND no exact child match exists
          const isActive = isExactMatch && !hasExactChildMatch
          
          return (
            <Collapsible key={item.title} asChild defaultOpen={isExactMatch || isChildRoute}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubActive = currentPath === subItem.url
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isSubActive}>
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
