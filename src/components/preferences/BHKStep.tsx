import { Label } from "@/components/ui/label";
import { MultiSelectCombobox, BaseOption } from "@/components/ui/multi-select-combobox";

interface BHKStepProps {
  value: number[];
  onChange: (value: number[]) => void;
}

const bhkOptions: BaseOption<number>[] = [
  { value: 2, label: "2 BHK" },
  { value: 3, label: "3 BHK" },
  { value: 4, label: "4 BHK" },
  { value: 5, label: "5 BHK" },
];

export function BHKStep({ value, onChange }: BHKStepProps) {
  const renderSelectedBHK = (value: number[]) => {
    if (value.length === 0) return "";
    if (value.length === 1) {
      return bhkOptions.find(b => b.value === value[0])?.label;
    }
    return `${value.length} types selected`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Label className="text-sm">How many bedrooms are you looking for?</Label>
      <MultiSelectCombobox
        label="BHK Types"
        options={bhkOptions}
        value={value}
        onChange={onChange}
        renderItem={(option) => option.label}
        renderSelectedItem={renderSelectedBHK}
        placeholder="Search BHK types..."
      />
    </div>
  );
}