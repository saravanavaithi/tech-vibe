import { PassengerProfile, RideStatus, Language, RideCurrentStatus, RideOption, ContrastLevel, ColorBlindnessMode } from './types';
import { FaCar, FaWheelchair, FaUserPlus } from 'react-icons/fa';

export const RIDE_OPTIONS: RideOption[] = [
  {
    id: 'standard',
    name: 'Standard Ride',
    description: 'A standard vehicle for up to 4 passengers.',
    price: 25.50,
    icon: FaCar,
  },
  {
    id: 'wheelchair',
    name: 'Wheelchair Van',
    description: 'A vehicle with ramp or lift access.',
    price: 35.00,
    icon: FaWheelchair,
  },
  {
    id: 'assisted',
    name: 'Assisted Ride',
    description: 'Driver provides extra assistance from door to door.',
    price: 40.00,
    icon: FaUserPlus,
  },
];


export const INITIAL_PASSENGER_PROFILE: PassengerProfile = {
  name: 'Alex',
  assistanceNeeds: ['Visually Impaired', 'Uses a cane'],
  preferences: {
    language: Language.EN,
    largeFont: false,
    voiceOutput: true,
    voiceSpeed: 1,
    hapticFeedback: true,
    signLanguage: false,
    contrast: ContrastLevel.NORMAL,
    colorBlindness: ColorBlindnessMode.NONE,
  },
  caregiverContact: '',
  caregiverNotifications: {
    rideStartEnd: true,
    etaUpdates: true,
    emergencyAlerts: true,
  },
};

export const INITIAL_RIDE_STATUS: RideStatus = {
  pickup: '123 Main St, Cityville',
  destination: 'National Art Museum',
  totalTripMinutes: 30,
  etaMinutes: 30,
  driver: {
    name: 'Ben',
    vehicle: 'Blue Toyota Prius',
  },
  routeDescription: 'Via City Center highway. Light traffic expected.',
  status: RideCurrentStatus.IN_PROGRESS,
};

export const SIGN_LANGUAGE_VIDEOS: Record<string, string> = {
  'eta': 'https://www.signasl.org/assets/videos/time.mp4',
  'time': 'https://www.signasl.org/assets/videos/time.mp4',
  'where': 'https://www.signasl.org/assets/videos/where.mp4',
  'location': 'https://www.signasl.org/assets/videos/where.mp4',
  'help': 'https://www.signasl.org/assets/videos/help.mp4',
  'assistance': 'https://www.signasl.org/assets/videos/help.mp4',
  'seat': 'https://www.signasl.org/assets/videos/seat.mp4',
  'temperature': 'https://www.signasl.org/assets/videos/temperature.mp4',
  'hot': 'https://www.signasl.org/assets/videos/hot.mp4',
  'cold': 'https://www.signasl.org/assets/videos/cold.mp4',
  'emergency': 'https://www.signasl.org/assets/videos/emergency.mp4',
  'stop': 'https://www.signasl.org/assets/videos/stop.mp4',
  'hello': 'https://www.signasl.org/assets/videos/hello.mp4',
  'welcome': 'https://www.signasl.org/assets/videos/welcome.mp4',
  'thank you': 'https://www.signasl.org/assets/videos/thank-you.mp4',
  'yes': 'https://www.signasl.org/assets/videos/yes.mp4',
  'no': 'https://www.signasl.org/assets/videos/no.mp4',
  'fasten': 'https://www.signasl.org/assets/videos/seatbelt.mp4',
  'seatbelt': 'https://www.signasl.org/assets/videos/seatbelt.mp4',
};

export const QUICK_ACTIONS: Record<Language, { label: string; query: string }[]> = {
  [Language.EN]: [
    { label: "ETA?", query: "What is my current ETA?" },
    { label: "What's Around?", query: "Can you describe what's around us?" },
    { label: "Better Route?", query: "Is there a faster route available?" },
    { label: "Need Help", query: "I need some assistance." },
  ],
  [Language.FR]: [
    { label: "ETA?", query: "Quelle est mon ETA actuelle ?" },
    { label: "Qu'y a-t-il autour?", query: "Pouvez-vous décrire ce qui nous entoure ?" },
    { label: "Meilleur Itinéraire?", query: "Existe-t-il un itinéraire plus rapide ?" },
    { label: "Besoin d'aide", query: "J'ai besoin d'aide." },
  ],
  [Language.TA]: [
    { label: "ETA?", query: "எனது தற்போதைய ETA என்ன?" },
    { label: "சுற்றி என்ன?", query: "நம்மைச் சுற்றி என்ன இருக்கிறது என்று விவரிக்க முடியுமா?" },
    { label: "சிறந்த வழி?", query: "வேகமான பாதை உள்ளதா?" },
    { label: "உதவி தேவை", query: "எனக்கு சில உதவிகள் தேவை." },
  ],
};