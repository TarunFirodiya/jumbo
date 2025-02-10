
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VisitRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  buildingName: string;
  listingId: string;
  visitId?: string; // Optional - present only for rescheduling
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
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [day, setDay] = useState<string>();
  const [timeSlot, setTimeSlot] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial values when rescheduling
  useEffect(() => {
    if (visitId) {
      setDay(initialDay);
      setTimeSlot(initialTime);
    }
  }, [visitId, initialDay, initialTime]);

  // Fetch user's phone number on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', user.id)
          .single();
        
        if (profile?.phone_number) {
          setPhone(profile.phone_number);
        }
      }
    };
    fetchUserProfile();
  }, []);

  const handleSubmit = async () => {
    if (!phone || !day || !timeSlot) {
      toast({
        title: "Please fill all fields",
        description: "Phone number, day and time slot are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update phone number in profile
      await supabase
        .from('profiles')
        .update({ phone_number: phone })
        .eq('id', user.id);

      if (visitId) {
        // Update existing visit (reschedule)
        const { error: visitError } = await supabase
          .from('visits')
          .update({
            visit_day: day,
            visit_time: timeSlot,
            status: 'to be confirmed'
          })
          .eq('id', visitId);

        if (visitError) throw visitError;

        toast({
          title: "Visit Rescheduled",
          description: "Your visit has been rescheduled and will be confirmed shortly.",
        });
      } else {
        // Create new visit request
        const { error: visitError } = await supabase
          .from('visits')
          .insert({
            user_id: user.id,
            building_id: buildingId,
            listing_id: listingId,
            visit_day: day,
            visit_time: timeSlot,
          });

        if (visitError) throw visitError;

        toast({
          title: "Visit Requested",
          description: "We'll confirm your visit request shortly.",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast({
        title: "Error",
        description: "Could not schedule visit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{visitId ? "Reschedule Visit" : "Schedule a Visit"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Day</Label>
            <RadioGroup value={day} onValueChange={setDay}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Saturday" id="saturday" />
                <Label htmlFor="saturday">Saturday</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sunday" id="sunday" />
                <Label htmlFor="sunday">Sunday</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Select Time Slot</Label>
            <RadioGroup value={timeSlot} onValueChange={setTimeSlot}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="11 am to 2 pm" id="slot1" />
                <Label htmlFor="slot1">11 am to 2 pm</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3 pm to 6 pm" id="slot2" />
                <Label htmlFor="slot2">3 pm to 6 pm</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Requesting..." : visitId ? "Reschedule Visit" : "Request Visit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
