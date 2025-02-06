// React and hooks imports
import React, { useState } from "react";

// Third-party component imports
import { Check, ChevronsUpDown, ListFilter, X } from "lucide-react";

// Local UI component imports
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Utility imports
import { cn } from "@/lib/utils";

export interface BaseOption<T = string> {
  label: string;
  value: T;
}

interface Props<T> {
  label: string;
  renderItem: (option: BaseOption<T>) => React.ReactNode;
  renderSelectedItem: (value: T[]) => React.ReactNode;
  options: BaseOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  placeholder?: string;
}

export const MultiSelectCombobox = <T extends string | number>({
  label,
  renderItem,
  renderSelectedItem,
  options,
  value,
  onChange,
  placeholder,
}: Props<T>) => {
  const [open, setOpen] = useState(false);

  const handleChange = (currentValue: T) => {
    onChange(
      value.includes(currentValue)
        ? value.filter((val) => val !== currentValue)
        : [...value, currentValue]
    );
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="multi-select-options"
          aria-label={`Select ${label}`}
          tabIndex={0}
          className="flex h-10 min-w-[200px] cursor-pointer items-center justify-start gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setOpen(!open);
            }
          }}
        >
          <ListFilter
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {value.length > 0 && (
            <span className="text-muted-foreground">{label}</span>
          )}

          <div className="flex-1 overflow-hidden">
            {value.length > 0 ? renderSelectedItem(value) : `Select ${label}...`}
          </div>

          <span className="z-10 ml-auto flex items-center gap-2">
            {value.length > 0 && (
              <button
                type="button"
                aria-label="Clear selection"
                className="z-10 rounded-sm opacity-50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={handleClear}
              >
                <X className="size-4 shrink-0" />
              </button>
            )}
            <ChevronsUpDown
              className="size-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          </span>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        id="multi-select-options"
      >
        <Command>
          <CommandInput
            placeholder={placeholder || `Search ${label}...`}
            aria-label={`Search ${label}`}
          />
          <CommandList>
            <CommandEmpty>No {label} found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={option.label}
                  onSelect={() => handleChange(option.value)}
                  aria-selected={value.includes(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                  {renderItem(option)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};