
import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { ActionSearchBar, Action } from "@/components/ui/action-search-bar";
import { cn } from "@/lib/utils";

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
  localityActions?: Action[];
  onSearch?: (query: string) => void;
  onLocalitySelect?: (action: Action) => void;
  imageUrl?: string;
  className?: string;
}

export function AnimatedHero({ 
  title, 
  subtitle, 
  localityActions = [], 
  onSearch, 
  onLocalitySelect,
  imageUrl,
  className
}: AnimatedHeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["luxurious", "peaceful", "spacious", "modern", "perfect"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  // If imageUrl is provided, use the simple layout
  if (imageUrl) {
    return (
      <div className={cn(
        "w-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 relative overflow-hidden",
        className
      )}>
        {/* Diagonal stripes overlay for Stripe-like effect */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:100px_100px]"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 py-12 md:py-16 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-6 px-4 md:px-8 order-2 md:order-1">
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight text-white font-semibold">
                {title}
              </h1>
              
              <p className="text-base md:text-lg text-white/90 max-w-lg">
                {subtitle}
              </p>
              
              {onSearch && (
                <div className="w-full max-w-md mt-2">
                  <ActionSearchBar 
                    actions={localityActions || []} 
                    onSearch={onSearch} 
                    onActionSelect={onLocalitySelect} 
                    placeholderText="Search by property name or location..." 
                    labelText="" 
                    className="shadow-md" 
                  />
                </div>
              )}
            </div>
            
            {/* Right Image */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-1 md:order-2 px-4 md:px-0"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/lovable-uploads/d6734546-146b-4af0-9efa-4b94b8fc8bc6.png" 
                  alt="Happy couple signing home documents" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Original animated hero if no image is provided
  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto">
        <div className="flex gap-8 py-16 md:py-24 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col px-4 md:px-0">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl max-w-3xl tracking-tight text-center">
              <span className="text-gray-800">Find your</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-primary"
                    initial={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -30 : 30,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-600 max-w-2xl text-center">
              {subtitle}
            </p>
          </div>
          
          {onSearch && (
            <div className="w-full max-w-2xl mx-auto px-4 md:px-0 mt-4">
              <ActionSearchBar 
                actions={localityActions || []} 
                onSearch={onSearch} 
                onActionSelect={onLocalitySelect} 
                placeholderText="Search by property name or location..." 
                labelText="" 
                className="shadow-md" 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
