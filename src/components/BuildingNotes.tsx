import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface BuildingNotesProps {
  buildingId: string;
}

export default function BuildingNotes({ buildingId }: BuildingNotesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: buildingNotes, isLoading } = useQuery({
    queryKey: ['buildingNotes', buildingId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_building_scores')
        .select('notes')
        .eq('building_id', buildingId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data?.notes || "";
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (newNotes: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('user_building_scores')
        .upsert({
          building_id: buildingId,
          user_id: user.id,
          notes: newNotes,
        }, {
          onConflict: 'user_id,building_id',
        });

      if (error) throw error;
      return newNotes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingNotes', buildingId] });
      setIsEditing(false);
      toast({
        title: "Notes updated",
        description: "Your notes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating notes:", error);
    },
  });

  const handleEdit = () => {
    setNotes(buildingNotes || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    updateNotesMutation.mutate(notes);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNotes(buildingNotes || "");
  };

  if (isLoading) {
    return <div>Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      {isEditing ? (
        <>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your notes here..."
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateNotesMutation.isPending}>
              Save Notes
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          {buildingNotes ? (
            <>
              <p className="whitespace-pre-wrap">{buildingNotes}</p>
              <Button variant="outline" onClick={handleEdit}>
                Edit Notes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleEdit}>
              Add Notes
            </Button>
          )}
        </div>
      )}
    </div>
  );
}