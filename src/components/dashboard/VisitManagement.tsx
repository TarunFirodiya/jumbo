
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

// Define a simple enum for visit status to avoid deep type instantiation
type VisitStatus = 'to be confirmed' | 'confirmed' | 'completed' | 'cancelled';

// Simplified Visit type without using complex Database types
interface Visit {
  id: string;
  building_id: string;
  agent_id: string | null;
  status: VisitStatus;
  visit_day: string;
  visit_time: string;
  building_name: string;
  client_name: string | null;
  client_phone: string | null;
}

interface VisitManagementProps {
  currentUser: Profile;
}

export function VisitManagement({ currentUser }: VisitManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: visits } = useQuery<Visit[]>({
    queryKey: ['visits'],
    queryFn: async () => {
      let query = supabase
        .from('visits')
        .select(`
          id,
          building_id,
          agent_id,
          status,
          visit_day,
          visit_time,
          buildings!inner (name),
          client:profiles!visits_user_id_fkey (
            full_name,
            phone_number
          )
        `);

      if (currentUser.role === 'agent') {
        query = query.eq('agent_id', currentUser.id);
      }

      const { data: rawData, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the raw data to match our simplified Visit type
      return (rawData || []).map(item => ({
        id: item.id,
        building_id: item.building_id,
        agent_id: item.agent_id,
        status: item.status as VisitStatus,
        visit_day: item.visit_day,
        visit_time: item.visit_time,
        building_name: item.buildings?.name || '',
        client_name: item.client?.full_name || null,
        client_phone: item.client?.phone_number || null
      }));
    }
  });

  const updateVisitStatus = useMutation({
    mutationFn: async ({ visitId, status }: { visitId: string; status: VisitStatus }) => {
      const { error } = await supabase
        .from('visits')
        .update({ status })
        .eq('id', visitId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast({
        title: "Success",
        description: "Visit status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update visit status",
        variant: "destructive",
      });
      console.error('Error updating visit status:', error);
    }
  });

  const getStatusBadge = (status: VisitStatus) => {
    const variants: Record<VisitStatus, {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }> = {
      "to be confirmed": { variant: "outline", label: "To Be Confirmed" },
      "confirmed": { variant: "default", label: "Confirmed" },
      "completed": { variant: "secondary", label: "Completed" },
      "cancelled": { variant: "destructive", label: "Cancelled" }
    };

    return (
      <Badge variant={variants[status].variant}>
        {variants[status].label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Visits</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Building</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits?.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{visit.building_name}</TableCell>
                    <TableCell>{visit.client_name}</TableCell>
                    <TableCell>{visit.client_phone}</TableCell>
                    <TableCell>{visit.visit_day}</TableCell>
                    <TableCell>{visit.visit_time}</TableCell>
                    <TableCell>{getStatusBadge(visit.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {visit.status === 'to be confirmed' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => updateVisitStatus.mutate({ 
                                visitId: visit.id, 
                                status: 'confirmed' 
                              })}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => updateVisitStatus.mutate({ 
                                visitId: visit.id, 
                                status: 'cancelled' 
                              })}
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {visit.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => updateVisitStatus.mutate({ 
                              visitId: visit.id, 
                              status: 'completed' 
                            })}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!visits?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                      No visits scheduled
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
