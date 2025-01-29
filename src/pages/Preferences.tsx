import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Plus, Home, Building2, Castle, Trees } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { id: 1, title: "Location" },
  { id: 2, title: "Budget" },
  { id: 3, title: "Lifestyle" },
];

type LocationStep = 1 | 2 | 3;

export default function Preferences() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [locationStep, setLocationStep] = useState<LocationStep>(1);
  const autocompleteInput = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    location_preference_input: "",
    proximity_type: "",
    proximity_location: "",
    location_radius: 5,
    max_budget: "",
    size: "",
    lifestyle_cohort: "",
    home_features: [] as string[],
    custom_home_features: [] as string[],
    deal_breakers: [] as string[],
    custom_deal_breakers: [] as string[],
    location_latitude: null as number | null,
    location_longitude: null as number | null,
  });

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (window.google && autocompleteInput.current) {
      const autocomplete = new google.maps.places.Autocomplete(autocompleteInput.current, {
        componentRestrictions: { country: "in" },
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(12.864162, 77.438610), // SW bounds of Bangalore
          new google.maps.LatLng(13.139807, 77.711895)  // NE bounds of Bangalore
        ),
        strictBounds: true,
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
            location_latitude: lat,
            location_longitude: lng
          }));
        }
      });
    }
  }, [currentStep, locationStep]);

  // Load Google Maps Script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1 && locationStep < 3) {
      setLocationStep((prev) => (prev + 1) as LocationStep);
      return;
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setLocationStep(1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1 && locationStep > 1) {
      setLocationStep((prev) => (prev - 1) as LocationStep);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

      // Combine custom and predefined features/deal-breakers
      const allHomeFeatures = [
        ...formData.home_features,
        ...formData.custom_home_features,
      ];
      const allDealBreakers = [
        ...formData.deal_breakers,
        ...formData.custom_deal_breakers,
      ];

      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,  // Explicitly set the user_id
        location_preference_input: formData.location_preference_input,
        location_radius: formData.location_radius,
        max_budget: parseFloat(formData.max_budget as string) || null,
        size: parseFloat(formData.size as string) || null,
        lifestyle_cohort: formData.lifestyle_cohort,
        home_features: allHomeFeatures,
        deal_breakers: allDealBreakers,
        location_latitude: formData.location_latitude,
        location_longitude: formData.location_longitude,
      }, {
        onConflict: 'user_id',  // Specify the conflict target
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
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderLocationStep = () => {
    switch (locationStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Label>Where are you looking to live?</Label>
            <Input
              ref={autocompleteInput}
              placeholder="Enter area or locality"
              value={formData.location_preference_input}
              onChange={(e) => handleInputChange("location_preference_input", e.target.value)}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Label>Do you want to live close to work, school, a metro station or a friend?</Label>
            <RadioGroup
              value={formData.proximity_type}
              onValueChange={(value) => handleInputChange("proximity_type", value)}
              className="grid grid-cols-2 gap-4"
            >
              {["Work", "School", "Metro Station", "Friend's Place"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.toLowerCase()} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <Label>{`Where is your ${formData.proximity_type}?`}</Label>
            <Input
              placeholder="Enter location"
              value={formData.proximity_location}
              onChange={(e) => handleInputChange("proximity_location", e.target.value)}
            />
          </div>
        );
    }
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

  const homeFeatures = ["Balconies", "Spacious Rooms", "Great Ventilation"];
  const dealBreakers = ["Old construction", "South Facing Door", "Bad Access Roads"];

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <Progress value={((currentStep - 1) * 100) / (steps.length - 1)} className="mb-2" />
        <div className="flex justify-between items-center">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center",
                step.id === currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border",
                  step.id === currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground"
                )}
              >
                {step.id}
              </div>
              <span className="ml-2">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title} Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderLocationStep()}

          {currentStep === 2 && (
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
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
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

              <div className="space-y-4">
                <Label>Which of these does your ideal home have?</Label>
                <div className="grid grid-cols-2 gap-4">
                  {homeFeatures.map((feature) => (
                    <button
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
                <Label>Are there any deal-breakers?</Label>
                <div className="grid grid-cols-2 gap-4">
                  {dealBreakers.map((dealBreaker) => (
                    <button
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
          )}

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 && locationStep === 1}
            >
              Back
            </Button>
            {currentStep === steps.length ? (
              <Button type="button" onClick={handleSubmit}>
                Submit
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
