import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, description, className }: StatCardProps) => {
  return (
    <div className={cn("rounded-xl border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-secondary-foreground" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold font-display">{value}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
};

export default StatCard;
