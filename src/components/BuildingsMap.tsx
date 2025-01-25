import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tables } from '@/integrations/supabase/types';

interface BuildingsMapProps {
  buildings: Tables<'buildings'>[];
}

const BuildingsMap = ({ buildings }: BuildingsMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with the token from Supabase Edge Function Secrets
    mapboxgl.accessToken = process.env.MAPBOX_PUBLIC_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      zoom: 12,
      center: [72.8777, 19.0760], // Mumbai coordinates as default
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

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

        new mapboxgl.Marker()
          .setLngLat([building.longitude, building.latitude])
          .setPopup(popup)
          .addTo(map.current);
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [buildings]);

  return (
    <div className="w-full h-[calc(100vh-12rem)]">
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
};

export default BuildingsMap;