import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/date-utils";
import { Building, MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function VisitManagement({ visits, isLoading, refetch }) {
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (visitId: string, newStatus: "confirmed" | "completed" | "cancelled") => {
    try {
      setUpdatingStatus(true);
      const { error } = await supabase
        .from('visits')
        .update({ visit_status: newStatus })
        .eq('id', visitId);
      
      if (error) throw error;
      
      toast({
        title: "Visit status updated",
        description: `The visit has been marked as ${newStatus}`,
      });
      
      await refetch();
    } catch (error) {
      console.error('Error updating visit status:', error);
      toast({
        title: "Error updating status",
        description: "There was a problem updating the visit status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const pendingVisits = visits?.filter(visit => visit.status === 'pending') || [];
  const confirmedVisits = visits?.filter(visit => visit.status === 'confirmed') || [];
  const completedVisits = visits?.filter(visit => visit.status === 'completed') || [];
  const cancelledVisits = visits?.filter(visit => visit.status === 'cancelled') || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="pending">
            Pending ({pendingVisits.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedVisits.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedVisits.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledVisits.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingVisits.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No pending visits</p>
              </CardContent>
            </Card>
          ) : (
            pendingVisits.map(visit => (
              <VisitCard 
                key={visit.id} 
                visit={visit} 
                onStatusChange={handleStatusChange}
                updatingStatus={updatingStatus}
                showActions={true}
                actionButtons={[
                  { label: "Confirm", status: "confirmed", variant: "default", icon: <CheckCircle className="h-4 w-4 mr-2" /> },
                  { label: "Cancel", status: "cancelled", variant: "outline", icon: <XCircle className="h-4 w-4 mr-2" /> }
                ]}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="confirmed" className="space-y-4">
          {confirmedVisits.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No confirmed visits</p>
              </CardContent>
            </Card>
          ) : (
            confirmedVisits.map(visit => (
              <VisitCard 
                key={visit.id} 
                visit={visit} 
                onStatusChange={handleStatusChange}
                updatingStatus={updatingStatus}
                showActions={true}
                actionButtons={[
                  { label: "Mark Completed", status: "completed", variant: "default", icon: <CheckCircle className="h-4 w-4 mr-2" /> },
                  { label: "Cancel", status: "cancelled", variant: "outline", icon: <XCircle className="h-4 w-4 mr-2" /> }
                ]}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedVisits.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No completed visits</p>
              </CardContent>
            </Card>
          ) : (
            completedVisits.map(visit => (
              <VisitCard 
                key={visit.id} 
                visit={visit} 
                onStatusChange={handleStatusChange}
                updatingStatus={updatingStatus}
                showActions={false}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          {cancelledVisits.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No cancelled visits</p>
              </CardContent>
            </Card>
          ) : (
            cancelledVisits.map(visit => (
              <VisitCard 
                key={visit.id} 
                visit={visit} 
                onStatusChange={handleStatusChange}
                updatingStatus={updatingStatus}
                showActions={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VisitCard({ visit, onStatusChange, updatingStatus, showActions = true, actionButtons = [] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{visit.building?.name || "Unknown Building"}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {visit.building?.locality || "Unknown Location"}
            </CardDescription>
          </div>
          {getStatusBadge(visit.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{formatDate(visit.visit_day)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{formatTime(visit.visit_time)}</span>
          </div>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="flex justify-end gap-2">
          {actionButtons.map((button, index) => (
            <Button
              key={index}
              variant={button.variant}
              size="sm"
              onClick={() => onStatusChange(visit.id, button.status)}
              disabled={updatingStatus}
            >
              {button.icon}
              {button.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}

function getStatusBadge(status) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case 'confirmed':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}
