
import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
}

export function AnimatedHero({ title, subtitle }: AnimatedHeroProps) {
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
    <div className="w-full bg-black">
      <div className="container mx-auto">
        <div className="flex gap-8 py-16 md:py-24 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col px-4 md:px-0">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl max-w-3xl tracking-tight text-center">
              <span className="text-white">Find your</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-primary"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-neutral-300 max-w-2xl text-center">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
