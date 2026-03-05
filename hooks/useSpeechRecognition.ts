
import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognitionStatus } from '../types';

// FIX: Add types for the Web Speech API, which may not be part of the default TypeScript DOM library.
// This resolves errors about 'SpeechRecognition' and 'webkitSpeechRecognition' not being found.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type PermissionState = 'granted' | 'prompt' | 'denied';

interface SpeechRecognitionHook {
  isSupported: boolean;
  status: SpeechRecognitionStatus;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  error: string | null;
  permission: PermissionState;
}

const useSpeechRecognition = (lang: string, continuous: boolean = false): SpeechRecognitionHook => {
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for permissions API support and query status
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setPermission(permissionStatus.state);
          permissionStatus.onchange = () => {
            setPermission(permissionStatus.state);
          };
        }).catch(err => {
            console.warn("Permissions API not fully supported for microphone query.", err);
        });
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.continuous = continuous;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setStatus('listening');
      };

      recognition.onresult = (event) => {
        const currentTranscript = event.results[event.results.length - 1][0].transcript;
        setTranscript(currentTranscript);
        setStatus('processing');
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // "no-speech" and "aborted" are not critical failures. They just mean the user was silent or the action was cancelled.
        if (event.error === 'no-speech' || event.error === 'aborted') {
          setStatus('idle');
          return;
        }
        
        // The 'network' error is often transient. We treat it as a non-critical failure
        // and allow the user to simply try again without a persistent error message.
        if (event.error === 'network') {
          console.warn('Speech recognition network error. Resetting to allow user retry.');
          setStatus('idle');
          return;
        }

        // For all other, genuine errors:
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          // Sync our permission state if we receive this error
          setPermission('denied');
        }
        setError(event.error);
        setStatus('error');
      };

      recognition.onend = () => {
        // Reset to idle unless we are in an error state.
        setStatus(currentStatus => currentStatus === 'error' ? 'error' : 'idle');
      };
    }
  }, []); // This effect runs only once on mount to set everything up.
  
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  const startListening = useCallback(() => {
    // Proactively block if permission is denied
    if (permission === 'denied') {
      setError('not-allowed');
      setStatus('error');
      return;
    }

    if (recognitionRef.current && (status === 'idle' || status === 'error')) {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    }
  }, [status, permission]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && status === 'listening') {
      recognitionRef.current.stop();
    }
  }, [status]);

  return { isSupported, status, startListening, stopListening, transcript, error, permission };
};

export default useSpeechRecognition;