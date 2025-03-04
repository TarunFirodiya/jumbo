
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, XOctagon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { VisitRequestModal } from "@/components/VisitRequestModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Visit {
  id: string;
  building_id: string;
  building_name: string;
  listing_id: string;
  visit_day: string;
  visit_time: string;
  status: string;
  created_at: string;
}

const Visits = () => {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const { data: visits, isLoading } = useQuery<Visit[]>({
    queryKey: ['user-visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          id,
          building_id,
          listing_id,
          visit_day,
          visit_time,
          status,
          created_at,
          buildings!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching visits:', error);
        throw error;
      }

      return (data || []).map(visit => ({
        id: visit.id,
        building_id: visit.building_id,
        building_name: visit.buildings.name,
        listing_id: visit.listing_id,
        visit_day: visit.visit_day,
        visit_time: visit.visit_time,
        status: visit.status,
        created_at: visit.created_at,
      }));
    }
  });

  const cancelVisit = useMutation({
    mutationFn: async (visitId: string) => {
      setIsCancelling(visitId);
      
      const { error } = await supabase
        .from('visits')
        .update({ status: 'cancelled' })
        .eq('id', visitId);

      if (error) throw error;
      
      return visitId;
    },
    onSuccess: (visitId) => {
      queryClient.invalidateQueries({ queryKey: ['user-visits'] });
      toast({
        title: "Visit Cancelled",
        description: "Your visit has been cancelled successfully",
      });
      setIsCancelling(null);
    },
    onError: (error) => {
      console.error('Error cancelling visit:', error);
      toast({
        title: "Error",
        description: "Could not cancel visit",
        variant: "destructive",
      });
      setIsCancelling(null);
    }
  });

  const handleCancel = (visitId: string) => {
    cancelVisit.mutate(visitId);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Visits</h1>
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : visits?.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No visits scheduled yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Building</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits?.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell className="font-medium">{visit.building_name}</TableCell>
                    <TableCell>{visit.visit_day}</TableCell>
                    <TableCell>{visit.visit_time}</TableCell>
                    <TableCell>
                      <span className="capitalize">{visit.status}</span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(visit.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedVisit(visit)}
                          disabled={visit.status === 'cancelled'}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(visit.id)}
                          disabled={visit.status === 'cancelled' || isCancelling === visit.id}
                          className="text-destructive hover:text-destructive"
                        >
                          {isCancelling === visit.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-destructive mr-1"></div>
                          ) : (
                            <XOctagon className="h-4 w-4 mr-1" />
                          )}
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedVisit && (
        <VisitRequestModal
          open={!!selectedVisit}
          onOpenChange={(open) => !open && setSelectedVisit(null)}
          buildingId={selectedVisit.building_id}
          buildingName={selectedVisit.building_name}
          listingId={selectedVisit.listing_id}
          visitId={selectedVisit.id}
          initialDay={selectedVisit.visit_day}
          initialTime={selectedVisit.visit_time}
        />
      )}
    </div>
  );
};

export default Visits;
