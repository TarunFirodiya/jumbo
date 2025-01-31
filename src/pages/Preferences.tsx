import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Home, Building2, Castle, Trees } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TagsSelector } from "@/components/ui/tags-selector";
import ProgressIndicator from "@/components/ui/progress-indicator";
import { useNavigate } from "react-router-dom";

const steps = [
  { id: 1, title: "Location" },
  { id: 2, title: "Budget & Size" },
  { id: 3, title: "Lifestyle" },
  { id: 4, title: "Features" },
  { id: 5, title: "Deal Breakers" },
];

type LocationStep = 1 | 2 | 3;

export default function Preferences() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [locationStep, setLocationStep] = useState<LocationStep>(1);
  const autocompleteInput = useRef<HTMLInputElement>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  
  const homeFeatures = [
    { id: "balconies", label: "Balconies" },
    { id: "spacious-rooms", label: "Spacious Rooms" },
    { id: "ventilation", label: "Great Ventilation" },
  ];

  const dealBreakers = [
    { id: "old-construction", label: "Old construction" },
    { id: "south-facing", label: "South Facing Door" },
    { id: "bad-roads", label: "Bad Access Roads" },
  ];

  const [formData, setFormData] = useState({
    location_preference_input: "",
    proximity_type: "",
    proximity_location: "",
    location_radius: 5,
    max_budget: "",
    size: "",
    lifestyle_cohort: "",
    home_features: [] as { id: string; label: string }[],
    deal_breakers: [] as { id: string; label: string }[],
    location_latitude: null as number | null,
    location_longitude: null as number | null,
  });

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const headers = new Headers({
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        });

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-google-maps-key`,
          { headers }
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
    if (!googleMapsApiKey) return;

    const loadGoogleMapsScript = () => {
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeAutocomplete;
        document.head.appendChild(script);
      } else {
        initializeAutocomplete();
      }
    };

    loadGoogleMapsScript();
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
        console.log('Selected place:', { lat, lng, place });
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

  const lifestyleOptions = [
    { 
      title: "Luxury Amenities", 
      icon: Castle,
      value: "luxury"
    },
    { 
      title: "Gated Apartment with Basic Amenities", 
      icon: Building2,
      value: "gated_basic"
    },
    { 
      title: "Gated Apartment, Amenities don't matter", 
      icon: Home,
      value: "gated_no_amenities"
    },
    { 
      title: "Independent Villa", 
      icon: Trees,
      value: "villa"
    },
  ];

  const handleSubmit = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save preferences",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        location_preference_input: formData.location_preference_input,
        location_radius: formData.location_radius,
        max_budget: parseFloat(formData.max_budget) || null,
        size: parseFloat(formData.size) || null,
        lifestyle_cohort: formData.lifestyle_cohort,
        home_features: formData.home_features.map(f => f.label),
        deal_breakers: formData.deal_breakers.map(d => d.label),
        location_latitude: formData.location_latitude,
        location_longitude: formData.location_longitude,
      }, {
        onConflict: 'user_id',
      });

      if (error) {
        console.error("Error saving preferences:", error);
        toast({
          title: "Error",
          description: `Failed to save preferences: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your preferences have been saved!",
      });
      
      // Navigate to buildings page after successful submission
      navigate("/buildings");
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Label>Where are you looking to live?</Label>
            <Input
              ref={autocompleteInput}
              placeholder="Enter area or locality"
              value={formData.location_preference_input}
              onChange={(e) => handleInputChange("location_preference_input", e.target.value)}
              className="w-full"
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>What's your maximum budget for a home?</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.max_budget}
                onChange={(e) => handleInputChange("max_budget", e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <Label>How many bedrooms are you looking for?</Label>
              <Input
                type="number"
                placeholder="Number of bedrooms"
                value={formData.size}
                onChange={(e) => handleInputChange("size", e.target.value)}
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <Label>What kind of amenities are you looking for?</Label>
            <div className="grid grid-cols-2 gap-4">
              {lifestyleOptions.map((option) => (
                <button
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
        );
      
      case 4:
        return (
          <TagsSelector
            title="Which of these does your ideal home have?"
            tags={homeFeatures}
            selectedTags={formData.home_features}
            onTagSelect={(tags) => handleInputChange("home_features", tags)}
          />
        );
      
      case 5:
        return (
          <TagsSelector
            title="Are there any deal-breakers?"
            tags={dealBreakers}
            selectedTags={formData.deal_breakers}
            onTagSelect={(tags) => handleInputChange("deal_breakers", tags)}
          />
        );
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <ProgressIndicator 
          currentStep={currentStep} 
          onStepChange={setCurrentStep} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title} Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            {currentStep === steps.length ? (
              <Button type="button" onClick={handleSubmit}>
                Submit
              </Button>
            ) : (
              <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
