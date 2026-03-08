import {
  LayoutDashboard, Users, BookOpen, ClipboardList, BarChart3, LogOut, GraduationCap, Shield, ScrollText,
  CalendarDays, Megaphone, DollarSign, ClipboardCheck, FileText as LeaveIcon, Code2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["admin", "staff", "viewer"] },
  { title: "Students", url: "/admin/students", icon: Users, roles: ["admin", "staff", "viewer"] },
  { title: "Subjects", url: "/admin/subjects", icon: BookOpen, roles: ["admin", "staff"] },
  { title: "Marks", url: "/admin/marks", icon: ClipboardList, roles: ["admin", "staff"] },
  { title: "Attendance", url: "/admin/attendance", icon: ClipboardCheck, roles: ["admin", "staff"] },
  { title: "Leave Approvals", url: "/admin/leaves", icon: LeaveIcon, roles: ["admin", "staff"] },
  { title: "Notices", url: "/admin/notices", icon: Megaphone, roles: ["admin", "staff"] },
  { title: "Calendar", url: "/admin/calendar", icon: CalendarDays, roles: ["admin", "staff", "viewer"] },
  { title: "Fee Management", url: "/admin/fees", icon: DollarSign, roles: ["admin"] },
  { title: "Reports", url: "/admin/reports", icon: BarChart3, roles: ["admin", "staff", "viewer"] },
  { title: "Activity Log", url: "/admin/logs", icon: ScrollText, roles: ["admin"] },
  
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const visibleItems = menuItems.filter((item) => !user || item.roles.includes(user.role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold font-display text-sidebar-foreground">SMS Portal</span>
              <span className="text-xs text-sidebar-foreground/60 capitalize">{user?.role || "Admin"} Panel</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} end
                      className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {user && !collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-sidebar-accent/30 px-3 py-2">
            <Shield className="h-4 w-4 text-sidebar-foreground/60" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <Button variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
