export class SlideConfig {
  slides: any[] = [];

  // General settings with optional properties
  autoPlay?: boolean; 
  delay?: number; 
  loop?: number; // Changed to number: 0 (no loop), 1 (loop to first), 2 (infinite loop)
  vertical?: boolean;  // default horizontal, 

  // Navigation settings
  navEnabled?: boolean;
  navPosition?: string; 
  previousText?: string;
  nextText?: string;

  // Pagination settings
  paginationEnabled?: boolean;
  paginationPosition?: string; 
  slideChangeDelay?: number;
  slidesPerView?: number;

  // Breakpoints with all properties customizable per device type
  breakpoints?: {
    mobile?: {
      slidesPerView?: number;
      autoPlay?: boolean;
      delay?: number;
      loop?: number;
      navEnabled?: boolean;
      navPosition?: string;
      paginationEnabled?: boolean;
      paginationPosition?: string;
      previousText?: string;
      nextText?: string;
      slideChangeDelay?: number;
    };
    tablet?: {
      slidesPerView?: number;
      autoPlay?: boolean;
      delay?: number;
      loop?: number;
      navEnabled?: boolean;
      navPosition?: string;
      paginationEnabled?: boolean;
      paginationPosition?: string;
      previousText?: string;
      nextText?: string;
      slideChangeDelay?: number;
    };
    desktop?: {
      slidesPerView?: number;
      autoPlay?: boolean;
      delay?: number;
      loop?: number;
      navEnabled?: boolean;
      navPosition?: string;
      paginationEnabled?: boolean;
      paginationPosition?: string;
      previousText?: string;
      nextText?: string;
      slideChangeDelay?: number;
    };
  };
}
