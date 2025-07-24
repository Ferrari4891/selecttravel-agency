import React, { useState, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/components/TranslationProvider';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
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
    console.log('Language change requested:', langCode);
    setLanguage(langCode);
    setIsOpen(false);
    onClose?.();
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
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        )}
        
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-3 hover:bg-white/10 transition-all duration-200 rounded-md text-white group"
        disabled={isTranslating}
        title="Select Language"
      >
        <Globe className="h-5 w-5 text-white group-hover:text-white/80" />
        <span className="text-sm font-medium text-white hidden sm:inline">
          {currentLang.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center gap-3 w-full p-3 text-left rounded-md transition-all duration-150 ${
                  currentLanguage === lang.code 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                disabled={isTranslating}
              >
                <span className="text-lg flex-shrink-0">{lang.flag}</span>
                <span className="text-sm">{lang.name}</span>
                {currentLanguage === lang.code && (
                  <span className="ml-auto text-blue-600 text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};