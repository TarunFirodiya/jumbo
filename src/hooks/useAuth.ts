
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully",
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0], // Default name from email
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      });
      
      // Check if email confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          title: "Email verification required",
          description: "Please check your email to verify your account",
        });
        return { success: false, error: null, requiresVerification: true };
      } else {
        // Auto-login if email confirmation is not required
        return { success: true, error: null };
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPhone = async (phone: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) throw error;
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Phone auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw error;
      toast({
        title: "Success!",
        description: "Phone number verified successfully",
      });
      return { success: true, error: null };
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "Error",
        description: error.message || "Verification failed",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return {
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithPhone,
    verifyOtp,
    signInWithGoogle
  };
}
