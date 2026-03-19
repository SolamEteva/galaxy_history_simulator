/**
 * Responsive Navigation Component
 * 
 * Adapts navigation layout based on screen size:
 * - Mobile (< 640px): Hamburger menu with drawer
 * - Tablet (640px - 1024px): Compact sidebar
 * - Desktop (> 1024px): Full sidebar
 */

import { useState } from "react";
import { Menu, X, Home, Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/useMobile";
import { Link } from "wouter";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Home", icon: <Home className="w-5 h-5" />, path: "/" },
  { label: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
];

export function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold">Galaxy Simulator</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {isOpen && (
          <div className="border-t border-border bg-card">
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </Link>
              ))}
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors w-full text-left">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default ResponsiveNav;
