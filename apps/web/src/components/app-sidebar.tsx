"use client"

import * as React from "react"
import {
  LifeBuoy,
  Send,
  Settings2,
  Store,
  Package,
  Scan,
  BarChart,
  Printer,
  Users,
  LayoutDashboard,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Drivers",
      url: "/drivers",
      icon: Users,
      isActive: true,
    },
    {
      title: "Merchants",
      url: "/merchants",
      icon: Store,
      isActive: true,
    },
    {
      title: "Packages",
      url: "/packages",
      icon: Package,
      isActive: true,
    },
    {
      title: "Print Packages",
      url: "/packages/print",
      icon: Printer,
      isActive: true,
    },
    {
      title: "Assign Packages",
      url: "/assign",
      icon: Scan,
      isActive: true,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart,
      isActive: true,
    },
    {
      title: "Team",
      url: "/team",
      icon: Users,
      isActive: true,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <img src="/logo.svg" alt="logo" className="w-7 h-7" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">DYHE</span>
                  <span className="truncate text-xs">Delivery Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
