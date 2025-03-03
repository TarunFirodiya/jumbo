
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Send,
    MapPin,
    Home,
    Building,
    Building2,
    Bookmark,
} from "lucide-react";

function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Change this to an interface with export type
export interface Action {
    id: string;
    label: string;
    icon: React.ReactNode;
    description?: string;
    short?: string;
    end?: string;
    value?: string;
}

interface SearchResult {
    actions: Action[];
}

interface ActionSearchBarProps {
    actions: Action[];
    onSearch: (query: string) => void;
    onActionSelect?: (action: Action) => void;
    placeholderText?: string;
    labelText?: string;
    className?: string;
}

function ActionSearchBar({ 
    actions = [], 
    onSearch, 
    onActionSelect,
    placeholderText = "Search for properties or locations...",
    labelText = "Search",
    className = ""
}: ActionSearchBarProps) {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<SearchResult | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const debouncedQuery = useDebounce(query, 200);

    useEffect(() => {
        if (!isFocused) {
            setResult(null);
            return;
        }

        if (!debouncedQuery) {
            setResult({ actions });
            return;
        }

        const normalizedQuery = debouncedQuery.toLowerCase().trim();
        const filteredActions = actions.filter((action) => {
            const searchableText = action.label.toLowerCase();
            return searchableText.includes(normalizedQuery);
        });

        setResult({ actions: filteredActions });
    }, [debouncedQuery, isFocused, actions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setIsTyping(true);
        onSearch(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch(query);
            setIsFocused(false);
        }
    };

    const container = {
        hidden: { opacity: 0, height: 0 },
        show: {
            opacity: 1,
            height: "auto",
            transition: {
                height: {
                    duration: 0.4,
                },
                staggerChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            height: 0,
            transition: {
                height: {
                    duration: 0.3,
                },
                opacity: {
                    duration: 0.2,
                },
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2,
            },
        },
    };

    // Reset selectedAction when focusing the input
    const handleFocus = () => {
        setSelectedAction(null);
        setIsFocused(true);
    };

    const handleActionClick = (action: Action) => {
        setSelectedAction(action);
        setQuery(action.value || action.label);
        setIsFocused(false);
        if (onActionSelect) {
            onActionSelect(action);
        } else {
            onSearch(action.value || action.label);
        }
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="relative flex flex-col justify-start items-center">
                <div className="w-full sticky top-0 bg-background z-10">
                    {labelText && (
                        <label
                            className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block"
                            htmlFor="search"
                        >
                            {labelText}
                        </label>
                    )}
                    <div className="relative">
                        <Input
                            type="text"
                            id="search"
                            placeholder={placeholderText}
                            value={query}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={handleFocus}
                            onBlur={() =>
                                setTimeout(() => setIsFocused(false), 200)
                            }
                            className="pl-10 pr-9 py-1.5 h-12 text-base rounded-lg focus-visible:ring-offset-0"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5">
                            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        {query.length > 0 && (
                            <button 
                                onClick={() => {
                                    setQuery("");
                                    onSearch("");
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                            >
                                <span className="sr-only">Clear search</span>
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="w-full">
                    <AnimatePresence>
                        {isFocused && result && !selectedAction && result.actions.length > 0 && (
                            <motion.div
                                className="w-full border rounded-md shadow-sm overflow-hidden dark:border-gray-800 bg-background mt-1 absolute z-20"
                                variants={container}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                <motion.ul>
                                    {result.actions.map((action) => (
                                        <motion.li
                                            key={action.id}
                                            className="px-3 py-2 flex items-center justify-between hover:bg-accent cursor-pointer rounded-md"
                                            variants={item}
                                            layout
                                            onClick={() => handleActionClick(action)}
                                        >
                                            <div className="flex items-center gap-2 justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">
                                                        {action.icon}
                                                    </span>
                                                    <span className="text-sm font-medium text-foreground">
                                                        {action.label}
                                                    </span>
                                                    {action.description && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {action.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {(action.short || action.end) && (
                                                <div className="flex items-center gap-2">
                                                    {action.short && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {action.short}
                                                        </span>
                                                    )}
                                                    {action.end && (
                                                        <span className="text-xs text-muted-foreground text-right">
                                                            {action.end}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// Fix the export here by separating the component and interface
export { ActionSearchBar };
