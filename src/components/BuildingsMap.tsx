
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Building, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuildingsMapProps {
  buildings: Tables<'buildings'>[];
  onShortlist?: (buildingId: string) => Promise<void>;
  buildingScores?: Record<string, any>;
}

const BuildingsMap = ({ buildings, onShortlist, buildingScores = {} }: BuildingsMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        toast({
          title: "Error",
          description: "Failed to initialize map settings",
          variant: "destructive",
        });
      }
    };

    fetchMapboxToken();
  }, [toast]);

  // Initialize map
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
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
  }, [mapboxToken, toast]);

  // Function to handle shortlist
  const handleShortlist = (e: Event, buildingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onShortlist) {
      onShortlist(buildingId);
    }
  };

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
      el.className = 'price-marker';
      
      // Format the price for display (in Cr)
      const price = building.min_price ? `₹${(building.min_price/10000000).toFixed(1)} Cr` : '';
      
      // Style the marker like Airbnb price markers - making them smaller
      el.innerHTML = `
        <div class="price-bubble" style="
          background: white;
          color: #000;
          padding: 4px 8px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 12px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          transform-origin: center;
          transition: transform 0.2s ease;
        ">
          ${price}
        </div>
      `;
      
      const handleMouseEnter = () => {
        const priceBubble = el.querySelector('.price-bubble') as HTMLElement;
        if (priceBubble) {
          el.setAttribute('style', 'z-index: 10;');
          priceBubble.setAttribute('style', priceBubble.getAttribute('style') + '; transform: scale(1.1);');
        }
      };
      
      const handleMouseLeave = () => {
        if (activeMarker !== building.id) {
          const priceBubble = el.querySelector('.price-bubble') as HTMLElement;
          if (priceBubble) {
            el.setAttribute('style', 'z-index: 1;');
            priceBubble.setAttribute('style', priceBubble.getAttribute('style')?.replace('; transform: scale(1.1)', '') || '');
          }
        }
      };
      
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);

      // Create a popup with the building card
      const isShortlisted = buildingScores[building.id]?.shortlisted || false;
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '320px'
      })
      .setHTML(`
        <div class="building-popup" style="width: 100%; max-width: 300px; cursor: pointer;" onclick="window.location.href='/buildings/${building.id}'">
          <div class="image-container" style="position: relative; height: 180px; overflow: hidden; border-radius: 8px;">
            <img 
              src="${building.images && building.images.length > 0 ? building.images[0] : '/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png'}"
              style="width: 100%; height: 100%; object-fit: cover;"
              alt="${building.name}"
            />
            <button 
              id="shortlist-btn-${building.id}"
              style="
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(255,255,255,0.8);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
              "
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${isShortlisted ? '#ff4545' : 'none'}" stroke="${isShortlisted ? '#ff4545' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
          
          <div style="padding: 12px 0;">
            <h3 style="font-weight: 600; font-size: 16px; margin: 0 0 4px 0;">${building.name}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${building.locality || ''}</p>
            
            <div style="display: flex; gap: 16px; margin-bottom: 8px;">
              ${building.total_floors ? `
                <div style="display: flex; align-items: center; gap: 4px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                    <path d="M9 12h6"/>
                    <path d="M4 8h16"/>
                    <path d="M12 4v16"/>
                  </svg>
                  <span style="font-size: 13px;">${building.total_floors} Floors</span>
                </div>
              ` : ''}
              
              ${building.age !== null ? `
                <div style="display: flex; align-items: center; gap: 4px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span style="font-size: 13px;">${building.age} Old</span>
                </div>
              ` : ''}
            </div>
            
            <div>
              <p style="font-weight: 600; font-size: 16px; margin: 0;">
                ₹${(building.min_price/10000000).toFixed(1)} Cr
              </p>
            </div>
          </div>
        </div>
      `);

      // Create the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([building.longitude, building.latitude])
        .setPopup(popup)
        .addTo(map.current);

      // Handle marker click to set active state
      el.addEventListener('click', () => {
        // Reset previous active marker
        if (activeMarker && activeMarker !== building.id) {
          const prevMarkerEl = markers.current.find(m => 
            m.getElement().getAttribute('data-building-id') === activeMarker
          )?.getElement();
          
          if (prevMarkerEl) {
            prevMarkerEl.setAttribute('style', 'z-index: 1;');
            const prevBubble = prevMarkerEl.querySelector('.price-bubble') as HTMLElement;
            if (prevBubble) {
              prevBubble.setAttribute('style', prevBubble.getAttribute('style')?.replace('; transform: scale(1.1)', '') || '');
            }
          }
        }
        
        // Set new active marker
        setActiveMarker(building.id);
        el.setAttribute('style', 'z-index: 10;');
        const bubble = el.querySelector('.price-bubble') as HTMLElement;
        if (bubble) {
          bubble.setAttribute('style', bubble.getAttribute('style') + '; transform: scale(1.1);');
        }
      });

      // Set data attribute for identification
      el.setAttribute('data-building-id', building.id);
      
      markers.current.push(marker);
      bounds.extend([building.longitude, building.latitude]);
      
      // Add event listener for the shortlist button after popup is open
      marker.getPopup().on('open', () => {
        setTimeout(() => {
          const shortlistBtn = document.getElementById(`shortlist-btn-${building.id}`);
          if (shortlistBtn) {
            shortlistBtn.addEventListener('click', (e) => handleShortlist(e, building.id));
          }
        }, 100);
      });
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
  }, [buildings, buildingScores]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-[calc(100vh-12rem)]">
        <div className="w-full h-full rounded-lg shadow-lg bg-muted flex items-center justify-center">
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-12rem)]">
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
};

export default BuildingsMap;
