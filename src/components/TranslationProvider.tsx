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
        
        // Try to find any google_translate_element
        const elements = document.querySelectorAll('#google_translate_element');
        const targetElement = elements[elements.length - 1]; // Use the last one found
        
        if (targetElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,de,it,pt,zh,ja,ko,ar,ru,hi',
              layout: 2,
              autoDisplay: false,
            },
            targetElement.id
          );
        }
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
    
    // Wait a bit for Google Translate to be ready
    setTimeout(() => {
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      console.log('Found Google Translate select:', selectElement);
      
      if (selectElement) {
        // Set the value and trigger the change event
        selectElement.value = language;
        
        // Create and dispatch a proper change event
        const changeEvent = new Event('change', { 
          bubbles: true, 
          cancelable: true 
        });
        selectElement.dispatchEvent(changeEvent);
        
        // Also try triggering with input event
        const inputEvent = new Event('input', { 
          bubbles: true, 
          cancelable: true 
        });
        selectElement.dispatchEvent(inputEvent);
        
        console.log('Triggered Google Translate for language:', language);
        
        // Set translating to false after a delay
        setTimeout(() => {
          setIsTranslating(false);
        }, 1500);
      } else {
        console.log('Google Translate select not found, trying again...');
        // Retry after a longer delay
        setTimeout(() => {
          const retrySelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
          if (retrySelect) {
            retrySelect.value = language;
            retrySelect.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('Retry successful for language:', language);
          }
          setIsTranslating(false);
        }, 2000);
      }
    }, 500);
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, isTranslating }}>
      {children}
      {/* Google Translate element will be rendered in Navigation */}
      <div id="google_translate_element_placeholder" style={{ display: 'none' }}></div>
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