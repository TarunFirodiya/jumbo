import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Castle, Building2, Home, Trees, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { supabase } from "@/integrations/supabase/client";

interface PreferencesFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  mode?: 'create' | 'edit';
}

const localities = [
  { value: "indiranagar", label: "Indiranagar" },
  { value: "koramangala", label: "Koramangala" },
  { value: "whitefield", label: "Whitefield" },
  { value: "jayanagar", label: "Jayanagar" },
  { value: "jp_nagar", label: "JP Nagar" },
  { value: "marathahalli", label: "Marathahalli" },
];

const bhkOptions = [
  { value: 2, label: "2 BHK" },
  { value: 3, label: "3 BHK" },
  { value: 4, label: "4 BHK" },
  { value: 5, label: "5 BHK" },
];

export function PreferencesForm({ initialData, onSubmit, mode = 'create' }: PreferencesFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    preferred_localities: [] as string[],
    bhk_preferences: [] as number[],
    location_radius: 5,
    max_budget: 50,
    lifestyle_cohort: "",
    home_features: [] as string[],
    custom_home_features: [] as string[],
    deal_breakers: [] as string[],
    custom_deal_breakers: [] as string[],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        home_features: initialData.home_features || [],
        deal_breakers: initialData.deal_breakers || [],
        custom_home_features: [],
        custom_deal_breakers: [],
        preferred_localities: initialData.preferred_localities || [],
        bhk_preferences: initialData.bhk_preferences || [],
      }));
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatBudgetValue = (value: number) => {
    if (value < 100) {
      return `${value}L`;
    }
    return `${(value / 100).toFixed(1)}Cr`;
  };

  const lifestyleOptions = [
    { title: "Luxury Amenities", icon: Castle, value: "luxury" },
    { title: "Gated Apartment with Basic Amenities", icon: Building2, value: "gated_basic" },
    { title: "Gated Apartment, Amenities don't matter", icon: Home, value: "gated_no_amenities" },
    { title: "Independent Villa", icon: Trees, value: "villa" },
  ];

  const homeFeatures = ["Balconies", "Spacious Rooms", "Great Ventilation"];
  const dealBreakers = ["Old construction", "South Facing Door", "Bad Access Roads"];

  const renderSelectedLocalities = (value: string[]) => {
    if (value.length === 0) return "";
    if (value.length === 1) {
      return localities.find(l => l.value === value[0])?.label;
    }
    return `${value.length} localities selected`;
  };

  const renderSelectedBHK = (value: number[]) => {
    if (value.length === 0) return "";
    if (value.length === 1) {
      return bhkOptions.find(b => b.value === value[0])?.label;
    }
    return `${value.length} types selected`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allHomeFeatures = [
      ...formData.home_features,
      ...formData.custom_home_features,
    ];
    const allDealBreakers = [
      ...formData.deal_breakers,
      ...formData.custom_deal_breakers,
    ];

    const dataToSubmit = {
      ...formData,
      home_features: allHomeFeatures,
      deal_breakers: allDealBreakers,
    };

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm">Where are you looking to live?</Label>
              <MultiSelectCombobox
                label="Localities"
                options={localities}
                value={formData.preferred_localities}
                onChange={(value) => handleInputChange("preferred_localities", value)}
                renderItem={(option) => option.label}
                renderSelectedItem={renderSelectedLocalities}
                placeholder="Search localities..."
              />
            </div>

            <div className="space-y-4">
              <Label className="text-sm">What's your maximum budget for a home?</Label>
              <div className="px-2">
                <Slider
                  min={50}
                  max={600}
                  step={10}
                  value={[formData.max_budget]}
                  onValueChange={(value) => handleInputChange("max_budget", value[0])}
                  showTooltip
                  tooltipContent={(value) => formatBudgetValue(value)}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>50L</span>
                  <span>6Cr</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm">How many bedrooms are you looking for?</Label>
              <MultiSelectCombobox
                label="BHK Types"
                options={bhkOptions}
                value={formData.bhk_preferences}
                onChange={(value) => handleInputChange("bhk_preferences", value)}
                renderItem={(option) => option.label}
                renderSelectedItem={renderSelectedBHK}
                placeholder="Search BHK types..."
              />
            </div>

            <div className="space-y-4">
              <Label className="text-sm">What kind of amenities are you looking for?</Label>
              <div className="grid grid-cols-2 gap-4">
                {lifestyleOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => handleInputChange("lifestyle_cohort", option.value)}
                    className={cn(
                      "p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all",
                      formData.lifestyle_cohort === option.value
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

            <div className="space-y-4">
              <Label className="text-sm">Which of these does your ideal home have?</Label>
              <div className="grid grid-cols-2 gap-4">
                {homeFeatures.map((feature) => (
                  <button
                    type="button"
                    key={feature}
                    onClick={() => {
                      const features = formData.home_features.includes(feature)
                        ? formData.home_features.filter((f) => f !== feature)
                        : [...formData.home_features, feature];
                      handleInputChange("home_features", features);
                    }}
                    className={cn(
                      "p-3 rounded-lg border-2 text-left transition-all",
                      formData.home_features.includes(feature)
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
                      handleInputChange("custom_home_features", [
                        ...formData.custom_home_features,
                        customFeature,
                      ]);
                    }
                  }}
                  className="p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Other</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm">Are there any deal-breakers?</Label>
              <div className="grid grid-cols-2 gap-4">
                {dealBreakers.map((dealBreaker) => (
                  <button
                    type="button"
                    key={dealBreaker}
                    onClick={() => {
                      const breakers = formData.deal_breakers.includes(dealBreaker)
                        ? formData.deal_breakers.filter((d) => d !== dealBreaker)
                        : [...formData.deal_breakers, dealBreaker];
                      handleInputChange("deal_breakers", breakers);
                    }}
                    className={cn(
                      "p-3 rounded-lg border-2 text-left transition-all",
                      formData.deal_breakers.includes(dealBreaker)
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
                      handleInputChange("custom_deal_breakers", [
                        ...formData.custom_deal_breakers,
                        customBreaker,
                      ]);
                    }
                  }}
                  className="p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Other</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button type="submit" className="w-full">
              {mode === 'create' ? 'Save Preferences' : 'Update Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}