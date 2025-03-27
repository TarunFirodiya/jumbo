
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Building, BuildingFeatures, CompletionStatus } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Home, Pencil, Trash2, CheckCircle2, Circle, MapPin, Building as BuildingIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from "../building/ImageUploader";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface BuildingManagementProps {
  currentUser: Profile;
}

export function BuildingManagement({ currentUser }: BuildingManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);
  
  // Init form completion tracking
  const [formCompletion, setFormCompletion] = useState<CompletionStatus>({
    basic_info: false,
    location: false,
    features: false,
    media: false,
    pricing: false
  });

  // Calculate completion percentage
  const calculateCompletionPercentage = (status: CompletionStatus) => {
    const total = Object.keys(status).length;
    const completed = Object.values(status).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const {
    data: buildings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buildings")
        .select("*");

      if (error) throw error;
      
      // Process the buildings to ensure completion_status is properly typed
      const processedBuildings = (data || []).map(building => {
        // Ensure completion_status has the right shape
        let completion_status: CompletionStatus;
        if (!building.completion_status) {
          completion_status = {
            basic_info: false,
            location: false,
            features: false,
            media: false,
            pricing: false
          };
        } else {
          const cs = building.completion_status as Record<string, boolean>;
          completion_status = {
            basic_info: !!cs.basic_info,
            location: !!cs.location,
            features: !!cs.features,
            media: !!cs.media,
            pricing: !!cs.pricing
          };
        }
        
        // Ensure features has the right shape
        let features: BuildingFeatures;
        if (!building.features) {
          features = {
            amenities: [],
            security: [],
            connectivity: [],
            lifestyle: []
          };
        } else {
          const f = building.features as Record<string, string[]>;
          features = {
            amenities: f.amenities || [],
            security: f.security || [],
            connectivity: f.connectivity || [],
            lifestyle: f.lifestyle || []
          };
        }
        
        return {
          ...building,
          completion_status,
          features
        } as Building;
      });
      
      return processedBuildings;
    },
  });

  // Handle create or update building
  const uploadImages = async (files: File[], folder: string = 'building-images') => {
    if (!files.length) return [];
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;
        
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
      const name = formData.get('name')?.toString();
      if (!name) throw new Error('Building name is required');
      
      // Upload images
      const imageUrls = await uploadImages(uploadedImages);
      
      // Prepare completion status
      const completion_status: CompletionStatus = {
        basic_info: !!(name && formData.get('type')),
        location: !!(formData.get('locality') && formData.get('city')),
        features: false, // Will be updated based on amenities
        media: imageUrls.length > 0,
        pricing: !!(formData.get('min_price') || formData.get('max_price'))
      };

      // Prepare features
      const amenities = formData.getAll('amenities[]').map(x => x.toString());
      const security = formData.getAll('security[]').map(x => x.toString());
      const connectivity = formData.getAll('connectivity[]').map(x => x.toString());
      const lifestyle = formData.getAll('lifestyle[]').map(x => x.toString());
      
      // Update features completion status
      completion_status.features = !!(amenities.length || security.length || connectivity.length || lifestyle.length);
      
      const features: BuildingFeatures = {
        amenities,
        security,
        connectivity,
        lifestyle
      };

      const buildingData = {
        name,
        type: formData.get('type')?.toString(),
        locality: formData.get('locality')?.toString(),
        sub_locality: formData.get('sub_locality')?.toString(),
        city: formData.get('city')?.toString() || 'Bengaluru',
        bhk_types: [1, 2, 3].filter(bhk => formData.get(`bhk_${bhk}`) === 'on'),
        total_floors: formData.get('total_floors') ? Number(formData.get('total_floors')) : null,
        total_units: formData.get('total_units') ? Number(formData.get('total_units')) : null,
        min_price: formData.get('min_price') ? Number(formData.get('min_price')) : null,
        max_price: formData.get('max_price') ? Number(formData.get('max_price')) : null,
        latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
        longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
        map_link: formData.get('map_link')?.toString() || null,
        images: imageUrls,
        meta_description: formData.get('meta_description')?.toString() || null,
        meta_keywords: formData.get('meta_keywords')?.toString().split(',').map(k => k.trim()) || [],
        user_id: currentUser.id,
        features,
        completion_status
      };

      const { data, error } = await supabase
        .from('buildings')
        .insert(buildingData)
        .select();

      if (error) throw error;
      
      // Save media to the property_media table
      if (data && data.length > 0) {
        const buildingId = data[0].id;
        
        const mediaItems = imageUrls.map(url => ({
          type: 'regular' as const,
          url,
          is_thumbnail: false
        }));
        
        if (mediaItems.length > 0) {
          await saveMediaToDatabase(buildingId, mediaItems);
        }
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create building. Please try again.",
        variant: "destructive"
      });
      console.error('Error creating building:', error);
    }
  });

  const updateBuilding = useMutation({
    mutationFn: async (formData: FormData) => {
      const buildingId = formData.get('buildingId')?.toString();
      if (!buildingId || !editingBuilding) throw new Error('Building ID is required');
      
      let imageUrls = editingBuilding?.images || [];
      
      // Upload new images if provided
      if (uploadedImages.length) {
        const newUrls = await uploadImages(uploadedImages);
        imageUrls = [...(Array.isArray(imageUrls) ? imageUrls : []), ...newUrls];
        
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

      // Prepare features
      const amenities = formData.getAll('amenities[]').map(x => x.toString());
      const security = formData.getAll('security[]').map(x => x.toString());
      const connectivity = formData.getAll('connectivity[]').map(x => x.toString());
      const lifestyle = formData.getAll('lifestyle[]').map(x => x.toString());
      
      const features: BuildingFeatures = {
        amenities,
        security,
        connectivity,
        lifestyle
      };

      // Prepare completion status
      const completion_status: CompletionStatus = {
        basic_info: !!(formData.get('name') && formData.get('type')),
        location: !!(formData.get('locality') && formData.get('city')),
        features: !!(amenities.length || security.length || connectivity.length || lifestyle.length),
        media: imageUrls.length > 0,
        pricing: !!(formData.get('min_price') || formData.get('max_price'))
      };

      const updatedData = {
        name: formData.get('name')?.toString(),
        type: formData.get('type')?.toString(),
        locality: formData.get('locality')?.toString(),
        sub_locality: formData.get('sub_locality')?.toString(),
        city: formData.get('city')?.toString() || 'Bengaluru',
        bhk_types: [1, 2, 3].filter(bhk => formData.get(`bhk_${bhk}`) === 'on'),
        total_floors: formData.get('total_floors') ? Number(formData.get('total_floors')) : null,
        total_units: formData.get('total_units') ? Number(formData.get('total_units')) : null,
        min_price: formData.get('min_price') ? Number(formData.get('min_price')) : null,
        max_price: formData.get('max_price') ? Number(formData.get('max_price')) : null,
        latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
        longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
        map_link: formData.get('map_link')?.toString() || null,
        images: imageUrls,
        meta_description: formData.get('meta_description')?.toString() || null,
        meta_keywords: formData.get('meta_keywords')?.toString().split(',').map(k => k.trim()) || [],
        features,
        completion_status
      };

      const { error } = await supabase
        .from('buildings')
        .update(updatedData)
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update building. Please try again.",
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete building. Please try again.",
        variant: "destructive"
      });
      console.error('Error deleting building:', error);
    }
  });

  useEffect(() => {
    if (editingBuilding) {
      // When editing, initialize the completion status
      setFormCompletion(editingBuilding.completion_status || {
        basic_info: false,
        location: false,
        features: false,
        media: false,
        pricing: false
      });
    } else {
      // Reset form completion when not editing
      setFormCompletion({
        basic_info: false,
        location: false,
        features: false,
        media: false,
        pricing: false
      });
    }
  }, [editingBuilding]);

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

  // Common amenities and features for selection
  const amenityOptions = [
    "Swimming Pool", "Gym", "Garden", "Children's Play Area", "Clubhouse", 
    "Indoor Games", "Outdoor Sports", "Jogging Track", "Yoga Deck"
  ];
  
  const securityOptions = [
    "24/7 Security", "CCTV Surveillance", "Intercom", "Gated Community",
    "Visitor Management", "Fire Safety"
  ];
  
  const connectivityOptions = [
    "Near Metro", "Near Bus Stop", "Near Highway", "Near Train Station",
    "Near Airport", "Good Road Connectivity"
  ];
  
  const lifestyleOptions = [
    "Near Schools", "Near Colleges", "Near Hospitals", "Near Shopping Malls",
    "Near Restaurants", "Near Parks", "Near Markets", "Business District"
  ];

  const BuildingForm = ({ building }: { building?: Building }) => {
    return (
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <span>Basic Info</span>
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
          
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of the building</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Building Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={building?.name || ''} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Building Type</Label>
                  <Select 
                    name="type" 
                    defaultValue={building?.type || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select building type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Townhouse">Townhouse</SelectItem>
                      <SelectItem value="Plot">Plot</SelectItem>
                      <SelectItem value="Independent House">Independent House</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>BHK Types Available</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {[1, 2, 3].map((bhk) => (
                      <div key={bhk} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`bhk_${bhk}`} 
                          name={`bhk_${bhk}`}
                          defaultChecked={building?.bhk_types?.includes(bhk)}
                        />
                        <Label htmlFor={`bhk_${bhk}`} className="font-normal">
                          {bhk} BHK
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_floors">Total Floors</Label>
                    <Input 
                      id="total_floors" 
                      name="total_floors" 
                      type="number"
                      defaultValue={building?.total_floors || ''} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_units">Total Units</Label>
                    <Input 
                      id="total_units" 
                      name="total_units" 
                      type="number"
                      defaultValue={building?.total_units || ''} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea 
                    id="meta_description" 
                    name="meta_description" 
                    defaultValue={building?.meta_description || ''} 
                    className="resize-none" 
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Short description for SEO purposes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Meta Keywords</Label>
                  <Input 
                    id="meta_keywords" 
                    name="meta_keywords" 
                    defaultValue={building?.meta_keywords?.join(', ') || ''} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated keywords for SEO
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>Where is this building located?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="locality">Locality/Area</Label>
                    <Input 
                      id="locality" 
                      name="locality" 
                      defaultValue={building?.locality || ''} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub_locality">Sub-Locality</Label>
                    <Input 
                      id="sub_locality" 
                      name="sub_locality" 
                      defaultValue={building?.sub_locality || ''} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    defaultValue={building?.city || 'Bengaluru'} 
                    required
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
                    defaultValue={building?.map_link || ''} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
                <CardDescription>What features does this building offer?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Amenities</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {amenityOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`amenity-${option}`} 
                            name="amenities[]"
                            value={option}
                            defaultChecked={building?.features?.amenities?.includes(option)}
                          />
                          <Label htmlFor={`amenity-${option}`} className="font-normal text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Security</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {securityOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`security-${option}`} 
                            name="security[]"
                            value={option}
                            defaultChecked={building?.features?.security?.includes(option)}
                          />
                          <Label htmlFor={`security-${option}`} className="font-normal text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Connectivity</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {connectivityOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`connectivity-${option}`} 
                            name="connectivity[]"
                            value={option}
                            defaultChecked={building?.features?.connectivity?.includes(option)}
                          />
                          <Label htmlFor={`connectivity-${option}`} className="font-normal text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Lifestyle</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {lifestyleOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`lifestyle-${option}`} 
                            name="lifestyle[]"
                            value={option}
                            defaultChecked={building?.features?.lifestyle?.includes(option)}
                          />
                          <Label htmlFor={`lifestyle-${option}`} className="font-normal text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Media & Photos</CardTitle>
                <CardDescription>Upload photos of the building</CardDescription>
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
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setUploadedImages(Array.from(e.target.files));
                      }
                    }}
                    className="cursor-pointer"
                  />
                  
                  {building?.images && building.images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Existing Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {building.images.map((image, index) => (
                          <div key={index} className="relative group rounded-md overflow-hidden">
                            <img 
                              src={image as string} 
                              alt={`Building ${index + 1}`} 
                              className="h-24 w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 rounded-full p-0"
                                onClick={() => {
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
                              alt={`Preview ${index + 1}`} 
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
                <CardDescription>Enter the price range for this building</CardDescription>
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
                      defaultValue={building?.max_price || ''} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="pt-4 border-t flex justify-end space-x-4">
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
        </form>
      </Tabs>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Buildings</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <BuildingIcon className="h-4 w-4 mr-2" />
              Add New Building
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create New Building</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-80px)] pr-4">
              <div className="py-2">
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
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>BHK Types</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildings && buildings.map((building) => (
              <TableRow key={building.id}>
                <TableCell className="font-medium">{building.name}</TableCell>
                <TableCell>{building.locality}</TableCell>
                <TableCell>{building.type}</TableCell>
                <TableCell>{building.bhk_types?.join(', ')}</TableCell>
                <TableCell>
                  {building.min_price && building.max_price 
                    ? `₹${building.min_price.toLocaleString()} - ₹${building.max_price.toLocaleString()}`
                    : building.min_price 
                      ? `From ₹${building.min_price.toLocaleString()}`
                      : 'Price not set'
                  }
                </TableCell>
                <TableCell>
                  <Progress 
                    value={calculateCompletionPercentage(building.completion_status)} 
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
                      <Pencil className="h-4 w-4" />
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
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-80px)] pr-4">
            <div className="py-2">
              {editingBuilding && <BuildingForm building={editingBuilding} />}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this building? This action cannot be undone.
          </p>
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
