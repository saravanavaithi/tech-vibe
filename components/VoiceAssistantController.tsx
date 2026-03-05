import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaCheck, FaTimes, FaUndo, FaArrowLeft, FaPlay } from 'react-icons/fa';
import { InteractionMode, PassengerProfile, RideOption } from '../types';
import { RIDE_OPTIONS } from '../constants';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';

interface VoiceAssistantControllerProps {
  passengerProfile: PassengerProfile;
  setPassengerProfile: React.Dispatch<React.SetStateAction<PassengerProfile>>;
  onComplete: (rideOption: RideOption, pickup: string, destination: string) => void;
  onCancel: () => void;
}

enum VoiceStep {
  WELCOME = 'WELCOME',
  NAME = 'NAME',
  CONFIRM_NAME = 'CONFIRM_NAME',
  PICKUP_DETECT = 'PICKUP_DETECT',
  PICKUP_MANUAL = 'PICKUP_MANUAL',
  CONFIRM_PICKUP = 'CONFIRM_PICKUP',
  DESTINATION = 'DESTINATION',
  CONFIRM_DESTINATION = 'CONFIRM_DESTINATION',
  FINAL_CONFIRM = 'FINAL_CONFIRM',
  BOOKING = 'BOOKING'
}

const VoiceAssistantController: React.FC<VoiceAssistantControllerProps> = ({ 
  passengerProfile, 
  setPassengerProfile, 
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState<VoiceStep>(VoiceStep.WELCOME);
  const [stepHistory, setStepHistory] = useState<VoiceStep[]>([]);
  const [tempName, setTempName] = useState('');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [lastSpoken, setLastSpoken] = useState('');

  const changeStep = useCallback((newStep: VoiceStep) => {
    setStepHistory(prev => [...prev, step]);
    setStep(newStep);
  }, [step]);

  const goBack = useCallback(() => {
    if (stepHistory.length > 0) {
      const prev = stepHistory[stepHistory.length - 1];
      setStepHistory(prevHistory => prevHistory.slice(0, -1));
      setStep(prev);
    } else {
      onCancel();
    }
  }, [stepHistory, onCancel]);
  
  const { speak, isSpeaking, cancel: stopSpeaking } = useSpeechSynthesis();
  const { startListening, stopListening, transcript, status, isSupported, permission } = useSpeechRecognition('en-US', true);

  // Initial welcome message and start listening
  useEffect(() => {
    const initialMessage = "Welcome to Aura Accessibility Mode. You can control the app using your voice.";
    speak(initialMessage, 'en-US', 1);
    setLastSpoken(initialMessage);
    
    // After welcome, move to asking name
    const timer = setTimeout(() => {
      changeStep(VoiceStep.NAME);
    }, 4000);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
      stopListening();
    };
  }, []);

  const processCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    
    // Global commands
    if (lowerText.includes('repeat')) {
      speak(lastSpoken, 'en-US', 1);
      return;
    }
    if (lowerText.includes('go back')) {
      goBack();
      return;
    }
    if (lowerText.includes('cancel ride') || lowerText.includes('start over')) {
      onCancel();
      return;
    }

    switch (step) {
      case VoiceStep.WELCOME:
        changeStep(VoiceStep.NAME);
        break;
      
      case VoiceStep.NAME:
        if (text.length > 1) {
          setTempName(text);
          changeStep(VoiceStep.CONFIRM_NAME);
        }
        break;
      
      case VoiceStep.CONFIRM_NAME:
        if (lowerText.includes('yes') || lowerText.includes('correct')) {
          setPassengerProfile(prev => ({ ...prev, name: tempName }));
          changeStep(VoiceStep.PICKUP_DETECT);
        } else if (lowerText.includes('no')) {
          changeStep(VoiceStep.NAME);
        }
        break;

      case VoiceStep.CONFIRM_PICKUP:
        if (lowerText.includes('yes') || lowerText.includes('correct')) {
          changeStep(VoiceStep.DESTINATION);
        } else if (lowerText.includes('no')) {
          changeStep(VoiceStep.PICKUP_MANUAL);
        }
        break;

      case VoiceStep.PICKUP_MANUAL:
        if (text.length > 2) {
          setPickup(text);
          changeStep(VoiceStep.CONFIRM_PICKUP);
        }
        break;

      case VoiceStep.DESTINATION:
        if (text.length > 2) {
          // Simulate Places API search
          const searchResult = text.toLowerCase().includes('airport') 
            ? "Chennai International Airport" 
            : text;
          setDestination(searchResult);
          changeStep(VoiceStep.CONFIRM_DESTINATION);
        }
        break;

      case VoiceStep.CONFIRM_DESTINATION:
        if (lowerText.includes('yes') || lowerText.includes('correct')) {
          changeStep(VoiceStep.FINAL_CONFIRM);
        } else if (lowerText.includes('no')) {
          changeStep(VoiceStep.DESTINATION);
        }
        break;

      case VoiceStep.FINAL_CONFIRM:
        if (lowerText.includes('yes') || lowerText.includes('confirm')) {
          changeStep(VoiceStep.BOOKING);
          onComplete(RIDE_OPTIONS[0], pickup, destination);
        } else if (lowerText.includes('no')) {
          onCancel();
        }
        break;
    }
  }, [step, lastSpoken, tempName, pickup, destination, passengerProfile, setPassengerProfile, speak, onComplete, onCancel, changeStep, goBack]);

  useEffect(() => {
    if (transcript && status === 'processing') {
      processCommand(transcript);
    }
  }, [transcript, status, processCommand]);

  useEffect(() => {
    if (!isSpeaking && step !== VoiceStep.BOOKING && step !== VoiceStep.PICKUP_DETECT) {
      startListening();
    } else if (isSpeaking) {
      stopListening();
    }
  }, [isSpeaking, step, startListening, stopListening]);

  useEffect(() => {
    let message = '';
    switch (step) {
      case VoiceStep.WELCOME:
        message = `Please tell me your name.`;
        break;
      case VoiceStep.NAME:
        message = `What is your name?`;
        break;
      case VoiceStep.CONFIRM_NAME:
        message = `I heard ${tempName}. Is that correct?`;
        break;
      case VoiceStep.PICKUP_DETECT:
        message = `I will now detect your pickup location.`;
        // Simulate geolocation
        const geoTimer = setTimeout(() => {
          setPickup("Anna Nagar, Chennai");
          setStep(VoiceStep.CONFIRM_PICKUP);
        }, 3000);
        speak(message, 'en-US', 1);
        setLastSpoken(message);
        return () => clearTimeout(geoTimer);
      case VoiceStep.PICKUP_MANUAL:
        message = `Where should I pick you up?`;
        break;
      case VoiceStep.CONFIRM_PICKUP:
        message = `I found your pickup location as ${pickup}. Do you want to use this?`;
        break;
      case VoiceStep.DESTINATION:
        message = `Where would you like to go?`;
        break;
      case VoiceStep.CONFIRM_DESTINATION:
        message = `Did you mean ${destination}?`;
        break;
      case VoiceStep.FINAL_CONFIRM:
        message = `You are traveling from ${pickup} to ${destination}. Do you want to confirm your ride?`;
        break;
      case VoiceStep.BOOKING:
        message = `Your ride is being booked. Please wait.`;
        break;
    }

    if (message && step !== VoiceStep.WELCOME) { // Welcome is handled in the first useEffect
      setLastSpoken(message);
      speak(message, 'en-US', 1);
    }
  }, [step, tempName, pickup, destination, speak]);

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Voice Recognition Not Supported</h2>
        <p className="text-gray-300">Your browser does not support voice recognition. Please use a modern browser like Chrome.</p>
        <button onClick={onCancel} className="mt-6 px-6 py-3 bg-white/10 rounded-xl">Go Back</button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Microphone Access Denied</h2>
        <p className="text-gray-300">Aura needs microphone access to work in Accessibility Mode. Please enable it in your browser settings.</p>
        <button onClick={onCancel} className="mt-6 px-6 py-3 bg-white/10 rounded-xl">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-2xl mx-auto min-h-[70vh] space-y-8">
      <header className="text-center w-full">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--color-accent-aqua))] to-[rgb(var(--color-accent-purple))]">
          Aura Voice Assistant
        </h2>
      </header>

      {/* Assistant Message Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Assistant</div>
        <div className="text-2xl md:text-3xl font-medium text-white leading-tight">
          {lastSpoken || "Initializing..."}
        </div>
      </motion.div>

      {/* Listening Status Indicator */}
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${status === 'listening' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
        <span className={`text-sm font-bold uppercase tracking-widest ${status === 'listening' ? 'text-green-400' : 'text-gray-500'}`}>
          {status === 'listening' ? '● Listening...' : '● Idle'}
        </span>
      </div>

      {/* Recognized Speech Box */}
      <AnimatePresence>
        {transcript && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-[rgb(var(--color-accent-aqua))]/10 border border-[rgb(var(--color-accent-aqua))]/20 rounded-2xl p-6"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--color-accent-aqua))]/60 mb-2">You said</div>
            <div className="text-xl text-white italic font-medium">
              "{transcript}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Feedback for Voice */}
      <div className="relative flex items-center justify-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${status === 'listening' ? 'bg-[rgb(var(--color-accent-aqua))] shadow-[0_0_40px_rgba(var(--color-accent-aqua),0.4)]' : 'bg-white/5'}`}>
          <FaMicrophone className={`text-4xl ${status === 'listening' ? 'text-white animate-bounce' : 'text-white/20'}`} />
        </div>
        {status === 'listening' && (
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 border-2 border-[rgb(var(--color-accent-aqua))] rounded-full"
          />
        )}
      </div>

      {/* Controls (Optional for Accessibility Mode but good for debugging/fallback) */}
      <div className="grid grid-cols-2 gap-4 w-full pt-8">
        <button onClick={() => speak(lastSpoken, 'en-US', 1)} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
          <FaPlay className="text-sm" /> <span className="text-xs font-bold uppercase">Repeat</span>
        </button>
        <button onClick={() => setStep(VoiceStep.WELCOME)} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
          <FaUndo className="text-sm" /> <span className="text-xs font-bold uppercase">Start Over</span>
        </button>
      </div>
    </div>
  );
};

export default VoiceAssistantController;
