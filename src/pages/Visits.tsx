
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

interface Visit {
  id: string;
  building_name: string;
  visit_day: string;
  visit_time: string;
  status: string;
  created_at: string;
}

const Visits = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          id,
          visit_day,
          visit_time,
          status,
          created_at,
          buildings!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVisits(data.map(visit => ({
        id: visit.id,
        building_name: visit.buildings.name,
        visit_day: visit.visit_day,
        visit_time: visit.visit_time,
        status: visit.status,
        created_at: visit.created_at,
      })));
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast({
        title: "Error",
        description: "Could not load visits",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleReschedule = (visitId: string) => {
    // To be implemented
    toast({
      title: "Coming Soon",
      description: "Rescheduling will be available soon",
    });
  };

  const handleCancel = async (visitId: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({ status: 'cancelled' })
        .eq('id', visitId);

      if (error) throw error;

      toast({
        title: "Visit Cancelled",
        description: "Your visit has been cancelled successfully",
      });
      
      fetchVisits(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling visit:', error);
      toast({
        title: "Error",
        description: "Could not cancel visit",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Visits</h1>
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading visits...</p>
          ) : visits.length === 0 ? (
            <p className="text-center text-muted-foreground">No visits scheduled yet</p>
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
                {visits.map((visit) => (
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
                          onClick={() => handleReschedule(visit.id)}
                          disabled={visit.status === 'cancelled'}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(visit.id)}
                          disabled={visit.status === 'cancelled'}
                          className="text-destructive hover:text-destructive"
                        >
                          <XOctagon className="h-4 w-4 mr-1" />
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
    </div>
  );
};

export default Visits;
