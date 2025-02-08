import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProgressIndicator from "@/components/ui/progress-indicator";
import { LocationStep } from "@/components/preferences/LocationStep";
import { BudgetStep } from "@/components/preferences/BudgetStep";
import { BHKStep } from "@/components/preferences/BHKStep";
import { LifestyleStep } from "@/components/preferences/LifestyleStep";
import { FeaturesStep } from "@/components/preferences/FeaturesStep";
import { DealBreakersStep } from "@/components/preferences/DealBreakersStep";
import { motion } from "framer-motion";
import { Json } from "@/integrations/supabase/types";

interface FormData {
  preferred_localities: Json[];
  max_budget: number;
  bhk_preferences: number[];
  lifestyle_cohort: string;
  home_features: string[];
  custom_home_features: string[];
  deal_breakers: string[];
  custom_deal_breakers: string[];
}

export default function Preferences() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const totalSteps = 6;
  const [formData, setFormData] = useState<FormData>({
    preferred_localities: [],
    max_budget: 50,
    bhk_preferences: [],
    lifestyle_cohort: "",
    home_features: [],
    custom_home_features: [],
    deal_breakers: [],
    custom_deal_breakers: [],
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          toast({
            title: "Authentication required",
            description: "You must be logged in to save preferences",
            variant: "destructive",
          });
          return;
        }
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/auth");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in Preferences:", event, session);
      if (!session) {
        navigate("/auth");
        return;
      }
      setIsAuthenticated(true);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  // Fetch existing preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!isAuthenticated) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (preferences) {
          setFormData(prev => ({
            ...prev,
            preferred_localities: preferences.preferred_localities || [],
            max_budget: preferences.max_budget || 50,
            bhk_preferences: preferences.bhk_preferences || [],
            lifestyle_cohort: preferences.lifestyle_cohort ? preferences.lifestyle_cohort.toString() : "",
            home_features: preferences.home_features || [],
            deal_breakers: preferences.deal_breakers || [],
            custom_home_features: [],
            custom_deal_breakers: [],
          }));
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
        toast({
          title: "Error",
          description: "Failed to load your preferences",
          variant: "destructive",
        });
      }
    };

    if (isAuthenticated) {
      fetchPreferences();
    }
  }, [isAuthenticated, toast]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: "You must be logged in to save preferences",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

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
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        preferred_localities: formData.preferred_localities,
        max_budget: formData.max_budget,
        lifestyle_cohort: formData.lifestyle_cohort ? parseInt(formData.lifestyle_cohort) : null,
        home_features: [...formData.home_features, ...formData.custom_home_features],
        deal_breakers: [...formData.deal_breakers, ...formData.custom_deal_breakers],
        bhk_preferences: formData.bhk_preferences,
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

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <LocationStep
            value={formData.preferred_localities}
            onChange={(value) => setFormData({ ...formData, preferred_localities: value })}
          />
        );
      case 2:
        return (
          <BudgetStep
            value={formData.max_budget}
            onChange={(value) => setFormData({ ...formData, max_budget: value })}
          />
        );
      case 3:
        return (
          <BHKStep
            value={formData.bhk_preferences}
            onChange={(value) => setFormData({ ...formData, bhk_preferences: value })}
          />
        );
      case 4:
        return (
          <LifestyleStep
            value={formData.lifestyle_cohort}
            onChange={(value) => setFormData({ ...formData, lifestyle_cohort: value })}
          />
        );
      case 5:
        return (
          <FeaturesStep
            value={formData.home_features}
            onChange={(value) => setFormData({ ...formData, home_features: value })}
            onAddCustom={(value) => setFormData({ 
              ...formData, 
              custom_home_features: [...formData.custom_home_features, value] 
            })}
          />
        );
      case 6:
        return (
          <DealBreakersStep
            value={formData.deal_breakers}
            onChange={(value) => setFormData({ ...formData, deal_breakers: value })}
            onAddCustom={(value) => setFormData({ 
              ...formData, 
              custom_deal_breakers: [...formData.custom_deal_breakers, value] 
            })}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        {renderCurrentStep()}
      </motion.div>
      
      <div className="mt-8">
        <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
