import { Label } from "@/components/ui/label";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";

interface LocationStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const localities = [
  { value: "indiranagar", label: "Indiranagar" },
  { value: "koramangala", label: "Koramangala" },
  { value: "whitefield", label: "Whitefield" },
  { value: "jayanagar", label: "Jayanagar" },
  { value: "jp_nagar", label: "JP Nagar" },
  { value: "marathahalli", label: "Marathahalli" },
];

export function LocationStep({ value, onChange }: LocationStepProps) {
  const renderSelectedLocalities = (value: string[]) => {
    if (value.length === 0) return "";
    if (value.length === 1) {
      return localities.find(l => l.value === value[0])?.label;
    }
    return `${value.length} localities selected`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Label className="text-sm">Where are you looking to live?</Label>
      <MultiSelectCombobox
        label="Localities"
        options={localities}
        value={value}
        onChange={onChange}
        renderItem={(option) => option.label}
        renderSelectedItem={renderSelectedLocalities}
        placeholder="Search localities..."
      />
    </div>
  );
}