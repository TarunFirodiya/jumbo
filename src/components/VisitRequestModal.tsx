
import { useState } from "react";
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
}

export function VisitRequestModal({
  open,
  onOpenChange,
  buildingId,
  buildingName,
  listingId,
}: VisitRequestModalProps) {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [day, setDay] = useState<string>();
  const [timeSlot, setTimeSlot] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Create visit request
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
          <DialogTitle>Schedule a Visit</DialogTitle>
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
            {isSubmitting ? "Requesting..." : "Request Visit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
