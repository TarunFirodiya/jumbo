
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PencilIcon, Home, Building } from "lucide-react";

interface ListingManagementProps {
  currentUser: Profile;
}

type Building = {
  id: string;
  name: string;
}

type Listing = {
  id: string;
  building_id: string | null;
  building_name: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  built_up_area: number | null;
  floor: number | null;
  price: number | null;
  maintenance: number | null;
  facing: string | null;
};

export function ListingManagement({ currentUser }: ListingManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Fetch buildings
  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data: buildingsData, error } = await supabase
        .from('buildings')
        .select('id, name')
        .returns<Building[]>();
      
      if (error) throw error;
      return buildingsData;
    }
  });

  // Fetch listings
  const { data: listings } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const query = supabase
        .from('listings')
        .select('*')
        .returns<Listing[]>();

      if (currentUser.role === 'agent') {
        query.eq('agent_id', currentUser.id);
      }

      const { data: listingsData, error } = await query;
      if (error) throw error;
      return listingsData;
    }
  });

  // Create listing mutation
  const createListing = useMutation({
    mutationFn: async (formData: FormData) => {
      const building_id = formData.get('building_id')?.toString() || null;
      const building = buildings?.find(b => b.id === building_id);

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
        building_name: building?.name || null
      };

      const { error } = await supabase
        .from('listings')
        .insert(listingData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setIsCreateOpen(false);
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

      const listingData = {
        building_id,
        bedrooms: Number(formData.get('bedrooms')),
        bathrooms: Number(formData.get('bathrooms')),
        built_up_area: Number(formData.get('built_up_area')),
        floor: Number(formData.get('floor')),
        price: Number(formData.get('price')),
        maintenance: Number(formData.get('maintenance')),
        facing: formData.get('facing')?.toString() || null,
        building_name: building?.name || null
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

  const ListingForm = ({ listing }: { listing?: Listing }) => (
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
          <Label htmlFor="floor">Floor</Label>
          <Input 
            id="floor" 
            name="floor" 
            type="number"
            defaultValue={listing?.floor || ''} 
            required 
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

      <Button type="submit" className="w-full">
        {listing ? 'Update Listing' : 'Create Listing'}
      </Button>
    </form>
  );

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
              <TableHead className="w-[100px]">Actions</TableHead>
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
