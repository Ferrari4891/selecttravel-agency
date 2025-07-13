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
  const [isGoogleTranslateLoaded, setIsGoogleTranslateLoaded] = useState(false);

  useEffect(() => {
    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    
    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,es,fr,de,it,pt,zh,ja,ko,ar,ru,hi',
          layout: 2, // Simple layout
          autoDisplay: false,
        },
        'google_translate_element'
      );
      setIsGoogleTranslateLoaded(true);
    };

    document.head.appendChild(script);

    // Get saved language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const setLanguage = (language: string) => {
    console.log('Setting language to:', language);
    setIsTranslating(true);
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language);
    
    // Add a delay to ensure Google Translate is loaded
    setTimeout(() => {
      // Trigger Google Translate
      if (isGoogleTranslateLoaded) {
        const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        console.log('Google Translate select element:', selectElement);
        
        if (selectElement) {
          selectElement.value = language;
          selectElement.dispatchEvent(new Event('change'));
          console.log('Language changed to:', language);
        } else {
          console.log('Google Translate select element not found');
        }
      } else {
        console.log('Google Translate not loaded yet');
      }
      
      // Hide translation loading after a delay
      setTimeout(() => {
        setIsTranslating(false);
      }, 1000);
    }, 500);
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, isTranslating }}>
      {children}
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
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