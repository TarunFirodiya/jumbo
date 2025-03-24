
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface EmailAuthProps {
  onSuccess?: () => void;
}

export function EmailAuth({ onSuccess }: EmailAuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { isLoading, signInWithEmail, signUpWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = isSignUp 
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);
    
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="your@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 
          <span className="flex items-center gap-1">
            <span className="h-4 w-4 border-b-2 border-white rounded-full animate-spin"></span>
            <span>Processing...</span>
          </span> 
        : 
          isSignUp ? "Sign up" : "Sign in"
        }
      </Button>
      
      <div className="text-center">
        <Button 
          type="button" 
          variant="link" 
          className="text-xs underline" 
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </Button>
      </div>
    </form>
  );
}
