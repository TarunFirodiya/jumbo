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
  type: string | null;
  age: number | null;
  total_floors: number | null;
  min_price: number | null;
  max_price: number | null;
  price_psqft: number | null;
  bhk_types: number[] | null;
  lifestyle_cohort: number | null;
  collections: string[] | null;
  amenities: string[] | null;
  google_rating: number | null;
  bank: string[] | null;
  water: string[] | null;
  map_link: string | null;
  street_view: string | null;
  video_thumbnail: string | null;
  data_source: string | null;
  total_units: number | null;
}

const buildingTypes = ["Apartment", "Villa", "Penthouse", "Duplex", "Studio", "Row House", "Independent House"];
const collectionOptions = ["Affordable", "Gated Apartment", "New Construction", "Child Friendly", "Luxury Community", "Spacious Layout", "Vastu Compliant"];
const featureCategories = {
  "Amenities": ["Swimming Pool", "Gym", "Clubhouse", "Garden", "Indoor Games", "Children's Play Area", "Sports Facilities"],
  "Security": ["24/7 Security", "CCTV", "Intercom", "Gated Community"],
  "Connectivity": ["Near Metro", "Near Bus Stop", "Near Highway", "Near Airport"],
  "Lifestyle": ["Pet Friendly", "Senior Living", "Smart Home", "Green Building"]
};
const waterSourceOptions = ["Borewell", "Corporation", "Tanker", "Rainwater Harvesting"];
const bankOptions = ["SBI", "HDFC", "ICICI", "Axis", "PNB", "Canara Bank", "Bank of Baroda"];

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
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);
  
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
      setSelectedBanks(editingBuilding.bank || []);
    } else {
      setSelectedFeatures({});
      setSelectedBHKTypes([]);
      setSelectedCollections([]);
      setSelectedWaterSources([]);
      setSelectedBanks([]);
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

  const createBuilding = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!currentSession?.user?.id) {
        throw new Error('You must be logged in to create a building');
      }
      
      const uploadedUrls = await uploadImages(uploadedImages);
      
      const amenitiesList = prepareAmenities();
      
      const buildingData = {
        name: formData.get('name')?.toString() || '',
        city: formData.get('city')?.toString() || 'Bengaluru',
        locality: formData.get('locality')?.toString() || '',
        sub_locality: formData.get('sub_locality')?.toString() || null,
        latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
        longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
        type: formData.get('type')?.toString() || null,
        age: formData.get('age') ? Number(formData.get('age')) : null,
        total_floors: formData.get('total_floors') ? Number(formData.get('total_floors')) : null,
        min_price: formData.get('min_price') ? Number(formData.get('min_price')) : null,
        max_price: formData.get('max_price') ? Number(formData.get('max_price')) : null,
        price_psqft: formData.get('price_psqft') ? Number(formData.get('price_psqft')) : null,
        bhk_types: selectedBHKTypes.length ? selectedBHKTypes : null,
        lifestyle_cohort: formData.get('lifestyle_cohort') ? Number(formData.get('lifestyle_cohort')) : null,
        collections: selectedCollections.length ? selectedCollections : null,
        amenities: amenitiesList.length ? amenitiesList : null,
        google_rating: formData.get('google_rating') ? Number(formData.get('google_rating')) : null,
        bank: selectedBanks.length ? selectedBanks : null,
        water: selectedWaterSources.length ? selectedWaterSources : null,
        map_link: formData.get('map_link')?.toString() || null,
        street_view: formData.get('street_view')?.toString() || null,
        video_thumbnail: formData.get('video_thumbnail')?.toString() || null,
        data_source: formData.get('data_source')?.toString() || null,
        images: uploadedUrls.length ? uploadedUrls : null,
        user_id: currentSession.user.id,
        total_units: formData.get('total_units') ? Number(formData.get('total_units')) : null
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
      if (!buildingId) throw new Error('Building ID is required');
      
      let imageUrls: string[] | null = editingBuilding?.images || null;
      
      if (uploadedImages.length) {
        const newUrls = await uploadImages(uploadedImages);
        imageUrls = editingBuilding?.images ? [...editingBuilding.images, ...newUrls] : newUrls;
      }
      
      const amenitiesList = prepareAmenities();
      
      const buildingData = {
        name: formData.get('name')?.toString() || '',
        city: formData.get('city')?.toString() || 'Bengaluru',
        locality: formData.get('locality')?.toString() || '',
        sub_locality: formData.get('sub_locality')?.toString() || null,
        latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
        longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
        type: formData.get('type')?.toString() || null,
        age: formData.get('age') ? Number(formData.get('age')) : null,
        total_floors: formData.get('total_floors') ? Number(formData.get('total_floors')) : null,
        min_price: formData.get('min_price') ? Number(formData.get('min_price')) : null,
        max_price: formData.get('max_price') ? Number(formData.get('max_price')) : null,
        price_psqft: formData.get('price_psqft') ? Number(formData.get('price_psqft')) : null,
        bhk_types: selectedBHKTypes.length ? selectedBHKTypes : null,
        lifestyle_cohort: formData.get('lifestyle_cohort') ? Number(formData.get('lifestyle_cohort')) : null,
        collections: selectedCollections.length ? selectedCollections : null,
        amenities: amenitiesList.length ? amenitiesList : null,
        google_rating: formData.get('google_rating') ? Number(formData.get('google_rating')) : null,
        bank: selectedBanks.length ? selectedBanks : null,
        water: selectedWaterSources.length ? selectedWaterSources : null,
        map_link: formData.get('map_link')?.toString() || null,
        street_view: formData.get('street_view')?.toString() || null,
        video_thumbnail: formData.get('video_thumbnail')?.toString() || null,
        data_source: formData.get('data_source')?.toString() || null,
        images: imageUrls,
        total_units: formData.get('total_units') ? Number(formData.get('total_units')) : null
      };

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

  const toggleBank = (value: string) => {
    setSelectedBanks(prev => 
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

  const BuildingForm = ({ building }: { building?: Building }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {building && <input type="hidden" name="buildingId" value={building.id} />}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
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
              <Label htmlFor="type">Building Type</Label>
              <Select name="type" defaultValue={building?.type || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select building type" />
                </SelectTrigger>
                <SelectContent>
                  {buildingTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_price">Minimum Price (₹)</Label>
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
                <Label htmlFor="max_price">Maximum Price (₹)</Label>
                <Input 
                  id="max_price" 
                  name="max_price" 
                  type="number" 
                  min="0" 
                  step="1000" 
                  defaultValue={building?.max_price || ''} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_psqft">Price per Sq. ft. (₹)</Label>
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
              <Label htmlFor="lifestyle_cohort">Lifestyle Cohort (1-10)</Label>
              <div className="pt-2">
                <Slider 
                  id="lifestyle_cohort"
                  name="lifestyle_cohort"
                  defaultValue={[building?.lifestyle_cohort || 5]}
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Budget</span>
                  <span>Premium</span>
                </div>
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

            <div className="space-y-2">
              <Label>Bank Approvals</Label>
              <div className="grid grid-cols-3 gap-2">
                {bankOptions.map(bank => (
                  <div key={bank} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`bank-${bank}`} 
                      checked={selectedBanks.includes(bank)} 
                      onCheckedChange={() => toggleBank(bank)} 
                    />
                    <Label htmlFor={`bank-${bank}`} className="cursor-pointer font-normal">{bank}</Label>
                  </div>
                ))}
              </div>
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
          
          <TabsContent value="utilities" className="space-y-4">
            <div className="space-y-2">
              <Label>Water Sources</Label>
              <div className="grid grid-cols-2 gap-2">
                {waterSourceOptions.map(source => (
                  <div key={source} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`water-${source}`} 
                      checked={selectedWaterSources.includes(source)} 
                      onCheckedChange={() => toggleWaterSource(source)} 
                    />
                    <Label htmlFor={`water-${source}`} className="cursor-pointer font-normal">{source}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_source">Data Source</Label>
              <Input 
                id="data_source" 
                name="data_source" 
                defaultValue={building?.data_source || ''} 
                placeholder="Where did this data come from?"
              />
            </div>
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
              <Label htmlFor="images">Building Images</Label>
              <Input 
                id="images" 
                name="images" 
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              
              {building?.images && building.images.length > 0 && (
                <div className="mt-2">
                  <Label>Existing Images</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {building.images.map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`Building ${index + 1}`} 
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {uploadedImages.length > 0 && (
                <div className="mt-2">
                  <Label>New Images to Upload</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Array.from(uploadedImages).map((file, index) => (
                      <div key={index} className="h-16 w-16 relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index + 1}`} 
                          className="h-full w-full object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="flex justify-end gap-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (editingBuilding) {
              setEditingBuilding(null);
            } else {
              setIsCreateOpen(false);
            }
            setActiveTab("basic");
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isUploading || createBuilding.isPending || updateBuilding.isPending}
        >
          {isUploading ? 'Uploading images...' : 
           (createBuilding.isPending || updateBuilding.isPending) ? 'Saving...' : 
           building ? 'Update Building' : 'Create Building'}
        </Button>
      </div>
    </form>
  );

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-muted-foreground">You need to be logged in to manage buildings.</p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Buildings</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Building
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create New Building</DialogTitle>
              <DialogDescription>
                Fill in the details for the new building. Use the tabs to navigate between different sections.
              </DialogDescription>
            </DialogHeader>
            <BuildingForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Images</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildings && buildings.map((building) => (
              <TableRow key={building.id}>
                <TableCell className="font-medium">{building.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {building.locality}, {building.city}
                      {building.sub_locality && `, ${building.sub_locality}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{building.type || "—"}</TableCell>
                <TableCell>
                  {building.min_price && building.max_price ? (
                    <span>₹{(building.min_price / 100000).toFixed(1)}L - ₹{(building.max_price / 100000).toFixed(1)}L</span>
                  ) : building.min_price ? (
                    <span>From ₹{(building.min_price / 100000).toFixed(1)}L</span>
                  ) : building.max_price ? (
                    <span>Up to ₹{(building.max_price / 100000).toFixed(1)}L</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not specified</span>
                  )}
                </TableCell>
                <TableCell>
                  {building.images && building.images.length > 0 ? (
                    <div className="flex -space-x-2">
                      {building.images.slice(0, 3).map((image, index) => (
                        <img 
                          key={index} 
                          src={image} 
                          alt={`Building ${index + 1}`} 
                          className="h-8 w-8 rounded-full border border-background object-cover"
                        />
                      ))}
                      {building.images.length > 3 && (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs">
                          +{building.images.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No images</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingBuilding(building)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(building.id)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!buildings?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  No buildings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingBuilding} onOpenChange={(open) => !open && setEditingBuilding(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Building</DialogTitle>
            <DialogDescription>
              Update the building details. Use the tabs to navigate between different sections.
            </DialogDescription>
          </DialogHeader>
          {editingBuilding && <BuildingForm building={editingBuilding} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this building? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteBuilding.isPending}>
              {deleteBuilding.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
