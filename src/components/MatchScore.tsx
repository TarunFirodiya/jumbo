
import { cn } from "@/lib/utils";

interface MatchScoreProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function MatchScore({ score, showLabel = true, className }: MatchScoreProps) {
  const percentage = Math.round(score * 100);
  const strokeWidth = 6;
  const size = 70;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(score * circumference)} ${circumference}`;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-[70px] h-[70px]">
        <svg className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-muted fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-green-500 fill-none"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
          {percentage}%
        </div>
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground mt-1">Match</span>
      )}
    </div>
  );
}
