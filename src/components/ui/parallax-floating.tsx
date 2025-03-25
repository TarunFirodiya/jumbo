
"use client"

import { 
  createContext, 
  useContext, 
  useRef, 
  useEffect, 
  useState, 
  ReactNode 
} from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"

// Context for sharing the sensitivity value
const FloatingContext = createContext<number>(0)

type FloatingProps = {
  sensitivity?: number
  children: ReactNode
  className?: string
}

type FloatingElementProps = {
  depth?: number
  className?: string
  children: ReactNode
}

export default function Floating({ 
  sensitivity = 0.05, 
  children, 
  className = "" 
}: FloatingProps) {
  return (
    <FloatingContext.Provider value={sensitivity}>
      <div className={className}>
        {children}
      </div>
    </FloatingContext.Provider>
  )
}

export function FloatingElement({ 
  depth = 1, 
  className = "", 
  children 
}: FloatingElementProps) {
  const sensitivity = useContext(FloatingContext)
  const effectStrength = depth * sensitivity
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Get viewport dimensions
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      // Calculate distance from center (as a relative value)
      const offsetX = (e.clientX - centerX) / centerX
      const offsetY = (e.clientY - centerY) / centerY
      
      setMousePosition({ x: offsetX, y: offsetY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])
  
  return (
    <motion.div
      ref={ref}
      className={`absolute ${className}`}
      style={{
        x: mousePosition.x * 40 * effectStrength * -1,
        y: mousePosition.y * 40 * effectStrength * -1,
        transition: "transform 0.1s linear"
      }}
    >
      {children}
    </motion.div>
  )
}
