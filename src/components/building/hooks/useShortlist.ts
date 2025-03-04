
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Create a global event system for auth related actions
export const triggerAuthModal = new CustomEvent('triggerAuthModal', {
  detail: { action: 'shortlist' }
});

export function useShortlist(id: string, buildingName: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOptimisticallyShortlisted, setIsOptimisticallyShortlisted] = useState<boolean | null>(null);

  const { data: isShortlisted, isLoading: isShortlistedLoading } = useQuery({
    queryKey: ['shortlist', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_building_scores')
        .select('shortlisted')
        .eq('building_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching shortlist status:', error);
        return false;
      }
      return data?.shortlisted || false;
    },
  });

  // Reset optimistic state once we have the real data
  const previousIsShortlisted = isShortlisted;
  if (previousIsShortlisted !== undefined && isOptimisticallyShortlisted !== null) {
    setIsOptimisticallyShortlisted(null);
  }

  const { mutate: toggleShortlist, isPending } = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Dispatch an event to trigger the auth modal
        document.dispatchEvent(new CustomEvent('triggerAuthModal', {
          detail: { action: 'shortlist' }
        }));
        throw new Error("User not logged in");
      }

      // Determine the new state (either from optimistic state or current data)
      const currentState = isOptimisticallyShortlisted !== null 
        ? isOptimisticallyShortlisted 
        : isShortlisted;
      const newShortlistState = !currentState;

      // Set optimistic state immediately
      setIsOptimisticallyShortlisted(newShortlistState);

      const { error } = await supabase
        .from('user_building_scores')
        .upsert({
          user_id: user.id,
          building_id: id,
          shortlisted: newShortlistState,
        }, {
          onConflict: 'user_id,building_id',
        });

      if (error) throw error;
      
      return newShortlistState;
    },
    onSuccess: (newState) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['shortlist', id] });
      queryClient.invalidateQueries({ queryKey: ['buildingScores'] });
      queryClient.invalidateQueries({ queryKey: ['shortlistedBuildings'] });
      
      toast({
        title: newState ? "Added to shortlist" : "Removed from shortlist",
        description: `${buildingName} has been ${newState ? 'added to' : 'removed from'} your shortlist`,
      });
    },
    onError: (error) => {
      // Reset optimistic state on error
      setIsOptimisticallyShortlisted(null);
      
      if (error.message === "User not logged in") {
        // Don't show error toast when opening auth modal
        console.log("Opening auth modal for shortlist action");
      } else {
        console.error('Error toggling shortlist:', error);
        toast({
          title: "Error",
          description: "Could not update shortlist",
          variant: "destructive",
        });
      }
    },
  });

  // Determine the current shortlist state, prioritizing optimistic updates
  const currentShortlistState = 
    isOptimisticallyShortlisted !== null ? isOptimisticallyShortlisted : (isShortlisted || false);

  return {
    isShortlisted: currentShortlistState,
    isShortlistedLoading,
    toggleShortlist,
    isToggling: isPending
  };
}
