import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListFilter, MapPin, Home, Building2 } from "lucide-react";
import * as React from "react";
import { Dispatch, SetStateAction, forwardRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";

const AnimateChangeInHeight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [height, setHeight] = useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight);
    }
  }, [children]);

  return (
    <motion.div
      style={{ height }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={className}
    >
      <div ref={ref} className="overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};

export enum FilterType {
  LOCALITY = "Locality",
  BHK = "BHK",
  BUDGET = "Budget",
}

export enum FilterOperator {
  IS = "is",
  IS_NOT = "is not",
  IS_ANY_OF = "is any of",
}

export const BUDGET_RANGES = {
  "Under 50L": { min: 0, max: 5000000 },
  "50L - 1Cr": { min: 5000000, max: 10000000 },
  "1Cr - 1.5Cr": { min: 10000000, max: 15000000 },
  "1.5Cr - 2Cr": { min: 15000000, max: 20000000 },
  "2Cr - 3Cr": { min: 20000000, max: 30000000 },
  "Above 3Cr": { min: 30000000, max: Infinity },
};

export type FilterOption = {
  name: string;
  icon?: React.ReactNode;
  label?: string;
};

export type Filter = {
  id: string;
  type: FilterType;
  operator: FilterOperator;
  value: string[];
};

const FilterOperatorDropdown = ({
  filter,
  setFilters,
}: {
  filter: Filter;
  setFilters: Dispatch<SetStateAction<Filter[]>>;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={false}
          size="sm"
          className="transition group h-6 text-xs items-center rounded-sm flex gap-1.5"
        >
          {filter.operator}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <AnimateChangeInHeight>
          <Command>
            <CommandList>
              <CommandGroup>
                {Object.values(FilterOperator).map((operator) => (
                  <CommandItem
                    className="group text-muted-foreground flex gap-2 items-center"
                    key={operator}
                    value={operator}
                    onSelect={(currentValue) => {
                      setFilters((prev) =>
                        prev.map((f) =>
                          f.id === filter.id ? { ...f, operator: currentValue as FilterOperator } : f
                        )
                      );
                    }}
                  >
                    <span className="text-accent-foreground">{operator}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  );
};

const FilterValueCombobox = ({
  filter,
  setFilters,
  filterOptions,
}: {
  filter: Filter;
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  filterOptions: FilterOption[];
}) => {
  const [open, setOpen] = React.useState(false);
  const [commandInput, setCommandInput] = React.useState("");
  const commandInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setTimeout(() => {
            setCommandInput("");
          }, 200);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className={cn(
            "transition group h-6 text-xs items-center rounded-sm flex gap-1.5",
            filter.value?.length > 0 && "w-6"
          )}
        >
          {filter.value?.length > 0 ? (
            <div className="flex gap-1">
              {filter.value.length}
            </div>
          ) : (
            "Value"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <AnimateChangeInHeight>
          <Command>
            <CommandInput
              placeholder={"Value..."}
              className="h-9"
              value={commandInput}
              onInputCapture={(e) => {
                setCommandInput(e.currentTarget.value);
              }}
              ref={commandInputRef}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {filterOptions.map((filterOption: FilterOption) => (
                  <CommandItem
                    className="group text-muted-foreground flex gap-2 items-center"
                    key={filterOption.name}
                    value={filterOption.name}
                    onSelect={(currentValue) => {
                      setFilters((prev) => {
                        return prev.map((f) =>
                          f.id === filter.id ? { ...f, value: [currentValue] } : f
                        );
                      });
                      setTimeout(() => {
                        setCommandInput("");
                      }, 200);
                      setOpen(false);
                    }}
                  >
                    {filterOption.icon}
                    <span className="text-accent-foreground">
                      {filterOption.name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  );
};

export default function BuildingFilters({
  filters,
  setFilters,
  localities,
  bhkTypes,
}: {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  localities: string[];
  bhkTypes: number[];
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedView, setSelectedView] = React.useState<FilterType | null>(null);
  const [commandInput, setCommandInput] = React.useState("");
  const commandInputRef = React.useRef<HTMLInputElement>(null);

  const filterOptions = {
    [FilterType.LOCALITY]: localities.map(locality => ({ name: locality, icon: <MapPin className="h-4 w-4" /> })),
    [FilterType.BHK]: bhkTypes.map(bhk => ({ name: `${bhk} BHK`, icon: <Home className="h-4 w-4" /> })),
    [FilterType.BUDGET]: Object.keys(BUDGET_RANGES).map(range => ({ name: range, icon: <Building2 className="h-4 w-4" /> }))
  };

  return (
    <div className="flex gap-2 items-center ml-auto">
      <Filters 
        filters={filters} 
        setFilters={setFilters} 
        filterOptions={filterOptions}
      />
      
      {filters.filter((filter) => filter.value?.length > 0).length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="transition group h-6 text-xs items-center rounded-sm"
          onClick={() => setFilters([])}
        >
          Clear
        </Button>
      )}

      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setTimeout(() => {
              setSelectedView(null);
              setCommandInput("");
            }, 200);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            size="sm"
            className={cn(
              "transition group h-6 text-xs items-center rounded-sm flex gap-1.5",
              filters.length > 0 && "w-6"
            )}
          >
            <ListFilter className="h-4 w-4 shrink-0 transition-all text-muted-foreground group-hover:text-primary" />
            {!filters.length && "Filter"}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[200px] p-0">
          <AnimateChangeInHeight>
            <Command>
              <CommandInput
                placeholder={selectedView ? selectedView : "Filter..."}
                className="h-9"
                value={commandInput}
                onInputCapture={(e) => {
                  setCommandInput(e.currentTarget.value);
                }}
                ref={commandInputRef}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {selectedView ? (
                  <CommandGroup>
                    {filterOptions[selectedView].map((filter: FilterOption) => (
                      <CommandItem
                        className="group text-muted-foreground flex gap-2 items-center"
                        key={filter.name}
                        value={filter.name}
                        onSelect={(currentValue) => {
                          setFilters((prev) => {
                            const existingFilter = prev.find(f => f.type === selectedView);
                            if (existingFilter) {
                              return prev.map(f => 
                                f.type === selectedView 
                                  ? { ...f, value: [...f.value, currentValue] }
                                  : f
                              );
                            }
                            return [...prev, {
                              id: nanoid(),
                              type: selectedView,
                              operator: FilterOperator.IS_ANY_OF,
                              value: [currentValue],
                            }];
                          });
                          setTimeout(() => {
                            setSelectedView(null);
                            setCommandInput("");
                          }, 200);
                          setOpen(false);
                        }}
                      >
                        {filter.icon}
                        <span className="text-accent-foreground">
                          {filter.name}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandGroup>
                    {Object.values(FilterType).map((type) => (
                      <CommandItem
                        className="group text-muted-foreground flex gap-2 items-center"
                        key={type}
                        value={type}
                        onSelect={(currentValue) => {
                          setSelectedView(currentValue as FilterType);
                          setCommandInput("");
                          commandInputRef.current?.focus();
                        }}
                      >
                        {type === FilterType.LOCALITY && <MapPin className="h-4 w-4" />}
                        {type === FilterType.BHK && <Home className="h-4 w-4" />}
                        {type === FilterType.BUDGET && <Building2 className="h-4 w-4" />}
                        <span className="text-accent-foreground">{type}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </AnimateChangeInHeight>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const Filters = ({
  filters,
  setFilters,
  filterOptions,
}: {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  filterOptions: any;
}) => {
  return (
    <div className="flex gap-2">
      {filters.map((filter) => {
        return (
          <div key={filter.id} className="flex gap-1 items-center">
            <Button
              variant="outline"
              size="sm"
              className="transition group h-6 text-xs items-center rounded-sm"
            >
              {filter.type}
            </Button>
            <FilterOperatorDropdown filter={filter} setFilters={setFilters} />
            <FilterValueCombobox
              filter={filter}
              setFilters={setFilters}
              filterOptions={filterOptions[filter.type]}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setFilters((prev) => prev.filter((f) => f.id !== filter.id));
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          </div>
        );
      })}
    </div>
  );
};
