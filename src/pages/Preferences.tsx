import { useState } from "react";
import { PreferencesForm } from "@/components/PreferencesForm";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProgressIndicator from "@/components/ui/progress-indicator";
import { LocationStep } from "@/components/preferences/LocationStep";
import { BudgetStep } from "@/components/preferences/BudgetStep";
import { motion } from "framer-motion";

export default function Preferences() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    preferred_localities: [] as string[],
    max_budget: 50,
    bhk_preferences: [] as string[],
    lifestyle_cohort: "",
    home_features: [] as string[],
    deal_breakers: [] as string[],
  });

  const handleSubmit = async (formData: any) => {
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
        preferred_localities: formData.preferred_localities,
        max_budget: formData.max_budget,
        lifestyle_cohort: formData.lifestyle_cohort,
        home_features: formData.home_features,
        deal_breakers: formData.deal_breakers,
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
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="bg-primary p-8 rounded-lg mb-8">
        <ProgressIndicator currentStep={currentStep} onStepChange={setCurrentStep} />
      </div>
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderCurrentStep()}
      </motion.div>
    </div>
  );
}