import React, { useEffect, useState } from 'react';
import { useYouTubeLiveStatus } from '../hooks/useYouTubeLiveStatus';

interface LiveStreamBannerProps {
  className?: string;
}

const LiveStreamBanner: React.FC<LiveStreamBannerProps> = ({ className = '' }) => {
  const { isLive, stream, isLoading, error } = useYouTubeLiveStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle visibility animation based on live status
  useEffect(() => {
    if (isLive && !isVisible) {
      setIsVisible(true);
    } else if (!isLive && isVisible) {
      setIsVisible(false);
    }
  }, [isLive, isVisible]);

  const handleBannerClick = () => {
    if (stream?.url) {
      window.open(stream.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isLive || !stream) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      <div 
        onClick={handleBannerClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-red-600/90 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 cursor-pointer hover:bg-red-500/95 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <div className="flex items-center gap-2">
          {/* Pulsing LIVE indicator */}
          <div className="relative flex-shrink-0">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping opacity-50"></div>
          </div>
          
          {/* LIVE text */}
          <span className="font-bold text-white text-sm tracking-wide whitespace-nowrap">
            LIVE
          </span>
        </div>

        {/* Hover tooltip with stream title */}
        <div className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/90 backdrop-blur-sm text-white text-sm rounded-lg shadow-lg border border-white/10 whitespace-nowrap transform transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          <div className="max-w-xs truncate">
            {stream.title}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full right-4 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
      </div>
    </div>
  );
};

export default LiveStreamBanner;