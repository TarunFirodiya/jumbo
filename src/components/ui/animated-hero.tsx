
import { motion, LayoutGroup } from "framer-motion";
import { useState } from "react";
import { ActionSearchBar, Action } from "@/components/ui/action-search-bar";
import { cn } from "@/lib/utils";
import { TextRotate } from "@/components/ui/text-rotate";

interface AnimatedHeroProps {
  title?: string;
  subtitle?: string;
  localityActions?: Action[];
  onSearch?: (query: string) => void;
  onLocalitySelect?: (action: Action) => void;
  imageUrl?: string;
  className?: string;
}

export function AnimatedHero({ 
  subtitle = "Search, visit & buy ready-to-move homes at fixed prices", 
  localityActions = [], 
  onSearch, 
  onLocalitySelect,
  className
}: AnimatedHeroProps) {
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
              <span>Home Buying Made </span>
              <LayoutGroup>
                <motion.span layout className="flex whitespace-pre">
                  <TextRotate
                    texts={[
                      "Simple",
                      "Safe",
                      "Affordable"
                    ]}
                    mainClassName="overflow-hidden text-white font-bold"
                    staggerDuration={0.03}
                    staggerFrom="last"
                    rotationInterval={2000}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  />
                </motion.span>
              </LayoutGroup>
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
