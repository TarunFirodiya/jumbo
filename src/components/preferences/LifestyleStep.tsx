import { Label } from "@/components/ui/label";
import { Castle, Building2, Home, Trees } from "lucide-react";
import { cn } from "@/lib/utils";

interface LifestyleStepProps {
  value: string;
  onChange: (value: string) => void;
}

const lifestyleOptions = [
  { title: "Luxury Amenities", icon: Castle, value: "luxury" },
  { title: "Gated Apartment with Basic Amenities", icon: Building2, value: "gated_basic" },
  { title: "Gated Apartment, Amenities don't matter", icon: Home, value: "gated_no_amenities" },
  { title: "Independent Villa", icon: Trees, value: "villa" },
];

export function LifestyleStep({ value, onChange }: LifestyleStepProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Label className="text-sm">What kind of amenities are you looking for?</Label>
      <div className="grid grid-cols-2 gap-4">
        {lifestyleOptions.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all",
              value === option.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
          >
            <option.icon className="w-8 h-8" />
            <span className="text-sm text-center">{option.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}