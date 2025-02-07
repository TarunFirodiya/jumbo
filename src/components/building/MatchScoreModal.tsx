
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Match Score Breakdown</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Match</span>
              <span className="font-medium">{Math.round(scores.overall_match_score * 100)}%</span>
            </div>
            <Progress value={scores.overall_match_score * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Location Match</span>
              <span className="font-medium">{Math.round(scores.location_match_score * 100)}%</span>
            </div>
            <Progress value={scores.location_match_score * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Match</span>
              <span className="font-medium">{Math.round(scores.budget_match_score * 100)}%</span>
            </div>
            <Progress value={scores.budget_match_score * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Lifestyle Match</span>
              <span className="font-medium">{Math.round(scores.lifestyle_match_score * 100)}%</span>
            </div>
            <Progress value={scores.lifestyle_match_score * 100} className="h-2" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
