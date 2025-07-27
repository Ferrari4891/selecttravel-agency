import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, ChevronDown, Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { regionData } from '@/data/locationData';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedCityInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EnhancedCityInput: React.FC<EnhancedCityInputProps> = ({
  value,
  onChange,
  placeholder = "Enter or select a city"
}) => {
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Get all cities from regionData
  const allCities = React.useMemo(() => {
    const cities: Array<{ name: string; country: string; region: string }> = [];
    
    Object.entries(regionData).forEach(([regionName, region]) => {
      region.countries.forEach(country => {
        country.cities.forEach(city => {
          cities.push({
            name: city,
            country: country.name,
            region: regionName
          });
        });
      });
    });
    
    return cities.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filter cities based on input
  const filteredCities = allCities.filter(city =>
    city.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleCitySelect = (cityName: string) => {
    setInputValue(cityName);
    onChange(cityName);
    setOpen(false);
  };

  const startVoiceInput = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks to turn off microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      setIsListening(true);
      mediaRecorderRef.current.start();
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && isListening) {
          stopVoiceInput();
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopVoiceInput = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));
      
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.text) {
        const transcribedText = data.text.trim();
        handleInputChange(transcribedText);
        toast.success(`Voice input: "${transcribedText}"`);
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Voice transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="city" className="text-base font-semibold">
        2. Select City
      </Label>
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-10 px-3 py-2 text-left"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">
                    {inputValue || placeholder}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput 
                  placeholder="Search cities..." 
                  value={inputValue}
                  onValueChange={handleInputChange}
                />
                <CommandList>
                  <CommandEmpty>No cities found.</CommandEmpty>
                  <CommandGroup>
                    {filteredCities.slice(0, 10).map((city) => (
                      <CommandItem
                        key={`${city.name}-${city.country}`}
                        value={city.name}
                        onSelect={() => handleCitySelect(city.name)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{city.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {city.country}, {city.region}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {/* Hidden input for manual typing when dropdown is closed */}
          {!open && (
            <Input
              id="city"
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              className="absolute inset-0 bg-transparent border-none focus:ring-0 focus:border-none pl-9"
              onFocus={() => setOpen(true)}
            />
          )}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={isListening ? stopVoiceInput : startVoiceInput}
          disabled={isTranscribing}
          className={cn(
            "h-10 w-10",
            isListening && "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {isTranscribing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {isListening && (
        <p className="text-sm text-muted-foreground animate-pulse">
          🎤 Listening... (speak the city name)
        </p>
      )}
      
      {isTranscribing && (
        <p className="text-sm text-muted-foreground">
          ⏳ Transcribing audio...
        </p>
      )}
    </div>
  );
};