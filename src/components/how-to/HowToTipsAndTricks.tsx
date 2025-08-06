import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AudioPlayer from "@/components/AudioPlayer";

const HowToTipsAndTricks = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Tips and Tricks</CardTitle>
        <CardDescription className="text-center">Watch our step-by-step tutorial</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="relative aspect-video">
              <iframe 
                className="w-full h-full rounded-none"
                src="https://www.youtube.com/embed/muUQB4LRCxw" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t">
          <AudioPlayer src="how-to-video-tutorial.wav" className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default HowToTipsAndTricks;