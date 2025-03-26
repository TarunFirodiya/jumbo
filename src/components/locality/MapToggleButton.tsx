
import { MapIcon, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapToggleButtonProps {
  isMapView: boolean;
  toggleMapView: () => void;
}

export function MapToggleButton({ isMapView, toggleMapView }: MapToggleButtonProps) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <Button
        variant="default"
        onClick={toggleMapView}
        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
      >
        {isMapView ? (
          <>
            <List className="h-4 w-4" />
            Show list
          </>
        ) : (
          <>
            <MapIcon className="h-4 w-4" />
            Show map
          </>
        )}
      </Button>
    </div>
  );
}
