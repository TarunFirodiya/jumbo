
import { useState } from "react";
import { Calendar, Clock, IndianRupee, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { VisitRequestModal } from "@/components/VisitRequestModal";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface BookingSectionProps {
  buildingId: string;
  buildingName: string;
  selectedListingId?: string;
  price?: number;
}

export function BookingSection({ 
  buildingId, 
  buildingName, 
  selectedListingId, 
  price 
}: BookingSectionProps) {
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [visitDate, setVisitDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>("morning");
  
  const calculateEMI = (price: number) => {
    const loanAmount = price * 0.8; // 80% loan amount
    const interestRate = 0.085; // 8.5% interest rate
    const tenure = 20 * 12; // 20 years in months
    const monthlyRate = interestRate / 12;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };
  
  const openWhatsApp = () => {
    // WhatsApp API URL with pre-filled message
    const message = `Hi, I'm interested in ${buildingName} (ID: ${buildingId}).`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <>
      <Card className="p-6 sticky top-28 shadow-lg space-y-6">
        {price && (
          <div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-6 w-6 text-muted-foreground" />
              <span className="text-2xl font-semibold">₹{(price/10000000).toFixed(1)} Cr</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              EMI starts at ₹{(calculateEMI(price)/1000).toFixed(1)}k/month*
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <RainbowButton 
            className="w-full" 
            onClick={() => setShowVisitModal(true)}
          >
            Request a Visit
          </RainbowButton>
          <p className="text-xs text-center text-muted-foreground">Free, no-obligation, zero spam</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => setShowCalendarModal(true)}
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule Tour</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={openWhatsApp}
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp</span>
          </Button>
        </div>
        
        <hr className="my-2" />
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Get a callback</span>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex items-center gap-2">
            <Input 
              type="tel" 
              placeholder="Your phone number" 
              className="flex-1"
            />
            <Button>Call Me</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            By submitting, you agree to our <a href="#" className="underline">Terms & Conditions</a>
          </p>
        </div>
      </Card>
      
      <VisitRequestModal
        open={showVisitModal}
        onOpenChange={setShowVisitModal}
        buildingId={buildingId}
        buildingName={buildingName}
        listingId={selectedListingId || ""}
      />
      
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a Property Tour</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="flex flex-col items-center space-y-2">
              <CalendarComponent
                mode="single"
                selected={visitDate}
                onSelect={setVisitDate}
                className="rounded-md border"
                disabled={(date) => date < new Date() || date.getDay() === 0}
              />
              
              <p className="text-sm text-muted-foreground">
                Select a preferred time slot:
              </p>
              
              <RadioGroup 
                value={timeSlot} 
                onValueChange={setTimeSlot}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="morning" id="morning" />
                  <Label htmlFor="morning">Morning (9AM-12PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="afternoon" id="afternoon" />
                  <Label htmlFor="afternoon">Afternoon (12PM-3PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evening" id="evening" />
                  <Label htmlFor="evening">Evening (3PM-6PM)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setShowCalendarModal(false)}>
                Cancel
              </Button>
              <Button>Confirm Tour Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
