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
        TranslateElement: {
          new (options: any, element: string): any;
          InlineLayout: {
            SIMPLE: number;
            HORIZONTAL: number;
            VERTICAL: number;
          };
        };
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

    // Load Google Translate script only once
    if (!window.google?.translate?.TranslateElement) {
      // Initialize Google Translate callback first
      window.googleTranslateElementInit = () => {
        console.log('Google Translate initialized');
        
        // Create the translate element in a visible but hidden container
        const container = document.getElementById('google_translate_element');
        if (container && window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,de,it,pt,zh-cn,ja,ko,ar,ru,hi',
              layout: 2,
              autoDisplay: false,
              multilanguagePage: true
            },
            'google_translate_element'
          );
          setIsScriptLoaded(true);
          console.log('Google Translate element created');
        }
      };

      // Load the script
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => console.error('Failed to load Google Translate script');
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
    
    // Map language codes to Google Translate format
    const languageMap: { [key: string]: string } = {
      'en': 'en',
      'es': 'es', 
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt',
      'zh': 'zh-cn',
      'ja': 'ja',
      'ko': 'ko',
      'ar': 'ar',
      'ru': 'ru',
      'hi': 'hi'
    };

    const googleLangCode = languageMap[language] || language;
    
    // Function to attempt translation
    const attemptTranslation = (retryCount = 0) => {
      // Look for both possible selectors
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement || 
                           document.querySelector('select.goog-te-combo') as HTMLSelectElement ||
                           document.querySelector('#\\:0\\.targetLanguage') as HTMLSelectElement ||
                           document.querySelector('select[class*="goog-te"]') as HTMLSelectElement;
      
      console.log('Attempting translation, retry:', retryCount, 'select found:', !!selectElement);
      console.log('Available selects:', document.querySelectorAll('select').length);
      
      if (selectElement) {
        console.log('Current select value:', selectElement.value);
        console.log('Target language code:', googleLangCode);
        
        try {
          // Set the value directly
          selectElement.value = googleLangCode;
          
          // Trigger multiple events to ensure Google Translate responds
          const events = ['change', 'input', 'click'];
          events.forEach(eventType => {
            const event = new Event(eventType, { 
              bubbles: true, 
              cancelable: true 
            });
            selectElement.dispatchEvent(event);
          });
          
          console.log('Translation events dispatched for:', googleLangCode);
          setTimeout(() => setIsTranslating(false), 2000);
          
        } catch (error) {
          console.error('Error during translation:', error);
          setIsTranslating(false);
        }
      } else if (retryCount < 10) {
        // Increase retry attempts and check more frequently
        console.log('Retrying in', (retryCount + 1) * 500, 'ms');
        setTimeout(() => attemptTranslation(retryCount + 1), (retryCount + 1) * 500);
      } else {
        console.error('Google Translate element not found after multiple retries');
        console.log('All selects on page:', Array.from(document.querySelectorAll('select')).map(s => ({
          id: s.id,
          className: s.className,
          value: s.value
        })));
        setIsTranslating(false);
      }
    };

    // Start translation attempt immediately if script is ready
    if (isScriptLoaded) {
      attemptTranslation();
    } else {
      // Wait for script to load
      setTimeout(attemptTranslation, 1000);
    }
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, isTranslating }}>
      {children}
      {/* Google Translate element - positioned off-screen but accessible */}
      <div 
        id="google_translate_element" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      ></div>
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