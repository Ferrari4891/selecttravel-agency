import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AudioPlayerProps {
  src: string; // Now expects just the filename, e.g., "our-mission.wav"
  className?: string;
}

const AudioPlayer = ({ src, className = "" }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const getAudioUrl = async () => {
      if (!src) return;
      
      try {
        setIsLoading(true);
        const { data } = supabase.storage
          .from('audio-files')
          .getPublicUrl(src);
        
        console.log('Audio URL generated:', data.publicUrl);
        setAudioUrl(data.publicUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting audio URL:', error);
        setIsLoading(false);
      }
    };

    getAudioUrl();
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    console.log('Toggle playback clicked. Audio element:', audio, 'Audio URL:', audioUrl);
    
    if (!audio || !audioUrl) {
      console.log('Missing audio element or URL');
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        console.log('Audio stopped');
      } else {
        console.log('Attempting to play audio');
        await audio.play();
        setIsPlaying(true);
        console.log('Audio started playing');
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={togglePlayback}
        disabled={isLoading || !audioUrl}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {isPlaying ? (
          <>
            <Square className="h-4 w-4" />
            Stop
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            {isLoading ? 'Loading...' : 'Listen'}
          </>
        )}
      </Button>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
    </div>
  );
};

export default AudioPlayer;