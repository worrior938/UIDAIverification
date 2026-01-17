import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "blue" | "green" | "red" | "amber";
  className?: string;
}

const colorStyles = {
  blue: "bg-blue-50 text-blue-600 ring-blue-500/10",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-500/10",
  red: "bg-rose-50 text-rose-600 ring-rose-500/10",
  amber: "bg-amber-50 text-amber-600 ring-amber-500/10",
};

export function StatCard({ 
  label, 
  value, 
  subtext, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = "blue",
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <h3 className="text-3xl font-bold font-display tracking-tight text-slate-900 group-hover:scale-105 transition-transform duration-300 origin-left">
            {value}
          </h3>
        </div>
        <div className={cn("p-3 rounded-xl ring-1 shadow-sm transition-colors", colorStyles[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      {(subtext || trend) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend && (
            <span className={cn(
              "font-medium px-1.5 py-0.5 rounded text-xs",
              trend === "up" ? "bg-emerald-100 text-emerald-700" : 
              trend === "down" ? "bg-rose-100 text-rose-700" : 
              "bg-slate-100 text-slate-700"
            )}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "−"} {trendValue}
            </span>
          )}
          <span className="text-muted-foreground line-clamp-1">{subtext}</span>
        </div>
      )}
    </div>
  );
}
