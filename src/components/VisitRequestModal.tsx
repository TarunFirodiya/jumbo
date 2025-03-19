
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface VisitRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  buildingName: string;
  listingId: string;
  visitId?: string;
  initialDay?: string;
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
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  useEffect(() => {
    if (initialDay) {
      try {
        // Parse initial day if provided (format dd-MM-yyyy)
        const parsedDate = parse(initialDay, "dd-MM-yyyy", new Date());
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
        }
      } catch (error) {
        console.error("Error parsing initial date:", error);
      }
    }
    
    if (initialTime) {
      setTimeSlot(initialTime);
    }
  }, [initialDay, initialTime]);

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
      // Format date as string for storage (dd-MM-yyyy)
      const formattedDate = format(date, "dd-MM-yyyy");
      
      // Create or update visit
      if (visitId) {
        // Update existing visit
        const { error } = await supabase
          .from('visits')
          .update({
            visit_day: formattedDate,
            visit_time: timeSlot,
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
            visit_time: timeSlot,
            visit_status: 'confirmed'  // Set default status to confirmed
          });

        if (error) throw error;

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

  // If user is not logged in, show auth prompt
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sign in Required</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4">Please sign in to schedule a visit</p>
            <Button 
              onClick={() => {
                onOpenChange(false);
                // Trigger auth modal
                document.dispatchEvent(new CustomEvent('triggerAuthModal', {
                  detail: { action: 'visit' }
                }));
              }}
            >
              Sign in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{visitId ? "Update Visit" : "Schedule a Visit"}</DialogTitle>
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
              <PopoverContent className="w-auto p-0">
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
