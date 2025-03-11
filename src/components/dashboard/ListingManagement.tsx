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
import { PencilIcon, Home, ImageIcon, X } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

// Add the missing imports for the new features
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface ListingManagementProps {
  currentUser: Profile;
}

type Building = Database['public']['Tables']['buildings']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'];

export function ListingManagement({ currentUser }: ListingManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Add availability state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Fetch buildings
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

  // Fetch listings
  const { data: listings } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const query = supabase
        .from('listings')
        .select('*');
      
      if (currentUser.role === 'agent') {
        const { data, error } = await query.eq('agent_id', currentUser.id);
        if (error) throw error;
        return data;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Upload images to Supabase Storage
  const uploadImages = async (files: File[]) => {
    if (!files.length) return [];
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `listing-images/${fileName}`;
        
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

  // Create listing mutation
  const createListing = useMutation({
    mutationFn: async (formData: FormData) => {
      const building_id = formData.get('building_id')?.toString() || null;
      const building = buildings?.find(b => b.id === building_id);
      
      // Upload images if any
      const imageUrls = await uploadImages(uploadedImages);

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
        images: imageUrls.length ? imageUrls : []
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

  // Update listing mutation
  const updateListing = useMutation({
    mutationFn: async (formData: FormData) => {
      const listingId = formData.get('listingId')?.toString();
      const building_id = formData.get('building_id')?.toString() || null;
      const building = buildings?.find(b => b.id === building_id);
      
      let imageUrls = editingListing?.images || [];
      
      // Upload new images if any
      if (uploadedImages.length) {
        const newUrls = await uploadImages(uploadedImages);
        imageUrls = [...(imageUrls || []), ...newUrls];
      }

      const listingData = {
        building_id,
        bedrooms: Number(formData.get('bedrooms')),
        bathrooms: Number(formData.get('bathrooms')),
        built_up_area: Number(formData.get('built_up_area')),
        floor: Number(formData.get('floor')),
        price: Number(formData.get('price')),
        maintenance: Number(formData.get('maintenance')),
        facing: formData.get('facing')?.toString() || null,
        building_name: building?.name || null,
        images: imageUrls
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
    
    if (editingListing) {
      updateListing.mutate(formData);
    } else {
      createListing.mutate(formData);
    }
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

  const ListingForm = ({ listing }: { listing?: Listing }) => {
    // Initialize selected date from listing if it exists
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {listing && <input type="hidden" name="listingId" value={listing.id} />}
        
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
        
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="images">Unit Images</Label>
          <Input 
            id="images" 
            name="images" 
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
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
                      onClick={() => removeExistingImage(index)}
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
                      onClick={() => removeNewImage(index)}
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

        <Button 
          type="submit" 
          className="w-full"
          disabled={isUploading || createListing.isPending || updateListing.isPending}
        >
          {isUploading ? 'Uploading images...' : 
           (createListing.isPending || updateListing.isPending) ? 'Saving...' : 
           listing ? 'Update Listing' : 'Create Listing'}
        </Button>
      </form>
    );
  };

  // Modify the handleSubmit function to handle the new floor_plan_image field
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Check if a floor plan was uploaded
    const floorPlanInput = form.querySelector('#floor_plan') as HTMLInputElement;
    let floorPlanUpload = null;
    
    if (floorPlanInput && floorPlanInput.files && floorPlanInput.files.length > 0) {
      floorPlanUpload = floorPlanInput.files[0];
    }
    
    // Save floor plan if needed
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
    
    // Process the form
    if (editingListing) {
      // For updating
      const processUpdate = async () => {
        let imageUrls = editingListing?.images || [];
        let floorPlanUrl = editingListing?.floor_plan_image || null;
        
        // Upload new images if any
        if (uploadedImages.length) {
          const newUrls = await uploadImages(uploadedImages);
          imageUrls = [...(imageUrls || []), ...newUrls];
        }
        
        // Upload floor plan if needed
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
      // For creating
      const processCreate = async () => {
        const building_id = formData.get('building_id')?.toString() || null;
        const building = buildings?.find(b => b.id === building_id);
        
        // Upload images if any
        const imageUrls = await uploadImages(uploadedImages);
        
        // Upload floor plan if any
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
            </DialogHeader>
            <ListingForm />
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
                <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                  No listings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingListing} onOpenChange={(open) => !open && setEditingListing(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editingListing && <ListingForm listing={editingListing} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
