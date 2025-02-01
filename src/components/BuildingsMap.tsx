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

        map.current = initializedMap;

        // Add navigation controls after map is initialized
        initializedMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add markers once map is loaded
        initializedMap.on('load', () => {
          console.log('Map loaded, adding markers');
          addMarkers();
        });

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

  // Function to add markers
  const addMarkers = () => {
    if (!map.current) {
      console.log('Map not initialized yet');
      return;
    }

    console.log('Adding markers for buildings:', buildings.length);

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Create bounds object to fit markers
    const bounds = new mapboxgl.LngLatBounds();

    // Add new markers
    buildings.forEach(building => {
      if (!building.latitude || !building.longitude) {
        console.log('Missing coordinates for building:', building.id);
        return;
      }

      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      
      // Get match score from building data
      const matchScore = (building as any).overall_match_score || 0.5; // Default to 0.5 if no score
      
      // Calculate color based on match score (green gradient)
      const intensity = Math.floor(matchScore * 255);
      el.style.backgroundColor = `rgba(0, ${intensity}, 0, 0.8)`;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-4 max-w-sm bg-white rounded-lg shadow-lg">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-lg">${building.name}</h3>
              <div class="relative w-10 h-10">
                <svg class="w-full h-full -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="15"
                    class="stroke-muted fill-none"
                    stroke-width="4"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="15"
                    class="stroke-primary fill-none"
                    stroke-width="4"
                    stroke-dasharray="${matchScore * 94.2} 94.2"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  ${Math.round(matchScore * 100)}%
                </div>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-2">${building.locality || ''}</p>
            ${building.min_price ? 
              `<p class="text-sm font-medium">₹${(building.min_price/10000000).toFixed(1)} Cr${building.max_price ? 
                ` - ₹${(building.max_price/10000000).toFixed(1)} Cr` : ''}</p>` 
              : ''}
            <div class="mt-2 flex justify-between items-center">
              <button 
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                onclick="window.location.href='/buildings/${building.id}'"
              >
                View Details
              </button>
              <button 
                class="p-2 rounded-full hover:bg-gray-100"
                onclick="event.stopPropagation();"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([building.longitude, building.latitude])
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
      bounds.extend([building.longitude, building.latitude]);
    });

    // Fit map to markers if there are any
    if (markers.current.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  };

  // Update markers when buildings change
  useEffect(() => {
    if (map.current) {
      addMarkers();
    }
  }, [buildings]);

  return (
    <div className="w-full h-[calc(100vh-12rem)]">
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
};

export default BuildingsMap;