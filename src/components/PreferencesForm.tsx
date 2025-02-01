import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Castle, Building2, Home, Trees } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";

interface PreferencesFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  mode?: 'create' | 'edit';
}

export function PreferencesForm({ initialData, onSubmit, mode = 'create' }: PreferencesFormProps) {
  const { toast } = useToast();
  const autocompleteInput = useRef<HTMLInputElement>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    location_preference_input: "",
    location_radius: 5,
    max_budget: 50,
    size: [] as string[],
    lifestyle_cohort: "",
    home_features: [] as string[],
    custom_home_features: [] as string[],
    deal_breakers: [] as string[],
    custom_deal_breakers: [] as string[],
    location_latitude: null as number | null,
    location_longitude: null as number | null,
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
      }));
    }
  }, [initialData]);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-google-maps-key`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch API key');
        }
        
        const data = await response.json();
        setGoogleMapsApiKey(data.apiKey);
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        toast({
          title: "Error",
          description: "Failed to load location search. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchApiKey();
  }, [toast]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!googleMapsApiKey || !window.google || !autocompleteInput.current) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initializeAutocomplete();
    };

    // Only append the script if it hasn't been added yet
    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }
  }, [googleMapsApiKey]);

  const initializeAutocomplete = () => {
    if (!autocompleteInput.current || !window.google) return;

    const bangaloreBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(12.864162, 77.438610),
      new google.maps.LatLng(13.139807, 77.711895)
    );

    const autocomplete = new google.maps.places.Autocomplete(autocompleteInput.current, {
      bounds: bangaloreBounds,
      strictBounds: true,
      componentRestrictions: { country: "in" },
      types: ['geocode', 'establishment']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location?.lat();
        const lng = place.geometry.location?.lng();
        setFormData(prev => ({
          ...prev,
          location_preference_input: place.formatted_address || prev.location_preference_input,
          location_latitude: lat || null,
          location_longitude: lng || null
        }));
      }
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatBudgetValue = (value: number) => {
    if (value < 100) {
      return `${value}L`;
    }
    return `${(value / 100).toFixed(1)}Cr`;
  };

  const bedroomOptions = [
    { id: "2bhk", label: "2 BHK" },
    { id: "3bhk", label: "3 BHK" },
    { id: "4bhk", label: "4 BHK+" },
  ];

  const lifestyleOptions = [
    { title: "Luxury Amenities", icon: Castle, value: "luxury" },
    { title: "Gated Apartment with Basic Amenities", icon: Building2, value: "gated_basic" },
    { title: "Gated Apartment, Amenities don't matter", icon: Home, value: "gated_no_amenities" },
    { title: "Independent Villa", icon: Trees, value: "villa" },
  ];

  const homeFeatures = ["Balconies", "Spacious Rooms", "Great Ventilation"];
  const dealBreakers = ["Old construction", "South Facing Door", "Bad Access Roads"];

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
              <Input
                ref={autocompleteInput}
                placeholder="Enter area or locality"
                value={formData.location_preference_input}
                onChange={(e) => handleInputChange("location_preference_input", e.target.value)}
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
              <div className="grid grid-cols-2 gap-4">
                {bedroomOptions.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => {
                      const sizes = formData.size.includes(option.id)
                        ? formData.size.filter((s) => s !== option.id)
                        : [...formData.size, option.id];
                      handleInputChange("size", sizes);
                    }}
                    className={cn(
                      "p-3 rounded-lg border-2 text-left transition-all",
                      formData.size.includes(option.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
