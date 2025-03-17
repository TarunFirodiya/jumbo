import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { EmailAuth } from "@/components/auth/EmailAuth";
import { PhoneAuth } from "@/components/auth/PhoneAuth";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { useToast } from "@/hooks/use-toast";
interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "shortlist" | "visit" | "notify";
}
export function AuthModal({
  open,
  onOpenChange,
  actionType
}: AuthModalProps) {
  const {
    toast
  } = useToast();

  // Listen for auth modal trigger events
  useEffect(() => {
    const handleAuthTrigger = (e: CustomEvent<{
      action: "shortlist" | "visit" | "notify";
    }>) => {
      onOpenChange(true);
    };
    document.addEventListener('triggerAuthModal', handleAuthTrigger as EventListener);
    return () => {
      document.removeEventListener('triggerAuthModal', handleAuthTrigger as EventListener);
    };
  }, [onOpenChange]);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Close the modal and notify
        onOpenChange(false);
        toast({
          title: "Signed in successfully",
          description: "You are now logged in"
        });

        // Force a refresh of auth-dependent queries
        window.dispatchEvent(new CustomEvent('supabase.auth.stateChange', {
          detail: {
            event,
            session
          }
        }));
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onOpenChange, toast]);
  const handleAuthSuccess = () => {
    // This will be handled by the auth state change listener
  };
  const actionMessages = {
    shortlist: "shortlist properties",
    visit: "schedule visits",
    notify: "get notifications"
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in to {actionMessages[actionType]}</DialogTitle>
          <DialogDescription>Zero spam home-buying</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <EmailAuth onSuccess={handleAuthSuccess} />
            <SocialAuth />
          </TabsContent>

          <TabsContent value="phone">
            <PhoneAuth onSuccess={handleAuthSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>;
}