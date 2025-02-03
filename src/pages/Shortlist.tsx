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
import { cn } from "@/lib/utils";

type ShortlistedBuilding = {
  building_id: string;
  overall_match_score: number | null;
  notes: string | null;
  buildings: {
    id: string;
    name: string;
    type: string | null;
    locality: string | null;
    sub_locality: string | null;
    min_price: number | null;
    max_price: number | null;
    images: string[] | null;
    total_floors: number | null;
    age: string | null;
  } | null;
};

export default function Shortlist() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: shortlistedBuildings, isLoading, refetch } = useQuery({
    queryKey: ['shortlistedBuildings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('user_building_scores')
        .select(`
          building_id,
          overall_match_score,
          notes,
          buildings (
            id,
            name,
            type,
            locality,
            sub_locality,
            min_price,
            max_price,
            images,
            total_floors,
            age
          )
        `)
        .eq('user_id', user.id)
        .eq('shortlisted', true)
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      return data;
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
      accessorKey: "buildings",
      header: "Property",
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
              <div className="text-sm text-muted-foreground">
                {building.type}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "buildings",
      header: "Location",
      cell: ({ row }) => {
        const building = row.original.buildings;
        if (!building) return null;
        
        // Fix duplicate location display
        const location = building.locality;
        const subLocation = building.sub_locality;
        const displayLocation = subLocation && subLocation !== location
          ? `${location}, ${subLocation}`
          : location;
        
        return <div>{displayLocation}</div>;
      },
    },
    {
      accessorKey: "overall_match_score",
      header: "Match Score",
      cell: ({ row }) => {
        const score = row.original.overall_match_score;
        if (!score) return null;
        
        return (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span>{Math.round(score * 100)}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "buildings",
      header: "Price Range",
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
      accessorKey: "buildings",
      header: "Details",
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