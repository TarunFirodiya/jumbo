
import { useEffect, useRef, useState } from 'react';

// Function to check if an element is in viewport
export function isElementInViewport(el: Element) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Hook to detect when an element is visible in the viewport
export function useIntersectionObserver(options = {}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [options]);

  return [elementRef, isVisible];
}

// Function to add scroll animation for elements
export function initScrollAnimations() {
  const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
  
  const checkIfInView = () => {
    animateOnScrollElements.forEach((element) => {
      if (isElementInViewport(element)) {
        element.classList.add('is-visible');
      }
    });
  };
  
  // Initial check
  checkIfInView();
  
  // Add scroll listener
  window.addEventListener('scroll', checkIfInView);
  
  return () => {
    window.removeEventListener('scroll', checkIfInView);
  };
}

// Staggered animation for lists (returns a delay value based on index)
export function getStaggeredDelay(index: number, baseDelay = 0.1) {
  return `${baseDelay * index}s`;
}
