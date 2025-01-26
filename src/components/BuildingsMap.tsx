import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

interface BuildingsMapProps {
  buildings: Tables<'buildings'>[];
}

const BuildingsMap = ({ buildings }: BuildingsMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();

  const initializeMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    try {
      const token = 'pk.eyJ1IjoidGFydW5maXJvZGl5YSIsImEiOiJjbHJwcXFhbGkwMmZnMmpxdnc0ZGxqNmxsIn0.4CtXbxkQIHNkMxR_oGH9Ug';
      if (!token) {
        toast({
          title: "Map Error",
          description: "Unable to load map due to missing configuration",
          variant: "destructive",
        });
        return;
      }

      mapboxgl.accessToken = token;
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        zoom: 12,
        center: [72.8777, 19.0760], // Mumbai coordinates
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "There was an error loading the map",
        variant: "destructive",
      });
    }
  }, [toast]);

  const updateMarkers = useCallback(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    buildings.forEach(building => {
      if (!building.latitude || !building.longitude) return;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${building.name}</h3>
          <p class="text-sm text-gray-600">${building.locality || ''}</p>
          ${building.min_price ? 
            `<p class="text-sm font-medium">₹${(building.min_price/10000000).toFixed(1)} Cr${building.max_price ? 
              ` - ₹${(building.max_price/10000000).toFixed(1)} Cr` : ''}</p>` 
            : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker()
        .setLngLat([building.longitude, building.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [buildings]);

  // Initialize map
  useEffect(() => {
    initializeMap();
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap]);

  // Update markers when buildings change
  useEffect(() => {
    updateMarkers();
  }, [buildings, updateMarkers]);

  return (
    <div className="w-full h-[calc(100vh-12rem)]">
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
};

export default BuildingsMap;