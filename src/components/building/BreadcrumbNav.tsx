
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbNavProps {
  buildingName: string;
  locality: string;
}

export function BreadcrumbNav({ buildingName, locality }: BreadcrumbNavProps) {
  return (
    <div className="flex items-center text-sm text-muted-foreground mb-4 overflow-hidden">
      <Link to="/" className="flex items-center hover:text-primary transition-colors">
        <Home className="h-3.5 w-3.5 mr-1" />
        <span>Home</span>
      </Link>
      <ChevronRight className="h-3 w-3 mx-1" />
      <Link to="/buildings" className="hover:text-primary transition-colors truncate">
        Properties
      </Link>
      {locality && (
        <>
          <ChevronRight className="h-3 w-3 mx-1 flex-shrink-0" />
          <span className="truncate">{locality}</span>
        </>
      )}
      <ChevronRight className="h-3 w-3 mx-1 flex-shrink-0" />
      <span className="truncate font-medium text-foreground">{buildingName}</span>
    </div>
  );
}
