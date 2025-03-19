
import { motion, LayoutGroup } from "framer-motion";
import { ActionSearchBar, Action } from "@/components/ui/action-search-bar";
import { cn } from "@/lib/utils";
import { TextRotate } from "@/components/ui/text-rotate";
import Floating, { FloatingElement } from "@/components/ui/parallax-floating";

// Images for the floating elements
const exampleImages = [
  {
    url: "/lovable-uploads/8d9be52a-902f-45b2-9186-e5ff951e340b.png",
    title: "Colorful decorative image",
  },
  {
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=3087&auto=format&fit=crop",
    title: "Modern apartment interior",
  },
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=3150&auto=format&fit=crop",
    title: "Beautiful house exterior",
  },
  {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=3175&auto=format&fit=crop",
    title: "Modern home with pool",
  },
  {
    url: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?q=80&w=3150&auto=format&fit=crop",
    title: "Cozy living room",
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
      <Floating sensitivity={-0.5} className="w-full h-full absolute inset-0">
        <FloatingElement
          depth={0.5}
          className="top-[15%] left-[5%] md:top-[25%] md:left-[10%]"
        >
          <motion.img
            src={exampleImages[0].url}
            alt={exampleImages[0].title}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[3deg] shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={1}
          className="top-[8%] left-[15%] md:top-[12%] md:left-[25%]"
        >
          <motion.img
            src={exampleImages[1].url}
            alt={exampleImages[1].title}
            className="w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-40 lg:w-60 lg:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-6 shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={0.8}
          className="bottom-[15%] left-[10%] md:bottom-[20%] md:left-[15%]"
        >
          <motion.img
            src={exampleImages[2].url}
            alt={exampleImages[2].title}
            className="w-40 h-32 sm:w-48 sm:h-40 md:w-56 md:h-48 lg:w-64 lg:h-56 object-cover rotate-[4deg] hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={1.2}
          className="top-[10%] right-[10%] md:top-[15%] md:right-[15%]"
        >
          <motion.img
            src={exampleImages[3].url}
            alt={exampleImages[3].title}
            className="w-32 h-28 sm:w-40 sm:h-36 md:w-48 md:h-44 lg:w-56 lg:h-52 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[6deg] rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={1}
          className="bottom-[10%] right-[10%] md:bottom-[15%] md:right-[15%]"
        >
          <motion.img
            src={exampleImages[4].url}
            alt={exampleImages[4].title}
            className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-64 lg:h-64 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[8deg] rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          />
        </FloatingElement>
      </Floating>

      <div className="flex flex-col justify-center items-center w-[250px] sm:w-[350px] md:w-[500px] lg:w-[700px] z-50 pointer-events-auto">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-center w-full justify-center items-center flex-col flex whitespace-pre leading-tight font-serif tracking-tight space-y-1 md:space-y-3"
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
          className="text-sm sm:text-base md:text-lg lg:text-xl text-center pt-4 sm:pt-6 md:pt-8 lg:pt-10"
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
            <ActionSearchBar 
              actions={localityActions || []} 
              onSearch={onSearch} 
              onActionSelect={onLocalitySelect} 
              placeholderText="Search by property name or location..." 
              labelText="" 
              className="shadow-lg" 
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
