
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useBuildingShortlist(
  user: any, 
  buildingScores: Record<string, any> | null, 
  refetchBuildingScores: () => Promise<any>
) {
  const { toast } = useToast();
  const [authAction, setAuthAction] = useState<"shortlist" | "visit" | "notify">("shortlist");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleShortlistToggle = useCallback(async (buildingId: string) => {
    if (!user) {
      setAuthAction("shortlist");
      setShowAuthModal(true);
      return;
    }

    try {
      const currentShortlistStatus = buildingScores?.[buildingId]?.shortlisted || false;
      const { error } = await supabase
        .from('user_building_scores')
        .upsert({
          user_id: user.id,
          building_id: buildingId,
          shortlisted: !currentShortlistStatus,
        }, {
          onConflict: 'user_id,building_id',
        });

      if (error) throw error;
      
      await refetchBuildingScores();
      
      toast({
        title: currentShortlistStatus ? "Removed from shortlist" : "Added to shortlist",
        description: currentShortlistStatus 
          ? "Building has been removed from your shortlist"
          : "Building has been added to your shortlist",
      });
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      toast({
        title: "Error",
        description: "Could not update shortlist",
        variant: "destructive",
      });
    }
  }, [user, buildingScores, toast, supabase, refetchBuildingScores]);

  return {
    handleShortlistToggle,
    authAction,
    showAuthModal,
    setShowAuthModal
  };
}
