
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PencilIcon, Home, ImageIcon, X, Video } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { ListingWithProcessedImages } from "@/components/building/hooks/useBuildingData";
import { ScrollArea } from "@/components/ui/scroll-area";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ListingManagementProps {
  currentUser: Profile;
}

type Building = Database['public']['Tables']['buildings']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'];

export function ListingManagement({ currentUser }: ListingManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ListingWithProcessedImages | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedAIStagedPhotos, setUploadedAIStagedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name');
      
      if (error) throw error;
      return (data as Pick<Building, 'id' | 'name'>[]) || [];
    }
  });

  const { data: listings } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const query = supabase
        .from('listings')
        .select('*');
      
      if (currentUser.role === 'agent') {
        const { data, error } = await query.eq('agent_id', currentUser.id);
        if (error) throw error;
        
        return data.map(listing => {
          const processedListing = { ...listing } as ListingWithProcessedImages;
          
          if (!Array.isArray(processedListing.images)) {
            processedListing.images = processedListing.images ? [processedListing.images as unknown as string] : [];
          }
          
          if (!processedListing.ai_staged_photos) {
            processedListing.ai_staged_photos = [];
          } else if (!Array.isArray(processedListing.ai_staged_photos)) {
            processedListing.ai_staged_photos = [processedListing.ai_staged_photos as unknown as string];
          }
          
          return processedListing;
        });
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(listing => {
        const processedListing = { ...listing } as ListingWithProcessedImages;
        
        if (!Array.isArray(processedListing.images)) {
          processedListing.images = processedListing.images ? [processedListing.images as unknown as string] : [];
        }
        
        if (!processedListing.ai_staged_photos) {
          processedListing.ai_staged_photos = [];
        } else if (!Array.isArray(processedListing.ai_staged_photos)) {
          processedListing.ai_staged_photos = [processedListing.ai_staged_photos as unknown as string];
        }
        
        return processedListing;
      });
    }
  });

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

  const createListing = useMutation({
    mutationFn: async (formData: FormData) => {
      const building_id = formData.get('building_id')?.toString() || null;
      const building = buildings?.find(b => b.id === building_id);
      
      const imageUrls = await uploadImages(uploadedImages);
      const aiStagedUrls = await uploadImages(uploadedAIStagedPhotos, 'ai-staged-photos');

      const listingData = {
        building_id,
        bedrooms: Number(formData.get('bedrooms')),
        bathrooms: Number(formData.get('bathrooms')),
        built_up_area: Number(formData.get('built_up_area')),
        floor: Number(formData.get('floor')),
        price: Number(formData.get('price')),
        maintenance: Number(formData.get('maintenance')),
        facing: formData.get('facing')?.toString() || null,
        agent_id: currentUser.id,
        building_name: building?.name || null,
        images: imageUrls.length ? imageUrls : [],
        ai_staged_photos: aiStagedUrls.length ? aiStagedUrls : []
      };

      const { error } = await supabase
        .from('listings')
        .insert(listingData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setIsCreateOpen(false);
      setUploadedImages([]);
      setUploadedAIStagedPhotos([]);
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
      const building_id = formData.get('building_id')?.toString() || null;
      const building = buildings?.find(b => b.id === building_id);
      
      let imageUrls = editingListing?.images || [];
      let aiStagedUrls = editingListing?.ai_staged_photos || [];
      
      if (uploadedImages.length) {
        const newUrls = await uploadImages(uploadedImages);
        imageUrls = [...(imageUrls || []), ...newUrls];
      }
      
      if (uploadedAIStagedPhotos.length) {
        const newUrls = await uploadImages(uploadedAIStagedPhotos, 'ai-staged-photos');
        aiStagedUrls = [...(aiStagedUrls || []), ...newUrls];
      }

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
        building_name: building?.name || null,
        images: imageUrls,
        ai_staged_photos: aiStagedUrls
      };

      if (!listingId) throw new Error('Listing ID is required');

      const { error } = await supabase
        .from('listings')
        .update(listingData)
        .eq('id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setEditingListing(null);
      setUploadedImages([]);
      setUploadedAIStagedPhotos([]);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const floorPlanInput = form.querySelector('#floor_plan') as HTMLInputElement;
    let floorPlanUpload = null;
    
    if (floorPlanInput && floorPlanInput.files && floorPlanInput.files.length > 0) {
      floorPlanUpload = floorPlanInput.files[0];
    }
    
    const uploadFloorPlan = async () => {
      if (!floorPlanUpload) return null;
      
      setIsUploading(true);
      try {
        const fileExt = floorPlanUpload.name.split('.').pop();
        const fileName = `floor-plan-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `floor-plans/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, floorPlanUpload);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath);
          
        return data.publicUrl;
      } catch (error) {
        console.error('Error uploading floor plan:', error);
        return null;
      }
    };
    
    if (editingListing) {
      const processUpdate = async () => {
        let imageUrls = editingListing?.images || [];
        let aiStagedUrls = editingListing?.ai_staged_photos || [];
        let floorPlanUrl = editingListing?.floor_plan_image || null;
        
        if (uploadedImages.length) {
          const newUrls = await uploadImages(uploadedImages);
          imageUrls = [...(imageUrls || []), ...newUrls];
        }
        
        if (uploadedAIStagedPhotos.length) {
          const newUrls = await uploadImages(uploadedAIStagedPhotos, 'ai-staged-photos');
          aiStagedUrls = [...(aiStagedUrls || []), ...newUrls];
        }
        
        if (floorPlanUpload) {
          const newFloorPlanUrl = await uploadFloorPlan();
          if (newFloorPlanUrl) {
            floorPlanUrl = newFloorPlanUrl;
          }
        }

        const listingId = formData.get('listingId')?.toString();
        const building_id = formData.get('building_id')?.toString() || null;
        const building = buildings?.find(b => b.id === building_id);
        
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
          building_name: building?.name || null,
          images: imageUrls,
          ai_staged_photos: aiStagedUrls,
          floor_plan_image: floorPlanUrl,
          parking_spots: formData.get('parking_spots') ? Number(formData.get('parking_spots')) : null,
          balconies: formData.get('balconies') ? Number(formData.get('balconies')) : null,
          furnishing_status: formData.get('furnishing_status')?.toString() || null,
          status: formData.get('status')?.toString() || 'available',
          availability: formData.get('availability')?.toString() || null
        };

        if (!listingId) throw new Error('Listing ID is required');

        const { error } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', listingId);

        if (error) throw error;
        
        setIsUploading(false);
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        setEditingListing(null);
        setUploadedImages([]);
        setUploadedAIStagedPhotos([]);
        setSelectedDate(undefined);
        toast({
          title: "Success",
          description: "Listing updated successfully",
        });
      };
      
      processUpdate().catch((error) => {
        setIsUploading(false);
        toast({
          title: "Error",
          description: "Failed to update listing. Please try again.",
          variant: "destructive"
        });
        console.error('Error updating listing:', error);
      });
    } else {
      const processCreate = async () => {
        const building_id = formData.get('building_id')?.toString() || null;
        const building = buildings?.find(b => b.id === building_id);
        
        const imageUrls = await uploadImages(uploadedImages);
        const aiStagedUrls = await uploadImages(uploadedAIStagedPhotos, 'ai-staged-photos');
        
        let floorPlanUrl = null;
        if (floorPlanUpload) {
          floorPlanUrl = await uploadFloorPlan();
        }

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
          availability: formData.get('availability')?.toString() || null
        };

        const { error } = await supabase
          .from('listings')
          .insert(listingData);

        if (error) throw error;
        
        setIsUploading(false);
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        setIsCreateOpen(false);
        setUploadedImages([]);
        setUploadedAIStagedPhotos([]);
        setSelectedDate(undefined);
        toast({
          title: "Success",
          description: "Listing created successfully",
        });
      };
      
      processCreate().catch((error) => {
        setIsUploading(false);
        toast({
          title: "Error",
          description: "Failed to create listing. Please try again.",
          variant: "destructive"
        });
        console.error('Error creating listing:', error);
      });
    }
  };

  const ListingForm = ({ listing }: { listing?: ListingWithProcessedImages }) => {
    useEffect(() => {
      if (listing?.availability) {
        try {
          setSelectedDate(new Date(listing.availability));
        } catch (e) {
          setSelectedDate(undefined);
        }
      } else {
        setSelectedDate(undefined);
      }
    }, [listing]);

    return (
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-4">
          {listing && <input type="hidden" name="listingId" value={listing.id} />}
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="building_id">Building</Label>
              <select 
                id="building_id" 
                name="building_id" 
                className="w-full rounded-md border p-2"
                defaultValue={listing?.building_id || ''}
                required
              >
                <option value="">Select a building</option>
                {buildings?.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number"
                  defaultValue={listing?.price || ''} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maintenance">Maintenance</Label>
                <Input 
                  id="maintenance" 
                  name="maintenance" 
                  type="number"
                  defaultValue={listing?.maintenance || ''} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status" 
                  name="status" 
                  className="w-full rounded-md border p-2"
                  defaultValue={listing?.status || 'available'}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
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
                <input 
                  type="hidden" 
                  name="availability" 
                  value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ''} 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
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
                <select 
                  id="facing" 
                  name="facing" 
                  className="w-full rounded-md border p-2"
                  defaultValue={listing?.facing || ''}
                  required
                >
                  <option value="">Select facing direction</option>
                  {['North', 'South', 'East', 'West', 'North East', 'North West', 'South East', 'South West'].map((direction) => (
                    <option key={direction} value={direction}>
                      {direction}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="furnishing_status">Furnishing Status</Label>
                <select 
                  id="furnishing_status" 
                  name="furnishing_status" 
                  className="w-full rounded-md border p-2"
                  defaultValue={listing?.furnishing_status || ''}
                >
                  <option value="">Select furnishing</option>
                  {['unfurnished', 'semi-furnished', 'fully furnished'].map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
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
                <div className="mt-2">
                  <Label>Existing Images</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {listing.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Listing ${index + 1}`} 
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {uploadedImages.length > 0 && (
                <div className="mt-2">
                  <Label>New Images to Upload</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Array.from(uploadedImages).map((file, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index + 1}`} 
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const updatedImages = [...uploadedImages];
                            updatedImages.splice(index, 1);
                            setUploadedImages(updatedImages);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
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
                <div className="mt-2">
                  <Label>Existing AI Staged Photos</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {listing.ai_staged_photos.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`AI Staged ${index + 1}`} 
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {uploadedAIStagedPhotos.length > 0 && (
                <div className="mt-2">
                  <Label>New AI Staged Photos to Upload</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Array.from(uploadedAIStagedPhotos).map((file, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`AI Staged Preview ${index + 1}`} 
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const updatedPhotos = [...uploadedAIStagedPhotos];
                            updatedPhotos.splice(index, 1);
                            setUploadedAIStagedPhotos(updatedPhotos);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="floor_plan">Floor Plan Image</Label>
              <Input 
                id="floor_plan" 
                name="floor_plan" 
                type="file"
                accept="image/*"
                className="cursor-pointer"
              />
              
              {listing?.floor_plan_image && (
                <div className="mt-2">
                  <Label>Existing Floor Plan</Label>
                  <div className="mt-1">
                    <img 
                      src={listing.floor_plan_image} 
                      alt="Floor Plan" 
                      className="max-h-40 object-contain rounded-md border border-border"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <div className="pt-4 border-t">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isUploading || createListing.isPending || updateListing.isPending}
            >
              {isUploading ? 'Uploading images...' : 
               (createListing.isPending || updateListing.isPending) ? 'Saving...' : 
               listing ? 'Update Listing' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </Tabs>
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedImages(Array.from(e.target.files));
    }
  };
  
  const removeExistingImage = (index: number) => {
    if (editingListing && editingListing.images) {
      const updatedImages = [...editingListing.images];
      updatedImages.splice(index, 1);
      
      setEditingListing({
        ...editingListing,
        images: updatedImages
      });
    }
  };
  
  const removeNewImage = (index: number) => {
    const updatedImages = [...uploadedImages];
    updatedImages.splice(index, 1);
    setUploadedImages(updatedImages);
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
          <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(85vh-80px)] pr-4">
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
              <TableHead>Bedrooms</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Facing</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>AI Staged</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings?.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>{listing.building_name}</TableCell>
                <TableCell>{listing.bedrooms} BHK</TableCell>
                <TableCell>{listing.built_up_area} sq ft</TableCell>
                <TableCell>{listing.floor}</TableCell>
                <TableCell>₹{listing.price?.toLocaleString()}</TableCell>
                <TableCell>{listing.facing}</TableCell>
                <TableCell>
                  {listing.images && listing.images.length > 0 ? (
                    <div className="flex -space-x-2">
                      {listing.images.slice(0, 3).map((image, index) => (
                        <img 
                          key={index} 
                          src={image} 
                          alt={`Listing ${index + 1}`} 
                          className="h-8 w-8 rounded-full border border-background object-cover"
                        />
                      ))}
                      {listing.images.length > 3 && (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs">
                          +{listing.images.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-muted-foreground">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      <span className="text-xs">None</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {listing.ai_staged_photos && listing.ai_staged_photos.length > 0 ? (
                    <div className="flex -space-x-2">
                      {listing.ai_staged_photos.slice(0, 2).map((image, index) => (
                        <img 
                          key={index} 
                          src={image} 
                          alt={`AI Staged ${index + 1}`} 
                          className="h-8 w-8 rounded-full border border-background object-cover"
                        />
                      ))}
                      {listing.ai_staged_photos.length > 2 && (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs">
                          +{listing.ai_staged_photos.length - 2}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-muted-foreground">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      <span className="text-xs">None</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingListing(listing)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!listings?.length && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                  No listings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingListing} onOpenChange={(open) => !open && setEditingListing(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-80px)] pr-4">
            <div className="py-2">
              {editingListing && <ListingForm listing={editingListing} />}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
