import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap, Upload, ShieldCheck, Search, Building2, Lightbulb,
  BarChart3, FileCheck, Users
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

type Role = "student" | "placement" | "admin";

const roleConfig = {
  student: {
    label: "Student",
    icon: GraduationCap,
    items: [
      { title: "Dashboard", url: "/", icon: Search },
      { title: "Companies", url: "/#companies", icon: Building2 },
      { title: "Skills", url: "/#skills", icon: Lightbulb },
    ],
  },
  placement: {
    label: "Placement Cell",
    icon: Upload,
    items: [
      { title: "Upload Data", url: "/placement-cell", icon: Upload },
      { title: "Statistics", url: "/placement-cell#stats", icon: BarChart3 },
    ],
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    items: [
      { title: "Approvals", url: "/admin", icon: FileCheck },
      { title: "Verified Data", url: "/admin#verified", icon: Users },
    ],
  },
};

const roles: Role[] = ["student", "placement", "admin"];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getActiveRole = (): Role => {
    if (location.pathname.startsWith("/placement-cell")) return "placement";
    if (location.pathname.startsWith("/admin")) return "admin";
    return "student";
  };

  const [activeRole, setActiveRole] = useState<Role>(getActiveRole());
  const config = roleConfig[activeRole];

  const handleRoleSwitch = (role: Role) => {
    setActiveRole(role);
    const firstUrl = roleConfig[role].items[0].url;
    navigate(firstUrl.split("#")[0]);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        {!collapsed && (
          <h2 className="text-lg font-bold text-sidebar-foreground px-2 mb-3">
            Campus Placement Hub
          </h2>
        )}
        <div className={`flex ${collapsed ? "flex-col" : ""} gap-1`}>
          {roles.map((role) => {
            const Icon = roleConfig[role].icon;
            const isActive = activeRole === role;
            return (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  } ${collapsed ? "justify-center px-2" : "flex-1 justify-center"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{roleConfig[role].label}</span>}
              </button>
            );
          })}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{config.label} Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {config.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url.split("#")[0]}
                      end
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
