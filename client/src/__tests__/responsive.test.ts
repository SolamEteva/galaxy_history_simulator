import { describe, it, expect } from "vitest";
import {
  BREAKPOINTS,
  DEVICE_SIZES,
  TOUCH_TARGETS,
  getDeviceType,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  getResponsiveGridColumns,
  getResponsiveSidebarWidth,
  getResponsiveSpacing,
  getResponsiveFontSize,
} from "../lib/responsive";

describe("Responsive Design Utilities", () => {
  describe("Breakpoints", () => {
    it("should define correct breakpoint values", () => {
      expect(BREAKPOINTS.xs).toBe(0);
      expect(BREAKPOINTS.sm).toBe(640);
      expect(BREAKPOINTS.md).toBe(768);
      expect(BREAKPOINTS.lg).toBe(1024);
      expect(BREAKPOINTS.xl).toBe(1280);
      expect(BREAKPOINTS["2xl"]).toBe(1536);
    });

    it("should have device size ranges", () => {
      expect(DEVICE_SIZES.mobile.max).toBe(BREAKPOINTS.sm - 1);
      expect(DEVICE_SIZES.tablet.min).toBe(BREAKPOINTS.sm);
      expect(DEVICE_SIZES.tablet.max).toBe(BREAKPOINTS.lg - 1);
      expect(DEVICE_SIZES.desktop.min).toBe(BREAKPOINTS.lg);
    });
  });

  describe("Touch Targets", () => {
    it("should have WCAG-compliant minimum touch target size", () => {
      expect(TOUCH_TARGETS.default).toBe(44);
      expect(TOUCH_TARGETS.default).toBeGreaterThanOrEqual(44);
    });

    it("should provide multiple touch target sizes", () => {
      expect(TOUCH_TARGETS.small).toBe(36);
      expect(TOUCH_TARGETS.large).toBe(48);
      expect(TOUCH_TARGETS.xlarge).toBe(56);
    });
  });

  describe("Device Type Detection", () => {
    it("should detect mobile viewports", () => {
      expect(getDeviceType(375)).toBe("mobile");
      expect(getDeviceType(390)).toBe("mobile");
      expect(getDeviceType(430)).toBe("mobile");
      expect(getDeviceType(639)).toBe("mobile");
    });

    it("should detect tablet viewports", () => {
      expect(getDeviceType(640)).toBe("tablet");
      expect(getDeviceType(768)).toBe("tablet");
      expect(getDeviceType(810)).toBe("tablet");
      expect(getDeviceType(1023)).toBe("tablet");
    });

    it("should detect desktop viewports", () => {
      expect(getDeviceType(1024)).toBe("desktop");
      expect(getDeviceType(1366)).toBe("desktop");
      expect(getDeviceType(1920)).toBe("desktop");
      expect(getDeviceType(2560)).toBe("desktop");
    });
  });

  describe("Viewport Detection Functions", () => {
    it("should correctly identify mobile viewports", () => {
      expect(isMobileViewport(375)).toBe(true);
      expect(isMobileViewport(640)).toBe(false);
      expect(isMobileViewport(1024)).toBe(false);
    });

    it("should correctly identify tablet viewports", () => {
      expect(isTabletViewport(375)).toBe(false);
      expect(isTabletViewport(640)).toBe(true);
      expect(isTabletViewport(810)).toBe(true);
      expect(isTabletViewport(1024)).toBe(false);
    });

    it("should correctly identify desktop viewports", () => {
      expect(isDesktopViewport(375)).toBe(false);
      expect(isDesktopViewport(640)).toBe(false);
      expect(isDesktopViewport(1024)).toBe(true);
      expect(isDesktopViewport(1920)).toBe(true);
    });
  });

  describe("Responsive Grid Columns", () => {
    it("should return 1 column for mobile", () => {
      expect(getResponsiveGridColumns(375)).toBe(1);
      expect(getResponsiveGridColumns(430)).toBe(1);
    });

    it("should return 2 columns for tablet", () => {
      expect(getResponsiveGridColumns(640)).toBe(2);
      expect(getResponsiveGridColumns(768)).toBe(2);
      expect(getResponsiveGridColumns(810)).toBe(2);
    });

    it("should return 3 columns for desktop", () => {
      expect(getResponsiveGridColumns(1024)).toBe(3);
      expect(getResponsiveGridColumns(1366)).toBe(3);
    });

    it("should return 4 columns for large desktop", () => {
      expect(getResponsiveGridColumns(1920)).toBe(4);
      expect(getResponsiveGridColumns(2560)).toBe(4);
    });
  });

  describe("Responsive Sidebar Width", () => {
    it("should hide sidebar on mobile", () => {
      expect(getResponsiveSidebarWidth(375)).toBe(0);
      expect(getResponsiveSidebarWidth(430)).toBe(0);
    });

    it("should use compact sidebar on tablet", () => {
      expect(getResponsiveSidebarWidth(640)).toBe(200);
      expect(getResponsiveSidebarWidth(810)).toBe(200);
    });

    it("should use full sidebar on desktop", () => {
      expect(getResponsiveSidebarWidth(1024)).toBe(280);
      expect(getResponsiveSidebarWidth(1920)).toBe(280);
    });
  });

  describe("Responsive Spacing", () => {
    it("should provide mobile spacing values", () => {
      const spacing = getResponsiveSpacing("md", "mobile");
      expect(spacing).toBe(12);
    });

    it("should provide tablet spacing values", () => {
      const spacing = getResponsiveSpacing("md", "tablet");
      expect(spacing).toBe(16);
    });

    it("should provide desktop spacing values", () => {
      const spacing = getResponsiveSpacing("md", "desktop");
      expect(spacing).toBe(20);
    });

    it("should scale spacing appropriately", () => {
      const mobileSpacing = getResponsiveSpacing("lg", "mobile");
      const tabletSpacing = getResponsiveSpacing("lg", "tablet");
      const desktopSpacing = getResponsiveSpacing("lg", "desktop");

      expect(mobileSpacing).toBeLessThan(tabletSpacing);
      expect(tabletSpacing).toBeLessThan(desktopSpacing);
    });
  });

  describe("Responsive Font Sizes", () => {
    it("should provide mobile font sizes", () => {
      const fontSize = getResponsiveFontSize("base", "mobile");
      expect(fontSize).toBe(16);
    });

    it("should provide tablet font sizes", () => {
      const fontSize = getResponsiveFontSize("base", "tablet");
      expect(fontSize).toBe(16);
    });

    it("should provide desktop font sizes", () => {
      const fontSize = getResponsiveFontSize("base", "desktop");
      expect(fontSize).toBe(16);
    });

    it("should scale headings appropriately", () => {
      const mobileH1 = getResponsiveFontSize("3xl", "mobile");
      const tabletH1 = getResponsiveFontSize("3xl", "tablet");
      const desktopH1 = getResponsiveFontSize("3xl", "desktop");

      expect(mobileH1).toBeLessThanOrEqual(tabletH1);
      expect(tabletH1).toBeLessThanOrEqual(desktopH1);
    });
  });

  describe("Common Mobile Devices", () => {
    const devices = [
      { name: "iPhone SE", width: 375 },
      { name: "iPhone 12/13", width: 390 },
      { name: "iPhone 14 Pro Max", width: 430 },
      { name: "Samsung Galaxy S21", width: 360 },
      { name: "Google Pixel 6", width: 412 },
    ];

    devices.forEach(({ name, width }) => {
      it(`should handle ${name} (${width}px)`, () => {
        expect(getDeviceType(width)).toBe("mobile");
        expect(isMobileViewport(width)).toBe(true);
        expect(getResponsiveGridColumns(width)).toBe(1);
        expect(getResponsiveSidebarWidth(width)).toBe(0);
      });
    });
  });

  describe("Common Tablet Devices", () => {
    const devices = [
      { name: "iPad Mini", width: 768 },
      { name: "iPad", width: 810 },
      { name: "iPad Pro 11\"", width: 834 },
      { name: "iPad Pro 12.9\"", width: 1024 },
    ];

    devices.forEach(({ name, width }) => {
      it(`should handle ${name} (${width}px)`, () => {
        const deviceType = getDeviceType(width);
        expect(["tablet", "desktop"]).toContain(deviceType);
        expect(getResponsiveGridColumns(width)).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe("Common Desktop Displays", () => {
    const devices = [
      { name: "Small Laptop", width: 1024 },
      { name: "Standard Laptop", width: 1366 },
      { name: "Full HD", width: 1920 },
      { name: "4K", width: 2560 },
    ];

    devices.forEach(({ name, width }) => {
      it(`should handle ${name} (${width}px)`, () => {
        expect(getDeviceType(width)).toBe("desktop");
        expect(isDesktopViewport(width)).toBe(true);
        expect(getResponsiveSidebarWidth(width)).toBe(280);
      });
    });
  });
});
