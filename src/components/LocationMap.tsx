import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  buildingName: string;
}

type PlaceType = 'hospital' | 'school' | 'restaurant';

const LocationMap: React.FC<LocationMapProps> = ({ latitude, longitude, buildingName }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<google.maps.places.PlacesService | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const { toast } = useToast();
  const [selectedTypes, setSelectedTypes] = useState<PlaceType[]>([]);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Get Google Maps API key from Supabase Edge Function
        const { data: { apiKey }, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error || !apiKey) {
          throw new Error('Failed to get Google Maps API key');
        }

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => {
          if (!mapRef.current) return;

          // Create map instance
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: latitude, lng: longitude },
            zoom: 15, // This zoom level shows roughly 2km radius
          });

          // Add building marker
          new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: mapInstance,
            title: buildingName,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#000',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#fff',
            },
          });

          setMap(mapInstance);
          setPlaces(new google.maps.places.PlacesService(mapInstance));
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: "Map Error",
          description: "There was an error loading the map",
          variant: "destructive",
        });
      }
    };

    initializeMap();
  }, [latitude, longitude, buildingName, toast]);

  const searchNearbyPlaces = (type: PlaceType) => {
    if (!places || !map) return;

    const request = {
      location: { lat: latitude, lng: longitude },
      radius: 2000, // 2km in meters
      type: type,
    };

    places.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Clear existing markers of this type
        markers.forEach(marker => marker.setMap(null));
        
        const newMarkers = results.map(place => {
          if (!place.geometry?.location) return null;

          return new google.maps.Marker({
            position: place.geometry.location,
            map,
            title: place.name,
            icon: {
              url: place.icon as string,
              scaledSize: new google.maps.Size(24, 24),
            },
          });
        }).filter((marker): marker is google.maps.Marker => marker !== null);

        setMarkers(newMarkers);
      }
    });
  };

  const togglePlaceType = (type: PlaceType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
      // Clear markers when deselecting
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
    } else {
      setSelectedTypes([...selectedTypes, type]);
      searchNearbyPlaces(type);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedTypes.includes('hospital') ? 'default' : 'outline'}
          onClick={() => togglePlaceType('hospital')}
          size="sm"
        >
          Hospitals
        </Button>
        <Button
          variant={selectedTypes.includes('school') ? 'default' : 'outline'}
          onClick={() => togglePlaceType('school')}
          size="sm"
        >
          Schools
        </Button>
        <Button
          variant={selectedTypes.includes('restaurant') ? 'default' : 'outline'}
          onClick={() => togglePlaceType('restaurant')}
          size="sm"
        >
          Restaurants
        </Button>
      </div>
      <div ref={mapRef} className="h-[400px] w-full rounded-lg" />
    </div>
  );
};

export default LocationMap;