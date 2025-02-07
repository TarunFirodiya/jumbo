
import { Label } from "@/components/ui/label";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { Json } from "@/integrations/supabase/types";

interface LocationOption {
  value: string;
  label: string;
  latitude: number;
  longitude: number;
}

interface LocationStepProps {
  value: Json[];
  onChange: (value: Json[]) => void;
}

const localities: LocationOption[] = [
  { 
    value: "indiranagar", 
    label: "Indiranagar",
    latitude: 12.9719,
    longitude: 77.6412
  },
  { 
    value: "koramangala", 
    label: "Koramangala",
    latitude: 12.9279,
    longitude: 77.6271
  },
  { 
    value: "whitefield", 
    label: "Whitefield",
    latitude: 12.9698,
    longitude: 77.7500
  },
  { 
    value: "jayanagar", 
    label: "Jayanagar",
    latitude: 12.9250,
    longitude: 77.5938
  },
  { 
    value: "jp_nagar", 
    label: "JP Nagar",
    latitude: 12.9077,
    longitude: 77.5851
  },
  { 
    value: "marathahalli", 
    label: "Marathahalli",
    latitude: 12.9591,
    longitude: 77.6998
  }
];

export function LocationStep({ value, onChange }: LocationStepProps) {
  const renderSelectedLocalities = (selectedValues: string[]) => {
    if (selectedValues.length === 0) return "";
    if (selectedValues.length === 1) {
      return localities.find(l => l.value === selectedValues[0])?.label;
    }
    return `${selectedValues.length} localities selected`;
  };

  const handleChange = (selectedValues: string[]) => {
    // Convert selected values to full locality objects with coordinates
    const selectedLocalities = selectedValues.map(value => {
      const locality = localities.find(l => l.value === value);
      return {
        value: locality?.value,
        label: locality?.label,
        latitude: locality?.latitude,
        longitude: locality?.longitude
      };
    });
    onChange(selectedLocalities as Json[]);
  };

  // Extract just the values for the MultiSelectCombobox
  const selectedValues = value.map(v => (v as any).value);

  return (
    <div className="space-y-4 animate-fade-in">
      <Label className="text-sm">Where are you looking to live?</Label>
      <MultiSelectCombobox
        label="Localities"
        options={localities}
        value={selectedValues}
        onChange={handleChange}
        renderItem={(option) => option.label}
        renderSelectedItem={renderSelectedLocalities}
        placeholder="Search localities..."
      />
    </div>
  );
}
