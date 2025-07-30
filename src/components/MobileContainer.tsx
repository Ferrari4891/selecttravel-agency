import { ReactNode, useEffect, useState } from 'react';

interface MobileContainerProps {
  children: ReactNode;
}

const MobileContainer = ({ children }: MobileContainerProps) => {
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);

  useEffect(() => {
    // Listen for fullscreen changes to handle video orientation
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null;
      setIsVideoFullscreen(isFullscreen);
    };

    // Listen for video elements going fullscreen
    const handleVideoFullscreen = (event: Event) => {
      const target = event.target as HTMLVideoElement;
      if (target.tagName === 'VIDEO') {
        setIsVideoFullscreen(true);
      }
    };

    // Listen for escape key to exit video fullscreen
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVideoFullscreen) {
        setIsVideoFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('play', handleVideoFullscreen, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('play', handleVideoFullscreen, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVideoFullscreen]);

  // Apply video fullscreen class to body when needed
  useEffect(() => {
    if (isVideoFullscreen) {
      document.body.classList.add('video-fullscreen-active');
    } else {
      document.body.classList.remove('video-fullscreen-active');
    }
  }, [isVideoFullscreen]);

  return (
    <div className="mobile-container-wrapper">
      <div className={`mobile-container ${isVideoFullscreen ? 'video-fullscreen' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default MobileContainer;