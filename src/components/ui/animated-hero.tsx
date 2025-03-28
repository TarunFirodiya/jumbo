
import { motion, LayoutGroup } from "framer-motion";
import { ActionSearchBar, Action } from "@/components/ui/action-search-bar";
import { cn } from "@/lib/utils";
import { TextRotate } from "@/components/ui/text-rotate";

interface AnimatedHeroProps {
  title?: string;
  subtitle?: string;
  localityActions?: Action[];
  onSearch?: (query: string) => void;
  onLocalitySelect?: (action: Action) => void;
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
    <section className={cn(
      "w-full min-h-[60vh] overflow-hidden md:overflow-visible flex flex-col items-center justify-center relative bg-white",
      className
    )}>
      {/* Central content with increased z-index */}
      <div className="flex flex-col justify-center items-center max-w-[300px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[800px] relative z-20 px-4">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-center w-full justify-center items-center flex-col flex whitespace-pre leading-tight font-serif tracking-tight space-y-1 md:space-y-3 text-black"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.3 }}
        >
          <span>Home Buying Made </span>
          <LayoutGroup>
            <motion.span layout className="flex whitespace-pre">
              <TextRotate
                texts={[
                  "Simple",
                  "Safe",
                  "Affordable"
                ]}
                mainClassName="overflow-hidden text-blue-600 py-0 pb-2 md:pb-3 rounded-xl"
                staggerDuration={0.03}
                staggerFrom="last"
                rotationInterval={3000}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
            </motion.span>
          </LayoutGroup>
        </motion.h1>
        
        <motion.p
          className="text-sm sm:text-base md:text-lg lg:text-xl text-center pt-4 sm:pt-6 md:pt-8 lg:pt-10 text-black"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.5 }}
        >
          {subtitle}
        </motion.p>

        {onSearch && (
          <motion.div 
            className="w-full max-w-md mt-8 sm:mt-10 md:mt-12 lg:mt-14"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut", delay: 0.7 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-1 shadow-lg border border-gray-200">
              <ActionSearchBar 
                actions={localityActions || []} 
                onSearch={onSearch} 
                onActionSelect={onLocalitySelect} 
                placeholderText="Search by property name or location..." 
                labelText="" 
                className="rounded-[20px]" 
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
