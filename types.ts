import React from 'react';

export enum AppState {
  MODE_SELECTION = 'MODE_SELECTION',
  AUTH = 'AUTH',
  BOOKING = 'BOOKING',
  CONFIRMING = 'CONFIRMING',
  WAITING = 'WAITING',
  IN_RIDE = 'IN_RIDE',
  FINISHED = 'FINISHED',
}

export enum InteractionMode {
  VOICE_ONLY = 'VOICE_ONLY',
  STANDARD = 'STANDARD',
}

export enum UserRole {
  PASSENGER = 'Passenger',
  DRIVER = 'Driver',
  CAREGIVER = 'Caregiver',
}

export enum RideCurrentStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  EMERGENCY = 'EMERGENCY',
  ROUTE_SUGGESTION = 'ROUTE_SUGGESTION',
  FINISHED = 'FINISHED',
}

export enum Language {
  EN = 'English',
  FR = 'French',
  TA = 'Tamil',
}

export enum ContrastLevel {
  NORMAL = 'Normal',
  HIGH = 'High',
}

export enum ColorBlindnessMode {
  NONE = 'None',
  PROTANOPIA = 'Protanopia',
  DEUTERANOPIA = 'Deuteranopia',
  TRITANOPIA = 'Tritanopia',
}

export interface RideOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
}

export interface AccessibilityPreferences {
  language: Language;
  largeFont: boolean;
  voiceOutput: boolean;
  voiceSpeed: number;
  hapticFeedback: boolean;
  signLanguage: boolean;
  contrast: ContrastLevel;
  colorBlindness: ColorBlindnessMode;
}

export interface CaregiverNotifications {
  rideStartEnd: boolean;
  etaUpdates: boolean;
  emergencyAlerts: boolean;
}

export interface PassengerProfile {
  name: string;
  assistanceNeeds: string[];
  preferences: AccessibilityPreferences;
  caregiverContact?: string;
  caregiverNotifications: CaregiverNotifications;
}

export interface RideStatus {
  pickup: string;
  destination: string;
  totalTripMinutes: number;
  etaMinutes: number;
  driver: {
    name: string;
    vehicle: string;
  };
  routeDescription: string;
  status: RideCurrentStatus;
}

export interface NewRouteSuggestion {
  name: string;
  etaMinutes: number;
  description: string;
}

export interface AuraResponse {
  // FIX: Add 'DESCRIBE_SURROUNDINGS' to the union of possible intent values.
  // This aligns the type with the schema defined in `geminiService.ts` and fixes the comparison error in `App.tsx`.
  intent: 'INFO' | 'ASSIST' | 'EMERGENCY' | 'ROUTE_SUGGESTION' | 'DESCRIBE_SURROUNDINGS';
  response_text: string;
  driver_instruction: string | null;
  caregiver_alert: string | null;
  new_route_details?: NewRouteSuggestion;
}

export interface Message {
  id: string;
  sender: 'user' | 'aura';
  text: string;
  timestamp: Date;
  auraData?: AuraResponse;
}

export type SpeechRecognitionStatus = 'idle' | 'listening' | 'processing' | 'error';