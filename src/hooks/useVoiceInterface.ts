import { useState, useEffect, useCallback, useRef } from 'react';
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
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const startListening = useCallback((onVoiceCommand?: (command: string) => void) => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported' }));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = i18n.language || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognition.onerror = (event: any) => {
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        error: `Speech recognition error: ${event.error}` 
      }));
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      console.log('Voice command received:', transcript);
      
      if (onVoiceCommand) {
        onVoiceCommand(transcript.toLowerCase());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    return recognition;
  }, [state.isSupported, i18n.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort?.(); // abort is immediate
      } catch (e) {
        try { recognitionRef.current.stop?.(); } catch {}
      }
      recognitionRef.current = null;
    }
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  const stopSpeaking = useCallback(() => {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
    } catch {}
    utteranceRef.current = null;
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setState(prev => ({ ...prev, error: 'Speech synthesis not supported' }));
      return;
    }

    try {
      // Stop any ongoing speech immediately before speaking new text
      window.speechSynthesis.cancel();
    } catch {}

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language || 'en-US';

    // Prefer a female voice if available
    const pickFemaleVoice = () => {
      const voices = speechSynthesis.getVoices();
      const candidates = ['female', 'zira', 'hazel', 'samantha', 'karen', 'susan', 'victoria'];
      return voices.find(v => candidates.some(c => v.name.toLowerCase().includes(c)));
    };

    const assignVoice = () => {
      const femaleVoice = pickFemaleVoice();
      if (femaleVoice) utterance.voice = femaleVoice;
    };

    // In some browsers voices load asynchronously
    if (speechSynthesis.getVoices().length === 0) {
      const once = () => {
        assignVoice();
        speechSynthesis.onvoiceschanged = null;
      };
      speechSynthesis.onvoiceschanged = once;
    } else {
      assignVoice();
    }

    utterance.onstart = () => {
      utteranceRef.current = utterance;
      setState(prev => ({ ...prev, isSpeaking: true }));
    };

    utterance.onend = () => {
      if (utteranceRef.current === utterance) utteranceRef.current = null;
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    utterance.onerror = () => {
      if (utteranceRef.current === utterance) utteranceRef.current = null;
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    speechSynthesis.speak(utterance);
  }, [i18n.language]);

  // Process voice commands for restaurant search - intelligently routes between name and criteria search
  const processVoiceCommand = useCallback((
    command: string, 
    onCriteriaSearch?: (params: any) => void,
    onNameSearch?: (params: any) => void
  ) => {
    const lowerCommand = command.toLowerCase();
    const originalCommand = command; // Keep original case for business names
    
    // Extract location first (needed for both search types)
    let city = '';
    let country = '';
    
    // Common cities
    const cityPatterns = [
      { pattern: /in paris/i, city: 'Paris', country: 'France' },
      { pattern: /in london/i, city: 'London', country: 'United Kingdom' },
      { pattern: /in new york/i, city: 'New York', country: 'United States' },
      { pattern: /in tokyo/i, city: 'Tokyo', country: 'Japan' },
      { pattern: /in rome/i, city: 'Rome', country: 'Italy' },
      { pattern: /in madrid/i, city: 'Madrid', country: 'Spain' },
      { pattern: /in berlin/i, city: 'Berlin', country: 'Germany' },
      { pattern: /in barcelona/i, city: 'Barcelona', country: 'Spain' },
      { pattern: /in amsterdam/i, city: 'Amsterdam', country: 'Netherlands' }
    ];

    for (const { pattern, city: c, country: co } of cityPatterns) {
      if (pattern.test(lowerCommand)) {
        city = c;
        country = co;
        break;
      }
    }

    // Check for cuisine, price, food, or drink keywords to determine search type
    const hasCuisine = /italian|chinese|french|japanese|mexican|indian|thai|american/i.test(lowerCommand);
    const hasPrice = /budget|cheap|expensive|fine dining|premium/i.test(lowerCommand);
    const hasFood = /pizza|burger|steak|pasta|sushi/i.test(lowerCommand);
    const hasDrink = /wine|cocktail|bar|beer|coffee/i.test(lowerCommand);
    
    // If command has specific criteria, use criteria search
    if (hasCuisine || hasPrice || hasFood || hasDrink) {
      const searchParams: any = {
        searchType: 'cuisine',
        resultCount: 10
      };

      // Extract cuisine types
      if (lowerCommand.includes('italian')) searchParams.cuisineType = 'Italian';
      else if (lowerCommand.includes('chinese')) searchParams.cuisineType = 'Chinese';
      else if (lowerCommand.includes('french')) searchParams.cuisineType = 'French';
      else if (lowerCommand.includes('japanese')) searchParams.cuisineType = 'Japanese';
      else if (lowerCommand.includes('mexican')) searchParams.cuisineType = 'Mexican';
      else if (lowerCommand.includes('indian')) searchParams.cuisineType = 'Indian';
      else if (lowerCommand.includes('thai')) searchParams.cuisineType = 'Thai';
      else if (lowerCommand.includes('american')) searchParams.cuisineType = 'American';

      // Extract price levels
      if (lowerCommand.includes('budget') || lowerCommand.includes('cheap')) {
        searchParams.searchType = 'price';
        searchParams.priceLevel = 'Budget';
      } else if (lowerCommand.includes('expensive') || lowerCommand.includes('fine dining')) {
        searchParams.searchType = 'price';
        searchParams.priceLevel = 'Premium';
      }

      // Extract food specialties
      if (lowerCommand.includes('pizza')) {
        searchParams.searchType = 'food';
        searchParams.foodSpecialty = 'Pizza';
      } else if (lowerCommand.includes('burger')) {
        searchParams.searchType = 'food';
        searchParams.foodSpecialty = 'Burger';
      } else if (lowerCommand.includes('steak')) {
        searchParams.searchType = 'food';
        searchParams.foodSpecialty = 'Steak';
      }

      // Extract drink specialties
      if (lowerCommand.includes('wine') || lowerCommand.includes('wine bar')) {
        searchParams.searchType = 'drink';
        searchParams.drinkSpecialty = 'Wine';
      } else if (lowerCommand.includes('cocktail') || lowerCommand.includes('bar')) {
        searchParams.searchType = 'drink';
        searchParams.drinkSpecialty = 'Cocktails';
      }

      if (city && country) {
        searchParams.city = city;
        searchParams.country = country;
        
        if (onCriteriaSearch) {
          const criteria = searchParams.cuisineType || searchParams.priceLevel || searchParams.foodSpecialty || searchParams.drinkSpecialty || 'restaurants';
          speak(`Searching for ${criteria} in ${city}, ${country}`);
          onCriteriaSearch(searchParams);
        }
      } else {
        speak("Please specify a city for your search. For example, say 'Find Italian restaurants in Paris'");
      }
    } else {
      // Try to extract business name - preserve original case for better matching
      let businessName = '';
      
      // Work with original command to preserve case
      const beforeCityOriginal = originalCommand.split(/\s+in\s+/i)[0];
      const beforeCityLower = lowerCommand.split(/\s+in\s+/)[0];
      
      // Remove common command words and phrases while preserving case
      businessName = beforeCityOriginal
        .replace(/^(find|search for|show me|look for|get me|locate|where is|for)\s+/i, '')
        .replace(/^(the\s+)?(business\s+)?(name\s+)?(called\s+)?/i, '')
        .trim();
      
      console.log('Voice command processing:', { 
        original: command, 
        lowerCommand, 
        beforeCityOriginal, 
        businessName,
        city,
        country,
        hasNameSearchCallback: !!onNameSearch 
      });
      
      if (businessName && onNameSearch) {
        const nameSearchParams: any = {
          businessName: businessName
        };
        
        if (city) nameSearchParams.city = city;
        if (country) nameSearchParams.country = country;
        
        const locationText = city ? ` in ${city}, ${country}` : '';
        speak(`Searching for ${businessName}${locationText}`);
        console.log('Calling name search with params:', nameSearchParams);
        onNameSearch(nameSearchParams);
      } else if (!businessName) {
        speak("I didn't understand that. Please say the business name or specify what type of restaurant you're looking for. For example, 'Find Starbucks in New York' or 'Find Italian restaurants in Paris'");
      } else if (!onNameSearch) {
        console.error('Name search callback not provided');
        speak("Unable to perform name search. Please try using the touch interface.");
      }
    }
  }, [speak]);

  return {
    ...state,
    startListening,
    stopListening,
    stopSpeaking,
    speak,
    processVoiceCommand,
    isAuthenticated: !!user
  };
};