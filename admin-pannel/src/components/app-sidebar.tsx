"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  Wrench,
  ShoppingCart,
  Calendar,
  Star,
  BarChart3,
  Tag,
  Type,
  Plus,
  Search,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/roles"

// Role-based navigation data
const getRoleBasedData = (userRole: UserRole) => {
  const baseData = {
    teams: [
      {
        name: "Home Service Platform",
        logo: GalleryVerticalEnd,
        plan: "Professional",
      },
    ],
  }

  switch (userRole) {
    case UserRole.ADMIN:
      return {
        ...baseData,
        navMain: [
          {
            title: "Dashboard",
            url: "/dashboard",
            icon: BarChart3,
            isActive: true,
          },
          {
            title: "Management",
            url: "#",
            icon: Settings2,
            items: [
              {
                title: "Categories",
                url: "/admin/categories",
              },
              {
                title: "Service Types",
                url: "/admin/types",
              },
              {
                title: "All Services",
                url: "/admin/services",
              },
            ],
          },
          {
            title: "Analytics",
            url: "#",
            icon: PieChart,
            items: [
              {
                title: "User Analytics",
                url: "#",
              },
              {
                title: "Service Analytics",
                url: "#",
              },
              {
                title: "Booking Analytics",
                url: "#",
              },
            ],
          },
        ],
        projects: [
          {
            name: "User Management",
            url: "#",
            icon: Users,
          },
          {
            name: "Service Approval",
            url: "#",
            icon: Wrench,
          },
        ],
      }

    case UserRole.SERVICE_PROVIDER:
      return {
        ...baseData,
        navMain: [
          {
            title: "My Services",
            url: "/provider/services",
            icon: Wrench,
            isActive: true,
          },
          {
            title: "My Bookings",
            url: "/provider/bookings",
            icon: Calendar,
          },
          {
            title: "Analytics",
            url: "#",
            icon: BarChart3,
            items: [
              {
                title: "Service Performance",
                url: "#",
              },
              {
                title: "Booking History",
                url: "#",
              },
            ],
          },
        ],
        projects: [
          {
            name: "Add New Service",
            url: "/provider/services",
            icon: Plus,
          },
          {
            name: "View Reviews",
            url: "#",
            icon: Star,
          },
        ],
      }

    case UserRole.USER:
    default:
      return {
        ...baseData,
        navMain: [
          {
            title: "Browse Services",
            url: "/user/services",
            icon: Search,
            isActive: true,
          },
          {
            title: "My Bookings",
            url: "/user/bookings",
            icon: Calendar,
          },
          {
            title: "Reviews",
            url: "#",
            icon: Star,
            items: [
              {
                title: "My Reviews",
                url: "#",
              },
              {
                title: "Leave Review",
                url: "#",
              },
            ],
          },
        ],
        projects: [
          {
            name: "Book a Service",
            url: "/user/services",
            icon: ShoppingCart,
          },
          {
            name: "Booking History",
            url: "/user/bookings",
            icon: Calendar,
          },
        ],
      }
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userRole } = useAuth()
  const data = getRoleBasedData(userRole)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
