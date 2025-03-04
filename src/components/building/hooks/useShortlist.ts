
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useShortlist(id: string, buildingName: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { mutate: toggleShortlist, isPending } = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not logged in");
      }

      const newShortlistState = !isShortlisted;

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
      // Invalidate both queries to ensure UI updates everywhere
      queryClient.invalidateQueries({ queryKey: ['shortlist', id] });
      queryClient.invalidateQueries({ queryKey: ['buildingScores'] });
      queryClient.invalidateQueries({ queryKey: ['shortlistedBuildings'] });
      
      toast({
        title: newState ? "Added to shortlist" : "Removed from shortlist",
        description: `${buildingName} has been ${newState ? 'added to' : 'removed from'} your shortlist`,
      });
    },
    onError: (error) => {
      if (error.message === "User not logged in") {
        toast({
          title: "Please login",
          description: "You need to be logged in to shortlist buildings",
          variant: "destructive",
        });
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

  return {
    isShortlisted: isShortlisted || false,
    isShortlistedLoading,
    toggleShortlist,
    isToggling: isPending
  };
}
