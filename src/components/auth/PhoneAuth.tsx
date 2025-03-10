
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface PhoneAuthProps {
  onSuccess: () => void;
}

export function PhoneAuth({ onSuccess }: PhoneAuthProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationStep, setVerificationStep] = useState<'input' | 'verify'>('input');
  const { isLoading, signInWithPhone, verifyOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationStep === 'input') {
      const { success } = await signInWithPhone(phone);
      if (success) setVerificationStep('verify');
    } else {
      const { success } = await verifyOtp(phone, otp);
      if (success) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {verificationStep === 'input' ? (
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send OTP"}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVerificationStep('input')}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
