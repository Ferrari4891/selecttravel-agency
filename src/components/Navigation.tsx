import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Menu, Home, Info, HelpCircle, Users, Building2, ChevronDown, ChevronRight, Search, Bookmark, User, LogOut, Heart, Globe, Shield, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import logo55Plus from '@/assets/55plus-logo.png';

interface NavigationProps {
  onMenuStateChange?: (isOpen: boolean) => void;
  forceMenuOpen?: boolean;
}

export const Navigation = ({ onMenuStateChange, forceMenuOpen }: NavigationProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [advertiseExpanded, setAdvertiseExpanded] = useState(false);
  const [toolboxExpanded, setToolboxExpanded] = useState(false);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
const { user } = useAuth();
  const { showLanguagePopup } = useLanguage();
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

  // Check admin status
  React.useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminEmail || !adminPassword) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Success",
          description: "Administrator logged in successfully.",
        });
        setMenuOpen(false);
        setAdminEmail('');
        setAdminPassword('');
        setAdminExpanded(false);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-4 justify-between px-4 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3 h-12 px-2 sm:px-3 hover:bg-gray-100 transition-colors cursor-pointer touch-target flex-1" onClick={() => window.location.href = '/'}>
          <img src={logo55Plus} alt="55+ Guides Logo" className="h-8 w-8 flex-shrink-0" />
          <span className="font-bold text-green-600 text-lg sm:text-2xl whitespace-nowrap flex-1 text-center">55plusguides.com</span>
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
              <div className="flex flex-col gap-1 pt-4 h-full overflow-y-auto">{/* Reduced gap from 3 to 1, pt from 6 to 4, added overflow */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-10 text-left touch-target" 
                  onClick={() => {
                    setMenuOpen(false);
                    window.location.href = '/';
                  }}
                >
                  <Home className="h-4 w-4 mr-2" />
                  <span className="text-sm">Home</span>
                 </Button>
                 <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                   <Link to="/about-us" onClick={() => setMenuOpen(false)}>
                     <Info className="h-4 w-4 mr-2" />
                     <span className="text-sm">About Us</span>
                   </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                  <Link to="/how-to" onClick={() => setMenuOpen(false)}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">How To</span>
                  </Link>
                </Button>
                
                {/* Public Member Section - moved after How To */}
                {!user && (
                  <Button variant="default" className="w-full justify-start h-11 text-left touch-target mb-1" asChild>
                    <Link to="/auth" onClick={() => setMenuOpen(false)}>
                      <User className="h-5 w-5 mr-2" />
                      <span className="text-base font-semibold">Join Free</span>
                    </Link>
                  </Button>
                )}
                
                {/* Advertise with dropdown */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-10 text-left touch-target" 
                  onClick={() => setAdvertiseExpanded(!advertiseExpanded)}
                >
                  <Info className="h-4 w-4 mr-2" />
                  <span className="text-sm">Advertise</span>
                  {advertiseExpanded ? (
                    <ChevronDown className="h-3 w-3 ml-auto" />
                  ) : (
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  )}
                </Button>
                
                {/* Advertise sub-menu */}
                {advertiseExpanded && (
                  <div className="ml-3 space-y-0">
                    <Button variant="ghost" className="w-full justify-start h-9 text-left touch-target" asChild>
                      <Link to="/advertise" onClick={() => setMenuOpen(false)}>
                        <Info className="h-4 w-4 mr-2" />
                        <span className="text-sm">Advertise Info</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-9 text-left touch-target" asChild>
                      <Link to="/roi" onClick={() => setMenuOpen(false)}>
                        <Info className="h-4 w-4 mr-2" />
                        <span className="text-sm">ROI Calculator</span>
                      </Link>
                    </Button>
                  </div>
                )}
                {/* Toolbox with dropdown */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-10 text-left touch-target" 
                  onClick={() => setToolboxExpanded(!toolboxExpanded)}
                >
                  <Info className="h-4 w-4 mr-2" />
                  <span className="text-sm">Toolbox</span>
                  {toolboxExpanded ? (
                    <ChevronDown className="h-3 w-3 ml-auto" />
                  ) : (
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  )}
                </Button>
                
                {/* Toolbox sub-menu */}
                {toolboxExpanded && (
                  <div className="ml-3 space-y-0">
                    <Button variant="ghost" className="w-full justify-start h-9 text-left touch-target" asChild>
                      <Link to="/toolbox" onClick={() => setMenuOpen(false)}>
                        <Info className="h-4 w-4 mr-2" />
                        <span className="text-sm">Toolbox Info</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-9 text-left touch-target" asChild>
                      <Link to="/visa-info" onClick={() => setMenuOpen(false)}>
                        <Info className="h-4 w-4 mr-2" />
                        <span className="text-sm">Visa Info</span>
                      </Link>
                    </Button>
                  </div>
                )}
                
                <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                  <Link to="/vouchers" onClick={() => setMenuOpen(false)}>
                    <Info className="h-4 w-4 mr-2" />
                    <span className="text-sm">Discount Vouchers</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                  <Link to="/tv-channel" onClick={() => setMenuOpen(false)}>
                    <Info className="h-4 w-4 mr-2" />
                    <span className="text-sm">TV Channel</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                  <Link to="/business-centre" onClick={() => setMenuOpen(false)}>
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="text-sm">Business Centre</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                  <Link to="/business-register" onClick={() => setMenuOpen(false)}>
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="text-sm">Add a Business</span>
                  </Link>
                </Button>
                 
                 <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                   <Link to="/flipbook-test" onClick={() => setMenuOpen(false)}>
                     <BookOpen className="h-4 w-4 mr-2" />
                     <span className="text-sm">Test Embed</span>
                   </Link>
                 </Button>
                 
                 {/* User Account Section - only show when logged in */}
                {user && (
                  <>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <p className="text-xs text-gray-600 mb-2 px-2">My Account</p>
                      <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          <span className="text-sm">Member Dashboard</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                        <Link to="/collections" onClick={() => setMenuOpen(false)}>
                          <Heart className="h-4 w-4 mr-2" />
                          <span className="text-sm">My Saved Places</span>
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-10 text-left touch-target mt-1" 
                        onClick={handleUserLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span className="text-sm">Logout</span>
                      </Button>
                    </div>
                  </>
                )}
                
                {/* Language Selector */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-10 text-left touch-target" 
                  onClick={() => {
                    showLanguagePopup();
                    setMenuOpen(false);
                  }}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="text-sm">Language / Idioma</span>
                </Button>
                
                {/* Site Logout Button */}
                <Button 
                  variant="destructive" 
                  className="w-full justify-start h-9 text-left touch-target mt-1" 
                  onClick={handleSiteLogout}
                >
                  <span className="text-sm">Site Logout</span>
                </Button>
                
                {/* Administrator Section */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-10 text-left touch-target" 
                    onClick={() => setAdminExpanded(!adminExpanded)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="text-sm">Administrator</span>
                    {adminExpanded ? (
                      <ChevronDown className="h-3 w-3 ml-auto" />
                    ) : (
                      <ChevronRight className="h-3 w-3 ml-auto" />
                    )}
                  </Button>
                  
                  {/* Administrator login form */}
                  {adminExpanded && (
                    <div className="ml-3 space-y-2 mt-2">
                      <form onSubmit={handleAdminLogin}>
                        <div className="space-y-2">
                          <Input
                            type="email"
                            placeholder="Administrator Email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            className="w-full h-9 text-sm"
                          />
                          <Input
                            type="password"
                            placeholder="Password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full h-9 text-sm"
                          />
                          <Button 
                            type="submit"
                            variant="default" 
                            className="w-full h-9 text-sm"
                          >
                            Submit
                          </Button>
                          <Button 
                            type="button"
                            variant="ghost" 
                            className="w-full h-8 text-xs text-gray-600"
                            onClick={() => {
                              toast({
                                title: "Forgot Password",
                                description: "Please contact system administrator for password reset.",
                              });
                            }}
                          >
                            Forgotten Password
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Admin Dashboard link - only show if logged in as admin */}
                  {isAdmin && (
                    <div className="ml-3 mt-1">
                      <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                        <Link to="/admin-dashboard" onClick={() => setMenuOpen(false)}>
                          <Shield className="h-4 w-4 mr-2" />
                          <span className="text-sm">Admin Dashboard</span>
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Business Login/Dashboard - Placed at bottom */}
                <div className="mt-auto pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2 px-2">Business Owners</p>
                  {user ? (
                    <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                      <Link to="/business-dashboard" onClick={() => setMenuOpen(false)}>
                        <Building2 className="h-4 w-4 mr-2" />
                        <span className="text-sm">Business Dashboard</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" className="w-full justify-start h-10 text-left touch-target" asChild>
                      <Link to="/business-login" onClick={() => setMenuOpen(false)}>
                        <Building2 className="h-4 w-4 mr-2" />
                        <span className="text-sm">Business Login</span>
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