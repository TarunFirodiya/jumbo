
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface BudgetStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function BudgetStep({ value, onChange }: BudgetStepProps) {
  const formatBudgetValue = (value: number) => {
    if (value < 100) {
      return `${value}L`;
    }
    return `${(value / 100).toFixed(1)}Cr`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <Label className="text-sm">What's your maximum budget for a home?</Label>
        <span className="text-sm font-medium">{formatBudgetValue(value)}</span>
      </div>
      <div className="px-2">
        <Slider
          min={50}
          max={600}
          step={10}
          value={[value]}
          onValueChange={(value) => onChange(value[0])}
          showTooltip
          tooltipContent={(value) => formatBudgetValue(value)}
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>50L</span>
          <span>6Cr</span>
        </div>
      </div>
    </div>
  );
}
