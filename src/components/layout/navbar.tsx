// @ts-nocheck
// TODO: Fix types
"use client";

import Link from 'next/link';
import { ScanSearch, Tag, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const NavLink = ({ href, children, onClick }) => (
  <Link href={href} passHref>
    <Button variant="ghost" className="text-sm font-medium" onClick={onClick}>
      {children}
    </Button>
  </Link>
);

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" passHref>
          <div className="flex items-center gap-2 cursor-pointer">
            <ScanSearch className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">ItemCheck AI</h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <NavLink href="/pricing">
            <Tag className="mr-2 h-4 w-4" /> Pricing
          </NavLink>
          <NavLink href="/login">
            <LogIn className="mr-2 h-4 w-4" /> Login
          </NavLink>
          <NavLink href="/signup">
            <UserPlus className="mr-2 h-4 w-4" /> Sign Up
          </NavLink>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
              <div className="flex flex-col space-y-4">
                <Link href="/" passHref>
                  <div className="flex items-center gap-2 cursor-pointer mb-4" onClick={closeMobileMenu}>
                    <ScanSearch className="h-7 w-7 text-primary" />
                    <h1 className="text-lg font-bold">ItemCheck AI</h1>
                  </div>
                </Link>
                <NavLink href="/pricing" onClick={closeMobileMenu}>
                  <Tag className="mr-2 h-4 w-4" /> Pricing
                </NavLink>
                <NavLink href="/login" onClick={closeMobileMenu}>
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </NavLink>
                <NavLink href="/signup" onClick={closeMobileMenu}>
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </NavLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
