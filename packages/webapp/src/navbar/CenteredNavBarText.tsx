import * as React from "react";
import { useEffect, useRef, useState } from "react";

interface CenteredNavBarTextProps {
  text: string;
  className?: string;
  padding?: number;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  onClick?: () => void;
}

/**
 * Centered text component for navbar that hides when it overlaps with buttons.
 * Buttons have priority and will always be visible.
 */
export const CenteredNavBarText = ({ text, className = "", padding = 8, fontFamily, fontSize, fontWeight, onClick }: CenteredNavBarTextProps) => {
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

      // Check if text fits in screen width with padding
      if (textRect.width > window.innerWidth - (2 * padding)) {
        hasOverlap = true;
      }

      // Check NavItem buttons with horizontal padding
      buttons.forEach((button) => {
        const buttonRect = button.getBoundingClientRect();
        const paddedRect = {
          left: buttonRect.left - padding,
          right: buttonRect.right + padding,
          top: buttonRect.top,
          bottom: buttonRect.bottom
        };
        // Check if text overlaps with button
        if (!(textRect.right < paddedRect.left ||
              textRect.left > paddedRect.right ||
              textRect.bottom < paddedRect.top ||
              textRect.top > paddedRect.bottom)) {
          hasOverlap = true;
        }
      });

      // Check search input container with horizontal padding
      if (searchContainer) {
        const searchRect = searchContainer.getBoundingClientRect();
        const paddedRect = {
          left: searchRect.left - padding,
          right: searchRect.right + padding,
          top: searchRect.top,
          bottom: searchRect.bottom
        };
        // Check if text overlaps with search input
        if (!(textRect.right < paddedRect.left ||
              textRect.left > paddedRect.right ||
              textRect.bottom < paddedRect.top ||
              textRect.top > paddedRect.bottom)) {
          hasOverlap = true;
        }
      }

      // Check search button (mobile) with horizontal padding
      searchButtons.forEach((button) => {
        const buttonRect = button.getBoundingClientRect();
        const paddedRect = {
          left: buttonRect.left - padding,
          right: buttonRect.right + padding,
          top: buttonRect.top,
          bottom: buttonRect.bottom
        };
        // Check if text overlaps with search button
        if (!(textRect.right < paddedRect.left ||
              textRect.left > paddedRect.right ||
              textRect.bottom < paddedRect.top ||
              textRect.top > paddedRect.bottom)) {
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
  }, [padding]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } ${className}`}
    >
      <div
        ref={textRef}
        className="text-light-50 font-medium text-center whitespace-nowrap"
        style={{
          ...(fontFamily && { fontFamily }),
          ...(fontSize && { fontSize }),
          ...(fontWeight && { fontWeight })
        }}
      >
        {text}
      </div>
    </div>
  );
};



