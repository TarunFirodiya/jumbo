import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealBreakersStepProps {
  value: string[];
  onChange: (value: string[]) => void;
  onAddCustom: (value: string) => void;
}

const dealBreakers = ["Old construction", "South Facing Door", "Bad Access Roads"];

export function DealBreakersStep({ value, onChange, onAddCustom }: DealBreakersStepProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Label className="text-sm">Are there any deal-breakers?</Label>
      <div className="grid grid-cols-2 gap-4">
        {dealBreakers.map((dealBreaker) => (
          <button
            type="button"
            key={dealBreaker}
            onClick={() => {
              const breakers = value.includes(dealBreaker)
                ? value.filter((d) => d !== dealBreaker)
                : [...value, dealBreaker];
              onChange(breakers);
            }}
            className={cn(
              "p-3 rounded-lg border-2 text-left transition-all",
              value.includes(dealBreaker)
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
          >
            {dealBreaker}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const customBreaker = window.prompt("Enter custom deal-breaker");
            if (customBreaker) {
              onAddCustom(customBreaker);
            }
          }}
          className="p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Other</span>
        </button>
      </div>
    </div>
  );
}