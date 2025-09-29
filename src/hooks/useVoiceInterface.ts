import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInterfaceState {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
}

export const useVoiceInterface = () => {
  const [state, setState] = useState<VoiceInterfaceState>({
    isListening: false,
    isSpeaking: false,
    isSupported: false,
    error: null
  });
  
  const { user } = useAuth();
  const { i18n } = useTranslation();

  // Check browser support
  useEffect(() => {
    const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setState(prev => ({ ...prev, isSupported }));
  }, []);

  // Load user language preferences for members
  useEffect(() => {
    const loadUserLanguagePreference = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('language_preference')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.log('Error loading language preference:', error);
          return;
        }

        if (profile?.language_preference && profile.language_preference !== i18n.language) {
          await i18n.changeLanguage(profile.language_preference);
        }
      } catch (error) {
        console.log('No language preference found or error loading:', error);
      }
    };

    loadUserLanguagePreference();
  }, [user, i18n]);

  const startListening = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported' }));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = i18n.language || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognition.onerror = (event) => {
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        error: `Speech recognition error: ${event.error}` 
      }));
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      // Process voice command here
      console.log('Voice transcript:', transcript);
    };

    recognition.start();
  }, [state.isSupported, i18n.language]);

  const stopListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setState(prev => ({ ...prev, error: 'Speech synthesis not supported' }));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language || 'en-US';
    
    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true }));
    };
    
    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    speechSynthesis.speak(utterance);
  }, [i18n.language]);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    isAuthenticated: !!user
  };
};