import React from 'react';
import { RideOption, Language, PassengerProfile } from '../../types';
import Card from '../ui/Card';
import { l } from '../../services/localization';
import { FaMapMarkerAlt, FaCreditCard, FaWallet, FaBell, FaStreetView } from 'react-icons/fa';

interface ConfirmationViewProps {
  rideOption: RideOption;
  pickup: string;
  destination: string;
  onConfirm: () => void;
  onCancel: () => void;
  lang: Language;
  passengerProfile: PassengerProfile;
}

const ConfirmationView: React.FC<ConfirmationViewProps> = ({ rideOption, pickup, destination, onConfirm, onCancel, lang, passengerProfile }) => {
  const T = l(lang);
  return (
    <div className="p-4 flex flex-col justify-center items-center h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Confirm Your Ride</h2>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg">
            <rideOption.icon className="text-[rgb(var(--color-accent-aqua))] text-2xl" />
            <div>
              <p className="text-sm text-gray-400">Ride Type</p>
              <p className="font-bold">{rideOption.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg">
            <FaStreetView className="text-[rgb(var(--color-accent-aqua))] text-2xl" />
            <div>
              <p className="text-sm text-gray-400">From</p>
              <p className="font-bold">{pickup}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg">
            <FaMapMarkerAlt className="text-[rgb(var(--color-accent-aqua))] text-2xl" />
            <div>
              <p className="text-sm text-gray-400">{T('destination')}</p>
              <p className="font-bold">{destination}</p>
            </div>
          </div>
        </div>
        
        {passengerProfile.caregiverContact && (
            <div className="flex items-start space-x-3 p-3 bg-green-900/30 rounded-lg text-green-300 mb-6 border border-green-700">
                <FaBell className="text-green-400 text-xl mt-1 flex-shrink-0" />
                <div>
                    <p className="font-bold">Caregiver will be notified</p>
                    <p className="text-sm">A notification with a tracking link will be sent to {passengerProfile.caregiverContact} once the ride begins.</p>
                </div>
            </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full p-4 text-xl font-bold bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Confirm & Request
          </button>
          <button
            onClick={onCancel}
            className="w-full p-2 text-center text-gray-300 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationView;