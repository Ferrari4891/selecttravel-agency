import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Info, HelpCircle, Users, Building2, ChevronDown, ChevronRight, Search, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
    <div className="flex items-center gap-2 sm:gap-4 justify-between w-full p-4 bg-transparent absolute top-0 left-0 right-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 h-12 px-2 sm:px-3 border border-white hover:bg-white/10 transition-colors cursor-pointer touch-target" onClick={() => window.location.href = '/'}>
        <div className="w-8 h-8 bg-white flex items-center justify-center">
          <span className="text-black font-bold text-xs sm:text-sm">STA</span>
        </div>
        <span className="font-bold text-white text-sm sm:text-lg hidden xs:block sm:block">seniortravel.agency</span>
        <span className="font-bold text-white text-sm block xs:hidden sm:hidden">STA</span>
      </div>

      {/* Hamburger Menu */}
      <div>
        <Sheet open={menuOpen} onOpenChange={handleMenuChange}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="h-12 w-12 sm:h-12 sm:px-3 rounded-none border border-white touch-target bg-black hover:bg-black/80"
              size="sm"
            >
              <Menu className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
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
                
                {/* Dashboard with dropdown */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-left touch-target" 
                  onClick={() => setDashboardExpanded(!dashboardExpanded)}
                >
                  <Users className="h-5 w-5 mr-3" />
                  <span className="text-base">Dashboard</span>
                  {dashboardExpanded ? (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Button>
                
                {/* Dashboard sub-menu */}
                {dashboardExpanded && (
                  <div className="ml-4 space-y-1">
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                        <Users className="h-5 w-5 mr-3" />
                        <span className="text-base">Dashboard Info</span>
                      </Link>
                    </Button>
                     {!user && (
                       <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                         <Link to="/join-free" onClick={() => setMenuOpen(false)}>
                           <Users className="h-5 w-5 mr-3" />
                           <span className="text-base">Join Free</span>
                         </Link>
                       </Button>
                     )}
                     {user && (
                       <>
                         <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                           <Link to="/user-dashboard" onClick={() => setMenuOpen(false)}>
                             <Users className="h-5 w-5 mr-3" />
                             <span className="text-base">My Preferences</span>
                           </Link>
                         </Button>
                         <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                           <Link to="/collections" onClick={() => setMenuOpen(false)}>
                             <Bookmark className="h-5 w-5 mr-3" />
                             <span className="text-base">My Collections</span>
                           </Link>
                         </Button>
                       </>
                     )}
                  </div>
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
                  {user ? (
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                        <Link to="/business-dashboard" onClick={() => setMenuOpen(false)}>
                          <Building2 className="h-5 w-5 mr-3" />
                          <span className="text-base">Business Dashboard</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                        <Link to="/collections" onClick={() => setMenuOpen(false)}>
                          <Bookmark className="h-5 w-5 mr-3" />
                          <span className="text-base">My Collections</span>
                        </Link>
                      </Button>
                    </div>
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
  );
};