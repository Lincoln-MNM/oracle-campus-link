import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
}

const Sidebar = ({ items, className }: SidebarProps) => {
  return (
    <aside className={cn("w-64 min-h-screen border-r bg-muted/30 p-4", className)}>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              item.active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
