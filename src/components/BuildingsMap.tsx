import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

interface BuildingsMapProps {
  buildings: Tables<'buildings'>[];
}

const BuildingsMap = ({ buildings }: BuildingsMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainer.current) return;

    // Get token from environment variable
    const token = 'pk.eyJ1IjoidGFydW5maXJvZGl5YSIsImEiOiJjbHJwcXFhbGkwMmZnMmpxdnc0ZGxqNmxsIn0.4CtXbxkQIHNkMxR_oGH9Ug';
    
    if (!token) {
      toast({
        title: "Map Error",
        description: "Unable to load map due to missing configuration",
        variant: "destructive",
      });
      return;
    }

    // Initialize map with the token
    mapboxgl.accessToken = token;
    
    try {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        zoom: 12,
        center: [72.8777, 19.0760], // Mumbai coordinates as default
      });

      // Add navigation controls
      mapInstance.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add markers for buildings with coordinates
      buildings.forEach((building) => {
        if (building.latitude && building.longitude) {
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(
              `<div class="p-2">
                <h3 class="font-semibold">${building.name}</h3>
                <p class="text-sm text-gray-600">${building.locality || ''}</p>
                ${building.min_price ? 
                  `<p class="text-sm font-medium">₹${(building.min_price/10000000).toFixed(1)} Cr${building.max_price ? 
                    ` - ₹${(building.max_price/10000000).toFixed(1)} Cr` : ''}</p>` 
                  : ''}
              </div>`
            );

          const marker = new mapboxgl.Marker()
            .setLngLat([building.longitude, building.latitude])
            .setPopup(popup)
            .addTo(mapInstance.current!);

          markersRef.current.push(marker);
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "There was an error loading the map",
        variant: "destructive",
      });
    }

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [buildings, toast]);

  return (
    <div className="w-full h-[calc(100vh-12rem)]">
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
};

export default BuildingsMap;