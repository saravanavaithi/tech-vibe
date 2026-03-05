import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUniversalAccess, FaKeyboard, FaMicrophone } from 'react-icons/fa';
import { InteractionMode } from '../types';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';

interface ModeSelectorProps {
  onSelect: (mode: InteractionMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect }) => {
  const { speak } = useSpeechSynthesis();
  const { startListening, transcript, status } = useSpeechRecognition('en-US', true);

  useEffect(() => {
    const welcomeText = "Welcome to Aura. If you need voice-only assistance, say Accessibility Mode. Otherwise say Standard Mode.";
    speak(welcomeText, 'en-US', 1);
    
    // Start listening after a short delay to allow the welcome message to start
    const timer = setTimeout(() => {
      startListening();
    }, 1000);

    return () => clearTimeout(timer);
  }, [speak, startListening]);

  useEffect(() => {
    if (transcript) {
      const lowerTranscript = transcript.toLowerCase();
      if (lowerTranscript.includes('accessibility') || lowerTranscript.includes('voice')) {
        onSelect(InteractionMode.VOICE_ONLY);
      } else if (lowerTranscript.includes('standard')) {
        onSelect(InteractionMode.STANDARD);
      }
    }
  }, [transcript, onSelect]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Choose Your Mode</h2>
        <p className="text-xl text-gray-300">How would you like to interact with Aura today?</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Accessibility Mode */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(InteractionMode.VOICE_ONLY)}
          className="group relative overflow-hidden bg-gradient-to-br from-[rgb(var(--color-accent-purple))] to-[rgb(var(--color-bg-mid))] p-8 rounded-3xl border-2 border-white/10 hover:border-[rgb(var(--color-accent-aqua))] transition-all text-left shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-[rgb(var(--color-accent-aqua))]/20 transition-colors">
              <FaUniversalAccess className="text-4xl text-white group-hover:text-[rgb(var(--color-accent-aqua))] transition-colors" />
            </div>
            <div className="flex items-center space-x-2 text-[rgb(var(--color-accent-aqua))]">
              <FaMicrophone className="animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-widest">Voice Only</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-3 text-white">Accessibility Mode</h3>
          <p className="text-gray-200 text-lg leading-relaxed">
            Designed for users who prefer or require voice-only interaction. Aura will guide you through every step.
          </p>
          <div className="mt-8 flex items-center text-white/60 text-sm font-medium italic">
            Say "Accessibility Mode" to select
          </div>
        </motion.button>

        {/* Standard Mode */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(InteractionMode.STANDARD)}
          className="group relative overflow-hidden bg-white/5 p-8 rounded-3xl border-2 border-white/10 hover:border-[rgb(var(--color-accent-purple))] transition-all text-left shadow-2xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-[rgb(var(--color-accent-purple))]/20 transition-colors">
              <FaKeyboard className="text-4xl text-white group-hover:text-[rgb(var(--color-accent-purple))] transition-colors" />
            </div>
            <div className="flex items-center space-x-2 text-white/40">
              <span className="text-sm font-bold uppercase tracking-widest">Manual + Voice</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-3 text-white">Standard Mode</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            A versatile mix of manual input and voice commands. Best for users who want flexibility.
          </p>
          <div className="mt-8 flex items-center text-white/40 text-sm font-medium italic">
            Say "Standard Mode" to select
          </div>
        </motion.button>
      </div>

      {status === 'listening' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-full border border-white/10"
        >
          <div className="w-3 h-3 bg-[rgb(var(--color-accent-aqua))] rounded-full animate-ping" />
          <span className="text-[rgb(var(--color-accent-aqua))] font-medium tracking-wide">Aura is listening...</span>
        </motion.div>
      )}
    </div>
  );
};

export default ModeSelector;
