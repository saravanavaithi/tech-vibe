import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaCog, FaUserNurse, FaPhoneAlt, FaStreetView, FaMicrophone, FaSpinner } from 'react-icons/fa';
import { PassengerProfile, RideOption, Language, CaregiverNotifications, InteractionMode } from '../../types';
import { RIDE_OPTIONS } from '../../constants';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import AccessibilityPanel from '../AccessibilityPanel';
import VoiceAssistantController from '../VoiceAssistantController';
import { l } from '../../services/localization';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

interface BookingViewProps {
  passengerProfile: PassengerProfile;
  setPassengerProfile: React.Dispatch<React.SetStateAction<PassengerProfile>>;
  onBooking: (rideOption: RideOption, pickup: string, destination: string) => void;
  interactionMode: InteractionMode;
  onCancel: () => void;
}

const BookingView: React.FC<BookingViewProps> = ({ passengerProfile, setPassengerProfile, onBooking, interactionMode, onCancel }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [activeMicField, setActiveMicField] = useState<'pickup' | 'destination' | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideOption | null>(null);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [notifyCaregiver, setNotifyCaregiver] = useState(!!passengerProfile.caregiverContact);
  const T = l(passengerProfile.preferences.language);

  useEffect(() => {
    // Auto-detect location on mount for Standard mode
    if (interactionMode === InteractionMode.STANDARD && !pickup) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          // In a real app, we'd reverse geocode here. 
          // For this demo, we'll use a placeholder.
          setPickup("Current Location (Anna Nagar)");
        });
      }
    }
  }, [interactionMode]);

  const { startListening, stopListening, transcript, status } = useSpeechRecognition(
    passengerProfile.preferences.language === Language.TA ? 'ta-IN' : 
    passengerProfile.preferences.language === Language.FR ? 'fr-FR' : 'en-US'
  );

  useEffect(() => {
    if (transcript && status === 'processing' && activeMicField) {
      if (activeMicField === 'pickup') setPickup(transcript);
      if (activeMicField === 'destination') setDestination(transcript);
      setActiveMicField(null);
    }
  }, [transcript, status, activeMicField]);
  
  const handleMicClick = (field: 'pickup' | 'destination') => {
    if (activeMicField === field) {
      stopListening();
      setActiveMicField(null);
    } else {
      setActiveMicField(field);
      startListening();
    }
  };

  const handlePreferencesChange = <K extends keyof PassengerProfile['preferences']>(
    key: K, 
    value: PassengerProfile['preferences'][K]
  ) => {
    setPassengerProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleCaregiverNotificationChange = <K extends keyof CaregiverNotifications>(key: K, value: CaregiverNotifications[K]) => {
    setPassengerProfile(prev => ({
        ...prev,
        caregiverNotifications: {
            ...prev.caregiverNotifications,
            [key]: value,
        },
    }));
  };

  const handleNotifyCaregiverToggle = (checked: boolean) => {
    setNotifyCaregiver(checked);
    if (!checked) {
      setPassengerProfile(prev => ({
        ...prev,
        caregiverContact: '',
      }));
    }
  };
  
  const handleCaregiverNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value;
    setPassengerProfile(prev => ({
      ...prev,
      caregiverContact: number,
    }));
  };

  const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-[rgb(var(--color-accent-purple))]' : 'bg-gray-600'}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
  
  if (interactionMode === InteractionMode.VOICE_ONLY) {
    return (
      <VoiceAssistantController 
        passengerProfile={passengerProfile}
        setPassengerProfile={setPassengerProfile}
        onComplete={onBooking}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="p-4 space-y-4 pb-28">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Where to, {passengerProfile.name}?</h2>
        <div className="space-y-3">
            <div className="relative flex items-center space-x-2">
              <div className="relative flex-grow">
                <FaStreetView className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="From: Pickup location"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 focus:ring-[rgb(var(--color-accent-purple))] focus:border-[rgb(var(--color-accent-purple))]"
                />
              </div>
              <button 
                onClick={() => handleMicClick('pickup')}
                className={`p-3 rounded-lg transition-colors ${activeMicField === 'pickup' ? 'bg-red-500 animate-pulse' : 'bg-gray-800 hover:bg-gray-700'}`}
                aria-label="Speak pickup location"
              >
                {activeMicField === 'pickup' && status === 'listening' ? <FaSpinner className="animate-spin" /> : <FaMicrophone />}
              </button>
            </div>
            <div className="relative flex items-center space-x-2">
              <div className="relative flex-grow">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="To: Enter destination"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 focus:ring-[rgb(var(--color-accent-purple))] focus:border-[rgb(var(--color-accent-purple))]"
                />
              </div>
              <button 
                onClick={() => handleMicClick('destination')}
                className={`p-3 rounded-lg transition-colors ${activeMicField === 'destination' ? 'bg-red-500 animate-pulse' : 'bg-gray-800 hover:bg-gray-700'}`}
                aria-label="Speak destination location"
              >
                {activeMicField === 'destination' && status === 'listening' ? <FaSpinner className="animate-spin" /> : <FaMicrophone />}
              </button>
            </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-bold mb-3">Select a ride</h3>
        <div className="space-y-3">
          {RIDE_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedRide(option)}
              className={`w-full p-4 rounded-lg text-left transition-all border-2 ${selectedRide?.id === option.id ? 'bg-[rgba(var(--color-accent-purple),0.3)] border-[rgb(var(--color-accent-purple))]' : 'bg-gray-700/50 border-transparent hover:border-[rgb(var(--color-accent-purple))]'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <option.icon className="text-3xl text-[rgb(var(--color-accent-aqua))]" />
                  <div>
                    <p className="font-bold text-lg">{option.name}</p>
                    <p className="text-sm text-gray-300">{option.description}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <FaUserNurse className="text-xl text-[rgb(var(--color-accent-aqua))]" />
                <label className="font-medium">Notify a caregiver?</label>
            </div>
            <Toggle label="Notify a caregiver" checked={notifyCaregiver} onChange={handleNotifyCaregiverToggle} />
        </div>
        {notifyCaregiver && (
          <>
            <div className="relative mt-4">
                <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="tel"
                    value={passengerProfile.caregiverContact || ''}
                    onChange={handleCaregiverNumberChange}
                    placeholder="Caregiver's mobile number"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 focus:ring-[rgb(var(--color-accent-purple))] focus:border-[rgb(var(--color-accent-purple))]"
                />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                <h4 className="font-semibold text-gray-200">{T('notificationPreferences')}</h4>
                <div className="flex items-center justify-between">
                    <label className="font-medium text-white">{T('rideStartEnd')}</label>
                    <Toggle 
                        label={T('rideStartEnd')} 
                        checked={passengerProfile.caregiverNotifications.rideStartEnd} 
                        onChange={(val) => handleCaregiverNotificationChange('rideStartEnd', val)} 
                    />
                </div>
                <div className="flex items-center justify-between">
                    <label className="font-medium text-white">{T('etaUpdates')}</label>
                    <Toggle 
                        label={T('etaUpdates')} 
                        checked={passengerProfile.caregiverNotifications.etaUpdates} 
                        onChange={(val) => handleCaregiverNotificationChange('etaUpdates', val)} 
                    />
                </div>
                <div className="flex items-center justify-between">
                    <label className="font-medium text-white">{T('emergencyAlerts')}</label>
                    <Toggle 
                        label={T('emergencyAlerts')} 
                        checked={passengerProfile.caregiverNotifications.emergencyAlerts} 
                        onChange={(val) => handleCaregiverNotificationChange('emergencyAlerts', val)} 
                    />
                </div>
            </div>
          </>
        )}
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 z-30">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button onClick={() => setIsAccessibilityModalOpen(true)} className="flex-shrink-0 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2">
            <FaCog /> <span>{T('accessibilitySettings')}</span>
          </button>
          <button
            onClick={() => selectedRide && pickup && destination && onBooking(selectedRide, pickup, destination)}
            disabled={!selectedRide || !pickup || !destination}
            className="w-full p-4 text-xl font-bold bg-[rgb(var(--color-accent-purple))] rounded-lg hover:bg-[rgba(var(--color-accent-purple),0.8)] disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            Book {selectedRide?.name || 'Ride'}
          </button>
        </div>
      </div>
      
      <Modal isOpen={isAccessibilityModalOpen} onClose={() => setIsAccessibilityModalOpen(false)} title={T('accessibilitySettings')}>
        <AccessibilityPanel preferences={passengerProfile.preferences} onPreferencesChange={handlePreferencesChange} />
      </Modal>
    </div>
  );
};

export default BookingView;