import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Info, HelpCircle, Users, Building2, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  onMenuStateChange?: (isOpen: boolean) => void;
  forceMenuOpen?: boolean;
}

export const Navigation = ({ onMenuStateChange, forceMenuOpen }: NavigationProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [advertiseExpanded, setAdvertiseExpanded] = useState(false);
  const [toolboxExpanded, setToolboxExpanded] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState(false);
  const { user } = useAuth();

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

  return (
    <div className="flex items-center gap-2 sm:gap-4 justify-start w-full">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Hamburger Menu */}
        <div>
          <Sheet open={menuOpen} onOpenChange={handleMenuChange}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="h-12 w-12 sm:h-12 sm:px-3 rounded-none border border-primary touch-target"
                size="sm"
              >
                <Menu className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-80 max-w-sm">
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
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/tv-channel" onClick={() => setMenuOpen(false)}>
                        <Info className="h-5 w-5 mr-3" />
                        <span className="text-base">TV Channel</span>
                      </Link>
                    </Button>
                  </div>
                )}
                
                {/* Members with dropdown */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-left touch-target" 
                  onClick={() => setMembersExpanded(!membersExpanded)}
                >
                  <Users className="h-5 w-5 mr-3" />
                  <span className="text-base">Members</span>
                  {membersExpanded ? (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Button>
                
                {/* Members sub-menu */}
                {membersExpanded && (
                  <div className="ml-4 space-y-1">
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/members" onClick={() => setMenuOpen(false)}>
                        <Users className="h-5 w-5 mr-3" />
                        <span className="text-base">Members Info</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/join-free" onClick={() => setMenuOpen(false)}>
                        <Users className="h-5 w-5 mr-3" />
                        <span className="text-base">Join Free</span>
                      </Link>
                    </Button>
                  </div>
                )}
                
                {/* Language Selector */}
                <LanguageSelector inMenu={true} onClose={() => setMenuOpen(false)} />
                
                {/* Business Login/Dashboard - Placed at bottom */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  {user ? (
                    <Button variant="ghost" className="w-full justify-start h-12 text-left touch-target" asChild>
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
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

        {/* Logo */}
        <div className="flex items-center gap-2 h-12 px-2 sm:px-3 border border-primary hover:bg-primary/5 transition-colors cursor-pointer touch-target" onClick={() => window.location.href = '/'} style={{"--primary": "200 98% 39%"} as React.CSSProperties}>
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs sm:text-sm">SGL</span>
          </div>
          <span className="font-bold text-primary text-sm sm:text-lg hidden xs:block sm:block">SmartGuides.Live</span>
          <span className="font-bold text-primary text-sm block xs:hidden sm:hidden">SGL</span>
        </div>
      </div>
    </div>
  );
};