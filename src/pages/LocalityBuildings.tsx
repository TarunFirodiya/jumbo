
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/auth/AuthModal";
import { SEO } from "@/components/SEO";
import { Filter } from "@/components/ui/filters";
import { useIsMobile } from "@/hooks/use-mobile";
import { Building2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";

// Import new components
import { SearchHeader } from "@/components/locality/SearchHeader";
import { BuildingsList } from "@/components/locality/BuildingsList";
import { MapToggleButton } from "@/components/locality/MapToggleButton";
import { useFilteredBuildings } from "@/components/locality/hooks/useFilteredBuildings";
import { useBuildingShortlist } from "@/components/locality/hooks/useBuildingShortlist";
import { useBuildingsData } from "@/components/locality/hooks/useBuildingsData";
import { 
  getSEODescription, 
  getKeywords, 
  getStructuredData 
} from "@/components/locality/utils/seoUtils";

// Direct import instead of lazy loading
import BuildingsMap from "@/components/BuildingsMap";

export default function LocalityBuildings() {
  const { locality } = useParams();
  const navigate = useNavigate();
  const [isMapView, setIsMapView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const isMobile = useIsMobile();
  const [mapError, setMapError] = useState(false);

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch buildings data
  const { 
    buildings, 
    buildingsLoading, 
    buildingScores, 
    refetchBuildingScores 
  } = useBuildingsData(user, locality, selectedCollections);

  // Handle shortlisting
  const { 
    handleShortlistToggle, 
    showAuthModal, 
    setShowAuthModal, 
    authAction 
  } = useBuildingShortlist(user, buildingScores, refetchBuildingScores);

  // Filter buildings based on search and filters
  const filteredBuildings = useFilteredBuildings(
    buildings, 
    selectedCollections, 
    activeFilters, 
    searchTerm
  );

  const handleCollectionToggle = useCallback((collectionId: string) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  }, []);

  const handleFiltersChange = useCallback((filters: Filter[]) => {
    setActiveFilters(filters);
  }, []);

  const navigateToBuilding = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const toggleMapView = useCallback(() => {
    if (mapError && !isMapView) {
      return; // Prevent enabling map view if there's an error
    }
    setIsMapView(prev => !prev);
  }, [mapError, isMapView]);

  const localityDisplayName = useMemo(() => {
    return locality ? decodeURIComponent(locality) : 'All Locations';
  }, [locality]);

  if (buildingsLoading) {
    return (
      <>
        <SEO title={`Loading Properties in ${localityDisplayName} | Cozy Dwell Search`} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
      </>
    );
  }

  // Map error fallback
  const MapErrorFallback = () => (
    <div className="h-[60vh] flex flex-col items-center justify-center bg-gray-100 rounded-lg">
      <Building2 className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-700">Map view is currently unavailable</h3>
      <p className="text-gray-500 mb-6">We've automatically switched to list view</p>
      <Button onClick={() => setIsMapView(false)} variant="outline">Continue with List View</Button>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      <SEO
        title={`Properties in ${localityDisplayName} ${selectedCollections.length ? `| ${selectedCollections.join(', ')}` : ''} | Cozy Dwell Search`}
        description={getSEODescription(localityDisplayName, selectedCollections, activeFilters, filteredBuildings.length)}
        canonical={`/buildings/locality/${encodeURIComponent(locality || '')}`}
        structuredData={getStructuredData(localityDisplayName, locality, filteredBuildings.length)}
        keywords={getKeywords(localityDisplayName, selectedCollections, activeFilters)}
      />
      
      <SearchHeader
        localityDisplayName={localityDisplayName}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCollections={selectedCollections}
        handleCollectionToggle={handleCollectionToggle}
        handleFiltersChange={handleFiltersChange}
        buildings={buildings || []}
        filteredBuildingsCount={filteredBuildings.length}
      />

      {isMapView ? (
        mapError ? (
          <MapErrorFallback />
        ) : (
          <div onError={() => {
            setMapError(true);
            setIsMapView(false);
          }}>
            <BuildingsMap 
              buildings={filteredBuildings}
              buildingScores={buildingScores}
              onShortlist={handleShortlistToggle}
            />
          </div>
        )
      ) : (
        <BuildingsList
          filteredBuildings={filteredBuildings}
          buildingScores={buildingScores}
          handleShortlistToggle={handleShortlistToggle}
          navigateToBuilding={navigateToBuilding}
        />
      )}

      <MapToggleButton 
        isMapView={isMapView} 
        toggleMapView={toggleMapView}
        disabled={mapError && !isMapView}
      />

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        actionType={authAction}
      />
    </div>
  );
}
