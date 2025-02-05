
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useShortlist(id: string, buildingName: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isShortlisted, refetch: refetchShortlist } = useQuery({
    queryKey: ['shortlist', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_building_scores')
        .select('shortlisted')
        .eq('building_id', id)
        .eq('user_id', user.id)
        .single();

      if (error) return false;
      return data?.shortlisted || false;
    },
  });

  const toggleShortlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to shortlist buildings",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_building_scores')
        .upsert({
          user_id: user.id,
          building_id: id,
          shortlisted: !isShortlisted,
        }, {
          onConflict: 'user_id,building_id',
        });

      if (error) throw error;

      await refetchShortlist();
      toast({
        title: isShortlisted ? "Removed from shortlist" : "Added to shortlist",
        description: `${buildingName} has been ${isShortlisted ? 'removed from' : 'added to'} your shortlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update shortlist",
        variant: "destructive",
      });
    }
  };

  return {
    isShortlisted,
    toggleShortlist
  };
}
