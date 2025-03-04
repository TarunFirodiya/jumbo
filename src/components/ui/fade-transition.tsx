
import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type FadeProps = {
  children: React.ReactNode;
  show?: boolean;
  className?: string;
  duration?: number;
  delay?: number;
  type?: 'fade' | 'fadeUp' | 'fadeDown' | 'scale';
};

export function FadeTransition({
  children,
  show = true,
  className = '',
  duration = 300,
  delay = 0,
  type = 'fade'
}: FadeProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) setShouldRender(true);
    else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);
  
  const getTransformStyles = () => {
    switch (type) {
      case 'fadeUp':
        return { transform: show ? 'translateY(0)' : 'translateY(10px)' };
      case 'fadeDown':
        return { transform: show ? 'translateY(0)' : 'translateY(-10px)' };
      case 'scale':
        return { transform: show ? 'scale(1)' : 'scale(0.95)' };
      default:
        return {};
    }
  };

  const style = {
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
    opacity: show ? 1 : 0,
    transitionDelay: `${delay}ms`,
    ...getTransformStyles()
  };

  if (!shouldRender) return null;

  return (
    <div
      ref={nodeRef}
      style={style}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
