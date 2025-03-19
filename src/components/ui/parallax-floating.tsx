
"use client"

import { 
  createContext, 
  useContext, 
  useRef, 
  useEffect, 
  useState, 
  ReactNode 
} from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

interface FloatingContextType {
  x: number;
  y: number;
  sensitivity: number;
}

const FloatingContext = createContext<FloatingContextType>({
  x: 0,
  y: 0,
  sensitivity: 1,
})

interface FloatingProps {
  children: ReactNode;
  className?: string;
  sensitivity?: number;
}

export default function Floating({ 
  children, 
  className = "", 
  sensitivity = 1 
}: FloatingProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <FloatingContext.Provider 
      value={{ 
        x: mousePosition.x, 
        y: mousePosition.y, 
        sensitivity 
      }}
    >
      <div className={`relative ${className}`}>{children}</div>
    </FloatingContext.Provider>
  )
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  depth?: number;
}

export function FloatingElement({ 
  children, 
  className = "", 
  depth = 1 
}: FloatingElementProps) {
  const { x, y, sensitivity } = useContext(FloatingContext)
  const elementRef = useRef<HTMLDivElement>(null)
  
  const motionX = useMotionValue(0)
  const motionY = useMotionValue(0)
  
  const springX = useSpring(motionX, { stiffness: 100, damping: 30 })
  const springY = useSpring(motionY, { stiffness: 100, damping: 30 })

  useEffect(() => {
    motionX.set(x * depth * sensitivity * -10)
    motionY.set(y * depth * sensitivity * -10)
  }, [x, y, depth, sensitivity])

  return (
    <motion.div
      ref={elementRef}
      className={`absolute ${className}`}
      style={{
        x: springX,
        y: springY,
      }}
    >
      {children}
    </motion.div>
  )
}
