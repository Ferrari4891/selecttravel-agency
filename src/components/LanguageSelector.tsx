import React, { useState, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/components/TranslationProvider';

const languages = [
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'it', name: 'Italiano', flag: 'IT' },
  { code: 'pt', name: 'Português', flag: 'PT' },
  { code: 'zh', name: '中文', flag: 'CN' },
  { code: 'ja', name: '日本語', flag: 'JP' },
  { code: 'ko', name: '한국어', flag: 'KR' },
  { code: 'ar', name: 'العربية', flag: 'SA' },
  { code: 'ru', name: 'Русский', flag: 'RU' },
  { code: 'hi', name: 'हिंदी', flag: 'IN' },
];

interface LanguageSelectorProps {
  inMenu?: boolean;
  onClose?: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ inMenu = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { currentLanguage, setLanguage, isTranslating } = useTranslation();

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  useEffect(() => {
    // Check if Google Translate is ready
    const checkReady = () => {
      const element = document.querySelector('.goog-te-combo');
      if (element || document.querySelector('#google_translate_element .goog-te-combo')) {
        setIsReady(true);
      } else {
        setTimeout(checkReady, 500);
      }
    };
    
    setTimeout(checkReady, 1000);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    if (isReady) {
      setLanguage(langCode);
      setIsOpen(false);
      onClose?.();
    }
  };

  if (inMenu) {
    return (
      <div className="w-full">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-left p-0 h-auto"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 p-2 w-full">
            <Globe className="h-4 w-4" />
            <span>Language</span>
            <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </Button>
        
        {isOpen && (
          <div className="mt-2 ml-6 space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center gap-3 w-full p-2 text-sm rounded hover:bg-muted/50 transition-colors ${
                  currentLanguage === lang.code ? 'bg-muted font-medium' : ''
                }`}
                disabled={isTranslating}
              >
                <span className="text-xs font-bold bg-primary text-primary-foreground px-1 rounded">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* Hidden Google Translate element */}
        <div className="hidden">
          <div id="google_translate_element"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-3 border border-border/50 hover:bg-muted/50 transition-colors rounded"
        disabled={isTranslating}
      >
        <span className="text-xs font-bold bg-primary text-primary-foreground px-1 rounded">{currentLang.flag}</span>
        <span className="text-sm font-medium">{currentLang.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-sm z-50 max-h-60 overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-2 w-full p-3 text-sm hover:bg-muted transition-colors ${
                currentLanguage === lang.code ? 'bg-muted font-medium' : ''
              }`}
              disabled={isTranslating}
            >
              <span className="text-xs font-bold bg-primary text-primary-foreground px-1 rounded">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Hidden Google Translate element for top menu */}
      <div className="hidden">
        <div id="google_translate_element"></div>
      </div>
    </div>
  );
};