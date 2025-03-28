import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Heart, StickyNote, Star } from "lucide-react";

type Building = {
  id: string;
  name: string;
  type: string | null;
  locality: string | null;
  sub_locality: string | null;
  min_price: number | null;
  max_price: number | null;
  images: string[] | null;
  total_floors: number | null;
  age: number | null;
};

type ShortlistedBuilding = {
  building_id: string;
  notes: string | null;
  buildings: Building | null;
};

export default function Shortlist() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: shortlistedBuildings, isLoading, refetch } = useQuery({
    queryKey: ['shortlistedBuildings'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from('user_building_scores')
          .select(`
            building_id,
            notes,
            buildings (
              id,
              name,
              locality,
              sub_locality,
              min_price,
              images,
              total_floors,
              age
            )
          `)
          .eq('user_id', user.id)
          .eq('shortlisted', true)
          .order('calculated_at', { ascending: false });

        if (error) {
          console.error("Error fetching shortlisted buildings:", error);
          throw error;
        }
        
        // Cast the result to the expected type
        return data as unknown as ShortlistedBuilding[];
      } catch (error) {
        console.error("Error in shortlistedBuildings query:", error);
        return [];
      }
    },
  });

  const updateNotes = async (buildingId: string, notes: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to update notes",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_building_scores')
        .upsert({
          user_id: user.id,
          building_id: buildingId,
          notes: notes,
        }, {
          onConflict: 'user_id,building_id',
        });

      if (error) throw error;

      await refetch();
      toast({
        title: "Notes updated",
        description: "Your notes have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update notes",
        variant: "destructive",
      });
    }
  };

  const toggleShortlist = async (buildingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to shortlist buildings",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_building_scores')
        .upsert({
          user_id: user.id,
          building_id: buildingId,
          shortlisted: false,
        }, {
          onConflict: 'user_id,building_id',
        });

      if (error) throw error;

      await refetch();
      toast({
        title: "Removed from shortlist",
        description: "Building has been removed from your shortlist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update shortlist",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<ShortlistedBuilding>[] = [
    {
      id: "property",
      header: "Property",
      accessorFn: (row) => row.buildings?.name,
      cell: ({ row }) => {
        const building = row.original.buildings;
        if (!building) return null;
        
        return (
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-md">
              {building.images?.[0] ? (
                <img
                  src={building.images[0]}
                  alt={building.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    target.className = "h-6 w-6 opacity-50";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <img 
                    src="/placeholder.svg" 
                    alt="Placeholder" 
                    className="h-6 w-6 opacity-50"
                  />
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{building.name}</div>
              {/* Display building type if available */}
              <div className="text-sm text-muted-foreground">
                {building.type || "Residential"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "location",
      header: "Location",
      accessorFn: (row) => row.buildings?.locality,
      cell: ({ row }) => {
        const building = row.original.buildings;
        if (!building) return null;
        
        const location = building.locality;
        const subLocation = building.sub_locality;
        const displayLocation = subLocation && subLocation !== location
          ? `${location}, ${subLocation}`
          : location;
        
        return <div>{displayLocation}</div>;
      },
    },
    {
      id: "price_range",
      header: "Price Range",
      accessorFn: (row) => row.buildings?.min_price,
      cell: ({ row }) => {
        const building = row.original.buildings;
        if (!building) return null;
        
        return (
          <div>
            {building.min_price && 
              `₹${(building.min_price/10000000).toFixed(1)} Cr`}
            {building.max_price && 
              ` - ₹${(building.max_price/10000000).toFixed(1)} Cr`}
          </div>
        );
      },
    },
    {
      id: "details",
      header: "Details",
      accessorFn: (row) => row.buildings?.total_floors,
      cell: ({ row }) => {
        const building = row.original.buildings;
        if (!building) return null;
        
        return (
          <div className="text-sm text-muted-foreground">
            {building.total_floors && `${building.total_floors} floors`}
            {building.age && ` • ${building.age} years old`}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const building = row.original.buildings;
        const notes = row.original.notes;
        if (!building) return null;

        return (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <StickyNote className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notes for {building.name}</DialogTitle>
                </DialogHeader>
                <Textarea
                  defaultValue={notes || ""}
                  placeholder="Add your notes here..."
                  className="min-h-[200px]"
                  onChange={(e) => updateNotes(building.id, e.target.value)}
                />
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleShortlist(building.id);
              }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Heart className="h-5 w-5 fill-current" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: shortlistedBuildings || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 mt-8">Your Shortlist</h1>
      <div className="mt-8">
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : !shortlistedBuildings?.length ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                You haven't shortlisted any properties yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer"
                      onClick={() => {
                        const building = row.original.buildings;
                        if (building) {
                          navigate(`/buildings/${building.id}`);
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
