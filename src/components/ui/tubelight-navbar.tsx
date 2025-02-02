"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  externalLink?: string
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = items.find(item => item.url === currentPath);
    if (currentItem) {
      setActiveTab(currentItem.name);
    }
  }, [location, items]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const renderLink = (item: NavItem) => {
    const Icon = item.icon
    const isActive = activeTab === item.name
    const linkProps = {
      key: item.name,
      onClick: () => setActiveTab(item.name),
      className: cn(
        "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
        "text-white/80 hover:text-white",
        isActive && "bg-white/10 text-white",
      ),
    }

    const content = (
      <>
        <span className="hidden md:inline">{item.name}</span>
        <span className="md:hidden">
          <Icon size={18} strokeWidth={2.5} />
        </span>
        {isActive && (
          <motion.div
            layoutId="lamp"
            className="absolute inset-0 w-full bg-white/5 rounded-full -z-10"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full">
              <div className="absolute w-12 h-6 bg-white/20 rounded-full blur-md -top-2 -left-2" />
              <div className="absolute w-8 h-6 bg-white/20 rounded-full blur-md -top-1" />
              <div className="absolute w-4 h-4 bg-white/20 rounded-full blur-sm top-0 left-2" />
            </div>
          </motion.div>
        )}
      </>
    )

    if (item.externalLink) {
      return (
        <a 
          {...linkProps} 
          href={item.externalLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      )
    }

    return (
      <Link {...linkProps} to={item.url}>
        {content}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2 z-50 mb-4 w-full max-w-lg px-4",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-[#2374FF] py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => renderLink(item))}
      </div>
    </div>
  )
}