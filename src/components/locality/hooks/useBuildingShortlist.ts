
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useBuildingShortlist(
  user: any, 
  buildingScores: Record<string, any> | null,
  refetchBuildingScores: () => void
) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<"shortlist" | "visit" | "login">("login");

  const handleShortlistToggle = async (buildingId: string) => {
    if (!user) {
      setAuthAction("shortlist");
      setShowAuthModal(true);
      return;
    }

    try {
      const isCurrentlyShortlisted = buildingScores?.[buildingId]?.shortlisted || false;
      
      if (isCurrentlyShortlisted) {
        // If already shortlisted, remove from shortlist
        const { error } = await supabase
          .from('user_building_scores')
          .update({ shortlisted: false })
          .eq('user_id', user.id)
          .eq('building_id', buildingId);

        if (error) throw error;
        
        toast({
          title: "Removed from shortlist",
          description: "Property has been removed from your shortlist.",
          variant: "default",
        });
      } else {
        // Check if record exists
        const { data: existingRecord } = await supabase
          .from('user_building_scores')
          .select('*')
          .eq('user_id', user.id)
          .eq('building_id', buildingId)
          .single();
        
        if (existingRecord) {
          // Update existing record
          const { error } = await supabase
            .from('user_building_scores')
            .update({ shortlisted: true })
            .eq('user_id', user.id)
            .eq('building_id', buildingId);
            
          if (error) throw error;
        } else {
          // Create new record
          const { error } = await supabase
            .from('user_building_scores')
            .insert([{ 
              user_id: user.id, 
              building_id: buildingId,
              shortlisted: true
            }]);
            
          if (error) throw error;
        }
        
        toast({
          title: "Added to shortlist",
          description: "Property has been added to your shortlist.",
          variant: "default",
        });
      }
      
      // Refetch the building scores to update UI
      refetchBuildingScores();
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      toast({
        title: "Error",
        description: "There was an error updating your shortlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    handleShortlistToggle,
    showAuthModal,
    setShowAuthModal,
    authAction
  };
}
