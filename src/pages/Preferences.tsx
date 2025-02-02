import { PreferencesForm } from "@/components/PreferencesForm";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Preferences() {
  const { toast } = useToast();
  const navigate = useNavigate();

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
        location_preference_input: formData.location_preference_input,
        location_radius: formData.location_radius,
        max_budget: parseFloat(formData.max_budget) || null,
        lifestyle_cohort: formData.lifestyle_cohort,
        home_features: formData.home_features,
        deal_breakers: formData.deal_breakers,
        location_latitude: formData.location_latitude,
        location_longitude: formData.location_longitude,
        preferred_localities: formData.preferred_localities,
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

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <PreferencesForm onSubmit={handleSubmit} mode="create" />
    </div>
  );
}