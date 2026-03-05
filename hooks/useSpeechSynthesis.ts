
import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string, lang: string, rate: number) => void;
  cancel: () => void;
  isSpeaking: boolean;
}

const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;

  const speak = useCallback((text: string, lang: string, rate: number) => {
    if (synth.speaking) {
      synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ta' ? 'ta-IN' : lang === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = rate;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        // The 'canceled' and 'interrupted' errors are expected when we programmatically interrupt speech (e.g., by speaking again).
        // We don't need to log them as critical failures. For all other errors, we log the specific reason.
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.error('Speech synthesis error:', e.error);
        }
        setIsSpeaking(false);
    };
    synth.speak(utterance);
  }, [synth]);

  const cancel = useCallback(() => {
    synth.cancel();
    setIsSpeaking(false);
  }, [synth]);

  useEffect(() => {
    return () => {
      synth.cancel();
    };
  }, [synth]);

  return { speak, cancel, isSpeaking };
};

export default useSpeechSynthesis;