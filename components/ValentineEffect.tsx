
import React from 'react';
import { motion } from 'framer-motion';
import { isSplashDay } from '../constants';

const ValentineEffect: React.FC = () => {
  const isSpecial = isSplashDay();

  if (!isSpecial) return (
    <div className="fixed inset-0 pointer-events-none -z-10 opacity-40">
      {/* Subtle floating buds - optimized for larger screens */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl lg:text-4xl filter grayscale-[0.2] opacity-20"
          style={{ 
            left: `${(i * 15 + 5) % 100}%`, 
            top: `${(i * 20 + 10) % 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
        >
          {i % 2 === 0 ? '🌿' : '🌱'}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Pink Glow Overlay - Slightly warmer for special occasions */}
      <div className="absolute inset-0 bg-rose-500/5 mix-blend-multiply pointer-events-none" />
      
      {/* Floating Petals - Higher Density and varying sizes */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl lg:text-4xl text-rose-300/40"
          initial={{ y: -50, x: Math.random() * 100 + '%', rotate: 0 }}
          animate={{
            y: '110vh',
            x: `+=${Math.sin(i) * 100}px`,
            rotate: 720
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 20
          }}
        >
          {i % 3 === 0 ? '🌸' : i % 3 === 1 ? '💖' : '💕'}
        </motion.div>
      ))}

      {/* Blossoming Flowers - Corner Accentuation */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.12 }}
        className="absolute -bottom-20 -left-20 w-80 lg:w-[32rem] h-80 lg:h-[32rem] text-[10rem] lg:text-[18rem] flex items-center justify-center filter blur-[2px]"
      >
        🌺
      </motion.div>
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.12 }}
        className="absolute -top-20 -right-20 w-80 lg:w-[32rem] h-80 lg:h-[32rem] text-[10rem] lg:text-[18rem] flex items-center justify-center filter blur-[2px]"
      >
        🌹
      </motion.div>
    </div>
  );
};

export default ValentineEffect;
