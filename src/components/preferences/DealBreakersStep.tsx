
import { TagsSelector } from "@/components/ui/tags-selector";

interface DealBreakersStepProps {
  value: string[];
  onChange: (value: string[]) => void;
  onAddCustom: (value: string) => void;
}

const DEAL_BREAKER_TAGS = [
  { id: "south_facing", label: "South Facing" },
  { id: "bad_access_road", label: "Bad Access Road" },
  { id: "water_issue", label: "Water Issue" },
  { id: "high_repairs", label: "High Repairs" },
  { id: "cash_payment", label: "Cash Payment" },
];

export function DealBreakersStep({ value, onChange }: DealBreakersStepProps) {
  const selectedTags = DEAL_BREAKER_TAGS.filter(tag => value.includes(tag.id));

  return (
    <div className="space-y-4 animate-fade-in">
      <TagsSelector 
        tags={DEAL_BREAKER_TAGS}
        selectedTags={selectedTags}
        onTagSelect={(tags) => onChange(tags.map(t => t.id))}
        title="What are your deal breakers? (select any 3)"
      />
    </div>
  );
}
