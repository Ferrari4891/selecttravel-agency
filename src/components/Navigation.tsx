import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Info, HelpCircle, Users, Building2, ChevronDown, ChevronRight, Search, Bookmark, User, LogOut, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NavigationProps {
  onMenuStateChange?: (isOpen: boolean) => void;
  forceMenuOpen?: boolean;
}

export const Navigation = ({ onMenuStateChange, forceMenuOpen }: NavigationProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [advertiseExpanded, setAdvertiseExpanded] = useState(false);
  const [toolboxExpanded, setToolboxExpanded] = useState(false);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleMenuChange = (open: boolean) => {
    setMenuOpen(open);
    onMenuStateChange?.(open);
  };

  // Force open menu when requested from outside
  React.useEffect(() => {
    if (forceMenuOpen) {
      handleMenuChange(true);
    }
  }, [forceMenuOpen]);

  // Clean up auth state helper
  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  // Handle Supabase user logout
  const handleUserLogout = async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setMenuOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/';
    }
  };

  const handleSiteLogout = () => {
    localStorage.removeItem('siteAuthenticated');
    toast({
      title: "Logged Out",
      description: "You have been logged out of the site.",
    });
    setMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-4 justify-between px-4 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 h-12 px-2 sm:px-3 hover:bg-gray-100 transition-colors cursor-pointer touch-target" onClick={() => window.location.href = '/'}>
          <span className="font-bold text-black text-sm sm:text-lg">seniortravel.agency</span>
        </div>

      {/* Hamburger Menu */}
      <div>
        <Sheet open={menuOpen} onOpenChange={handleMenuChange}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="h-12 w-12 sm:h-12 sm:px-3 rounded-none border border-gray-300 touch-target bg-white hover:bg-gray-100"
              size="sm"
            >
              <Menu className="h-5 w-5 sm:h-4 sm:w-4 text-black" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-80 max-w-sm">
              <div className="flex flex-col gap-3 pt-6 h-full">{/* Added h-full for full height */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-left touch-target" 
                  onClick={() => {
                    setMenuOpen(false);
                    window.location.href = '/';
                  }}
                >
                  <Home className="h-5 w-5 mr-3" />
                  <span className="text-base">Home</span>
                 </Button>
                 <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                   <Link to="/about-us" onClick={() => setMenuOpen(false)}>
                     <Info className="h-5 w-5 mr-3" />
                     <span className="text-base">About Us</span>
                   </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                  <Link to="/how-to" onClick={() => setMenuOpen(false)}>
                    <HelpCircle className="h-5 w-5 mr-3" />
                    <span className="text-base">How To</span>
                  </Link>
                </Button>
                {/* Advertise with dropdown */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-left touch-target" 
                  onClick={() => setAdvertiseExpanded(!advertiseExpanded)}
                >
                  <Info className="h-5 w-5 mr-3" />
                  <span className="text-base">Advertise</span>
                  {advertiseExpanded ? (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Button>
                
                {/* Advertise sub-menu */}
                {advertiseExpanded && (
                  <div className="ml-4 space-y-1">
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/advertise" onClick={() => setMenuOpen(false)}>
                        <Info className="h-5 w-5 mr-3" />
                        <span className="text-base">Advertise Info</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/roi" onClick={() => setMenuOpen(false)}>
                        <Info className="h-5 w-5 mr-3" />
                        <span className="text-base">ROI Calculator</span>
                      </Link>
                    </Button>
                  </div>
                )}
                {/* Toolbox with dropdown */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-left touch-target" 
                  onClick={() => setToolboxExpanded(!toolboxExpanded)}
                >
                  <Info className="h-5 w-5 mr-3" />
                  <span className="text-base">Toolbox</span>
                  {toolboxExpanded ? (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Button>
                
                {/* Toolbox sub-menu */}
                {toolboxExpanded && (
                  <div className="ml-4 space-y-1">
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/toolbox" onClick={() => setMenuOpen(false)}>
                        <Info className="h-5 w-5 mr-3" />
                        <span className="text-base">Toolbox Info</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/visa-info" onClick={() => setMenuOpen(false)}>
                        <Info className="h-5 w-5 mr-3" />
                        <span className="text-base">Visa Info</span>
                      </Link>
                    </Button>
                  </div>
                )}
                
                <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                  <Link to="/tv-channel" onClick={() => setMenuOpen(false)}>
                    <Info className="h-5 w-5 mr-3" />
                    <span className="text-base">TV Channel</span>
                  </Link>
                </Button>
                
                {/* Member Section */}
                {!user ? (
                  <>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-sm text-gray-600 mb-3 px-2">Become a Member</p>
                      <Button variant="default" className="w-full justify-start h-14 text-left touch-target mb-2" asChild>
                        <Link to="/auth" onClick={() => setMenuOpen(false)}>
                          <User className="h-6 w-6 mr-3" />
                          <span className="text-lg font-semibold">Join Free</span>
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12 text-left touch-target" asChild>
                        <Link to="/auth" onClick={() => setMenuOpen(false)}>
                          <LogOut className="h-5 w-5 mr-3" />
                          <span className="text-base">Login</span>
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-sm text-gray-600 mb-3 px-2">My Account</p>
                      <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                        <Link to="/user-dashboard" onClick={() => setMenuOpen(false)}>
                          <User className="h-5 w-5 mr-3" />
                          <span className="text-base">My Dashboard</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                        <Link to="/collections" onClick={() => setMenuOpen(false)}>
                          <Heart className="h-5 w-5 mr-3" />
                          <span className="text-base">My Saved Places</span>
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-12 text-left touch-target mt-2" 
                        onClick={handleUserLogout}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span className="text-base">Logout</span>
                      </Button>
                    </div>
                  </>
                )}
                
                {/* Language Selector */}
                <LanguageSelector inMenu={true} onClose={() => setMenuOpen(false)} />
                
                {/* Site Logout Button */}
                <Button 
                  variant="destructive" 
                  className="w-full justify-start h-12 text-left touch-target mt-2" 
                  onClick={handleSiteLogout}
                >
                  <span className="text-base">Site Logout</span>
                </Button>
                
                {/* Business Login/Dashboard - Placed at bottom */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3 px-2">Business Owners</p>
                  {user ? (
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/business-dashboard" onClick={() => setMenuOpen(false)}>
                        <Building2 className="h-5 w-5 mr-3" />
                        <span className="text-base">Business Dashboard</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/auth" onClick={() => setMenuOpen(false)}>
                        <Building2 className="h-5 w-5 mr-3" />
                        <span className="text-base">Business Login</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};