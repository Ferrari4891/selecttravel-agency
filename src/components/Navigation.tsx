import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Info, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-4 justify-start w-full">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu */}
        <div>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-12 px-3 rounded-none border border-primary">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col gap-4 pt-6">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => {
                    setMenuOpen(false);
                    window.location.href = '/';
                  }}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/about-us" onClick={() => setMenuOpen(false)}>
                    <Info className="h-4 w-4 mr-2" />
                    About Us
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/how-to" onClick={() => setMenuOpen(false)}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    How To
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/advertise" onClick={() => setMenuOpen(false)}>
                    <Info className="h-4 w-4 mr-2" />
                    Advertise
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/toolbox" onClick={() => setMenuOpen(false)}>
                    <Info className="h-4 w-4 mr-2" />
                    Toolbox
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/visa-info" onClick={() => setMenuOpen(false)}>
                    <Info className="h-4 w-4 mr-2" />
                    Visa Info
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2 h-12 px-3 border border-primary hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => window.location.href = '/'} style={{"--primary": "200 98% 39%"} as React.CSSProperties}>
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SGL</span>
          </div>
          <span className="font-bold text-primary text-lg">SmartGuides.Live</span>
        </div>

        {/* Google Translate Widget */}
        <div className="h-12 min-w-[200px] w-auto border border-primary hover:bg-primary/5 transition-colors" style={{"--primary": "200 98% 39%"} as React.CSSProperties}>
          <div id="google_translate_element" className="h-full flex items-center"></div>
        </div>
      </div>
    </div>
  );
};