import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { setCookieConsent } from '@/utils/cookies';

interface CookieConsentProps {
  onClose: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onClose }) => {
  const { t } = useTranslation();
  
  const handleAcceptAll = () => {
    setCookieConsent('all');
    onClose();
  };
  
  const handleDeclineNonEssential = () => {
    setCookieConsent('essential');
    onClose();
  };
  
  const handleCustomize = () => {
    // For now, just open a simple modal or redirect to preferences
    // This could be expanded to show detailed cookie categories
    setCookieConsent('custom');
    onClose();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-2xl p-6 shadow-lg">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {t('cookie_consent_title')}
          </h3>
          
          <p className="text-sm text-muted-foreground">
            {t('cookie_consent_description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" onClick={handleDeclineNonEssential}>
              {t('decline_non_essential')}
            </Button>
            
            <Button variant="outline" onClick={handleCustomize}>
              {t('customize_preferences')}
            </Button>
            
            <Button onClick={handleAcceptAll}>
              {t('accept_all')}
            </Button>
          </div>
          
          <div className="text-center">
            <button className="text-sm text-primary hover:underline">
              {t('learn_more')}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};