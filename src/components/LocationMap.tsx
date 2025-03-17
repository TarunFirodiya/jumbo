import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Clock, Route } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MultiSelectCombobox, BaseOption } from '@/components/ui/multi-select-combobox';

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
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [routeDisplayed, setRouteDisplayed] = useState(false);
  const [travelInfo, setTravelInfo] = useState<{distance: string, duration: string} | null>(null);
  const routeSourceId = useRef<string>('route');
  const searchMarker = useRef<mapboxgl.Marker | null>(null);
  const searchDebounceTimeout = useRef<number | null>(null);

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

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;

    const initializeMap = async () => {
      try {
        // Initialize Mapbox with token from Edge Function
        mapboxgl.accessToken = mapboxToken;
        
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
          
          // Add source for routes
          mapInstance.addSource(routeSourceId.current, {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'LineString',
                'coordinates': []
              }
            }
          });
          
          // Add route layer
          mapInstance.addLayer({
            'id': 'route',
            'type': 'line',
            'source': routeSourceId.current,
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': '#4a89dc',
              'line-width': 5,
              'line-opacity': 0.8
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
  }, [latitude, longitude, buildingName, toast, mapboxToken]);

  useEffect(() => {
    if (!mapboxToken || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    if (searchDebounceTimeout.current) {
      window.clearTimeout(searchDebounceTimeout.current);
    }

    searchDebounceTimeout.current = window.setTimeout(() => {
      searchPlaces();
    }, 300);

    return () => {
      if (searchDebounceTimeout.current) {
        window.clearTimeout(searchDebounceTimeout.current);
      }
    };
  }, [searchQuery, mapboxToken]);

  const searchPlaces = async () => {
    if (!map.current || !mapboxToken || !searchQuery.trim()) return;
    
    try {
      // Bangalore coordinates to restrict search to Bangalore area
      const bangaloreCoords = '77.5946,12.9716'; // Longitude, Latitude
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `proximity=${bangaloreCoords}&` +
        `bbox=77.4099,12.8260,77.7600,13.0947&` + // Bounding box for Bangalore
        `country=in&` + // Restrict to India
        `types=address,poi,place,neighborhood,locality&` +
        `limit=5&` +
        `access_token=${mapboxToken}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data.features);
    } catch (error) {
      console.error('Error searching for places:', error);
      toast({
        title: "Search Error",
        description: "Failed to find places matching your search",
        variant: "destructive",
      });
    }
  };

  const addSearchMarker = (place: any) => {
    if (!map.current) return;
    
    // Clear any existing search marker
    if (searchMarker.current) {
      searchMarker.current.remove();
    }
    
    // Create new marker
    searchMarker.current = new mapboxgl.Marker({
      color: '#d03d3d',
    })
      .setLngLat(place.center)
      .setPopup(new mapboxgl.Popup().setHTML(`<h4>${place.text}</h4>`))
      .addTo(map.current);
    
    // Fly to the location
    map.current.flyTo({
      center: place.center,
      zoom: 15,
      speed: 1.2
    });
    
    // Get directions
    getDirections(place.center);
    
    // Clear search results
    setSearchResults([]);
    
    // Keep the search query
    setSearchQuery(place.place_name || place.text);
  };
  
  const getDirections = async (destination: [number, number]) => {
    if (!map.current || !mapboxToken) return;
    
    try {
      // Get directions from Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${longitude},${latitude};${destination[0]},${destination[1]}?` +
        `geometries=geojson&` +
        `access_token=${mapboxToken}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeGeometry = route.geometry;
        
        // Update the route on the map
        if (map.current && map.current.getSource(routeSourceId.current)) {
          const source = map.current.getSource(routeSourceId.current) as mapboxgl.GeoJSONSource;
          source.setData({
            'type': 'Feature',
            'properties': {},
            'geometry': routeGeometry
          });
        }
        
        // Display travel info
        const distance = (route.distance / 1000).toFixed(2); // Convert to km
        const duration = Math.round(route.duration / 60); // Convert to minutes
        
        setTravelInfo({
          distance: `${distance} km`,
          duration: `${duration} min`
        });
        
        setRouteDisplayed(true);
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      toast({
        title: "Directions Error",
        description: "Failed to get directions to this location",
        variant: "destructive",
      });
    }
  };

  const searchNearbyPlaces = async (type: PlaceType) => {
    if (!map.current || !mapboxToken) return;

    try {
      // Clear existing markers of this type
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Define search radius (in meters)
      const radius = 2000;

      // Use Mapbox's geocoding API to find nearby places
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${type}.json?` +
        `proximity=${longitude},${latitude}&` +
        `radius=${radius}&` +
        `limit=10&` +
        `access_token=${mapboxToken}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add markers for each place
      data.features.forEach((place: any) => {
        let color;
        
        switch (type) {
          case 'hospital':
            color = '#E53935';  // Red for hospitals
            break;
          case 'school':
            color = '#43A047';  // Green for schools
            break;
          case 'restaurant':
            color = '#FB8C00';  // Orange for restaurants
            break;
          default:
            color = '#3949AB';  // Blue for other
        }
        
        const marker = new mapboxgl.Marker({
          color: color,
          scale: 0.7,
        })
          .setLngLat(place.center)
          .setPopup(new mapboxgl.Popup().setHTML(`
            <h4>${place.text}</h4>
            <p class="text-sm text-gray-500">${place.properties?.address || place.place_name}</p>
          `))
          .addTo(map.current!);

        markers.current.push(marker);
      });
      
      toast({
        title: `Nearby ${type.charAt(0).toUpperCase() + type.slice(1)}s`,
        description: `Found ${data.features.length} places near this location`,
      });
    } catch (error) {
      console.error('Error searching nearby places:', error);
      toast({
        title: "Search Error",
        description: `Failed to find nearby ${type}s`,
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

  const clearDirections = () => {
    if (!map.current) return;
    
    // Clear route if map and source exist
    if (map.current.getSource(routeSourceId.current)) {
      const source = map.current.getSource(routeSourceId.current) as mapboxgl.GeoJSONSource;
      source.setData({
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': []
        }
      });
    }
    
    // Clear search marker
    if (searchMarker.current) {
      searchMarker.current.remove();
      searchMarker.current = null;
    }
    
    // Reset state
    setRouteDisplayed(false);
    setTravelInfo(null);
    setSearchQuery('');
  };

  if (!mapboxToken) {
    return <div className="h-[400px] w-full rounded-lg bg-muted flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Location & Neighbourhood</h3>
        <p className="text-sm text-muted-foreground">
          Check exact commute from your office / other landmarks by searching for them below
        </p>
        
        <div className="relative">
          <div className="relative w-full">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              className="pl-10 pr-4 w-full border border-gray-300 rounded-lg text-base"
            />
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" 
              aria-hidden="true"
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-[250px] overflow-y-auto mt-1">
              <ul className="py-1">
                {searchResults.map((place, index) => (
                  <li 
                    key={index} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start gap-2 border-b border-gray-100 last:border-0"
                    onClick={() => addSearchMarker(place)}
                  >
                    <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-left">{place.text}</p>
                      <p className="text-xs text-gray-500 truncate text-left">{place.place_name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {travelInfo && (
          <div className="flex items-center gap-4 p-3 border rounded-md bg-gray-50 shadow-sm">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border">
              <Route className="h-5 w-5 text-gray-700" />
              <span className="text-sm font-medium">{travelInfo.distance}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border">
              <Clock className="h-5 w-5 text-gray-700" />
              <span className="text-sm font-medium">{travelInfo.duration}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto" 
              onClick={clearDirections}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
      
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
