import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { setLanguagePreference, setHideLangPopup, shouldShowLangPopup } from '@/utils/cookies';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface LanguagePopupProps {
  open: boolean;
  onClose: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
];

export const LanguagePopup: React.FC<LanguagePopupProps> = ({ open, onClose }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleSave = async () => {
    // Change language immediately
    await i18n.changeLanguage(selectedLanguage);
    
    // Save to cookie for anonymous users
    setLanguagePreference(selectedLanguage);
    
    // If user is logged in, save to profile
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ preferred_language: selectedLanguage })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating user language preference:', error);
      }
    }
    
    // Handle "don't show again" preference
    if (dontShowAgain) {
      setHideLangPopup();
    }
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex-1">
              {t('welcome')}
            </DialogTitle>
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="h-12 w-12 p-0 border-2 hover:bg-gray-100 sm:h-10 sm:w-10"
            >
              <X className="h-8 w-8 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          <p className="text-center text-muted-foreground">
            {t('language_popup_description')}
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Language / Idioma / Langue</label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label htmlFor="dont-show-again" className="text-sm">
              {t('dont_show_again')}
            </label>
          </div>
          
          <Button onClick={handleSave} className="w-full">
            {t('save_continue')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};