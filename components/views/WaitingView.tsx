import React, { useEffect, useState } from 'react';
import Card from '../ui/Card';
import { FaCarSide, FaUserCircle } from 'react-icons/fa';
import { RideStatus } from '../../types';

interface WaitingViewProps {
  onDriverFound: () => void;
  driver: RideStatus['driver'];
}

const WaitingView: React.FC<WaitingViewProps> = ({ onDriverFound, driver }) => {
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      setIsSearching(false);
    }, 4000); // Simulate searching for 4 seconds

    const foundTimer = setTimeout(() => {
        onDriverFound();
    }, 9000); // Wait another 5 seconds before starting the ride

    return () => {
        clearTimeout(searchTimer);
        clearTimeout(foundTimer);
    }
  }, [onDriverFound]);

  return (
    <div className="p-4 flex flex-col justify-center items-center h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md text-white text-center">
        {isSearching ? (
          <>
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-4">
              <div className="absolute border-2 border-indigo-400/30 rounded-full w-full h-full animate-ping"></div>
              <div className="absolute border-2 border-indigo-400/50 rounded-full w-3/4 h-3/4 animate-ping" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute border-2 border-indigo-400/70 rounded-full w-1/2 h-1/2 animate-ping" style={{animationDelay: '1s'}}></div>
              <FaCarSide className="text-4xl text-indigo-300 z-10" />
            </div>
            <h2 className="text-2xl font-bold">Finding your driver...</h2>
            <p className="text-gray-300 mt-2">Connecting you with the nearest sustainable ride.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Your driver is on the way!</h2>
            <FaCarSide className="text-6xl text-indigo-300 mx-auto my-6 animate-pulse" />
            <div className="p-4 bg-black/20 rounded-lg text-left border border-white/10">
                <div className="flex items-center space-x-3">
                    <FaUserCircle className="text-indigo-400 text-3xl" />
                    <div>
                        <p className="font-bold text-lg">{driver.name}</p>
                        <p className="text-sm text-gray-300">{driver.vehicle}</p>
                    </div>
                </div>
            </div>
             <p className="text-gray-300 mt-6">Your ride will begin shortly.</p>
          </>
        )}
      </Card>
    </div>
  );
};

export default WaitingView;