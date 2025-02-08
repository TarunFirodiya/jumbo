
import { Label } from "@/components/ui/label";
import { TagsSelector } from "@/components/ui/tags-selector";

interface FeaturesStepProps {
  value: string[];
  onChange: (value: string[]) => void;
  onAddCustom: (value: string) => void;
}

const HOME_TAGS = [
  { id: "high_rise", label: "High Rise" },
  { id: "balconies", label: "Balconies" },
  { id: "ventilation", label: "Ventilation" },
  { id: "new_construction", label: "New Construction" },
  { id: "child_friendly", label: "Child Friendly" },
  { id: "pet_friendly", label: "Pet Friendly" },
];

export function FeaturesStep({ value, onChange }: FeaturesStepProps) {
  const selectedTags = HOME_TAGS.filter(tag => value.includes(tag.id));

  return (
    <div className="space-y-4 animate-fade-in">
      <Label className="text-sm">Which of these does your ideal home have? (select any 3)</Label>
      <TagsSelector 
        tags={HOME_TAGS}
        selectedTags={selectedTags}
        onTagSelect={(tags) => onChange(tags.map(t => t.id))}
        title="Home Features"
      />
    </div>
  );
}
