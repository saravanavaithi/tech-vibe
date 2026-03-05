import React, { useState, useEffect } from 'react';
import { FaSignLanguage, FaTimes, FaKeyboard, FaPlayCircle, FaExternalLinkAlt } from 'react-icons/fa';

interface SignLanguagePlayerProps {
  text: string;
}

const SignLanguagePlayer: React.FC<SignLanguagePlayerProps> = ({ text }) => {
  const [inputText, setInputText] = useState(text);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const DEFAULT_OFFLINE_VIDEO = "https://drive.google.com/uc?id=1a76n3ViqyduVPXfe0jb9ymhzgB5WcXLx";

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setInputText(text);
  }, [text]);

  return (
    <div className="w-full max-w-7xl mx-auto bg-gray-900/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row min-h-[650px] transition-all duration-300">
        
        {/* Left Side: Text Input */}
        <div className="flex-1 p-6 md:p-10 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-gradient-to-br from-white/5 to-transparent relative">
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center space-x-2 text-[rgb(var(--color-accent-purple))]">
                    <FaKeyboard />
                    <span className="font-bold tracking-wide text-sm uppercase">Text Input</span>
                 </div>
                 <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{isOnline ? 'Online' : 'Offline'}</span>
                    <span className="text-xs font-medium bg-black/40 text-gray-300 px-3 py-1 rounded-full border border-white/5">English</span>
                 </div>
            </div>
            
            <div className="flex-grow relative">
                <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type to translate..."
                    className="w-full h-full bg-transparent border-none resize-none text-2xl md:text-4xl text-white placeholder-gray-600 focus:ring-0 p-0 leading-tight font-light"
                    spellCheck={false}
                />
                {inputText && (
                    <button 
                        onClick={() => setInputText('')} 
                        className="absolute top-0 right-0 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                        aria-label="Clear text"
                    >
                        <FaTimes size={16} />
                    </button>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-end text-sm text-gray-500">
                <p>Try: <span className="text-gray-400">"Emergency"</span>, <span className="text-gray-400">"Time"</span>, <span className="text-gray-400">"Help"</span></p>
                <span>{inputText.length} chars</span>
            </div>
        </div>

        {/* Right Side: Sign Output */}
        <div className="flex-1 bg-black/40 p-6 md:p-10 flex flex-col justify-center items-center relative shadow-inner">
             <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-10">
                 <div className="flex items-center space-x-2 text-[rgb(var(--color-accent-aqua))]">
                    <FaSignLanguage />
                    <span className="font-bold tracking-wide text-sm uppercase">Sign Language (ASL)</span>
                 </div>
                 
                 <div className="flex items-center space-x-3">
                    <a 
                        href="https://sign.mt/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-gray-500 hover:text-[rgb(var(--color-accent-aqua))] transition-colors text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-1 rounded hover:bg-black/40"
                    >
                        <span>sign.mt</span>
                        <FaExternalLinkAlt size={10} />
                    </a>
                 </div>
            </div>

            <div className="w-full h-full flex items-center justify-center pt-8 pb-2">
                {/* Video Container - Responsive & Constrained */}
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    {inputText ? (
                        <div className="relative w-full max-w-lg aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gray-900/50 border border-white/10 ring-1 ring-white/5 group">
                            {isOnline ? (
                                <iframe 
                                    src={`https://sign.mt/translate?text=${encodeURIComponent(inputText)}`} 
                                    className="w-full h-full border-none bg-white"
                                    title="Sign.mt Translation"
                                />
                            ) : (
                                <video 
                                    key="default-offline"
                                    src={DEFAULT_OFFLINE_VIDEO}
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline
                                    className="w-full h-full object-contain bg-black/20"
                                />
                            )}
                            {/* Decorative Play Icon on Hover */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <FaPlayCircle className="text-white/20 text-6xl" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-600 animate-pulse">
                            <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <FaSignLanguage size={48} className="opacity-30" />
                            </div>
                            <p className="text-lg font-medium opacity-50">Translation will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SignLanguagePlayer;