
import React, { useEffect, useState } from 'react';
import { FaCarSide, FaMapMarkerAlt, FaTrafficLight } from 'react-icons/fa';

interface LiveMapProps {
  currentLocation?: { lat: number; lng: number } | null;
  onRefresh?: () => void;
  progress?: number;
}

const LiveMap: React.FC<LiveMapProps> = ({ currentLocation, onRefresh, progress = 0 }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [trafficLevel, setTrafficLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentLocation) {
      setCoords(currentLocation);
    } else if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition((position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }

    // Simulate traffic changes
    const trafficInterval = setInterval(() => {
      const levels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      setTrafficLevel(levels[Math.floor(Math.random() * levels.length)]);
    }, 15000);

    return () => clearInterval(trafficInterval);
  }, [currentLocation]);

  const handleElementClick = (element: string) => {
    setInfoMessage(`You tapped on the ${element}. This is a real-time tracking feature.`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  const trafficColor = {
    low: 'stroke-green-500',
    medium: 'stroke-yellow-500',
    high: 'stroke-red-500'
  }[trafficLevel];

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          <FaMapMarkerAlt className="text-[rgb(var(--color-accent-aqua))]" />
          <span>{coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Locating...'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onRefresh}
            className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/10 text-gray-300 transition-colors uppercase font-bold"
          >
            Refresh
          </button>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
            <FaTrafficLight className={trafficLevel === 'high' ? 'text-red-500' : trafficLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'} />
            <span className={trafficLevel === 'high' ? 'text-red-500' : trafficLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'}>
              Traffic: {trafficLevel}
            </span>
          </div>
        </div>
      </div>
      
      <div className="w-full h-32 md:h-40 rounded-lg bg-gray-900/50 p-2 overflow-hidden relative border border-white/5">
        {infoMessage && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
            <p className="text-white text-xs font-bold text-center px-4">{infoMessage}</p>
          </div>
        )}
        
        <svg width="100%" height="100%" viewBox="0 0 360 140">
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Route path with traffic color */}
          <path 
            className={`map-path transition-colors duration-1000 ${trafficColor} cursor-pointer hover:stroke-white/50`} 
            d="M20,70 Q60,30 100,70 T180,70 Q220,110 260,70 T340,70" 
            strokeWidth="4" 
            fill="none" 
            strokeDasharray="8 8" 
            onClick={() => handleElementClick('route')}
          />
          
          {/* Start and End points */}
          <circle cx="20" cy="70" r="6" fill="rgb(var(--color-accent-aqua))" className="animate-pulse" />
          <text x="20" y="95" fill="rgb(var(--color-accent-aqua))" fontSize="10" fontWeight="bold" textAnchor="middle">PICKUP</text>
          
          <circle cx="340" cy="70" r="6" fill="rgb(var(--color-accent-red))" />
          <text x="340" y="95" fill="rgb(var(--color-accent-red))" fontSize="10" fontWeight="bold" textAnchor="middle">DESTINATION</text>
          
          {/* The car icon that moves along the path */}
          <g style={{ 
            offsetPath: 'path("M20,70 Q60,30 100,70 T180,70 Q220,110 260,70 T340,70")',
            offsetDistance: `${progress}%`,
            offsetRotate: 'auto',
            transition: 'offset-distance 1s ease-in-out'
          }}>
            <foreignObject x="-12" y="-12" width="24" height="24" className="cursor-pointer" onClick={() => handleElementClick('vehicle')}>
                <div className="flex items-center justify-center w-full h-full">
                  <FaCarSide className="text-white text-2xl transform -rotate-12 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
            </foreignObject>
          </g>
        </svg>
        
        {/* Overlay for "Real-time" feel */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Live</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;