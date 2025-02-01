import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface BuildingsMapProps {
  buildings: Tables<'buildings'>[];
}

const BuildingsMap = ({ buildings }: BuildingsMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current || map.current) return;

      try {
        // Get the Mapbox token from Supabase Edge Function
        const { data: { token }, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !token) {
          throw new Error('Failed to get Mapbox token');
        }

        mapboxgl.accessToken = token;
        
        const initializedMap = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          zoom: 12,
          center: [77.5946, 12.9716], // Bangalore coordinates
        });

        // Wait for map to load before setting ref
        initializedMap.on('load', () => {
          map.current = initializedMap;
          console.log('Map loaded successfully');
        });

        initializedMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

        return () => {
          initializedMap.remove();
          map.current = null;
        };
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
  }, [toast]);

  // Handle markers
  useEffect(() => {
    if (!map.current) {
      console.log('Map not initialized yet');
      return;
    }

    console.log('Adding markers for buildings:', buildings.length);

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    buildings.forEach(building => {
      if (!building.latitude || !building.longitude) {
        console.log('Missing coordinates for building:', building.id);
        return;
      }

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-4 max-w-sm">
            <h3 class="font-semibold text-lg mb-2">${building.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${building.locality || ''}</p>
            ${building.min_price ? 
              `<p class="text-sm font-medium">₹${(building.min_price/10000000).toFixed(1)} Cr${building.max_price ? 
                ` - ₹${(building.max_price/10000000).toFixed(1)} Cr` : ''}</p>` 
              : ''}
            <button 
              class="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md w-full text-sm"
              onclick="window.location.href='/buildings/${building.id}'"
            >
              View Details
            </button>
          </div>
        `);

      const marker = new mapboxgl.Marker()
        .setLngLat([building.longitude, building.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Fit map to markers if there are any
    if (markers.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      buildings.forEach(building => {
        if (building.latitude && building.longitude) {
          bounds.extend([building.longitude, building.latitude]);
        }
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }

    // Cleanup function
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
    };
  }, [buildings, navigate]);

  return (
    <div className="w-full h-[calc(100vh-12rem)]">
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
};

export default BuildingsMap;