import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface-container-lowest)] border-t border-[var(--color-outline-variant)] pb-safe shadow-lg">
      <div className="flex items-center justify-around w-full max-w-[430px] mx-auto h-16 px-2">
        {items.map((item) => {
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href) && item.href !== '/dashboard' && item.href !== '/supplier/dashboard');
          // special case for dashboard since other routes might share prefixes, actually exact match or direct child is better
          // let's do exact match for dashboard, startswith for others
          const isActuallyActive = item.href === '/dashboard' || item.href === '/supplier/dashboard' ? location === item.href : location.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative cursor-pointer no-default-hover-elevate">
              <div 
                className={cn(
                  "flex items-center justify-center w-12 h-8 rounded-full transition-colors duration-200",
                  isActuallyActive ? "bg-[var(--color-secondary-container)]" : "bg-transparent hover:bg-[var(--color-surface-container-highest)]"
                )}
              >
                <span 
                  className={cn("material-icons text-2xl transition-colors duration-200", 
                    isActuallyActive ? "text-[var(--color-on-secondary-container)]" : "text-[var(--color-on-surface-variant)]"
                  )}
                >
                  {item.icon}
                </span>
              </div>
              <span 
                className={cn("text-[10px] font-medium transition-colors duration-200", 
                  isActuallyActive ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface-variant)]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
