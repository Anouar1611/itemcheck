
"use client";

import Link from 'next/link';
import { ScanSearch, Tag, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const NavLink = ({ href, children, onClick, isActive }: { href: string, children: React.ReactNode, onClick?: () => void, isActive?: boolean}) => (
  <Link href={href} passHref>
    <Button 
      variant={isActive ? "secondary" : "ghost"} 
      className={`justify-start text-sm font-medium w-full ${isActive ? 'text-primary-foreground bg-primary hover:bg-primary/90' : 'text-foreground hover:bg-muted/50'}`} 
      onClick={onClick}
    >
      {children}
    </Button>
  </Link>
);

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);


  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMobileMenu();
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  // Prevent rendering on server or before mount to avoid hydration mismatch with auth state
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
           <Link href="/" passHref>
            <div className="flex items-center gap-2 cursor-pointer">
              <ScanSearch className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">ItemCheck AI</h1>
            </div>
          </Link>
          <div className="h-8 w-8 animate-pulse bg-muted rounded-full md:hidden"></div>
        </div>
      </header>
    );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" passHref>
          <div className="flex items-center gap-2 cursor-pointer">
            <ScanSearch className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">ItemCheck AI</h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {user ? (
            <>
              <Button variant="ghost" onClick={handleLogout} className="text-sm font-medium text-foreground hover:bg-muted/50">
                <LogIn className="mr-2 h-4 w-4" /> Logout
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} data-ai-hint="user profile"/>
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
            </>
          ) : (
            <>
              <NavLink href="/login" isActive={pathname === '/login'}>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </NavLink>
              <NavLink href="/signup" isActive={pathname === '/signup'}>
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted/50">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-card p-6 border-l border-border">
              <div className="flex flex-col space-y-2">
                <Link href="/" passHref>
                  <div className="flex items-center gap-2 cursor-pointer mb-4" onClick={closeMobileMenu}>
                    <ScanSearch className="h-7 w-7 text-primary" />
                    <h1 className="text-lg font-bold text-card-foreground">ItemCheck AI</h1>
                  </div>
                </Link>
                <NavLink href="/" onClick={closeMobileMenu} isActive={pathname === '/'}>
                  <ScanSearch className="mr-2 h-4 w-4" /> Analyze
                </NavLink>
                <hr className="my-2 border-border"/>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} data-ai-hint="user profile small"/>
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium text-card-foreground">{user.displayName || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={handleLogout} className="justify-start text-sm font-medium w-full text-foreground hover:bg-muted/50">
                      <LogIn className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <NavLink href="/login" onClick={closeMobileMenu} isActive={pathname === '/login'}>
                      <LogIn className="mr-2 h-4 w-4" /> Login
                    </NavLink>
                    <NavLink href="/signup" onClick={closeMobileMenu} isActive={pathname === '/signup'}>
                      <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                    </NavLink>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
