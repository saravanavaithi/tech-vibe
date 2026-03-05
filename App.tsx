import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, PassengerProfile, RideStatus, Message, NewRouteSuggestion, RideCurrentStatus, AppState, RideOption, InteractionMode } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import useSpeechSynthesis from './hooks/useSpeechSynthesis';
import { INITIAL_PASSENGER_PROFILE, INITIAL_RIDE_STATUS } from './constants';
import { getAuraResponse, getVisionDescription } from './services/geminiService';
import { sendSms } from './services/smsService';
import { triggerHaptic, hapticPatterns } from './services/hapticService';
import PassengerView from './components/views/PassengerView';
import DriverView from './components/views/DriverView';
import CaregiverView from './components/views/CaregiverView';
import BookingView from './components/views/BookingView';
import ConfirmationView from './components/views/ConfirmationView';
import WaitingView from './components/views/WaitingView';
import AuthView from './components/views/AuthView';
import ModeSelector from './components/ModeSelector';
import { l } from './services/localization';
import { FaUser, FaUserCog, FaUserNurse } from 'react-icons/fa';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.MODE_SELECTION);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(InteractionMode.STANDARD);
  const [currentUserRole, setCurrentUserRole] = useLocalStorage<UserRole>('aura_userRole', UserRole.PASSENGER);
  const [passengerProfile, setPassengerProfile] = useLocalStorage<PassengerProfile>('aura_passengerProfile', INITIAL_PASSENGER_PROFILE);
  const [rideStatus, setRideStatus] = useState<RideStatus>(INITIAL_RIDE_STATUS);
  const [messageLog, setMessageLog] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisionProcessing, setIsVisionProcessing] = useState(false);
  const [newRouteSuggestion, setNewRouteSuggestion] = useState<NewRouteSuggestion | null>(null);
  const [visionRequestTrigger, setVisionRequestTrigger] = useState(0);
  const [halfwayNotified, setHalfwayNotified] = useState(false);
  const [isVisionOnCooldown, setIsVisionOnCooldown] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const visionCooldownTimer = useRef<number | null>(null);

  const [bookingDetails, setBookingDetails] = useState<{ rideOption: RideOption | null, pickup: string, destination: string }>({ rideOption: null, pickup: '', destination: '' });

  const { speak, cancel, isSpeaking } = useSpeechSynthesis();
  const T = l(passengerProfile.preferences.language);
  
  const prevAppStateRef = useRef<AppState | undefined>(undefined);
  useEffect(() => {
    prevAppStateRef.current = appState;
  });
  const prevAppState = prevAppStateRef.current;

  // Skip AUTH if profile is already set up
  useEffect(() => {
    if (appState === AppState.AUTH && passengerProfile.name !== 'Alex') {
      setAppState(AppState.BOOKING);
    }
  }, []); // Only on mount
  
  const { voiceOutput, language, voiceSpeed, hapticFeedback } = passengerProfile.preferences;

  const [trafficFactor, setTrafficFactor] = useState(1);

  useEffect(() => {
    if (appState !== AppState.IN_RIDE) return;

    const timer = setInterval(() => {
      setRideStatus(prev => {
        if (prev.status === RideCurrentStatus.IN_PROGRESS && prev.etaMinutes > 0) {
          // Simulate traffic affecting ETA
          // 20% chance of traffic delay
          const isTrafficDelay = Math.random() < 0.2;
          if (isTrafficDelay) {
            setTrafficFactor(1.5);
            return { ...prev, etaMinutes: prev.etaMinutes }; // No progress this tick
          } else {
            setTrafficFactor(1);
            return { ...prev, etaMinutes: prev.etaMinutes - 1 };
          }
        }
        if (prev.status === RideCurrentStatus.IN_PROGRESS && prev.etaMinutes <= 0) {
          setAppState(AppState.FINISHED);
          return { ...prev, status: RideCurrentStatus.FINISHED, etaMinutes: 0 };
        }
        return prev;
      });
    }, 10000); // Slower progress update

    return () => clearInterval(timer);
  }, [appState]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (visionCooldownTimer.current) {
        window.clearTimeout(visionCooldownTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
        appState === AppState.IN_RIDE &&
        !halfwayNotified &&
        rideStatus.etaMinutes <= rideStatus.totalTripMinutes / 2 &&
        rideStatus.etaMinutes > 0
    ) {
        if (passengerProfile.caregiverContact && passengerProfile.caregiverNotifications.etaUpdates) {
            const message = `Aura ETA Update: ${passengerProfile.name} is about halfway to their destination. New ETA: ${rideStatus.etaMinutes} minutes.`;
            sendSms(passengerProfile.caregiverContact, message);
        }
        setHalfwayNotified(true);
    }
  }, [appState, rideStatus, halfwayNotified, passengerProfile]);

  const handleBooking = (rideOption: RideOption, pickup: string, destination: string) => {
    setBookingDetails({ rideOption, pickup, destination });
    
    if (interactionMode === InteractionMode.VOICE_ONLY) {
      // Skip confirmation screen for voice-only mode as it's handled by the assistant
      const totalTripMinutes = 30;
      setRideStatus({
        ...INITIAL_RIDE_STATUS,
        pickup: pickup,
        destination: destination,
        totalTripMinutes: totalTripMinutes,
        etaMinutes: totalTripMinutes,
        status: RideCurrentStatus.IN_PROGRESS,
      });
      setHalfwayNotified(false);
      setAppState(AppState.WAITING);
    } else {
      setAppState(AppState.CONFIRMING);
    }
  };

  const handleConfirm = () => {
    if (!bookingDetails.rideOption || !bookingDetails.destination || !bookingDetails.pickup) return;
    
    const totalTripMinutes = 30;
    setRideStatus({
      ...INITIAL_RIDE_STATUS,
      pickup: bookingDetails.pickup,
      destination: bookingDetails.destination,
      totalTripMinutes: totalTripMinutes,
      etaMinutes: totalTripMinutes,
      status: RideCurrentStatus.IN_PROGRESS,
    });
    setHalfwayNotified(false);
    setAppState(AppState.WAITING);
  };

  const postAuraSystemMessage = useCallback((text: string, auraData: Partial<Message['auraData']> = {}) => {
    const auraMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'aura',
      text: text,
      timestamp: new Date(),
      auraData: {
        intent: 'INFO',
        response_text: text,
        driver_instruction: auraData.driver_instruction || null,
        caregiver_alert: auraData.caregiver_alert || null,
      },
    };
    setMessageLog(prev => [...prev, auraMessage]);

    if (voiceOutput) {
      speak(text, language, voiceSpeed);
    }
     if (hapticFeedback) {
      navigator.vibrate?.([50, 50, 50]);
    }
  }, [voiceOutput, language, voiceSpeed, hapticFeedback, speak]);
  
  const handleDescribeSurroundings = async (base64Image: string) => {
    if (isVisionProcessing || isVisionOnCooldown) return;
    setIsVisionProcessing(true);
    
    const description = await getVisionDescription(base64Image, passengerProfile);
    
    if (description.includes("high volume of requests")) {
      postAuraSystemMessage(description);
      setIsVisionOnCooldown(true);
      if (visionCooldownTimer.current) {
        window.clearTimeout(visionCooldownTimer.current);
      }
      visionCooldownTimer.current = window.setTimeout(() => {
        setIsVisionOnCooldown(false);
        postAuraSystemMessage("You can now try describing your surroundings again.");
      }, 30000);
    } else {
      postAuraSystemMessage(`Here's what I see: ${description}`);
    }
    
    setIsVisionProcessing(false);
  };

  useEffect(() => {
    if (appState === AppState.IN_RIDE && prevAppState === AppState.WAITING) {
      const welcomeMessage = `Hello ${passengerProfile.name}, your ride to ${rideStatus.destination} is starting now. Please fasten your seatbelt. I'm Aura, your in-ride assistant. If you need anything, just ask.`;
      postAuraSystemMessage(welcomeMessage);
      
      if (passengerProfile.caregiverContact && passengerProfile.caregiverNotifications.rideStartEnd) {
        const trackingId = Math.random().toString(36).substring(7);
        const trackingLink = `${window.location.origin}/track/${trackingId}`;
        const message = `Aura Ride Start: ${passengerProfile.name} is en route to ${rideStatus.destination}. Track ride: ${trackingLink}`;
        sendSms(passengerProfile.caregiverContact, message);
      }
    }
  }, [appState, prevAppState, passengerProfile, rideStatus.destination, postAuraSystemMessage]);
  
  useEffect(() => {
    if (appState === AppState.FINISHED && prevAppState === AppState.IN_RIDE) {
        if (passengerProfile.caregiverContact && passengerProfile.caregiverNotifications.rideStartEnd) {
            const message = `Aura Ride Complete: ${passengerProfile.name} has arrived safely at ${rideStatus.destination}.`;
            sendSms(passengerProfile.caregiverContact, message);
        }
    }
  }, [appState, prevAppState, passengerProfile, rideStatus.destination]);


  const handleEmergency = () => {
    if (rideStatus.status === RideCurrentStatus.EMERGENCY) return;
    setRideStatus(prev => ({...prev, status: RideCurrentStatus.EMERGENCY}));

    const driverInstruction = "EMERGENCY: Passenger requires immediate assistance. Pull over when safe.";
    const caregiverAlert = "EMERGENCY: Passenger has activated the SOS button.";

    postAuraSystemMessage(T('emergencyConfirmed'), {
        driver_instruction: driverInstruction,
        caregiver_alert: caregiverAlert
    });

    if (passengerProfile.caregiverContact && passengerProfile.caregiverNotifications.emergencyAlerts) {
      const locationStr = currentLocation 
        ? `Location: https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`
        : "Location: Unknown (GPS unavailable)";
      
      const needsStr = passengerProfile.assistanceNeeds.length > 0
        ? `Assistance Needs: ${passengerProfile.assistanceNeeds.join(', ')}`
        : "No specific assistance needs listed.";

      const message = `AURA EMERGENCY ALERT!
Passenger: ${passengerProfile.name}
Status: SOS Activated
${locationStr}
Destination: ${rideStatus.destination}
${needsStr}
Please check on them immediately.`;

      sendSms(passengerProfile.caregiverContact, message);
    }
  }

  const handleRouteDecision = (accept: boolean) => {
    if (accept && newRouteSuggestion) {
      setRideStatus(prev => ({
        ...prev,
        etaMinutes: newRouteSuggestion.etaMinutes,
        totalTripMinutes: newRouteSuggestion.etaMinutes,
        routeDescription: newRouteSuggestion.description,
        status: RideCurrentStatus.IN_PROGRESS,
      }));
      postAuraSystemMessage(T('routeAccepted'));
    } else {
      setRideStatus(prev => ({...prev, status: RideCurrentStatus.IN_PROGRESS}));
      postAuraSystemMessage(T('routeDeclined'));
    }
    setNewRouteSuggestion(null);
  }

  const handleCommand = async (command: string) => {
    if (isProcessing) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: command, timestamp: new Date() };
    setMessageLog(prev => [...prev, userMessage]);
    
    if (passengerProfile.preferences.hapticFeedback) {
      navigator.vibrate?.(100);
    }
    
    const lowerCommand = command.toLowerCase();

    if (rideStatus.status === RideCurrentStatus.ROUTE_SUGGESTION) {
        const acceptWords = ['accept', 'yes', 'confirm', 'ok', 'yep', 'sounds good', 'accepter', 'oui'];
        const declineWords = ['decline', 'no', 'reject', 'nope', 'cancel', 'refuser', 'non'];
        
        if (acceptWords.some(word => lowerCommand.includes(word))) {
            handleRouteDecision(true);
            return;
        }
        if (declineWords.some(word => lowerCommand.includes(word))) {
            handleRouteDecision(false);
            return;
        }
    }

    if (['emergency', 'sos', 'aide-moi', 'urgence'].some(word => lowerCommand.includes(word))) {
        handleEmergency();
        return;
    }

    setIsProcessing(true);
    const auraResponseData = await getAuraResponse(command, passengerProfile, rideStatus);
    
    const auraMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'aura',
      text: auraResponseData.response_text,
      timestamp: new Date(),
      auraData: auraResponseData,
    };
    setMessageLog(prev => [...prev, auraMessage]);
    
    if (auraResponseData.intent === 'DESCRIBE_SURROUNDINGS') {
      setVisionRequestTrigger(Date.now());
    }
    
    if (auraResponseData.intent === 'ROUTE_SUGGESTION' && auraResponseData.new_route_details) {
        setNewRouteSuggestion(auraResponseData.new_route_details);
        setRideStatus(prev => ({ ...prev, status: RideCurrentStatus.ROUTE_SUGGESTION }));
    }
    
    if (auraResponseData.intent === 'EMERGENCY') {
        setRideStatus(prev => ({...prev, status: RideCurrentStatus.EMERGENCY}));
    }

    if (passengerProfile.preferences.voiceOutput) {
      const langCode = passengerProfile.preferences.language;
      speak(auraResponseData.response_text, langCode, passengerProfile.preferences.voiceSpeed);
    }
     if (passengerProfile.preferences.hapticFeedback) {
      navigator.vibrate?.([50, 50, 50]);
    }

    setIsProcessing(false);
  };
  
  const handleModeSelect = (mode: InteractionMode) => {
    setInteractionMode(mode);
    // If Voice-Only, go straight to booking where the conversational assistant handles setup
    if (mode === InteractionMode.VOICE_ONLY) {
      setAppState(AppState.BOOKING);
      return;
    }
    // For Standard mode, check if profile is already set up
    if (passengerProfile.name !== 'Alex') {
      setAppState(AppState.BOOKING);
    } else {
      setAppState(AppState.AUTH);
    }
  };

  const renderCurrentScreen = () => {
    if (currentUserRole !== UserRole.PASSENGER) {
        if (appState === AppState.IN_RIDE || appState === AppState.FINISHED || appState === AppState.WAITING) {
            switch(currentUserRole) {
                case UserRole.DRIVER:
                    return <DriverView passengerProfile={passengerProfile} rideStatus={rideStatus} messageLog={messageLog} />;
                case UserRole.CAREGIVER:
                    return <CaregiverView rideStatus={rideStatus} messageLog={messageLog} currentLocation={currentLocation} />;
                default: return null;
            }
        } else {
            return <div className="text-center p-10 text-gray-300">Waiting for passenger to start a ride...</div>
        }
    }
    
    switch (appState) {
      case AppState.MODE_SELECTION:
        return <ModeSelector onSelect={handleModeSelect} />;
      case AppState.AUTH:
        return <AuthView passengerProfile={passengerProfile} setPassengerProfile={setPassengerProfile} onComplete={() => setAppState(AppState.BOOKING)} />;
      case AppState.BOOKING:
        return <BookingView 
          passengerProfile={passengerProfile} 
          setPassengerProfile={setPassengerProfile} 
          onBooking={handleBooking} 
          interactionMode={interactionMode} 
          onCancel={() => setAppState(AppState.MODE_SELECTION)}
        />;
      case AppState.CONFIRMING:
        if (!bookingDetails.rideOption) return null;
        return <ConfirmationView 
            rideOption={bookingDetails.rideOption} 
            pickup={bookingDetails.pickup}
            destination={bookingDetails.destination} 
            onConfirm={handleConfirm}
            onCancel={() => setAppState(AppState.BOOKING)}
            lang={passengerProfile.preferences.language}
            passengerProfile={passengerProfile}
        />;
      case AppState.WAITING:
        return <WaitingView onDriverFound={() => setAppState(AppState.IN_RIDE)} driver={rideStatus.driver} />;
      case AppState.IN_RIDE:
        return <PassengerView
          passengerProfile={passengerProfile}
          setPassengerProfile={setPassengerProfile}
          rideStatus={rideStatus}
          handleCommand={handleCommand}
          isProcessing={isProcessing}
          messageLog={messageLog}
          handleEmergency={handleEmergency}
          newRouteSuggestion={newRouteSuggestion}
          handleRouteDecision={handleRouteDecision}
          handleDescribeSurroundings={handleDescribeSurroundings}
          isVisionProcessing={isVisionProcessing}
          isVisionOnCooldown={isVisionOnCooldown}
          visionRequestTrigger={visionRequestTrigger}
          isSpeaking={isSpeaking}
          onStopSpeaking={cancel}
          currentLocation={currentLocation}
        />;
      case AppState.FINISHED:
          return (
            <div className="text-center p-10 flex flex-col justify-center items-center h-[calc(100vh-80px)]">
                <h2 className="text-3xl font-bold mb-4 text-white">Ride Finished!</h2>
                <p className="text-gray-200">You have arrived at {rideStatus.destination}.</p>
                <button onClick={() => {
                    setAppState(AppState.BOOKING);
                    setMessageLog([]);
                }} className="mt-6 px-6 py-3 bg-[rgb(var(--color-accent-purple))] rounded-lg hover:bg-[rgba(var(--color-accent-purple),0.8)] font-bold transition-colors">
                    Book Another Ride
                </button>
            </div>
          );
      default:
        return <BookingView 
          passengerProfile={passengerProfile} 
          setPassengerProfile={setPassengerProfile} 
          onBooking={handleBooking} 
          interactionMode={interactionMode} 
          onCancel={() => setAppState(AppState.MODE_SELECTION)}
        />;
    }
  };
  
  const roleIcons: Record<UserRole, React.ReactNode> = {
    [UserRole.PASSENGER]: <FaUser/>,
    [UserRole.DRIVER]: <FaUserCog/>,
    [UserRole.CAREGIVER]: <FaUserNurse/>
  }

  return (
    <div className={`min-h-screen w-full text-white ${passengerProfile.preferences.largeFont ? 'large-font' : ''} contrast-${(passengerProfile.preferences.contrast || 'Normal').toLowerCase()} colorblind-${(passengerProfile.preferences.colorBlindness || 'None').toLowerCase()}`}>
       <div className="min-h-screen w-full">
        <header className="p-4 bg-black/20 backdrop-blur-md flex justify-between items-center shadow-lg sticky top-0 z-40 border-b border-white/10">
          <h1 className="text-xl md:text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--color-accent-aqua))] to-[rgb(var(--color-accent-purple))]">Aura</h1>
            <div className="flex items-center space-x-4">
                <div className="flex space-x-1 p-1 bg-black/20 rounded-lg border border-white/10">
                    {Object.values(UserRole).map(role => (
                    <button 
                        key={role}
                        onClick={() => setCurrentUserRole(role)}
                        className={`px-3 py-1.5 rounded-md text-sm md:text-base font-semibold flex items-center space-x-2 transition-all duration-300 ${currentUserRole === role ? 'bg-[rgb(var(--color-accent-purple))] text-white shadow-md' : 'text-gray-300 hover:bg-white/10'}`}
                    >
                    {roleIcons[role]} <span className="hidden md:inline">{T(role.toLowerCase())}</span>
                    </button>
                    ))}
                </div>
            </div>
        </header>
        <main>
          {renderCurrentScreen()}
        </main>
       </div>
    </div>
  );
};

export default App;