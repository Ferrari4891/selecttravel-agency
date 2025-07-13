import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu, Home, Info, HelpCircle, Languages, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/components/TranslationProvider';

export const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Safe hook usage with fallback
  let translationState;
  try {
    translationState = useTranslation();
  } catch (error) {
    console.log('Translation context not available, using fallback');
    translationState = {
      currentLanguage: 'en',
      setLanguage: (lang: string) => console.log('Fallback setLanguage:', lang),
      isTranslating: false
    };
  }
  
  const { currentLanguage, setLanguage, isTranslating } = translationState;

  return (
    <div className="flex items-center gap-4 justify-start">
      {/* Hamburger Menu */}
      <div>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-none border border-primary">
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
              <div className="flex flex-col gap-2 pt-4 border-t">
                <div className="flex items-center gap-2 px-3">
                  {isTranslating ? (
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Languages className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Language</span>
                </div>
                <Select value={currentLanguage} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                    <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                    <SelectItem value="pt">🇵🇹 Português</SelectItem>
                    <SelectItem value="zh">🇨🇳 中文</SelectItem>
                    <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                    <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                    <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                    <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                    <SelectItem value="hi">🇮🇳 हिन्दी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Logo */}
      <div className="flex items-center gap-2 p-2 border border-primary hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => window.location.href = '/'} style={{"--primary": "200 98% 39%"} as React.CSSProperties}>
        <div className="w-8 h-8 bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">SGL</span>
        </div>
        <span className="font-bold text-primary text-lg">SmartGuides.Live</span>
      </div>
    </div>
  );
};