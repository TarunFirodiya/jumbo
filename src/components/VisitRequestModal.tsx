
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDateForStorage, parseTimeString } from "@/lib/date-utils";

interface VisitRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  buildingName: string;
  listingId: string;
  visitId?: string;
  initialDay?: Date;
  initialTime?: string;
}

export function VisitRequestModal({
  open,
  onOpenChange,
  buildingId,
  buildingName,
  listingId,
  visitId,
  initialDay,
  initialTime,
}: VisitRequestModalProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get current user
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  useEffect(() => {
    if (initialDay) {
      setDate(initialDay instanceof Date ? initialDay : new Date(initialDay));
    }
    
    if (initialTime) {
      setTimeSlot(initialTime);
    }
  }, [initialDay, initialTime]);

  // If user is not logged in, trigger auth modal and close this modal
  useEffect(() => {
    if (open && !isUserLoading && !user) {
      // Close the current modal
      onOpenChange(false);
      
      // Trigger auth modal
      document.dispatchEvent(new CustomEvent('triggerAuthModal', {
        detail: { action: 'visit' }
      }));
    }
  }, [open, user, isUserLoading, onOpenChange]);

  const timeSlots = [
    "09:00 AM - 10:00 AM", 
    "10:00 AM - 11:00 AM", 
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM", 
    "01:00 PM - 02:00 PM", 
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM", 
    "04:00 PM - 05:00 PM", 
    "05:00 PM - 06:00 PM",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot || !user) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time slot",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format date and parse time for database storage
      const formattedDate = formatDateForStorage(date);
      const formattedTime = parseTimeString(timeSlot);
      
      console.log("Submitting visit with formatted date:", formattedDate, "formatted time:", formattedTime);
      
      // Create or update visit
      if (visitId) {
        // Update existing visit
        const { error } = await supabase
          .from('visits')
          .update({
            visit_day: formattedDate,
            visit_time: formattedTime,
          })
          .eq('id', visitId);
          
        if (error) throw error;
        
        toast({
          title: "Visit Updated",
          description: `Your visit to ${buildingName} has been updated for ${format(date, "PPP")} at ${timeSlot}`,
        });
      } else {
        // Create new visit with confirmed status
        const { error } = await supabase
          .from('visits')
          .insert({
            building_id: buildingId,
            listing_id: listingId,
            user_id: user.id,
            visit_day: formattedDate,
            visit_time: formattedTime,
            visit_status: 'confirmed'  // Set default status to confirmed
          });

        if (error) {
          console.error("Visit insert error:", error);
          throw error;
        }

        toast({
          title: "Visit Scheduled",
          description: `Your visit to ${buildingName} has been scheduled for ${format(date, "PPP")} at ${timeSlot}`,
        });
      }
      
      onOpenChange(false);
      
      // Reset form
      setDate(undefined);
      setTimeSlot("");
    } catch (error: any) {
      console.error('Error with visit:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process visit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If still loading user data, show loading state
  if (isUserLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Loading</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-t-primary animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If user is not logged in, this component should not render anything
  // The useEffect above will handle redirecting to auth modal
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{visitId ? "Update Visit" : "Schedule a Visit"}</DialogTitle>
          <DialogDescription>
            Select a date and time for your property visit
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Time</label>
            <Select
              value={timeSlot}
              onValueChange={setTimeSlot}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(slot => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-slate-800"
            >
              {isSubmitting ? (visitId ? "Updating..." : "Scheduling...") : (visitId ? "Update Visit" : "Schedule Visit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
