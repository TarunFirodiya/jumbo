
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Edit } from "lucide-react";
import { formatDate, formatTime } from "@/lib/date-utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

// Define the allowed visit status types
type VisitStatus = "confirmed" | "completed" | "cancelled";

interface VisitManagementProps {
  visits: any[];
  isLoading: boolean;
  refetch: () => void;
}

export default function VisitManagement({ visits, isLoading, refetch }: VisitManagementProps) {
  const { toast } = useToast();
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [formState, setFormState] = useState<{
    visit_status: VisitStatus;
    notes: string;
  }>({
    visit_status: "confirmed",
    notes: "",
  });

  const statusColors = {
    confirmed: "bg-green-100 text-green-800 border-green-300",
    completed: "bg-blue-100 text-blue-800 border-blue-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  const openUpdateDialog = (visit: any) => {
    setSelectedVisit(visit);
    
    // Define a safe way to handle the incoming status
    const status = visit.visit_status || "confirmed";
    const safeStatus: VisitStatus = (["confirmed", "completed", "cancelled"].includes(status) 
      ? status as VisitStatus 
      : "confirmed");
    
    setFormState({
      visit_status: safeStatus,
      notes: visit.notes || "",
    });
    setDialogOpen(true);
  };

  const updateVisitStatus = async () => {
    if (!selectedVisit) return;
    
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("visits")
        .update({
          visit_status: formState.visit_status,
          notes: formState.notes,
        })
        .eq("id", selectedVisit.id);

      if (error) throw error;
      
      toast({
        title: "Visit updated",
        description: `Visit status updated to ${formState.visit_status}`,
      });
      
      setDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error updating visit:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the visit status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Format the date for display
  const displayDate = (dateValue: string | Date) => {
    try {
      if (!dateValue) return "Date unavailable";
      
      // Handle Date objects
      if (dateValue instanceof Date) {
        return format(dateValue, "MMMM d, yyyy");
      }
      
      // Handle ISO strings
      if (typeof dateValue === 'string' && dateValue.includes('T')) {
        return format(new Date(dateValue), "MMMM d, yyyy");
      }
      
      return String(dateValue); // Return as string for unknown formats
    } catch (error) {
      console.error("Error formatting date:", error);
      return String(dateValue);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-48">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Visit Requests</h2>
      
      {visits && visits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visits.map((visit) => {
            // Transform the visit data
            const visitData = {
              id: visit.id,
              building_id: visit.building_id,
              agent_id: visit.agent_id,
              status: visit.visit_status || "confirmed", // Use visit_status from DB
              visit_day: visit.visit_day,
              visit_time: visit.visit_time,
              buildings: visit.buildings,
              client: visit.client,
              clientPhone: visit.client?.phone_number,
              notes: visit.notes,
            };

            return (
              <Card key={visitData.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{visitData.buildings?.name || "Property Visit"}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>{visitData.buildings?.locality || "Location unavailable"}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[visitData.status as keyof typeof statusColors] || statusColors.confirmed}`}>
                      {visitData.status.charAt(0).toUpperCase() + visitData.status.slice(1)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{visitData.client?.full_name || "Client name unavailable"}</span>
                    </div>
                    
                    {visitData.clientPhone && (
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{visitData.clientPhone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{displayDate(visitData.visit_day)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatTime(visitData.visit_time)}</span>
                    </div>
                    
                    {visitData.notes && (
                      <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                        <p className="font-medium mb-1">Notes</p>
                        <p className="text-muted-foreground">{visitData.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => openUpdateDialog(visit)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No visit requests found.</p>
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Visit Status</DialogTitle>
            <DialogDescription>
              Update the status of this visit request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select 
                value={formState.visit_status} 
                onValueChange={(value: string) => {
                  const validStatus: VisitStatus = (["confirmed", "completed", "cancelled"].includes(value)
                    ? value as VisitStatus
                    : "confirmed");
                  setFormState(prev => ({ ...prev, visit_status: validStatus }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <Textarea
                id="notes"
                placeholder="Add visit notes here..."
                value={formState.notes}
                onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={updateVisitStatus} 
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                "Update Visit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
