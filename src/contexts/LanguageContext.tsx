import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getLanguagePreference, setLanguagePreference, shouldShowLangPopup, shouldShowCookieConsent } from '@/utils/cookies';
import { LanguagePopup } from '@/components/LanguagePopup';
import { CookieConsent } from '@/components/CookieConsent';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => Promise<void>;
  showLanguagePopup: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [showLangPopup, setShowLangPopup] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language preference
  useEffect(() => {
    const initializeLanguage = async () => {
      let preferredLanguage = 'en';

      // Check user profile first if logged in
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('user_id', user.id)
            .single();
          
          if (profile?.preferred_language) {
            preferredLanguage = profile.preferred_language;
          }
        } catch (error) {
          console.error('Error fetching user language preference:', error);
        }
      }

      // Fallback to cookie
      if (!user || preferredLanguage === 'en') {
        const cookieLanguage = getLanguagePreference();
        if (cookieLanguage) {
          preferredLanguage = cookieLanguage;
        }
      }

      await i18n.changeLanguage(preferredLanguage);
      setIsInitialized(true);
    };

    initializeLanguage();
  }, [user, i18n]);

  // Show popups after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      // Show language popup first if needed
      if (shouldShowLangPopup()) {
        setShowLangPopup(true);
      } else if (shouldShowCookieConsent()) {
        // Show cookie consent if language popup is not shown
        setShowCookieConsent(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isInitialized]);

  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
    setLanguagePreference(language);

    // Update user profile if logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ preferred_language: language })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating user language preference:', error);
      }
    }
  };

  const showLanguagePopup = () => {
    setShowLangPopup(true);
  };

  const handleLanguagePopupClose = () => {
    setShowLangPopup(false);
    // Show cookie consent after language popup is closed
    if (shouldShowCookieConsent()) {
      setTimeout(() => setShowCookieConsent(true), 500);
    }
  };

  const handleCookieConsentClose = () => {
    setShowCookieConsent(false);
  };

  const value: LanguageContextType = {
    currentLanguage: i18n.language,
    changeLanguage,
    showLanguagePopup,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
      
      <LanguagePopup 
        open={showLangPopup} 
        onClose={handleLanguagePopupClose}
      />
      
      {showCookieConsent && (
        <CookieConsent onClose={handleCookieConsentClose} />
      )}
    </LanguageContext.Provider>
  );
};