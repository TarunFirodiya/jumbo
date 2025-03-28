import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PencilIcon, Plus, MapPin, Building, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Json } from "@/integrations/supabase/types";

interface BuildingManagementProps {
  currentUser: Profile;
}

interface Building {
  id: string;
  name: string;
  city: string;
  locality: string;
  sub_locality: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[] | null;
  user_id: string | null;
  age: number | null;
  total_floors: number | null;
  min_price: number | null;
  price_psqft: number | null;
  bhk_types: number[] | null;
  collections: string[] | null;
  amenities: string[] | null;
  google_rating: number | null;
  water: string[] | null;
  map_link: string | null;
  street_view: string | null;
  video_thumbnail: string | null;
  total_units: number | null;
  building_status: string | null;
  nearby_places: {
    schools?: { name: string }[] | { name: string };
    hospitals?: { name: string }[] | { name: string };
    restaurants?: { name: string }[] | { name: string };
    tech_parks?: { name: string }[] | { name: string };
    malls?: { name: string }[] | { name: string };
    metro?: { name: string }[] | { name: string };
  } | null;
}

const collectionOptions = ["Affordable", "Gated Apartment", "New Construction", "Child Friendly", "Luxury Community", "Spacious Layout", "Vastu Compliant"];
const featureCategories = {
  "Amenities": [
    "Swimming Pool", "Gym", "Clubhouse", "Garden", "Children's Play Area", 
    "Badminton", "Cricket", "Tennis", "Spa", "Basketball", 
    "Table Tennis", "Snooker", "Library"
  ],
  "Security": ["24/7 Security", "CCTV", "Intercom", "Gated Community"]
};
const waterSourceOptions = ["Borewell", "Corporation", "Tanker", "Rainwater Harvesting"];
const nearbyPlaceCategories = ["schools", "hospitals", "tech_parks", "malls", "metro"];

export function BuildingManagement({ currentUser }: BuildingManagementProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<{[key: string]: boolean}>({});
  const [selectedBHKTypes, setSelectedBHKTypes] = useState<number[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedWaterSources, setSelectedWaterSources] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<{[key: string]: string[]}>({
    schools: [],
    hospitals: [],
    tech_parks: [],
    malls: [],
    metro: []
  });
  
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentSession(data.session);
    };
    
    getSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentSession(session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Get building status options - fixed to use string values directly instead of Postgres-specific syntax
  const { data: buildingStatusOptions = [] } = useQuery({
    queryKey: ['building-status-options'],
    queryFn: async () => {
      try {
        // Since we can't use Postgres-specific syntax like '::regtype' in JavaScript,
        // we'll use a direct RPC call or fall back to default values
        const { data, error } = await supabase
          .from('buildings')
          .select('building_status')
          .limit(100);
        
        if (error) {
          console.error("Error fetching building status options:", error);
          return ['Photos Pending', 'Publish']; // Default fallback values
        }
        
        // Extract unique statuses
        const statuses = new Set<string>();
        data.forEach(item => {
          if (item.building_status) {
            statuses.add(item.building_status);
          }
        });
        
        // If no statuses found, use defaults
        if (statuses.size === 0) {
          return ['Photos Pending', 'Publish'];
        }
        
        return Array.from(statuses);
      } catch (error) {
        console.error("Error in building status query:", error);
        return ['Photos Pending', 'Publish']; // Default fallback values
      }
    }
  });
  
  const { data: buildings, isLoading } = useQuery<Building[]>({
    queryKey: ['buildings'],
    queryFn: async () => {
      if (!currentSession?.user?.id) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('buildings')
        .select('*');
      
      if (error) {
        console.error("Error fetching buildings:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!currentSession?.user?.id
  });

  useEffect(() => {
    if (editingBuilding) {
      const featureState: {[key: string]: boolean} = {};
      
      if (editingBuilding.amenities) {
        Object.values(featureCategories).flat().forEach(feature => {
          featureState[feature] = editingBuilding.amenities?.includes(feature) || false;
        });
      }
      
      setSelectedFeatures(featureState);
      setSelectedBHKTypes(editingBuilding.bhk_types || []);
      setSelectedCollections(editingBuilding.collections || []);
      setSelectedWaterSources(editingBuilding.water || []);
      
      // Initialize nearby places
      const initialNearbyPlaces: {[key: string]: string[]} = {
        schools: [],
        hospitals: [],
        tech_parks: [],
        malls: [],
        metro: []
      };
      
      if (editingBuilding.nearby_places) {
        Object.entries(editingBuilding.nearby_places).forEach(([category, places]) => {
          if (Array.isArray(places)) {
            initialNearbyPlaces[category] = places.map(place => place.name);
          } else if (places && typeof places === 'object' && 'name' in places) {
            initialNearbyPlaces[category] = [places.name];
          }
        });
      }
      
      setNearbyPlaces(initialNearbyPlaces);
    } else {
      setSelectedFeatures({});
      setSelectedBHKTypes([]);
      setSelectedCollections([]);
      setSelectedWaterSources([]);
      setNearbyPlaces({
        schools: [],
        hospitals: [],
        tech_parks: [],
        malls: [],
        metro: []
      });
    }
  }, [editingBuilding]);

  const uploadImages = async (files: File[]) => {
    if (!files.length) return [];
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const buildingsBucket = buckets?.find(bucket => bucket.name === 'buildings');
      
      if (!buildingsBucket) {
        await supabase.storage.createBucket('buildings', {
          public: true,
          fileSizeLimit: 10485760,
        });
      }
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `building-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('buildings')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('buildings')
          .getPublicUrl(filePath);
          
        uploadedUrls.push(data.publicUrl);
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const prepareAmenities = () => {
    return Object.entries(selectedFeatures)
      .filter(([_, isSelected]) => isSelected)
      .map(([feature]) => feature);
  };

  const prepareNearbyPlaces = () => {
    const result: any = {};
    
    Object.entries(nearbyPlaces).forEach(([category, places]) => {
      if (places.length > 0) {
        result[category] = places.map(name => ({ name }));
      }
    });
    
    return Object.keys(result).length > 0 ? result : null;
  };

  const createBuilding = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!currentSession?.user?.id) {
        throw new Error('You must be logged in to create a building');
      }
      
      const uploadedUrls = await uploadImages(uploadedImages);
      
      const amenitiesList = prepareAmenities();
      const nearbyPlacesData = prepareNearbyPlaces();
      
      const buildingData = {
        name: formData.get('name')?.toString() || '',
        city: formData.get('city')?.toString() || 'Bengaluru',
        locality: formData.get('locality')?.toString() || '',
        sub_locality: formData.get('sub_locality')?.toString() || null,
        latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
        longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
        age: formData.get('age') ? Number(formData.get('age')) : null,
        total_floors: formData.get('total_floors') ? Number(formData.get('total_floors')) : null,
        min_price: formData.get('min_price') ? Number(formData.get('min_price')) : null,
        price_psqft: formData.get('price_psqft') ? Number(formData.get('price_psqft')) : null,
        bhk_types: selectedBHKTypes.length ? selectedBHKTypes : null,
        collections: selectedCollections.length ? selectedCollections : null,
        amenities: amenitiesList.length ? amenitiesList : null,
        google_rating: formData.get('google_rating') ? Number(formData.get('google_rating')) : null,
        water: selectedWaterSources.length ? selectedWaterSources : null,
        map_link: formData.get('map_link')?.toString() || null,
        street_view: formData.get('street_view')?.toString() || null,
        video_thumbnail: formData.get('video_thumbnail')?.toString() || null,
        images: uploadedUrls.length ? uploadedUrls : null,
        user_id: currentSession.user.id,
        total_units: formData.get('total_units') ? Number(formData.get('total_units')) : null,
        building_status: formData.get('building_status')?.toString() || 'Photos Pending',
        nearby_places: nearbyPlacesData
      };

      const { data, error } = await supabase
        .from('buildings')
        .insert(buildingData)
        .select();

      if (error) {
        console.error('Error creating building:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setIsCreateOpen(false);
      setUploadedImages([]);
      setActiveTab("basic");
      toast({
        title: "Success",
        description: "Building created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create building: ${error.message}`,
        variant: "destructive"
      });
      console.error('Error creating building:', error);
    }
  });

  const updateBuilding = useMutation({
    mutationFn: async (formData: FormData) => {
      const buildingId = formData.get('buildingId')?.toString();
      if (!buildingId || !editingBuilding) throw new Error('Building ID is required');
      
      let imageUrls: string[] | null = editingBuilding?.images || null;
      
      if (uploadedImages.length) {
        const newUrls = await uploadImages(uploadedImages);
        imageUrls = editingBuilding?.images ? [...editingBuilding.images, ...newUrls] : newUrls;
      }
      
      const amenitiesList = prepareAmenities();
      const nearbyPlacesData = prepareNearbyPlaces();
      
      const buildingData = {
        ...editingBuilding,
      };

      const name = formData.get('name')?.toString();
      if (name) buildingData.name = name;

      const city = formData.get('city')?.toString();
      if (city) buildingData.city = city;

      const locality = formData.get('locality')?.toString();
      if (locality) buildingData.locality = locality;

      const sub_locality = formData.get('sub_locality')?.toString();
      if (sub_locality !== undefined) buildingData.sub_locality = sub_locality || null;

      const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : null;
      if (latitude !== null) buildingData.latitude = latitude;

      const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : null;
      if (longitude !== null) buildingData.longitude = longitude;

      const age = formData.get('age') ? Number(formData.get('age')) : null;
      if (age !== null) buildingData.age = age;

      const total_floors = formData.get('total_floors') ? Number(formData.get('total_floors')) : null;
      if (total_floors !== null) buildingData.total_floors = total_floors;

      const min_price = formData.get('min_price') ? Number(formData.get('min_price')) : null;
      if (min_price !== null) buildingData.min_price = min_price;

      const price_psqft = formData.get('price_psqft') ? Number(formData.get('price_psqft')) : null;
      if (price_psqft !== null) buildingData.price_psqft = price_psqft;

      const google_rating = formData.get('google_rating') ? Number(formData.get('google_rating')) : null;
      if (google_rating !== null) buildingData.google_rating = google_rating;

      const map_link = formData.get('map_link')?.toString();
      if (map_link !== undefined) buildingData.map_link = map_link || null;

      const street_view = formData.get('street_view')?.toString();
      if (street_view !== undefined) buildingData.street_view = street_view || null;

      const video_thumbnail = formData.get('video_thumbnail')?.toString();
      if (video_thumbnail !== undefined) buildingData.video_thumbnail = video_thumbnail || null;

      const total_units = formData.get('total_units') ? Number(formData.get('total_units')) : null;
      if (total_units !== null) buildingData.total_units = total_units;

      const building_status = formData.get('building_status')?.toString();
      if (building_status) buildingData.building_status = building_status;

      if (selectedBHKTypes.length) buildingData.bhk_types = selectedBHKTypes;
      if (selectedCollections.length) buildingData.collections = selectedCollections;
      if (amenitiesList.length) buildingData.amenities = amenitiesList;
      if (selectedWaterSources.length) buildingData.water = selectedWaterSources;
      if (nearbyPlacesData) buildingData.nearby_places = nearbyPlacesData;
      
      if (imageUrls) buildingData.images = imageUrls;
      
      console.log("Updating building with data:", buildingData);

      const { error } = await supabase
        .from('buildings')
        .update(buildingData)
        .eq('id', buildingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setEditingBuilding(null);
      setUploadedImages([]);
      setActiveTab("basic");
      toast({
        title: "Success",
        description: "Building updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update building: ${error.message}`,
        variant: "destructive"
      });
      console.error('Error updating building:', error);
    }
  });

  const deleteBuilding = useMutation({
    mutationFn: async (buildingId: string) => {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', buildingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setIsDeleteDialogOpen(false);
      setBuildingToDelete(null);
      toast({
        title: "Success",
        description: "Building deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete building: ${error.message}`,
        variant: "destructive"
      });
      console.error('Error deleting building:', error);
    }
  });

  const handleDeleteClick = (buildingId: string) => {
    setBuildingToDelete(buildingId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (buildingToDelete) {
      deleteBuilding.mutate(buildingToDelete);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (editingBuilding) {
      updateBuilding.mutate(formData);
    } else {
      createBuilding.mutate(formData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedImages(Array.from(e.target.files));
    }
  };

  const toggleBHKType = (value: number) => {
    setSelectedBHKTypes(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };

  const toggleCollection = (value: string) => {
    setSelectedCollections(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };

  const toggleWaterSource = (value: string) => {
    setSelectedWaterSources(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };

  const toggleFeature = (feature: string, isChecked: boolean) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [feature]: isChecked
    }));
  };

  const handleNearbyPlaceChange = (category: string, index: number, value: string) => {
    setNearbyPlaces(prev => {
      const updatedPlaces = [...prev[category]];
      updatedPlaces[index] = value;
      return { ...prev, [category]: updatedPlaces };
    });
  };

  const addNearbyPlace = (category: string) => {
    setNearbyPlaces(prev => ({
      ...prev,
      [category]: [...prev[category], ""]
    }));
  };

  const removeNearbyPlace = (category: string, index: number) => {
    setNearbyPlaces(prev => {
      const updatedPlaces = [...prev[category]];
      updatedPlaces.splice(index, 1);
      return { ...prev, [category]: updatedPlaces };
    });
  };

  const BuildingForm = ({ building }: { building?: Building }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {building && <input type="hidden" name="buildingId" value={building.id} />}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="nearby">Nearby Places</TabsTrigger>
          <TabsTrigger value="links">Links & Media</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[500px] pr-4 mt-4">
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Building Name*</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={building?.name || ''} 
                required 
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  name="city" 
                  defaultValue={building?.city || 'Bengaluru'} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="locality">Locality*</Label>
                <Input 
                  id="locality" 
                  name="locality" 
                  defaultValue={building?.locality || ''} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sub_locality">Sub Locality</Label>
              <Input 
                id="sub_locality" 
                name="sub_locality" 
                defaultValue={building?.sub_locality || ''} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" 
                  name="latitude" 
                  type="number" 
                  step="any" 
                  defaultValue={building?.latitude || ''} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  name="longitude" 
                  type="number" 
                  step="any" 
                  defaultValue={building?.longitude || ''} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="building_status">Status</Label>
              <Select name="building_status" defaultValue={building?.building_status || 'Photos Pending'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select building status" />
                </SelectTrigger>
                <SelectContent>
                  {buildingStatusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (in years)</Label>
                <Input 
                  id="age" 
                  name="age" 
                  type="number" 
                  min="0" 
                  step="0.1" 
                  defaultValue={building?.age || ''} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total_floors">Total Floors</Label>
                <Input 
                  id="total_floors" 
                  name="total_floors" 
                  type="number" 
                  min="1" 
                  defaultValue={building?.total_floors || ''} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total_units">Total Units</Label>
                <Input 
                  id="total_units" 
                  name="total_units" 
                  type="number" 
                  min="1" 
                  defaultValue={building?.total_units || ''} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>BHK Types Available</Label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(bhk => (
                  <div 
                    key={bhk} 
                    className={`px-3 py-1 rounded-full border cursor-pointer select-none transition-colors ${
                      selectedBHKTypes.includes(bhk) 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-background border-muted-foreground/20 text-muted-foreground'
                    }`}
                    onClick={() => toggleBHKType(bhk)}
                  >
                    {bhk} BHK
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min_price">Price (₹)</Label>
              <Input 
                id="min_price" 
                name="min_price" 
                type="number" 
                min="0" 
                step="1000" 
                defaultValue={building?.min_price || ''} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_psqft">Price per Sq. ft. (₹) (Jumbo Fair Price Estimate)</Label>
              <Input 
                id="price_psqft" 
                name="price_psqft" 
                type="number" 
                min="0" 
                step="1" 
                defaultValue={building?.price_psqft || ''} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="collections">Collections</Label>
              <div className="grid grid-cols-2 gap-2">
                {collectionOptions.map(collection => (
                  <div key={collection} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`collection-${collection}`} 
                      checked={selectedCollections.includes(collection)} 
                      onCheckedChange={() => toggleCollection(collection)} 
                    />
                    <Label htmlFor={`collection-${collection}`} className="cursor-pointer font-normal">{collection}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="google_rating">Google Rating (0-5)</Label>
              <Input 
                id="google_rating" 
                name="google_rating" 
                type="number" 
                min="0" 
                max="5" 
                step="0.1" 
                defaultValue={building?.google_rating || ''} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            {Object.entries(featureCategories).map(([category, features]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-medium text-sm">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {features.map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`feature-${feature}`} 
                        checked={selectedFeatures[feature] || false} 
                        onCheckedChange={(checked) => toggleFeature(feature, !!checked)} 
                      />
                      <Label htmlFor={`feature-${feature}`} className="cursor-pointer font-normal">{feature}</Label>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="nearby" className="space-y-4">
            {nearbyPlaceCategories.map(category => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="capitalize">{category.replace('_', ' ')}</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNearbyPlace(category)}
                  >
                    Add
                  </Button>
                </div>
                
                {nearbyPlaces[category].map((place, index) => (
                  <div key={`${category}-${index}`} className="flex gap-2">
                    <Input 
                      value={place} 
                      onChange={(e) => handleNearbyPlaceChange(category, index, e.target.value)} 
                      placeholder={`Enter ${category.replace('_', ' ')} name`}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeNearbyPlace(category, index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {nearbyPlaces[category].length === 0 && (
                  <p className="text-sm text-muted-foreground">No {category.replace('_', ' ')} added yet.</p>
                )}
                
                <Separator className="my-2" />
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="links" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="map_link">Google Maps Link</Label>
              <Input 
                id="map_link" 
                name="map_link" 
                type="url" 
                defaultValue={building?.map_link || ''} 
                placeholder="https://maps.google.com/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="street_view">Street View Link</Label>
              <Input 
                id="street_view" 
                name="street_view" 
                type="url" 
                defaultValue={building?.street_view || ''} 
                placeholder="https://maps.google.com/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="video_thumbnail">Video Thumbnail URL</Label>
              <Input 
                id="video_thumbnail" 
                name="video_thumbnail" 
                type="url" 
                defaultValue={building?.video_thumbnail || ''} 
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="water">Water Sources</Label>
              <div className="grid grid-cols-2 gap-2">
                {waterSourceOptions.map(source => (
                  <div key={source} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`water-${source}`} 
                      checked={selectedWaterSources.includes(source)} 
                      onCheckedChange={() => toggleWaterSource(source)} 
                    />
                    <Label htmlFor={`water-${source}`} className="cursor-pointer font-normal">{source}</Label>
