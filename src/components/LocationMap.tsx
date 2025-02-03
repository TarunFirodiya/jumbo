import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<PlaceType[]>([]);
  const { toast } = useToast();
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Get Mapbox token from Supabase Edge Function
        const { data: { token }, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !token) {
          throw new Error('Failed to get Mapbox token');
        }

        if (!mapContainer.current) return;

        // Initialize Mapbox
        mapboxgl.accessToken = token;
        
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [longitude, latitude],
          zoom: 15,
          pitch: 45,
        });

        // Add navigation controls
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add building marker
        new mapboxgl.Marker({
          color: '#000000',
        })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${buildingName}</h3>`))
          .addTo(mapInstance);

        map.current = mapInstance;

        // Add 3D building layer
        mapInstance.on('load', () => {
          mapInstance.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 14,
            'paint': {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.6
            }
          });
        });

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

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude, buildingName, toast]);

  const searchNearbyPlaces = async (type: PlaceType) => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Define search radius (in meters)
    const radius = 2000;

    try {
      // Use Mapbox's geocoding API to find nearby places
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${type}.json?` +
        `proximity=${longitude},${latitude}&` +
        `radius=${radius}&` +
        `access_token=${mapboxgl.accessToken}`
      );

      const data = await response.json();

      // Add markers for each place
      data.features.forEach((place: any) => {
        const marker = new mapboxgl.Marker({
          color: '#FF0000',
          scale: 0.7,
        })
          .setLngLat(place.center)
          .setPopup(new mapboxgl.Popup().setHTML(`<h4>${place.text}</h4>`))
          .addTo(map.current!);

        markers.current.push(marker);
      });
    } catch (error) {
      console.error('Error searching nearby places:', error);
      toast({
        title: "Search Error",
        description: "Failed to find nearby places",
        variant: "destructive",
      });
    }
  };

  const togglePlaceType = (type: PlaceType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
      // Clear markers when deselecting
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
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
      <div ref={mapContainer} className="h-[400px] w-full rounded-lg" />
    </div>
  );
};

export default LocationMap;