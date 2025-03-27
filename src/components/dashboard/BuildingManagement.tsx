
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PencilIcon, Plus, MapPin, Building, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "../building/ImageUploader";
import { Json } from "@/integrations/supabase/types";

interface BuildingManagementProps {
  currentUser: Profile;
}

// Define a more structured building interface that matches our updated schema
interface Building {
  id: string;
  name: string;
  city: string;
  locality: string;
  sub_locality: string | null;
  latitude: number | null;
  longitude: number | null;
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
  // New fields from our schema update
  completion_status: {
    basic_info: boolean;
    location: boolean;
    features: boolean;
    media: boolean;
    pricing: boolean;
  };
  features: {
    amenities: string[];
    security: string[];
    connectivity: string[];
    lifestyle: string[];
  };
  meta_description: string | null;
  meta_keywords: string[] | null;
  images: string[] | null; // We'll keep this for backwards compatibility
}

// Media type for our new property_media table
interface PropertyMedia {
  id: string;
  building_id: string | null;
  listing_id: string | null;
  type: 'regular' | 'ai_staged' | 'floor_plan' | 'video' | 'street_view';
  url: string;
  is_thumbnail: boolean;
  display_order: number;
  metadata: Record<string, any>;
}

const buildingTypes = ["Apartment", "Villa", "Penthouse", "Duplex", "Studio", "Row House", "Independent House"];
const collectionOptions = ["Affordable", "Gated Apartment", "New Construction", "Child Friendly", "Luxury Community", "Spacious Layout", "Vastu Compliant"];

// Organize feature categories more clearly
const featureCategories = {
  "Amenities": ["Swimming Pool", "Gym", "Clubhouse", "Garden", "Indoor Games", "Children's Play Area", "Sports Facilities", "Yoga/Meditation Area", "Jogging Track", "Library"],
  "Security": ["24/7 Security", "CCTV", "Intercom", "Gated Community", "Biometric Access", "Fire Safety", "Emergency Response System"],
  "Connectivity": ["Near Metro", "Near Bus Stop", "Near Highway", "Near Airport", "Near Railway Station", "Near IT Park", "Near Schools", "Near Hospitals", "Near Shopping Centers"],
  "Lifestyle": ["Pet Friendly", "Senior Living", "Smart Home", "Green Building", "Power Backup", "Rainwater Harvesting", "Waste Management", "EV Charging", "Rooftop Terrace"]
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
  const [selectedFeatures, setSelectedFeatures] = useState<{[key: string]: {[key: string]: boolean}}>({
    Amenities: {},
    Security: {},
    Connectivity: {},
    Lifestyle: {}
  });
  const [selectedBHKTypes, setSelectedBHKTypes] = useState<number[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedWaterSources, setSelectedWaterSources] = useState<string[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);
  const [formCompletion, setFormCompletion] = useState({
    basic_info: false,
    location: false,
    features: false,
    media: false,
    pricing: false
  });
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  
  // Calculate completion percentage
  const calculateCompletionPercentage = (status: typeof formCompletion) => {
    const total = Object.keys(status).length;
    const completed = Object.values(status).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };
  
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

  // Fetch media for a specific building
  const fetchBuildingMedia = async (buildingId: string) => {
    const { data, error } = await supabase
      .from('property_media')
      .select('*')
      .eq('building_id', buildingId);
      
    if (error) {
      console.error("Error fetching building media:", error);
      throw error;
    }
    
    return data as PropertyMedia[];
  };

  useEffect(() => {
    if (editingBuilding) {
      // Initialize feature selection state based on building data
      const featureState: {[key: string]: {[key: string]: boolean}} = {
        Amenities: {},
        Security: {},
        Connectivity: {},
        Lifestyle: {}
      };
      
      // Handle old amenities array for backward compatibility
      if (editingBuilding.amenities) {
        Object.values(featureCategories).flat().forEach(feature => {
          const category = Object.entries(featureCategories).find(([_, features]) => 
            features.includes(feature)
          )?.[0] || "Amenities";
          
          featureState[category][feature] = editingBuilding.amenities?.includes(feature) || false;
        });
      }
      
      // Handle new features structure if available
      if (editingBuilding.features) {
        Object.entries(editingBuilding.features).forEach(([category, features]) => {
          const categoryKey = category.charAt(0).toUpperCase() + category.slice(1);
          if (featureState[categoryKey]) {
            features.forEach(feature => {
              featureState[categoryKey][feature] = true;
            });
          }
        });
      }
      
      setSelectedFeatures(featureState);
      setSelectedBHKTypes(editingBuilding.bhk_types || []);
      setSelectedCollections(editingBuilding.collections || []);
      setSelectedWaterSources(editingBuilding.water || []);
      setSelectedBanks(editingBuilding.bank || []);
      
      // Initialize form completion status
      if (editingBuilding.completion_status) {
        setFormCompletion(editingBuilding.completion_status);
      }
      
      // Initialize meta keywords
      if (editingBuilding.meta_keywords) {
        setMetaKeywords(editingBuilding.meta_keywords);
      } else {
        setMetaKeywords([]);
      }
      
      // Fetch media for this building
      if (editingBuilding.id) {
        fetchBuildingMedia(editingBuilding.id)
          .then(media => {
            console.log("Building media:", media);
            // We'll handle this data when we update the ImageUploader component
          })
          .catch(error => {
            console.error("Error fetching media:", error);
          });
      }
    } else {
      // Reset all state when not editing
      const emptyFeatureState: {[key: string]: {[key: string]: boolean}} = {
        Amenities: {},
        Security: {},
        Connectivity: {},
        Lifestyle: {}
      };
      
      Object.entries(featureCategories).forEach(([category, features]) => {
        features.forEach(feature => {
          emptyFeatureState[category][feature] = false;
        });
      });
      
      setSelectedFeatures(emptyFeatureState);
      setSelectedBHKTypes([]);
      setSelectedCollections([]);
      setSelectedWaterSources([]);
      setSelectedBanks([]);
      setFormCompletion({
        basic_info: false,
        location: false,
        features: false,
        media: false,
        pricing: false
      });
      setMetaKeywords([]);
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

  // Convert selected features to the new structure
  const prepareFeatures = () => {
    const features = {
      amenities: [] as string[],
      security: [] as string[],
      connectivity: [] as string[],
      lifestyle: [] as string[]
    };
    
    Object.entries(selectedFeatures).forEach(([category, featureObj]) => {
      const categoryKey = category.toLowerCase() as keyof typeof features;
      
      Object.entries(featureObj).forEach(([feature, isSelected]) => {
        if (isSelected && features[categoryKey]) {
          features[categoryKey].push(feature);
        }
      });
    });
    
    return features;
  };

  // For backward compatibility
  const prepareAmenities = () => {
    const allFeatures: string[] = [];
    
    Object.entries(selectedFeatures).forEach(([_, featureObj]) => {
      Object.entries(featureObj).forEach(([feature, isSelected]) => {
        if (isSelected) {
          allFeatures.push(feature);
        }
      });
    });
    
    return allFeatures;
  };

  const saveMediaToDatabase = async (buildingId: string, mediaItems: {
    type: 'regular' | 'ai_staged' | 'floor_plan' | 'video' | 'street_view';
    url: string;
    is_thumbnail?: boolean;
    display_order?: number;
    metadata?: Record<string, any>;
  }[]) => {
    const mediaToInsert = mediaItems.map((item, index) => ({
      building_id: buildingId,
      type: item.type,
      url: item.url,
      is_thumbnail: item.is_thumbnail || false,
      display_order: item.display_order || index,
      metadata: item.metadata || {}
    }));
    
    if (mediaToInsert.length === 0) return [];
    
    const { data, error } = await supabase
      .from('property_media')
      .insert(mediaToInsert)
      .select();
      
    if (error) {
      console.error("Error saving media:", error);
      throw error;
    }
    
    return data;
  };

  const createBuilding = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!currentSession?.user?.id) {
        throw new Error('You must be logged in to create a building');
      }
      
      // Upload images
      const uploadedUrls = await uploadImages(uploadedImages);
      
      // Prepare features and amenities
      const features = prepareFeatures();
      const amenitiesList = prepareAmenities();
      
      // Determine completion status
      const name = formData.get('name')?.toString();
      const locality = formData.get('locality')?.toString();
      const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : null;
      const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : null;
      
      const completion_status = {
        basic_info: !!(name && formData.get('type')),
        location: !!(locality && (latitude || longitude)),
        features: Object.values(features).some(arr => arr.length > 0),
        media: uploadedUrls.length > 0,
        pricing: !!(formData.get('min_price') || formData.get('max_price'))
      };
      
      const buildingData = {
        name: name || '',
        city: formData.get('city')?.toString() || 'Bengaluru',
        locality: locality || '',
        sub_locality: formData.get('sub_locality')?.toString() || null,
        latitude,
        longitude,
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
        total_units: formData.get('total_units') ? Number(formData.get('total_units')) : null,
        completion_status,
        features,
        meta_description: formData.get('meta_description')?.toString() || null,
        meta_keywords: metaKeywords.length ? metaKeywords : null
      };

      const { data, error } = await supabase
        .from('buildings')
        .insert(buildingData)
        .select();

      if (error) {
        console.error('Error creating building:', error);
        throw error;
      }
      
      if (data && data.length > 0 && uploadedUrls.length > 0) {
        // Save media to the new property_media table
        const mediaItems = uploadedUrls.map(url => ({
          type: 'regular' as const,
          url,
          is_thumbnail: false
        }));
        
        await saveMediaToDatabase(data[0].id, mediaItems);
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
        
        // Save new media to the property_media table
        if (newUrls.length) {
          const mediaItems = newUrls.map(url => ({
            type: 'regular' as const,
            url,
            is_thumbnail: false
          }));
          
          await saveMediaToDatabase(buildingId, mediaItems);
        }
      }
      
      const features = prepareFeatures();
      const amenitiesList = prepareAmenities();
      
      // Determine completion status
      const name = formData.get('name')?.toString() || editingBuilding.name;
      const locality = formData.get('locality')?.toString() || editingBuilding.locality;
      const type = formData.get('type')?.toString() || editingBuilding.type;
      const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : editingBuilding.latitude;
      const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : editingBuilding.longitude;
      const min_price = formData.get('min_price') ? Number(formData.get('min_price')) : editingBuilding.min_price;
      const max_price = formData.get('max_price') ? Number(formData.get('max_price')) : editingBuilding.max_price;
      
      const completion_status = {
        basic_info: !!(name && type),
        location: !!(locality && (latitude || longitude)),
        features: Object.values(features).some(arr => arr.length > 0),
        media: !!(imageUrls && imageUrls.length > 0),
        pricing: !!(min_price || max_price)
      };
      
      const buildingData: Partial<Building> = {
        ...editingBuilding,
        completion_status,
        features,
        amenities: amenitiesList.length ? amenitiesList : null,
        meta_keywords: metaKeywords.length ? metaKeywords : null
      };

      // Update fields that were provided in the form
      if (formData.get('name')) buildingData.name = formData.get('name')?.toString() as string;
      if (formData.get('city')) buildingData.city = formData.get('city')?.toString() as string;
      if (formData.get('locality')) buildingData.locality = formData.get('locality')?.toString() as string;
      if (formData.get('sub_locality') !== undefined) buildingData.sub_locality = formData.get('sub_locality')?.toString() || null;
      if (formData.get('latitude')) buildingData.latitude = Number(formData.get('latitude'));
      if (formData.get('longitude')) buildingData.longitude = Number(formData.get('longitude'));
      if (formData.get('type')) buildingData.type = formData.get('type')?.toString() || null;
      if (formData.get('age')) buildingData.age = Number(formData.get('age'));
      if (formData.get('total_floors')) buildingData.total_floors = Number(formData.get('total_floors'));
      if (formData.get('min_price')) buildingData.min_price = Number(formData.get('min_price'));
      if (formData.get('max_price')) buildingData.max_price = Number(formData.get('max_price'));
      if (formData.get('price_psqft')) buildingData.price_psqft = Number(formData.get('price_psqft'));
      if (formData.get('lifestyle_cohort')) buildingData.lifestyle_cohort = Number(formData.get('lifestyle_cohort'));
      if (formData.get('google_rating')) buildingData.google_rating = Number(formData.get('google_rating'));
      if (formData.get('map_link')) buildingData.map_link = formData.get('map_link')?.toString() || null;
      if (formData.get('street_view')) buildingData.street_view = formData.get('street_view')?.toString() || null;
      if (formData.get('video_thumbnail')) buildingData.video_thumbnail = formData.get('video_thumbnail')?.toString() || null;
      if (formData.get('data_source')) buildingData.data_source = formData.get('data_source')?.toString() || null;
      if (formData.get('total_units')) buildingData.total_units = Number(formData.get('total_units'));
      if (formData.get('meta_description')) buildingData.meta_description = formData.get('meta_description')?.toString() || null;
      
      if (selectedBHKTypes.length) buildingData.bhk_types = selectedBHKTypes;
      if (selectedCollections.length) buildingData.collections = selectedCollections;
      if (selectedBanks.length) buildingData.bank = selectedBanks;
      if (selectedWaterSources.length) buildingData.water = selectedWaterSources;
      
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
      // Note: We don't need to delete from property_media table because of the CASCADE constraint
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

  const toggleFeature = (category: string, feature: string, isChecked: boolean) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [feature]: isChecked
      }
    }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !metaKeywords.includes(keywordInput.trim())) {
      setMetaKeywords([...metaKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setMetaKeywords(metaKeywords.filter(k => k !== keyword));
  };

  const BuildingForm = ({ building }: { building?: Building }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {building && <input type="hidden" name="buildingId" value={building.id} />}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {building ? 'Edit Building' : 'Create New Building'}
        </h3>
        <div className="flex items-center gap-2">
          <Progress 
            value={calculateCompletionPercentage(formCompletion)} 
            className="w-32 h-2"
          />
          <span className="text-sm font-medium">
            {calculateCompletionPercentage(formCompletion)}% Complete
          </span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <span>Basic</span>
            {formCompletion.basic_info ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <span>Location</span>
            {formCompletion.location ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <span>Features</span>
            {formCompletion.features ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <span>Media</span>
            {formCompletion.media ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <span>Pricing</span>
            {formCompletion.pricing ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[500px] pr-4 mt-4">
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of the building</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea 
                    id="meta_description" 
                    name="meta_description" 
                    placeholder="Enter a description for search engines"
                    defaultValue={building?.meta_description || ''}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This description will be used for SEO purposes.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords">Meta Keywords</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="keywords" 
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keywords"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddKeyword}>Add</Button>
                  </div>
                  
                  {metaKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {metaKeywords.map(keyword => (
                        <Badge 
                          key={keyword} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {keyword}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
                <CardDescription>Provide details about the building's location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Building Features</CardTitle>
                <CardDescription>Select the features and amenities available in this building</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(featureCategories).map(([category, features]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-medium">{category}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {features.map(feature => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`feature-${category}-${feature}`} 
                            checked={selectedFeatures[category]?.[feature] || false} 
                            onCheckedChange={(checked) => toggleFeature(category, feature, checked === true)} 
                          />
                          <Label 
                            htmlFor={`feature-${category}-${feature}`} 
                            className="cursor-pointer font-normal text-sm"
                          >
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ))}
                
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Media & Images</CardTitle>
                <CardDescription>Upload and manage photos and videos of the building</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Existing Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {building.images.map((image, index) => (
                          <div key={index} className="relative group rounded-md overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Building ${index}`} 
                              className="h-24 w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 rounded-full p-0"
                                onClick={() => {
                                  // Handle image deletion
                                  if (editingBuilding && editingBuilding.images) {
                                    const updatedImages = [...editingBuilding.images];
                                    updatedImages.splice(index, 1);
                                    setEditingBuilding({
                                      ...editingBuilding,
                                      images: updatedImages
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">New Images to Upload</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Array.from(uploadedImages).map((file, index) => (
                          <div key={index} className="relative group rounded-md overflow-hidden">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Preview ${index}`} 
                              className="h-24 w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 rounded-full p-0"
                                onClick={() => {
                                  const updatedImages = [...uploadedImages];
                                  updatedImages.splice(index, 1);
                                  setUploadedImages(updatedImages);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video_thumbnail">Video Thumbnail URL</Label>
                  <Input 
                    id="video_thumbnail" 
                    name="video_thumbnail" 
                    type="url"
                    defaultValue={building?.video_thumbnail || ''} 
                    placeholder="https://example.com/video.mp4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a URL to a video of the building or a YouTube video ID
                  </p>
                </div>
                
                {/* Future enhancement: Add ImageUploader component integration */}
                {/* <ImageUploader 
                  images={building?.images || []}
                  onImagesChange={(images) => {
                    // Handle image changes
                  }}
                /> */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
                <CardDescription>Provide pricing details for the building</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <Label htmlFor={`bank-${bank}`} className="cursor-pointer font-normal text-sm">{bank}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
        
        <div className="pt-4 border-t mt-4 flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              if (editingBuilding) {
                setEditingBuilding(null);
              } else {
                setIsCreateOpen(false);
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isUploading || createBuilding.isPending || updateBuilding.isPending}
          >
            {isUploading ? 'Uploading...' : 
             (createBuilding.isPending || updateBuilding.isPending) ? 'Saving...' : 
             building ? 'Update Building' : 'Create Building'}
          </Button>
        </div>
      </Tabs>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Buildings</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Building className="h-4 w-4 mr-2" />
              Add New Building
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create New Building</DialogTitle>
              <DialogDescription>
                Fill out the form below to add a new building. You can save at any stage and complete the information later.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="py-2 px-1">
                <BuildingForm />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Building Name</TableHead>
              <TableHead>Locality</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildings?.map((building) => (
              <TableRow key={building.id}>
                <TableCell className="font-medium">{building.name}</TableCell>
                <TableCell>{building.locality}</TableCell>
                <TableCell>{building.type || 'N/A'}</TableCell>
                <TableCell>{building.total_units || 'N/A'}</TableCell>
                <TableCell>
                  {building.min_price && building.max_price 
                    ? `₹${building.min_price.toLocaleString()} - ₹${building.max_price.toLocaleString()}` 
                    : building.min_price 
                      ? `From ₹${building.min_price.toLocaleString()}` 
                      : building.max_price 
                        ? `Up to ₹${building.max_price.toLocaleString()}` 
                        : 'N/A'}
                </TableCell>
                <TableCell>
                  <Progress 
                    value={calculateCompletionPercentage(building.completion_status || formCompletion)} 
                    className="h-2 w-24"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingBuilding(building)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(building.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!buildings?.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No buildings found. Add your first building to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingBuilding} onOpenChange={(open) => !open && setEditingBuilding(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Building</DialogTitle>
            <DialogDescription>
              Update the building information below.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="py-2 px-1">
              {editingBuilding && <BuildingForm building={editingBuilding} />}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this building? This action cannot be undone,
              and will also delete all listings associated with this building.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteBuilding.isPending}>
              {deleteBuilding.isPending ? 'Deleting...' : 'Delete Building'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
