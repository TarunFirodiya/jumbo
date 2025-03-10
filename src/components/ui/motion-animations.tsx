
import { motion, HTMLMotionProps } from "framer-motion";
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

interface MotionCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
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

interface MotionImageProps extends Omit<HTMLMotionProps<"img">, "src" | "alt"> {
  src: string;
  alt: string;
  className?: string;
}

export const MotionImage = ({ 
  src, 
  alt, 
  className, 
  ...props 
}: MotionImageProps) => {
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

interface MotionButtonProps extends Omit<HTMLMotionProps<"button">, "children" | "onClick"> {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const MotionButton = ({ 
  children, 
  className, 
  onClick, 
  ...props 
}: MotionButtonProps) => {
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

interface AnimatePresenceWrapperProps {
  children: React.ReactNode;
}

export const AnimatePresenceWrapper = ({ 
  children 
}: AnimatePresenceWrapperProps) => {
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
