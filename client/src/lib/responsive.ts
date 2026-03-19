/**
 * Responsive Design Utilities
 * 
 * Provides breakpoint constants and responsive helpers
 * for consistent mobile-first design across the application
 */

// Breakpoint definitions (matching Tailwind defaults)
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Device classifications
export const DEVICE_SIZES = {
  mobile: {
    min: BREAKPOINTS.xs,
    max: BREAKPOINTS.sm - 1,
    label: "Mobile (< 640px)",
  },
  tablet: {
    min: BREAKPOINTS.sm,
    max: BREAKPOINTS.lg - 1,
    label: "Tablet (640px - 1023px)",
  },
  desktop: {
    min: BREAKPOINTS.lg,
    max: BREAKPOINTS["2xl"],
    label: "Desktop (≥ 1024px)",
  },
} as const;

// Touch target sizes (WCAG minimum is 44x44px)
export const TOUCH_TARGETS = {
  small: 36,
  default: 44,
  large: 48,
  xlarge: 56,
} as const;

// Responsive spacing scale
export const RESPONSIVE_SPACING = {
  mobile: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
  },
  tablet: {
    xs: 6,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    "2xl": 32,
  },
  desktop: {
    xs: 8,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 40,
  },
} as const;

// Responsive font sizes
export const RESPONSIVE_FONT_SIZES = {
  mobile: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
  },
  tablet: {
    xs: 13,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
  },
  desktop: {
    xs: 14,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
  },
} as const;

// Responsive container widths
export const RESPONSIVE_CONTAINER_WIDTHS = {
  mobile: "100%",
  tablet: "95%",
  desktop: "90%",
  maxWidth: 1400,
} as const;

/**
 * Get spacing value based on device size
 */
export function getResponsiveSpacing(
  size: keyof typeof RESPONSIVE_SPACING.mobile,
  deviceType: "mobile" | "tablet" | "desktop" = "mobile"
): number {
  return RESPONSIVE_SPACING[deviceType][size];
}

/**
 * Get font size based on device size
 */
export function getResponsiveFontSize(
  size: keyof typeof RESPONSIVE_FONT_SIZES.mobile,
  deviceType: "mobile" | "tablet" | "desktop" = "mobile"
): number {
  return RESPONSIVE_FONT_SIZES[deviceType][size];
}

/**
 * Determine device type from window width
 */
export function getDeviceType(width: number): "mobile" | "tablet" | "desktop" {
  if (width < BREAKPOINTS.sm) return "mobile";
  if (width < BREAKPOINTS.lg) return "tablet";
  return "desktop";
}

/**
 * Check if current viewport is mobile
 */
export function isMobileViewport(width: number): boolean {
  return width < BREAKPOINTS.sm;
}

/**
 * Check if current viewport is tablet
 */
export function isTabletViewport(width: number): boolean {
  return width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg;
}

/**
 * Check if current viewport is desktop
 */
export function isDesktopViewport(width: number): boolean {
  return width >= BREAKPOINTS.lg;
}

/**
 * Calculate responsive grid columns
 */
export function getResponsiveGridColumns(width: number): number {
  if (width < BREAKPOINTS.sm) return 1; // Mobile: 1 column
  if (width < BREAKPOINTS.lg) return 2; // Tablet: 2 columns
  if (width < BREAKPOINTS.xl) return 3; // Desktop: 3 columns
  return 4; // Large desktop: 4 columns
}

/**
 * Calculate responsive sidebar width
 */
export function getResponsiveSidebarWidth(width: number): number {
  if (width < BREAKPOINTS.sm) return 0; // Mobile: hidden
  if (width < BREAKPOINTS.lg) return 200; // Tablet: compact
  return 280; // Desktop: full
}

/**
 * Get responsive padding for containers
 */
export function getResponsivePadding(width: number): string {
  if (width < BREAKPOINTS.sm) return "p-3 sm:p-4"; // Mobile: 12px/16px
  if (width < BREAKPOINTS.lg) return "p-4 md:p-6"; // Tablet: 16px/24px
  return "p-6 lg:p-8"; // Desktop: 24px/32px
}

/**
 * Get responsive gap for flex/grid
 */
export function getResponsiveGap(width: number): string {
  if (width < BREAKPOINTS.sm) return "gap-2 sm:gap-3"; // Mobile: 8px/12px
  if (width < BREAKPOINTS.lg) return "gap-3 md:gap-4"; // Tablet: 12px/16px
  return "gap-4 lg:gap-6"; // Desktop: 16px/24px
}

/**
 * Responsive typography scale
 */
export const TYPOGRAPHY_SCALE = {
  h1: {
    mobile: "text-3xl md:text-4xl lg:text-5xl",
    weight: "font-bold",
    lineHeight: "leading-tight",
  },
  h2: {
    mobile: "text-2xl md:text-3xl lg:text-4xl",
    weight: "font-bold",
    lineHeight: "leading-snug",
  },
  h3: {
    mobile: "text-xl md:text-2xl lg:text-3xl",
    weight: "font-semibold",
    lineHeight: "leading-snug",
  },
  body: {
    mobile: "text-base md:text-base lg:text-lg",
    weight: "font-normal",
    lineHeight: "leading-relaxed",
  },
  small: {
    mobile: "text-sm md:text-sm lg:text-base",
    weight: "font-normal",
    lineHeight: "leading-relaxed",
  },
} as const;

/**
 * Responsive button size classes
 */
export const RESPONSIVE_BUTTON_SIZES = {
  mobile: "h-10 px-3 text-sm",
  tablet: "h-11 px-4 text-base",
  desktop: "h-12 px-6 text-base",
} as const;

/**
 * Responsive input size classes
 */
export const RESPONSIVE_INPUT_SIZES = {
  mobile: "h-10 px-3 text-sm",
  tablet: "h-11 px-4 text-base",
  desktop: "h-12 px-4 text-base",
} as const;

export default {
  BREAKPOINTS,
  DEVICE_SIZES,
  TOUCH_TARGETS,
  RESPONSIVE_SPACING,
  RESPONSIVE_FONT_SIZES,
  RESPONSIVE_CONTAINER_WIDTHS,
  TYPOGRAPHY_SCALE,
  RESPONSIVE_BUTTON_SIZES,
  RESPONSIVE_INPUT_SIZES,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getDeviceType,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  getResponsiveGridColumns,
  getResponsiveSidebarWidth,
  getResponsivePadding,
  getResponsiveGap,
};
