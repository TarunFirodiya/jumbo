import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MatchScoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scores: {
    overall_match_score: number;
    location_match_score: number;
    budget_match_score: number;
    lifestyle_match_score: number;
  };
}

export function MatchScoreModal({ open, onOpenChange, scores }: MatchScoreModalProps) {
  const renderMatchScoreCircle = (score: number, label: string) => (
    <div className="relative flex flex-col items-center">
      <svg className="w-24 h-24 -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="36"
          className="stroke-muted fill-none"
          strokeWidth="6"
        />
        <circle
          cx="48"
          cy="48"
          r="36"
          className="stroke-primary fill-none transition-all duration-1000 ease-out"
          strokeWidth="6"
          strokeDasharray={`${score * 226.2} 226.2`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold">{Math.round(score * 100)}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Match Score Breakdown</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          {renderMatchScoreCircle(scores.overall_match_score || 0, "Overall")}
          {renderMatchScoreCircle(scores.location_match_score || 0, "Location")}
          {renderMatchScoreCircle(scores.budget_match_score || 0, "Budget")}
          {renderMatchScoreCircle(scores.lifestyle_match_score || 0, "Lifestyle")}
        </div>
      </DialogContent>
    </Dialog>
  );
}