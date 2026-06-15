"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PenLine, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",             label: "Stories" },
  { href: "/posts/create", label: "Write"   },
];

export function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full animate-in fade-in slide-in-from-top-2 duration-500",
        scrolled
          ? "border-b border-border/80 bg-background/95 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.04)]"
          : "bg-background/60 backdrop-blur-sm"
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">

        {/* ── Logo ─────────────────────────────── */}
        <Link
          href="/"
          className="group flex items-start gap-px select-none"
        >
          <span className="font-serif text-xl font-bold tracking-tight
            transition-opacity duration-200 group-hover:opacity-60">
            Inkwell
          </span>
          <sup className="mt-1.5 font-sans text-[9px] font-normal text-muted-foreground">
            ®
          </sup>
        </Link>

        {/* ── Center nav — desktop ─────────────── */}
        <ul className="hidden md:flex items-center gap-9 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "relative pb-px text-sm font-medium transition-colors duration-200",
                    /* animated underline */
                    "after:absolute after:bottom-0 after:left-0 after:h-[1.5px]",
                    "after:w-full after:bg-current",
                    "after:origin-left after:transition-transform after:duration-250 after:ease-out",
                    active
                      ? "text-foreground after:scale-x-100"
                      : "text-muted-foreground hover:text-foreground after:scale-x-0 hover:after:scale-x-100"
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── Right side ───────────────────────── */}
        <div className="flex items-center gap-3">

          {/* CTA — pill with shimmer on hover */}
          <Button
            asChild
            className="relative overflow-hidden rounded-full gap-2
              transition-transform duration-150 active:scale-95"
          >
            <Link href="/posts/create">
              {/* shimmer sweep */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0
                  -translate-x-full group-hover:translate-x-full
                  bg-gradient-to-r from-transparent via-white/20 to-transparent
                  transition-transform duration-700 ease-out"
              />
              <PenLine className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10 hidden sm:inline">Write Post</span>
              <span className="relative z-10 sm:hidden">Write</span>
            </Link>
          </Button>

          {/* Hamburger — animated icon swap */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="relative md:hidden h-8 w-8 flex items-center justify-center
              rounded-md hover:bg-muted transition-colors duration-150"
          >
            <Menu className={cn(
              "h-5 w-5 absolute transition-all duration-200",
              menuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
            )} />
            <X className={cn(
              "h-5 w-5 absolute transition-all duration-200",
              menuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
            )} />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu — smooth height reveal ── */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          menuOpen
            ? "max-h-48 border-t border-border/60 bg-background/95 backdrop-blur-xl"
            : "max-h-0"
        )}
      >
        <ul className="px-6 py-3 space-y-0.5 list-none m-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center py-2.5 text-sm font-medium transition-colors duration-150",
                  pathname === href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
