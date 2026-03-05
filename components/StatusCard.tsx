import React from 'react';
import { RideStatus, Language } from '../types';
import Card from './ui/Card';
import { FaMapMarkerAlt, FaClock, FaUserCircle, FaRoute, FaLeaf } from 'react-icons/fa';
import { l } from '../services/localization';

interface StatusCardProps {
  rideStatus: RideStatus;
  lang: Language;
}

const StatusCard: React.FC<StatusCardProps> = ({ rideStatus, lang }) => {
  const T = l(lang);
  return (
    <Card className="text-white">
      <div className="flex justify-between items-start">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-[rgb(var(--color-accent-aqua))] text-xl" />
              <div>
                <p className="text-sm text-gray-300">{T('destination')}</p>
                <p className="font-bold text-lg">{rideStatus.destination}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaClock className="text-[rgb(var(--color-accent-aqua))] text-xl" />
              <div>
                <p className="text-sm text-gray-300">{T('eta')}</p>
                <p className="font-bold text-lg">{rideStatus.etaMinutes} {T('minutes')}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-700/50 pt-4 md:pt-0 md:pl-4">
            <div className="flex items-center space-x-3">
              <FaUserCircle className="text-[rgb(var(--color-accent-aqua))] text-xl" />
              <div>
                <p className="text-sm text-gray-300">{T('driverInfo')}</p>
                <p className="font-bold">{rideStatus.driver.name} - {rideStatus.driver.vehicle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaRoute className="text-[rgb(var(--color-accent-aqua))] text-xl" />
              <div>
                <p className="text-sm text-gray-300">{T('routeInfo')}</p>
                <p className="font-semibold text-sm">{rideStatus.routeDescription}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex flex-col items-center space-y-1 text-green-400 bg-green-900/40 p-2 rounded-lg">
          <FaLeaf />
          <span className="text-xs font-bold text-center">Sustainable Ride</span>
        </div>
      </div>
    </Card>
  );
};

export default StatusCard;