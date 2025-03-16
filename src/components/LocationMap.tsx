
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Clock, Route } from 'lucide-react';
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
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [routeDisplayed, setRouteDisplayed] = useState(false);
  const [travelInfo, setTravelInfo] = useState<{distance: string, duration: string} | null>(null);
  const routeSourceId = useRef<string>('route');
  const searchMarker = useRef<mapboxgl.Marker | null>(null);

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

  const searchPlaces = async () => {
    if (!map.current || !mapboxToken || !searchQuery.trim()) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `proximity=${longitude},${latitude}&` +
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
        <p className="text-sm text-muted-foreground">
          Search for a location to see travel time from this building
        </p>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                searchPlaces();
              }
            }}
            className="pl-10 pr-4"
          />
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-10 w-10" 
            onClick={searchPlaces}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full bg-background border rounded-md shadow-md max-h-[200px] overflow-y-auto">
            <ul className="p-1">
              {searchResults.map((place, index) => (
                <li 
                  key={index} 
                  className="p-2 hover:bg-muted cursor-pointer rounded-sm flex items-start gap-2"
                  onClick={() => addSearchMarker(place)}
                >
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{place.text}</p>
                    <p className="text-xs text-muted-foreground">{place.place_name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {travelInfo && (
          <div className="flex items-center gap-4 p-2 border rounded-md bg-muted/50">
            <div className="flex items-center gap-1">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{travelInfo.distance}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
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

