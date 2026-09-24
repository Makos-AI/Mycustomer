import { Trophy } from "lucide-react";
import type { Milestone } from "@/lib/milestones";

interface MilestoneCardProps {
  milestone: Milestone;
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  return (
    <div className="flex justify-center my-6">
      <div className="max-w-[85%] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="w-12 h-12 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">{milestone.icon}</span>
          </div>
          <h3 className="font-bold text-amber-400 mb-1 flex items-center justify-center gap-1">
            <Trophy className="w-4 h-4" /> {milestone.title}
          </h3>
          <p className="text-xs text-slate-300">
            {milestone.message}
          </p>
        </div>
      </div>
    </div>
  );
}
