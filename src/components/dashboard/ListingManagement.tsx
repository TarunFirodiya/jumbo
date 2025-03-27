
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PencilIcon, Home, ImageIcon, X, Video, Building, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Listing, CompletionStatus, PropertyMedia } from "@/types/property";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from "../building/ImageUploader";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ListingManagementProps {
  currentUser: Profile;
}

// Enhanced Listing type with metadata and completion status
interface EnhancedListing extends Listing {
  media?: PropertyMedia[];
  variant_options?: {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
  }[];
  completion_status?: CompletionStatus;
}

export function ListingManagement({ currentUser }: ListingManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<EnhancedListing | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedAIStagedPhotos, setUploadedAIStagedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("basic");
  const [formCompletion, setFormCompletion] = useState<CompletionStatus>({
    basic_info: false,
    floor_plan: false,
    pricing: false,
    features: false,
    media: false
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [uploadedFloorPlan, setUploadedFloorPlan] = useState<File | null>(null);

  // Calculate completion percentage
  const calculateCompletionPercentage = (status: CompletionStatus) => {
    const total = Object.keys(status).length;
    const completed = Object.values(status).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const query = supabase
        .from('listings')
        .select('*');
      
      if (currentUser.role === 'agent') {
        const { data, error } = await query.eq('agent_id', currentUser.id);
        if (error) throw error;
        
        return await processListingData(data);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return await processListingData(data);
    }
  });

  // Process listing data to handle both old and new schema
  const processListingData = async (data: Listing[]) => {
    const processedListings: EnhancedListing[] = [];
    
    for (const listing of data) {
      const processedListing: EnhancedListing = { ...listing };
      
      // Handle legacy images field
      if (!Array.isArray(processedListing.images)) {
        processedListing.images = processedListing.images ? [processedListing.images as unknown as string] : [];
      }
      
      // Handle legacy ai_staged_photos field
      if (!processedListing.ai_staged_photos) {
        processedListing.ai_staged_photos = [];
      } else if (!Array.isArray(processedListing.ai_staged_photos)) {
        processedListing.ai_staged_photos = [processedListing.ai_staged_photos as unknown as string];
      }
      
      // Fetch media from new property_media table
      const { data: mediaData } = await supabase
        .from('property_media')
        .select('*')
        .eq('listing_id', listing.id);
        
      if (mediaData && mediaData.length > 0) {
        processedListing.media = mediaData as PropertyMedia[];
        
        // If we have media but no legacy images, extract them from media
        if ((!processedListing.images || processedListing.images.length === 0) && mediaData.length > 0) {
          processedListing.images = mediaData
            .filter(item => item.type === 'regular')
            .map(item => item.url);
            
          processedListing.ai_staged_photos = mediaData
            .filter(item => item.type === 'ai_staged')
            .map(item => item.url);
        }
      }
      
      // Set default completion status based on data presence
      processedListing.completion_status = {
        basic_info: !!(processedListing.building_id && processedListing.bedrooms),
        floor_plan: !!processedListing.floor_plan_image,
        pricing: !!processedListing.price,
        features: !!(processedListing.facing || processedListing.furnishing_status),
        media: !!(processedListing.images && processedListing.images.length > 0)
      };
      
      processedListings.push(processedListing);
    }
    
    return processedListings;
  };

  // Fetch a single listing with its media
  const fetchListingWithMedia = async (listingId: string) => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();
      
    if (error) throw error;
    
    const processed = await processListingData([data]);
    return processed[0];
  };

  useEffect(() => {
    if (editingListing) {
      // When editing, initialize the completion status
      setFormCompletion(editingListing.completion_status || {
        basic_info: false,
        floor_plan: false,
        pricing: false,
        features: false,
        media: false
      });
      
      // Set selected date if availability is provided
      if (editingListing.availability) {
        try {
          setSelectedDate(new Date(editingListing.availability));
        } catch (e) {
          setSelectedDate(undefined);
        }
      } else {
        setSelectedDate(undefined);
      }
    } else {
      // Reset form completion when not editing
      setFormCompletion({
        basic_info: false,
        floor_plan: false,
        pricing: false,
        features: false,
        media: false
      });
      setSelectedDate(undefined);
    }
  }, [editingListing]);

  const uploadImages = async (files: File[], folder: string = 'listing-images') => {
    if (!files.length) return [];
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('listings')
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

  const saveMediaToDatabase = async (listingId: string, mediaItems: {
    type: 'regular' | 'ai_staged' | 'floor_plan' | 'video' | 'street_view';
    url: string;
    is_thumbnail?: boolean;
    display_order?: number;
    metadata?: Record<string, any>;
  }[]) => {
    const mediaToInsert = mediaItems.map((item, index) => ({
      listing_id: listingId,
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

  const createListing = useMutation({
    mutationFn: async (formData: FormData) => {
      const building_id = formData.get('building_id')?.toString() || null;
      if (!building_id) throw new Error('Building ID is required');
      
      const building = buildings?.find(b => b.id === building_id);
      
      // Upload regular images
      const imageUrls = await uploadImages(uploadedImages);
      
      // Upload AI staged photos
      const aiStagedUrls = await uploadImages(uploadedAIStagedPhotos, 'ai-staged-photos');
      
      // Upload floor plan if provided
      let floorPlanUrl = null;
      if (uploadedFloorPlan) {
        const floorPlanUrls = await uploadImages([uploadedFloorPlan], 'floor-plans');
        floorPlanUrl = floorPlanUrls.length > 0 ? floorPlanUrls[0] : null;
      }
      
      // Prepare completion status
      const completion_status = {
        basic_info: !!(building_id && formData.get('bedrooms')),
        floor_plan: !!floorPlanUrl,
        pricing: !!formData.get('price'),
        features: !!(formData.get('facing') || formData.get('furnishing_status')),
        media: imageUrls.length > 0 || aiStagedUrls.length > 0
      };

      const listingData = {
        building_id,
        bedrooms: Number(formData.get('bedrooms')),
        bathrooms: Number(formData.get('bathrooms')),
        built_up_area: Number(formData.get('built_up_area')),
        carpet_area: formData.get('carpet_area') ? Number(formData.get('carpet_area')) : null,
        floor: Number(formData.get('floor')),
        price: Number(formData.get('price')),
        maintenance: Number(formData.get('maintenance')),
        facing: formData.get('facing')?.toString() || null,
        agent_id: currentUser.id,
        building_name: building?.name || null,
        images: imageUrls.length ? imageUrls : [],
        ai_staged_photos: aiStagedUrls.length ? aiStagedUrls : [],
        floor_plan_image: floorPlanUrl,
        parking_spots: formData.get('parking_spots') ? Number(formData.get('parking_spots')) : null,
        balconies: formData.get('balconies') ? Number(formData.get('balconies')) : null,
        furnishing_status: formData.get('furnishing_status')?.toString() || null,
        status: formData.get('status')?.toString() || 'available',
        availability: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
        completion_status
      };

      const { data, error } = await supabase
        .from('listings')
        .insert(listingData)
        .select();

      if (error) throw error;
      
      // Save media to the new property_media table
      if (data && data.length > 0) {
        const listingId = data[0].id;
        
        const mediaItems = [
          ...imageUrls.map(url => ({
            type: 'regular' as const,
            url,
            is_thumbnail: false
          })),
          ...aiStagedUrls.map(url => ({
            type: 'ai_staged' as const,
            url,
            is_thumbnail: false
          }))
        ];
        
        if (floorPlanUrl) {
          mediaItems.push({
            type: 'floor_plan' as const,
            url: floorPlanUrl,
            is_thumbnail: false
          });
        }
        
        if (mediaItems.length > 0) {
          await saveMediaToDatabase(listingId, mediaItems);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setIsCreateOpen(false);
      setUploadedImages([]);
      setUploadedAIStagedPhotos([]);
      setUploadedFloorPlan(null);
      setActiveTab("basic");
      toast({
        title: "Success",
        description: "Listing created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive"
      });
      console.error('Error creating listing:', error);
    }
  });

  const updateListing = useMutation({
    mutationFn: async (formData: FormData) => {
      const listingId = formData.get('listingId')?.toString();
      if (!listingId || !editingListing) throw new Error('Listing ID is required');
      
      let imageUrls = editingListing?.images || [];
      let aiStagedUrls = editingListing?.ai_staged_photos || [];
      let floorPlanUrl = editingListing?.floor_plan_image || null;
      
      // Upload new regular images if provided
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
          
          await saveMediaToDatabase(listingId, mediaItems);
        }
      }
      
      // Upload new AI staged photos if provided
      if (uploadedAIStagedPhotos.length) {
        const newUrls = await uploadImages(uploadedAIStagedPhotos, 'ai-staged-photos');
        aiStagedUrls = [...(Array.isArray(aiStagedUrls) ? aiStagedUrls : []), ...newUrls];
        
        // Save new media to the property_media table
        if (newUrls.length) {
          const mediaItems = newUrls.map(url => ({
            type: 'ai_staged' as const,
            url,
            is_thumbnail: false
          }));
          
          await saveMediaToDatabase(listingId, mediaItems);
        }
      }
      
      // Upload new floor plan if provided
      if (uploadedFloorPlan) {
        const floorPlanUrls = await uploadImages([uploadedFloorPlan], 'floor-plans');
        if (floorPlanUrls.length > 0) {
          floorPlanUrl = floorPlanUrls[0];
          
          // Save new floor plan to the property_media table
          await saveMediaToDatabase(listingId, [{
            type: 'floor_plan' as const,
            url: floorPlanUrl,
            is_thumbnail: false
          }]);
        }
      }

      // Prepare completion status
      const completion_status = {
        basic_info: !!(editingListing.building_id && (formData.get('bedrooms') || editingListing.bedrooms)),
        floor_plan: !!floorPlanUrl,
        pricing: !!(formData.get('price') || editingListing.price),
        features: !!((formData.get('facing') || editingListing.facing) || (formData.get('furnishing_status') || editingListing.furnishing_status)),
        media: (imageUrls && imageUrls.length > 0) || (aiStagedUrls && aiStagedUrls.length > 0)
      };

      const updatedData: Partial<Listing> = { 
        ...editingListing,
        completion_status
      };
      
      // Update fields that were provided in the form
      if (formData.get('building_id')) {
        updatedData.building_id = formData.get('building_id')?.toString() || editingListing.building_id;
        
        // Update building name if building changed
        if (updatedData.building_id !== editingListing.building_id) {
          const building = buildings?.find(b => b.id === updatedData.building_id);
          if (building) {
            updatedData.building_name = building.name;
          }
        }
      }
      
      if (formData.get('bedrooms')) {
        updatedData.bedrooms = Number(formData.get('bedrooms'));
      }
      
      if (formData.get('bathrooms')) {
        updatedData.bathrooms = Number(formData.get('bathrooms'));
      }
      
      if (formData.get('built_up_area')) {
        updatedData.built_up_area = Number(formData.get('built_up_area'));
      }
      
      if (formData.get('carpet_area')) {
        updatedData.carpet_area = formData.get('carpet_area') ? Number(formData.get('carpet_area')) : null;
      }
      
      if (formData.get('floor')) {
        updatedData.floor = Number(formData.get('floor'));
      }
      
      if (formData.get('price')) {
        updatedData.price = Number(formData.get('price'));
      }
      
      if (formData.get('maintenance')) {
        updatedData.maintenance = Number(formData.get('maintenance'));
      }

      if (formData.get('facing')) {
        updatedData.facing = formData.get('facing')?.toString() || null;
      }
      
      if (formData.get('parking_spots')) {
        updatedData.parking_spots = Number(formData.get('parking_spots'));
      }
      
      if (formData.get('balconies')) {
        updatedData.balconies = Number(formData.get('balconies'));
      }
      
      if (formData.get('furnishing_status')) {
        updatedData.furnishing_status = formData.get('furnishing_status')?.toString() || null;
      }
      
      if (formData.get('status')) {
        updatedData.status = formData.get('status')?.toString() || 'available';
      }
      
      if (selectedDate) {
        updatedData.availability = format(selectedDate, "yyyy-MM-dd");
      }

      updatedData.images = imageUrls;
      updatedData.ai_staged_photos = aiStagedUrls;
      updatedData.floor_plan_image = floorPlanUrl;

      console.log("Updating listing with data:", updatedData);

      const { error } = await supabase
        .from('listings')
        .update(updatedData)
        .eq('id', listingId);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setEditingListing(null);
      setUploadedImages([]);
      setUploadedAIStagedPhotos([]);
      setUploadedFloorPlan(null);
      setActiveTab("basic");
      toast({
        title: "Success",
        description: "Listing updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive"
      });
      console.error('Error updating listing:', error);
    }
  });

  const deleteListing = useMutation({
    mutationFn: async (listingId: string) => {
      // Note: We don't need to delete from property_media table because of the CASCADE constraint
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setIsDeleteDialogOpen(false);
      setListingToDelete(null);
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive"
      });
      console.error('Error deleting listing:', error);
    }
  });

  const handleDeleteClick = (listingId: string) => {
    setListingToDelete(listingId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (listingToDelete) {
      deleteListing.mutate(listingToDelete);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    console.log("Form submission - editing listing:", !!editingListing);
    
    if (editingListing) {
      console.log("Editing existing listing:", editingListing.id);
      updateListing.mutate(formData);
    } else {
      console.log("Creating new listing");
      createListing.mutate(formData);
    }
  };

  const ListingForm = ({ listing }: { listing?: EnhancedListing }) => {
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
          <TabsTrigger value="features" className="flex items-center gap-2">
            <span>Features</span>
            {formCompletion.features ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </TabsTrigger>
          <TabsTrigger value="floor_plan" className="flex items-center gap-2">
            <span>Floor Plan</span>
            {formCompletion.floor_plan ? (
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
          <TabsTrigger value="media" className="flex items-center gap-2">
            <span>Media</span>
            {formCompletion.media ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-4">
          {listing && <input type="hidden" name="listingId" value={listing.id} />}
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">
              {listing ? 'Edit Listing' : 'Create New Listing'}
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
                <CardDescription>Enter the basic details of the listing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="building_id">Building</Label>
                  <Select 
                    name="building_id" 
                    defaultValue={listing?.building_id || ''}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings?.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input 
                      id="bedrooms" 
                      name="bedrooms" 
                      type="number"
                      defaultValue={listing?.bedrooms || ''} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input 
                      id="bathrooms" 
                      name="bathrooms" 
                      type="number"
                      defaultValue={listing?.bathrooms || ''} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="built_up_area">Built Up Area (sq ft)</Label>
                    <Input 
                      id="built_up_area" 
                      name="built_up_area" 
                      type="number"
                      defaultValue={listing?.built_up_area || ''} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="carpet_area">Carpet Area (sq ft)</Label>
                    <Input 
                      id="carpet_area" 
                      name="carpet_area" 
                      type="number"
                      defaultValue={listing?.carpet_area || ''} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    name="status" 
                    defaultValue={listing?.status || 'available'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="availability"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Immediate"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Features & Specifications</CardTitle>
                <CardDescription>Provide details about the unit's features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input 
                      id="floor" 
                      name="floor" 
                      type="number"
                      defaultValue={listing?.floor || ''} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parking_spots">Parking Spots</Label>
                    <Input 
                      id="parking_spots" 
                      name="parking_spots" 
                      type="number"
                      min="0"
                      defaultValue={listing?.parking_spots || '0'} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="balconies">Balconies</Label>
                    <Input 
                      id="balconies" 
                      name="balconies" 
                      type="number"
                      min="0"
                      defaultValue={listing?.balconies || '0'} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facing">Facing</Label>
                    <Select 
                      name="facing" 
                      defaultValue={listing?.facing || ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select facing direction" />
                      </SelectTrigger>
                      <SelectContent>
                        {['North', 'South', 'East', 'West', 'North East', 'North West', 'South East', 'South West'].map((direction) => (
                          <SelectItem key={direction} value={direction}>
                            {direction}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="furnishing_status">Furnishing Status</Label>
                    <Select 
                      name="furnishing_status" 
                      defaultValue={listing?.furnishing_status || ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select furnishing" />
                      </SelectTrigger>
                      <SelectContent>
                        {['unfurnished', 'semi-furnished', 'fully furnished'].map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="floor_plan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Floor Plan</CardTitle>
                <CardDescription>Upload the floor plan for this unit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="floor_plan">Floor Plan Image</Label>
                  <Input 
                    id="floor_plan" 
                    name="floor_plan" 
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setUploadedFloorPlan(e.target.files[0]);
                      }
                    }}
                  />
                  
                  {listing?.floor_plan_image && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Existing Floor Plan</h4>
                      <div className="border rounded-md p-2">
                        <img 
                          src={listing.floor_plan_image} 
                          alt="Floor Plan" 
                          className="max-h-60 object-contain mx-auto"
                        />
                      </div>
                    </div>
                  )}
                  
                  {uploadedFloorPlan && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">New Floor Plan to Upload</h4>
                      <div className="border rounded-md p-2">
                        <img 
                          src={URL.createObjectURL(uploadedFloorPlan)} 
                          alt="Floor Plan Preview" 
                          className="max-h-60 object-contain mx-auto"
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setUploadedFloorPlan(null)}
                          >
                            Remove
                          </Button>
                        </div>
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
                <CardDescription>Provide pricing details for this unit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input 
                      id="price" 
                      name="price" 
                      type="number"
                      defaultValue={listing?.price || ''} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maintenance">Maintenance (₹)</Label>
                    <Input 
                      id="maintenance" 
                      name="maintenance" 
                      type="number"
                      defaultValue={listing?.maintenance || ''} 
                      required 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Media & Photos</CardTitle>
                <CardDescription>Upload photos of the unit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="images">Unit Images</Label>
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
                  
                  {listing?.images && listing.images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Existing Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {listing.images.map((image, index) => (
                          <div key={index} className="relative group rounded-md overflow-hidden">
                            <img 
                              src={image as string} 
                              alt={`Listing ${index + 1}`} 
                              className="h-24 w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 rounded-full p-0"
                                onClick={() => {
                                  if (editingListing && editingListing.images) {
                                    const updatedImages = [...editingListing.images];
                                    updatedImages.splice(index, 1);
                                    
                                    setEditingListing({
                                      ...editingListing,
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
                
                <div className="space-y-2">
                  <Label htmlFor="ai_staged_photos" className="text-base font-medium">AI Staged Photos</Label>
                  <Input 
                    id="ai_staged_photos" 
                    name="ai_staged_photos" 
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setUploadedAIStagedPhotos(Array.from(e.target.files));
                      }
                    }}
                    className="cursor-pointer"
                  />
                  
                  {listing?.ai_staged_photos && listing.ai_staged_photos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Existing AI Staged Photos</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {listing.ai_staged_photos.map((image, index) => (
                          <div key={index} className="relative group rounded-md overflow-hidden">
                            <img 
                              src={image as string} 
                              alt={`AI Staged ${index + 1}`} 
                              className="h-24 w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 rounded-full p-0"
                                onClick={() => {
                                  if (editingListing && editingListing.ai_staged_photos) {
                                    const updatedPhotos = [...editingListing.ai_staged_photos];
                                    updatedPhotos.splice(index, 1);
                                    
                                    setEditingListing({
                                      ...editingListing,
                                      ai_staged_photos: updatedPhotos
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Badge className="absolute top-1 left-1 bg-purple-500">AI</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {uploadedAIStagedPhotos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">New AI Staged Photos to Upload</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Array.from(uploadedAIStagedPhotos).map((file, index) => (
                          <div key={index} className="relative group rounded-md overflow-hidden">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`AI Staged Preview ${index + 1}`} 
                              className="h-24 w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 rounded-full p-0"
                                onClick={() => {
                                  const updatedPhotos = [...uploadedAIStagedPhotos];
                                  updatedPhotos.splice(index, 1);
                                  setUploadedAIStagedPhotos(updatedPhotos);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Badge className="absolute top-1 left-1 bg-purple-500">AI</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="pt-4 border-t flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                if (editingListing) {
                  setEditingListing(null);
                } else {
                  setIsCreateOpen(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || createListing.isPending || updateListing.isPending}
            >
              {isUploading ? 'Uploading...' : 
               (createListing.isPending || updateListing.isPending) ? 'Saving...' : 
               listing ? 'Update Listing' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </Tabs>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Listings</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Add New Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-80px)] pr-4">
              <div className="py-2">
                <ListingForm />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Building</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings?.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">{listing.building_name}</TableCell>
                <TableCell>{listing.bedrooms} BHK, Floor {listing.floor}</TableCell>
                <TableCell>{listing.built_up_area} sq ft</TableCell>
                <TableCell>₹{listing.price?.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      listing.status === 'available' ? 'default' :
                      listing.status === 'reserved' ? 'secondary' :
                      'outline'
                    }
                  >
                    {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Progress 
                    value={calculateCompletionPercentage(listing.completion_status || formCompletion)} 
                    className="h-2 w-24"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingListing(listing)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(listing.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!listings?.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No listings found. Add your first listing to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingListing} onOpenChange={(open) => !open && setEditingListing(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-80px)] pr-4">
            <div className="py-2">
              {editingListing && <ListingForm listing={editingListing} />}
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
            Are you sure you want to delete this listing? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteListing.isPending}>
              {deleteListing.isPending ? 'Deleting...' : 'Delete Listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
