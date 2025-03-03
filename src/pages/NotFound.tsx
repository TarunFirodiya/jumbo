
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SEO
        title="Page Not Found | Cozy Dwell Search"
        description="The page you are looking for does not exist. Please navigate back to the home page."
        canonical="/404"
      />
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Button 
            onClick={() => navigate('/buildings')} 
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
