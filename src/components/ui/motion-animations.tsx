
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

// Animation variants for common use cases
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export const itemFadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

interface MotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
}

export const MotionCard = ({ 
  children, 
  className, 
  delay = 0,
  ...props 
}: MotionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        type: "spring", 
        stiffness: 150, 
        damping: 25 
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn("overflow-hidden", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MotionImage = ({ src, alt, className, ...props }) => {
  return (
    <motion.img
      src={src}
      alt={alt}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className={cn("object-cover", className)}
      {...props}
    />
  );
};

export const MotionButton = ({ children, className, onClick, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const AnimatePresenceWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
