import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturesStepProps {
  value: string[];
  onChange: (value: string[]) => void;
  onAddCustom: (value: string) => void;
}

const homeFeatures = ["Balconies", "Spacious Rooms", "Great Ventilation"];

export function FeaturesStep({ value, onChange, onAddCustom }: FeaturesStepProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Label className="text-sm">Which of these does your ideal home have?</Label>
      <div className="grid grid-cols-2 gap-4">
        {homeFeatures.map((feature) => (
          <button
            type="button"
            key={feature}
            onClick={() => {
              const features = value.includes(feature)
                ? value.filter((f) => f !== feature)
                : [...value, feature];
              onChange(features);
            }}
            className={cn(
              "p-3 rounded-lg border-2 text-left transition-all",
              value.includes(feature)
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
          >
            {feature}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const customFeature = window.prompt("Enter custom feature");
            if (customFeature) {
              onAddCustom(customFeature);
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