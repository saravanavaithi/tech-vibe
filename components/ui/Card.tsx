import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animateOnScroll?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', animateOnScroll = true }) => {
  return (
    <motion.div 
      initial={animateOnScroll ? { opacity: 0, y: 20 } : undefined}
      whileInView={animateOnScroll ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`bg-black/20 border border-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-4 md:p-6 relative overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;