"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import DocsSidebar from "./Sidebar";
import Image from "next/image";

export default function DocsMobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Prevent scroll propagation when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Drawer Trigger (Hamburger Button) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 p-4 rounded-full bg-accent hover:bg-accent-hover text-white shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Open documentation menu"
      >
        <Menu size={20} />
        <span className="text-sm font-semibold tracking-wide">Menu</span>
      </button>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Drawer Container */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface/95 dark:bg-surface/95 backdrop-blur-3xl border-r border-border/50 p-6 shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Image
              src="/logonobg.png"
              alt="Sythoria"
              width={28}
              height={28}
              className="w-7 h-7"
            />
            <span className="text-base font-semibold text-text-primary">
              Docs Navigation
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-none pr-1">
          <DocsSidebar onItemClick={() => setIsOpen(false)} minimal={true} />
        </nav>
      </div>
    </>
  );
}
