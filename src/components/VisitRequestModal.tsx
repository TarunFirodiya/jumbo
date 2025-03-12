
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  const [date, setDate] = useState<Date>();
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
      const [day, month, year] = initialDay.split('-').map(Number);
      if (day && month && year) {
        setDate(new Date(year, month - 1, day));
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
      const { error } = await supabase
        .from('visits')
        .insert({
          building_id: buildingId,
          listing_id: listingId,
          user_id: user.id,
          visit_day: format(date, "dd-MM-yyyy"),
          visit_time: timeSlot,
          status: 'pending'
        });

      if (error) throw error;

      onOpenChange(false);
      toast({
        title: "Visit Scheduled",
        description: `Your visit to ${buildingName} has been scheduled for ${format(date, "PPP")} at ${timeSlot}`,
      });
      
      // Reset form
      setDate(undefined);
      setTimeSlot("");
    } catch (error: any) {
      console.error('Error scheduling visit:', error);
      toast({
        title: "Error",
        description: "Failed to schedule visit. Please try again.",
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (visitId ? "Updating..." : "Scheduling...") : (visitId ? "Update Visit" : "Schedule Visit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
