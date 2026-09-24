import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface ReliabilityBadgeProps {
  rate: number; // 0 to 100
  size?: "sm" | "md" | "lg";
}

export function ReliabilityBadge({ rate, size = "md" }: ReliabilityBadgeProps) {
  let color = "text-teal-400";
  let bg = "bg-teal-500/10 border-teal-500/20";
  let Icon = CheckCircle2;

  if (rate < 70) {
    color = "text-red-400";
    bg = "bg-red-500/10 border-red-500/20";
    Icon = XCircle;
  } else if (rate < 90) {
    color = "text-amber-400";
    bg = "bg-amber-500/10 border-amber-500/20";
    Icon = AlertCircle;
  }

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizes[size]}`}>
      <Icon className={`${iconSizes[size]} ${color}`} />
      <span className={`font-semibold ${color}`}>{rate}% Reliable</span>
    </div>
  );
}
