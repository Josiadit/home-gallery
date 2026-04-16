import * as React from "react";
import { useEffect, useRef, useState } from "react";

interface CenteredNavBarTextProps {
  text: string;
  className?: string;
}

/**
 * Centered text component for navbar that hides when it overlaps with buttons.
 * Buttons have priority and will always be visible.
 */
export const CenteredNavBarText = ({ text, className = "" }: CenteredNavBarTextProps) => {
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      if (!textRef.current || !containerRef.current) {
        setIsVisible(false);
        return;
      }

      const textRect = textRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Get all buttons (NavItems) in the navbar
      const navbar = containerRef.current.closest('nav');
      if (!navbar) {
        setIsVisible(false);
        return;
      }

      // Get all buttons (NavItems) in the navbar
      const buttons = navbar.querySelectorAll('a[class*="flex gap-2 items-center"]');

      // Get search input container
      const searchContainer = navbar.querySelector('div[class*="flex gap-2 overflow-hidden border"]');

      // Get search button (mobile)
      const searchButtons = navbar.querySelectorAll('button[class*="flex items-center justify-center gap-2"]');

      let hasOverlap = false;

      // Check if text fits in screen width
      if (textRect.width > window.innerWidth) {
        hasOverlap = true;
      }

      // Check NavItem buttons
      buttons.forEach((button) => {
        const buttonRect = button.getBoundingClientRect();
        // Check if text overlaps with button
        if (!(textRect.right < buttonRect.left ||
              textRect.left > buttonRect.right ||
              textRect.bottom < buttonRect.top ||
              textRect.top > buttonRect.bottom)) {
          hasOverlap = true;
        }
      });

      // Check search input container
      if (searchContainer) {
        const searchRect = searchContainer.getBoundingClientRect();
        // Check if text overlaps with search input
        if (!(textRect.right < searchRect.left ||
              textRect.left > searchRect.right ||
              textRect.bottom < searchRect.top ||
              textRect.top > searchRect.bottom)) {
          hasOverlap = true;
        }
      }

      // Check search button (mobile)
      searchButtons.forEach((button) => {
        const buttonRect = button.getBoundingClientRect();
        // Check if text overlaps with search button
        if (!(textRect.right < buttonRect.left ||
              textRect.left > buttonRect.right ||
              textRect.bottom < buttonRect.top ||
              textRect.top > buttonRect.bottom)) {
          hasOverlap = true;
        }
      });

      setIsVisible(!hasOverlap);
    };

    // Check on mount and window resize
    checkVisibility();
    window.addEventListener('resize', checkVisibility);

    // Use ResizeObserver to detect when navbar buttons change
    const resizeObserver = new ResizeObserver(checkVisibility);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', checkVisibility);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } ${className}`}
    >
      <div
        ref={textRef}
        className="text-light-50 font-medium text-center whitespace-nowrap"
      >
        {text}
      </div>
    </div>
  );
};



