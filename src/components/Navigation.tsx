import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu, Home, Info, HelpCircle, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 justify-start items-start">
      {/* Logo */}
      <div className="flex items-center gap-2 p-2 border border-primary hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => window.location.href = '/'}>
        <div className="w-8 h-8 bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-sm">SG</span>
        </div>
        <span className="font-bold text-primary text-lg">SmartGuides.live</span>
      </div>
      
      {/* Hamburger Menu */}
      <div>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-none">
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
              <div className="flex flex-col gap-2 pt-4 border-t">
                <div className="flex items-center gap-2 px-3">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Language</span>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};