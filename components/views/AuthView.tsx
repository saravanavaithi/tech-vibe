import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaWheelchair, FaLanguage, FaCheck, FaArrowRight, FaArrowLeft, FaUniversalAccess, FaMicrophone, FaMicrophoneSlash, FaSpinner, FaUserNurse } from 'react-icons/fa';
import { PassengerProfile, Language } from '../../types';
import Card from '../ui/Card';
import AccessibilityPanel from '../AccessibilityPanel';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

interface AuthViewProps {
  passengerProfile: PassengerProfile;
  setPassengerProfile: React.Dispatch<React.SetStateAction<PassengerProfile>>;
  onComplete: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ passengerProfile, setPassengerProfile, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const { isSupported, status, startListening, stopListening, transcript, permission } = useSpeechRecognition('en-US');

  useEffect(() => {
    if (transcript && status === 'processing' && step === 1) {
      setPassengerProfile(prev => ({ ...prev, name: transcript }));
    }
  }, [transcript, status, step, setPassengerProfile]);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const assistanceOptions = [
    'Visually Impaired',
    'Hearing Impaired',
    'Wheelchair User',
    'Mobility Assistance',
    'Cognitive Support',
    'Service Animal',
  ];

  const toggleNeed = (need: string) => {
    setPassengerProfile(prev => {
      const needs = prev.assistanceNeeds.includes(need)
        ? prev.assistanceNeeds.filter(n => n !== need)
        : [...prev.assistanceNeeds, need];
      return { ...prev, assistanceNeeds: needs };
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[rgb(var(--color-accent-purple))] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[rgb(var(--color-accent-purple))]/20">
                <FaUser className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Welcome to Aura</h2>
              <p className="text-gray-400 mt-2">Let's set up your profile for a better experience.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 ml-1">What should we call you?</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={passengerProfile.name}
                  onChange={(e) => setPassengerProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Name"
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl p-4 text-xl text-white focus:ring-2 focus:ring-[rgb(var(--color-accent-purple))] focus:border-transparent transition-all"
                />
                {isSupported && (
                  <button
                    onClick={() => {
                      if (status === 'listening') stopListening();
                      else startListening();
                    }}
                    disabled={status === 'processing' || permission === 'denied'}
                    className={`w-16 rounded-xl flex items-center justify-center text-2xl transition-all ${
                      status === 'listening' 
                        ? 'bg-yellow-500 animate-pulse text-white' 
                        : permission === 'denied'
                        ? 'bg-red-500/20 text-red-500 border border-red-500/50'
                        : 'bg-[rgb(var(--color-accent-purple))] text-white hover:bg-[rgba(var(--color-accent-purple),0.8)]'
                    }`}
                    title={permission === 'denied' ? 'Microphone access denied' : 'Speak your name'}
                  >
                    {status === 'processing' ? (
                      <FaSpinner className="animate-spin" />
                    ) : permission === 'denied' ? (
                      <FaMicrophoneSlash />
                    ) : (
                      <FaMicrophone />
                    )}
                  </button>
                )}
              </div>
              {permission === 'denied' && (
                <p className="text-xs text-red-400 text-center">Microphone access is denied. Please enable it in your browser settings.</p>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[rgb(var(--color-accent-aqua))] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[rgb(var(--color-accent-aqua))]/20">
                <FaWheelchair className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Assistance Needs</h2>
              <p className="text-gray-400 mt-2">Select any areas where you might need extra support.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assistanceOptions.map(option => (
                <button
                  key={option}
                  onClick={() => toggleNeed(option)}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                    passengerProfile.assistanceNeeds.includes(option)
                      ? 'bg-[rgba(var(--color-accent-aqua),0.2)] border-[rgb(var(--color-accent-aqua))] text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                  {passengerProfile.assistanceNeeds.includes(option) && <FaCheck className="text-[rgb(var(--color-accent-aqua))]" />}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[rgb(var(--color-accent-purple))] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[rgb(var(--color-accent-purple))]/20">
                <FaUniversalAccess className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Accessibility</h2>
              <p className="text-gray-400 mt-2">Customize how Aura interacts with you.</p>
            </div>

            <AccessibilityPanel 
              preferences={passengerProfile.preferences} 
              onPreferencesChange={(key, value) => setPassengerProfile(prev => ({
                ...prev,
                preferences: { ...prev.preferences, [key]: value }
              }))} 
            />
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[rgb(var(--color-accent-aqua))] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[rgb(var(--color-accent-aqua))]/20">
                <FaUserNurse className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Caregiver Contact</h2>
              <p className="text-gray-400 mt-2">Add a contact for emergency notifications.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 ml-1">Caregiver Phone Number (Optional)</label>
              <input
                type="tel"
                value={passengerProfile.caregiverContact || ''}
                onChange={(e) => setPassengerProfile(prev => ({ ...prev, caregiverContact: e.target.value }))}
                placeholder="e.g. +1 234 567 8900"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xl text-white focus:ring-2 focus:ring-[rgb(var(--color-accent-purple))] focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 italic">This person will receive SMS alerts if you activate the SOS button or when your ride starts/ends.</p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 md:p-8 max-w-2xl mx-auto">
      <div className="w-full mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Step {step} of {totalSteps}</span>
          <span className="text-xs font-bold text-[rgb(var(--color-accent-purple))] uppercase tracking-widest">{Math.round((step / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[rgb(var(--color-accent-aqua))] to-[rgb(var(--color-accent-purple))]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="w-full flex-grow">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      <div className="w-full mt-12 flex space-x-4">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 p-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center border border-white/10"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={step === 1 && !passengerProfile.name.trim()}
          className="flex-[2] p-4 rounded-xl bg-[rgb(var(--color-accent-purple))] hover:bg-[rgba(var(--color-accent-purple),0.8)] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center justify-center shadow-lg shadow-[rgb(var(--color-accent-purple))]/20"
        >
          {step === totalSteps ? 'Get Started' : 'Continue'} <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default AuthView;