
import { motion, LayoutGroup } from "framer-motion";
import { ActionSearchBar, Action } from "@/components/ui/action-search-bar";
import { cn } from "@/lib/utils";
import { TextRotate } from "@/components/ui/text-rotate";
import Floating, { FloatingElement } from "@/components/ui/parallax-floating";

// Updated images for the floating elements
const exampleImages = [
  {
    url: "/lovable-uploads/bab9aea2-f261-49eb-867d-f0d7a731d270.png",
    title: "Security shield icon",
  },
  {
    url: "/lovable-uploads/a7f217e2-856c-43b3-ad1f-923583877464.png",
    title: "Modern house 3D icon",
  },
  {
    url: "/lovable-uploads/341f318a-2492-41ed-adb0-d0b63d478444.png",
    title: "Key icon",
  },
  {
    url: "/lovable-uploads/acf94706-ef81-433d-8c77-c20841d8be7f.png",
    title: "Location pin icon",
  },
  {
    url: "/lovable-uploads/315a0028-009a-4c1b-bd13-632d0da2d721.png",
    title: "Indian rupee icon",
  },
];

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
      "w-full min-h-[80vh] overflow-hidden md:overflow-visible flex flex-col items-center justify-center relative bg-white",
      className
    )}>
      {/* Floating images positioned to not overlap with the center text */}
      <Floating sensitivity={-0.2} className="w-full h-full absolute inset-0 pointer-events-none">
        {/* Left side images */}
        <FloatingElement
          depth={0.5}
          className="top-[5%] left-[5%] md:top-[10%] md:left-[10%]"
        >
          <motion.img
            src={exampleImages[0].url}
            alt={exampleImages[0].title}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[3deg] shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={1}
          className="top-[40%] left-[2%] md:top-[35%] md:left-[5%]"
        >
          <motion.img
            src={exampleImages[1].url}
            alt={exampleImages[1].title}
            className="w-24 h-20 sm:w-32 sm:h-24 md:w-40 md:h-32 lg:w-48 lg:h-40 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-6 shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={0.8}
          className="bottom-[15%] left-[8%] md:bottom-[20%] md:left-[13%]"
        >
          <motion.img
            src={exampleImages[2].url}
            alt={exampleImages[2].title}
            className="w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-40 lg:w-56 lg:h-48 object-contain rotate-[4deg] hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          />
        </FloatingElement>

        {/* Right side images */}
        <FloatingElement
          depth={1.2}
          className="top-[10%] right-[5%] md:top-[12%] md:right-[10%]"
        >
          <motion.img
            src={exampleImages[3].url}
            alt={exampleImages[3].title}
            className="w-24 h-20 sm:w-32 sm:h-28 md:w-40 md:h-36 lg:w-48 lg:h-44 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[6deg] rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={1}
          className="bottom-[15%] right-[5%] md:bottom-[20%] md:right-[10%]"
        >
          <motion.img
            src={exampleImages[4].url}
            alt={exampleImages[4].title}
            className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[8deg] rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          />
        </FloatingElement>
      </Floating>

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
