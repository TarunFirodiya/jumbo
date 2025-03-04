
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PencilIcon, Plus, MapPin, Building } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
}

export function BuildingManagement({ currentUser }: BuildingManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch buildings
  const { data: buildings, isLoading } = useQuery<Building[]>({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name, city, locality, sub_locality, latitude, longitude, images');
      
      if (error) throw error;
      return data || [];
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

  // Create building mutation
  const createBuilding = useMutation({
    mutationFn: async (formData: FormData) => {
      const uploadedUrls = await uploadImages(uploadedImages);
      
      const buildingData = {
        name: formData.get('name')?.toString() || '',
        city: formData.get('city')?.toString() || 'Bengaluru',
        locality: formData.get('locality')?.toString() || '',
        sub_locality: formData.get('sub_locality')?.toString() || null,
        latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
        longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
        images: uploadedUrls.length ? uploadedUrls : null
      };

      const { error } = await supabase
        .from('buildings')
        .insert(buildingData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setIsCreateOpen(false);
      setUploadedImages([]);
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

  // Update building mutation
  const updateBuilding = useMutation({
    mutationFn: async (formData: FormData) => {
      const buildingId = formData.get('buildingId')?.toString();
      if (!buildingId) throw new Error('Building ID is required');
      
      let imageUrls: string[] | null = editingBuilding?.images || null;
      
      // Upload new images if any
      if (uploadedImages.length) {
        const newUrls = await uploadImages(uploadedImages);
        imageUrls = editingBuilding?.images ? [...editingBuilding.images, ...newUrls] : newUrls;
      }
      
      const buildingData = {
        name: formData.get('name')?.toString() || '',
        city: formData.get('city')?.toString() || 'Bengaluru',
        locality: formData.get('locality')?.toString() || '',
        sub_locality: formData.get('sub_locality')?.toString() || null,
        latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
        longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
        images: imageUrls
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

  const BuildingForm = ({ building }: { building?: Building }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {building && <input type="hidden" name="buildingId" value={building.id} />}
      
      <div className="space-y-2">
        <Label htmlFor="name">Building Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={building?.name || ''}
          required 
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
          <Label htmlFor="locality">Locality</Label>
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

      <Button type="submit" className="w-full" disabled={isUploading || createBuilding.isPending || updateBuilding.isPending}>
        {isUploading ? 'Uploading images...' : 
         (createBuilding.isPending || updateBuilding.isPending) ? 'Saving...' : 
         building ? 'Update Building' : 'Create Building'}
      </Button>
    </form>
  );

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Building</DialogTitle>
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
              <TableHead>Images</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildings?.map((building) => (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingBuilding(building)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!buildings?.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No buildings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingBuilding} onOpenChange={(open) => !open && setEditingBuilding(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Building</DialogTitle>
          </DialogHeader>
          {editingBuilding && <BuildingForm building={editingBuilding} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
