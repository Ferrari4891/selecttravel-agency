import React, { createContext, useContext, useState, useEffect } from 'react';

interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (options: any, element: string) => any;
      };
    };
  }
}

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Get saved language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }

    // Load Google Translate script
    const existingScript = document.querySelector('script[src*="translate.google.com"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      
      // Initialize Google Translate
      window.googleTranslateElementInit = () => {
        console.log('Google Translate initialized');
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,es,fr,de,it,pt,zh,ja,ko,ar,ru,hi',
            layout: 2,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setIsScriptLoaded(true);
      };

      document.head.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  const setLanguage = (language: string) => {
    console.log('Setting language to:', language);
    setIsTranslating(true);
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language);
    
    // Try multiple methods to trigger translation
    setTimeout(() => {
      // Method 1: Direct Google Translate API call
      if (window.google && window.google.translate) {
        try {
          // Trigger translation by changing the select value
          const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
          console.log('Found select element:', selectElement);
          
          if (selectElement) {
            selectElement.value = language;
            const event = new Event('change', { bubbles: true });
            selectElement.dispatchEvent(event);
            console.log('Dispatched change event for language:', language);
          }
          
          // Method 2: Force page translation using Google's internal functions
          if ((window as any).google?.translate?.TranslateService) {
            const service = (window as any).google.translate.TranslateService.getInstance();
            if (service) {
              service.translatePage('en', language);
              console.log('Used TranslateService to translate to:', language);
            }
          }
        } catch (error) {
          console.error('Translation error:', error);
        }
      }
      
      // Method 3: URL-based translation (fallback)
      if (language !== 'en') {
        const currentUrl = window.location.href.split('#')[0];
        const translateUrl = `https://translate.google.com/translate?sl=en&tl=${language}&u=${encodeURIComponent(currentUrl)}`;
        console.log('Fallback: redirect to translate URL');
        // Don't actually redirect, just log for debugging
      }
      
      setTimeout(() => {
        setIsTranslating(false);
      }, 2000);
    }, 1000);
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, isTranslating }}>
      {children}
      {/* Visible Google Translate element for testing */}
      <div id="google_translate_element" style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        zIndex: 9999,
        background: 'white',
        padding: '10px',
        border: '1px solid #ccc'
      }}></div>
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};