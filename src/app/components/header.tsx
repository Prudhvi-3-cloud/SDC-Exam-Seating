"use client";

import { useState } from "react";
import { Phone, Mail, User, LogIn, Shield, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#admissions", label: "Admissions" },
  { href: "#academics", label: "Academics" },
  { href: "#departments", label: "Departments" },
  { href: "#placements", label: "Placements" },
  { href: "#campus", label: "Campus Life" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <header className="w-full">
      {/* Top Utility Bar */}
      <div className="bg-muted py-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center text-sm">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>+91 123 456 7890</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>info@srit.edu.in</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="/login?role=student"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Student Login</span>
            </a>
            <a
              href="/login?role=faculty"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Faculty Login</span>
            </a>
            <a
              href="/login?role=admin"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Login</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and College Name */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                <img
                  src="/srit-logo.png"
                  alt="SRIT logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl text-primary">SRIT</h1>
                <p className="text-sm text-muted-foreground truncate">
                  Srinivasa Ramanujan Institute of Technology
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md border px-3 py-2 text-foreground hover:text-primary hover:border-primary transition-colors"
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-primary-nav"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>

          {/* Mobile Navigation Panel */}
          {isMobileNavOpen ? (
            <nav
              id="mobile-primary-nav"
              className="md:hidden grid gap-2 pt-3"
              aria-label="Mobile navigation"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-md border px-3 py-2 text-foreground hover:text-primary hover:border-primary transition-colors"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
