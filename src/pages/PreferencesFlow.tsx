
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";

export default function PreferencesFlow() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    bhk_preferences: [],
    max_budget: 0,
    preferred_localities: [],
    amenities: [],
    home_features: [],
    deal_breakers: [],
    lifestyle_cohort: 0
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to save your preferences",
          variant: "destructive"
        });
        return;
      }

      // Save preferences to database
      const { error } = await supabase.from('user_preferences').upsert({
        user_id: user.id,
        ...preferences
      }, {
        onConflict: 'user_id'
      });

      if (error) throw error;

      toast({
        title: "Preferences saved",
        description: "Your home preferences have been saved successfully."
      });

      // Navigate to buildings page
      navigate('/buildings');
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="Tell Us Your Home Preferences | Cozy Dwell Search"
        description="Customize your home search by telling us what matters most to you - from location to amenities, budget, and lifestyle preferences."
      />
      
      <h1 className="text-3xl font-bold text-center mb-8">Find Your Perfect Home</h1>
      
      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <Tabs defaultValue="location" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="size">Size & Budget</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            </TabsList>
            
            <TabsContent value="location" className="space-y-4">
              <h2 className="text-xl font-semibold">Where would you like to live?</h2>
              <p className="text-muted-foreground">
                Tell us which areas you're interested in exploring.
              </p>
              
              {/* Location selection would go here */}
              <div className="py-8 text-center text-muted-foreground">
                Location selection interface would be here
              </div>
            </TabsContent>
            
            <TabsContent value="size" className="space-y-4">
              <h2 className="text-xl font-semibold">What size and budget works for you?</h2>
              <p className="text-muted-foreground">
                Select your preferred number of bedrooms and budget range.
              </p>
              
              {/* Size and budget selection would go here */}
              <div className="py-8 text-center text-muted-foreground">
                Size and budget selection interface would be here
              </div>
            </TabsContent>
            
            <TabsContent value="lifestyle" className="space-y-4">
              <h2 className="text-xl font-semibold">What matters most in your lifestyle?</h2>
              <p className="text-muted-foreground">
                Tell us about your priorities and deal-breakers.
              </p>
              
              {/* Lifestyle preferences would go here */}
              <div className="py-8 text-center text-muted-foreground">
                Lifestyle preferences interface would be here
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-4 mt-8">
            <Button onClick={() => navigate('/buildings')} variant="outline">
              Skip for now
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
