
import { useQuery } from "@tanstack/react-query";
import { MapPin, CalendarDays, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { formatDate } from "@/lib/date-utils";
import { VisitRequestModal } from "@/components/VisitRequestModal";
import { Helmet } from "react-helmet-async";

export default function Visits() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Get current user
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['current-user-visits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch visits
  const { data: visits, isLoading: visitsLoading, refetch: refetchVisits } = useQuery({
    queryKey: ['user-visits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('visits')
        .select(`
          id,
          visit_day,
          visit_time,
          visit_status,
          buildings(id, name, locality, images),
          listings(id, bhk, area_sqft, price)
        `)
        .eq('user_id', user.id)
        .order('visit_day', { ascending: true });
        
      if (error) {
        console.error('Error fetching visits:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your visits",
      });
      
      // Trigger auth modal
      document.dispatchEvent(new CustomEvent('triggerAuthModal', {
        detail: { action: 'visit' }
      }));
    }
  }, [user, isUserLoading, toast]);
  
  const handleReschedule = (visit) => {
    setSelectedVisit(visit);
    setShowVisitModal(true);
  };
  
  const handleCancelVisit = async (visitId) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({ visit_status: 'cancelled' })
        .eq('id', visitId);
        
      if (error) throw error;
      
      toast({
        title: "Visit cancelled",
        description: "Your visit has been cancelled successfully"
      });
      
      refetchVisits();
    } catch (error) {
      console.error('Error cancelling visit:', error);
      toast({
        title: "Error",
        description: "Could not cancel your visit. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleVisitComplete = async (visitId) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({ visit_status: 'completed' })
        .eq('id', visitId);
        
      if (error) throw error;
      
      toast({
        title: "Visit marked as completed",
        description: "Your visit has been marked as completed"
      });
      
      refetchVisits();
    } catch (error) {
      console.error('Error updating visit:', error);
      toast({
        title: "Error",
        description: "Could not update your visit. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isUserLoading || visitsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="Your Property Visits | Cozy Dwell Search" 
        description="View and manage your scheduled property visits."
      />
      <Helmet>
        <title>Your Property Visits | Cozy Dwell Search</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Visits</h1>
        <p className="text-muted-foreground">Manage your scheduled property visits</p>
      </div>
      
      {!visits || visits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">No visits scheduled</h3>
              <p className="text-muted-foreground mb-6">You haven't scheduled any property visits yet.</p>
              <Button onClick={() => navigate('/buildings')}>
                Browse Properties
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visits.map((visit) => (
            <Card key={visit.id} className="overflow-hidden">
              <div className="relative h-48 bg-muted">
                {visit.buildings?.images?.[0] ? (
                  <img 
                    src={visit.buildings.images[0]} 
                    alt={visit.buildings.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                <div className="absolute top-0 right-0 bg-black/70 text-white px-3 py-1 text-sm">
                  {visit.visit_status === 'confirmed' ? (
                    <span className="text-green-400">Confirmed</span>
                  ) : visit.visit_status === 'cancelled' ? (
                    <span className="text-red-400">Cancelled</span>
                  ) : (
                    <span className="text-blue-400">Completed</span>
                  )}
                </div>
              </div>
              
              <CardHeader>
                <CardTitle 
                  className="text-lg hover:text-blue-600 transition-colors cursor-pointer"
                  onClick={() => navigate(`/buildings/${visit.buildings.id}`)}
                >
                  {visit.buildings.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{visit.buildings.locality}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {visit.visit_day ? (
                        typeof visit.visit_day === 'string' 
                          ? formatDate(visit.visit_day) 
                          : formatDate(new Date(visit.visit_day))
                      ) : 'Date not available'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{visit.visit_time || 'Time not available'}</span>
                  </div>
                  
                  {visit.listings && (
                    <div className="mt-2 font-medium">
                      {visit.listings.bhk} BHK · {visit.listings.area_sqft} sq.ft · 
                      ₹{(visit.listings.price / 10000000).toFixed(2)} Cr
                    </div>
                  )}
                </div>
                
                {visit.visit_status === 'confirmed' && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleReschedule(visit)}
                    >
                      Reschedule
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCancelVisit(visit.id)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleVisitComplete(visit.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Done
                    </Button>
                  </div>
                )}
                
                {visit.visit_status === 'cancelled' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleReschedule(visit)}
                  >
                    Reschedule
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {selectedVisit && (
        <VisitRequestModal
          open={showVisitModal}
          onOpenChange={setShowVisitModal}
          buildingId={selectedVisit.buildings.id}
          buildingName={selectedVisit.buildings.name}
          listingId={selectedVisit.listings.id}
          visitId={selectedVisit.id}
          initialDay={selectedVisit.visit_day}
          initialTime={selectedVisit.visit_time}
        />
      )}
    </div>
  );
}
