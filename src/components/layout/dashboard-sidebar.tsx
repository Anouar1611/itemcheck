
'use client';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScanSearch, Tag, LogIn, UserPlus, Home, Settings, LogOut, PanelLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NavLinkContent = ({ icon, label }: { icon: React.ReactNode; label: string }) => {
  const { state } = useSidebar();
  return (
    <>
      {icon}
      {state === 'expanded' && <span>{label}</span>}
    </>
  );
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { toggleSidebar, state } = useSidebar();

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      // router.push('/'); // Or to login page
    } catch (error: any) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };


  if (!isMounted) {
    // Avoid rendering sidebar content prematurely to prevent hydration issues
    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="p-2 flex items-center justify-between">
                 {state === 'expanded' && (
                    <Link href="/" className="flex items-center gap-2" aria-label="ItemCheck AI Home">
                        <ScanSearch className="h-7 w-7 text-primary" />
                        <h1 className="text-xl font-semibold">ItemCheck AI</h1>
                    </Link>
                 )}
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground hover:text-sidebar-accent-foreground">
                    <PanelLeft size={20} />
                </Button>
            </SidebarHeader>
        </Sidebar>
    );
  }


  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" variant="sidebar">
      <SidebarHeader className="p-2 flex items-center justify-between">
         {state === 'expanded' && (
            <Link href="/" className="flex items-center gap-2" aria-label="ItemCheck AI Home">
                <ScanSearch className="h-7 w-7 text-primary" />
                <h1 className="text-xl font-semibold">ItemCheck AI</h1>
            </Link>
         )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground hover:text-sidebar-accent-foreground">
            <PanelLeft size={20} />
        </Button>
      </SidebarHeader>

      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" legacyBehavior passHref>
              <SidebarMenuButton asChild isActive={pathname === '/'} tooltip={state === 'collapsed' ? 'Home' : undefined}>
                <a><NavLinkContent icon={<Home size={18}/>} label="Analyze"/></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/pricing" legacyBehavior passHref>
              <SidebarMenuButton asChild isActive={pathname === '/pricing'} tooltip={state === 'collapsed' ? 'Pricing' : undefined}>
                <a><NavLinkContent icon={<Tag size={18}/>} label="Pricing"/></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 mt-auto">
        {user ? (
          <div className="space-y-2">
            {state === 'expanded' && (
                 <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} data-ai-hint="user profile" />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-foreground">{user.displayName || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            )}
            <SidebarMenuButton onClick={handleLogout} tooltip={state === 'collapsed' ? 'Logout' : undefined} >
              <NavLinkContent icon={<LogOut size={18}/>} label="Logout"/>
            </SidebarMenuButton>
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/login" legacyBehavior passHref>
                <SidebarMenuButton asChild isActive={pathname === '/login'} tooltip={state === 'collapsed' ? 'Login' : undefined}>
                  <a><NavLinkContent icon={<LogIn size={18}/>} label="Login"/></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/signup" legacyBehavior passHref>
                <SidebarMenuButton asChild isActive={pathname === '/signup'} tooltip={state === 'collapsed' ? 'Sign Up' : undefined}>
                  <a><NavLinkContent icon={<UserPlus size={18}/>} label="Sign Up"/></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
