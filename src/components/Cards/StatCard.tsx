import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; label: string };
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, description, trend, className }: StatCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group rounded-xl border bg-card p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:gradient-primary">
          <Icon className="h-5 w-5 text-secondary-foreground transition-colors group-hover:text-primary-foreground" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold font-display">{value}</p>
      {trend && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={cn("text-xs font-semibold", trend.value >= 0 ? "text-emerald-600" : "text-destructive")}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
      {description && !trend && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </motion.div>
  );
};

export default StatCard;
