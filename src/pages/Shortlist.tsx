import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type ShortlistedBuilding = {
  building_id: string;
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
      
      return (
        <div>
          {building.locality}
          {building.sub_locality && `, ${building.sub_locality}`}
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
];

export default function Shortlist() {
  const { data: shortlistedBuildings, isLoading } = useQuery({
    queryKey: ['shortlistedBuildings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('user_building_scores')
        .select(`
          building_id,
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

  const table = useReactTable({
    data: shortlistedBuildings || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="container mx-auto px-4">
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