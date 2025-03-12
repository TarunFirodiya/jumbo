
import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { ActionSearchBar, Action } from "@/components/ui/action-search-bar";

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
  localityActions?: Action[];
  onSearch?: (query: string) => void;
  onLocalitySelect?: (action: Action) => void;
}

export function AnimatedHero({ 
  title, 
  subtitle, 
  localityActions = [], 
  onSearch, 
  onLocalitySelect 
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
