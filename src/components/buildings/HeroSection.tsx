
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { ActionSearchBar, Action } from "@/components/ui/action-search-bar";
import { motion } from "framer-motion";

interface HeroSectionProps {
  localityActions: Action[];
  onSearch: (query: string) => void;
  onLocalitySelect: (action: Action) => void;
}

export function HeroSection({ 
  localityActions, 
  onSearch, 
  onLocalitySelect 
}: HeroSectionProps) {
  return (
    <div className="relative w-full h-[600px] bg-black overflow-hidden">
      {/* Particles Background */}
      <div className="w-full absolute inset-0 h-full">
        <SparklesCore
          id="tsparticlescolorful"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#00ff00"
          speed={0.5}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-6">
            Zero Spam Home Buying
          </h1>
          
          <p className="text-xl text-neutral-300 mb-12 max-w-2xl mx-auto">
            Choose from over 1000 ready to move homes in Bangalore.
            Visit multiple homes over a weekend.
            Buy with 100% legal safety.
          </p>
        </motion.div>
        
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-full p-2">
            <ActionSearchBar 
              actions={localityActions} 
              onSearch={onSearch} 
              onActionSelect={onLocalitySelect} 
              placeholderText="Search by property name or location..." 
              labelText="" 
              className="shadow-lg" 
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
