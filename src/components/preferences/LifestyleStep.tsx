import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface LifestyleStepProps {
  value: string;
  onChange: (value: string) => void;
}

const lifestyleOptions = [
  { 
    title: "Luxury Amenities", 
    value: "luxury",
    image: "/lovable-uploads/78099c8f-77ed-425b-a422-4b59f9d9647a.png"
  },
  { 
    title: "Gated Society, Amenities don't matter", 
    value: "gated_no_amenities",
    image: "/lovable-uploads/7f78928d-0b35-4267-8b36-ead15a4ed061.png"
  },
  { 
    title: "Gated Society, Basic Amenities", 
    value: "gated_basic",
    image: "/lovable-uploads/93986bd2-d46e-4473-a596-16cec932d7cd.png"
  },
  { 
    title: "Standalone Building", 
    value: "standalone",
    image: "/lovable-uploads/624fb8be-298e-45c4-b30c-2bd59fba032e.png"
  },
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
              "relative p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all overflow-hidden group",
              value === option.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="relative w-full aspect-video rounded-md overflow-hidden">
              <img 
                src={option.image} 
                alt={option.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>
            <span className="text-sm text-center font-medium">{option.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}