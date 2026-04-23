import {
  GraduationCap,
  Search,
  Building2,
  Lightbulb,
  Briefcase,
  Shield
} from "lucide-react";

import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // ✅ GET ROLE
  const role = localStorage.getItem("role");

  // ✅ CONFIG BASED ON ROLE
  let config;

  if (role === "admin") {
    config = {
      label: "Admin",
      icon: Shield,
      items: [
        { title: "Dashboard", url: "/admin", icon: Search },
      ],
    };
  } else if (role === "placement") {
    config = {
      label: "Placement Cell",
      icon: Briefcase,
      items: [
        { title: "Dashboard", url: "/placement-cell", icon: Search },
      ],
    };
  } else {
    // default = student
    config = {
      label: "Student",
      icon: GraduationCap,
      items: [
        { title: "Dashboard", url: "/student", icon: Search },
        { title: "Companies", url: "/student#companies", icon: Building2 },
        { title: "Skills", url: "/student#skills", icon: Lightbulb },
      ],
    };
  }

  return (
    <Sidebar collapsible="icon">

      {/* HEADER */}
      <SidebarHeader className="p-3">
        {!collapsed && (
          <>
            <h2 className="text-lg font-bold text-sidebar-foreground px-2 mb-2">
              Career Compass

            </h2>

            <div className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-sidebar-foreground">
              <config.icon className="h-4 w-4" />
              <span>{config.label}</span>
            </div>
          </>
        )}
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{config.label} Menu</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {config.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/student" || item.url === "/admin" || item.url === "/placement-cell"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>

        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}