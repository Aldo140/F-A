
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ArrowRight, X, PartyPopper, Stars } from 'lucide-react';
import { APP_CONTENT } from '../content';
import { isAnniversaryDate } from '../constants';

interface Props {
  onDismiss: () => void;
}

const ValentineSplash: React.FC<Props> = ({ onDismiss }) => {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);
  const [showBruh, setShowBruh] = useState(false);
  
  const isAnniversary = isAnniversaryDate();
  const content = isAnniversary ? APP_CONTENT.anniversary : APP_CONTENT.valentine;
  
  const [funnyMessage, setFunnyMessage] = useState(content.initialMessage);

  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const sparkles = useMemo(() => Array.from({ length: 20 }), []);
  const floatingIcons = useMemo(() => Array.from({ length: 12 }), []);

  const handleNoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAnniversary) {
      // For anniversary, just a gentle nudge
      setFunnyMessage("Wait, you don't mean that! 😉");
      return;
    }
    
    const nextCount = noCount + 1;
    setNoCount(nextCount);

    const roasts = APP_CONTENT.valentine.roasts;
    setFunnyMessage(roasts[Math.min(nextCount - 1, roasts.length - 1)]);

    if (nextCount % 3 === 0) {
      setShowBruh(true);
      setTimeout(() => setShowBruh(false), 1500);
    }

    if (containerRef.current) {
      const pad = 100;
      const maxX = (window.innerWidth / 2) - pad;
      const maxY = (window.innerHeight / 2) - pad;
      const chosenX = (Math.random() - 0.5) * maxX * 1.5;
      const chosenY = (Math.random() - 0.5) * maxY * 1.5;
      setNoButtonPos({ x: chosenX, y: chosenY });
    }
  };

  const themeColors = isAnniversary 
    ? { 
        bg: 'bg-[#fffdf5]', 
        primary: 'text-amber-500', 
        button: 'bg-amber-500 hover:bg-amber-600', 
        accent: 'text-amber-300',
        glow: 'rgba(251, 191, 36, 0.2)'
      }
    : { 
        bg: 'bg-[#fffcfc]', 
        primary: 'text-rose-500', 
        button: 'bg-rose-600 hover:bg-rose-700', 
        accent: 'text-rose-300',
        glow: 'rgba(244, 63, 94, 0.3)'
      };

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[99999] ${themeColors.bg} flex flex-col items-center justify-center p-6 text-center overflow-hidden`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_${themeColors.glow}_100%)]`} />
        {sparkles.map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className={`absolute ${themeColors.accent}/40`}
            initial={{ opacity: 0, x: Math.random() * 100 + '%', y: Math.random() * 100 + '%', scale: Math.random() * 0.5 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
          >
            {isAnniversary ? <Stars size={Math.random() * 16 + 8} /> : <Sparkles size={Math.random() * 16 + 8} />}
          </motion.div>
        ))}
        {floatingIcons.map((_, i) => (
          <motion.div
            key={`icon-bg-${i}`}
            className={`absolute ${isAnniversary ? 'text-amber-200/20' : 'text-rose-200/20'}`}
            initial={{ opacity: 0, x: Math.random() * 100 + '%', y: '110%', scale: Math.random() * 0.5 + 0.5 }}
            animate={{ opacity: [0, 0.3, 0], y: '-10%', rotate: [0, 90, -90, 0] }}
            transition={{ duration: 20 + Math.random() * 15, repeat: Infinity, delay: Math.random() * 10, ease: "linear" }}
          >
            {isAnniversary ? <PartyPopper size={Math.random() * 60 + 30} /> : <Heart size={Math.random() * 60 + 30} fill="currentColor" />}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showBruh && (
          <motion.div initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.5, y: -20 }} className="fixed inset-0 z-[100000] flex items-center justify-center pointer-events-none">
            <div className="bg-stone-900/90 backdrop-blur-md text-white px-8 py-4 rounded-full font-black text-2xl lg:text-4xl uppercase tracking-tighter italic shadow-2xl">
              {APP_CONTENT.valentine.bruhText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center h-full">
        <AnimatePresence mode="wait">
          {!hasAccepted ? (
            <motion.div key="proposal" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} className="flex flex-col items-center gap-6 lg:gap-10">
              <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="relative">
                <div className="p-6 bg-white rounded-full shadow-xl border border-stone-50">
                  {isAnniversary ? (
                    <PartyPopper size={48} className="lg:w-20 lg:h-20 text-amber-500" />
                  ) : (
                    <Heart size={48} className={`lg:w-20 lg:h-20 ${noCount > 2 ? 'text-stone-300' : 'text-rose-500 fill-rose-100'} transition-colors duration-500`} />
                  )}
                </div>
                <div className="absolute -top-2 -right-2"><Sparkles className="text-amber-400 animate-pulse" size={24} /></div>
              </motion.div>
              <div className="space-y-4 px-4">
                <h1 className={`text-4xl lg:text-7xl font-bold ${isAnniversary ? 'text-amber-900' : 'text-rose-950'} serif italic leading-tight`}>{isAnniversary ? APP_CONTENT.anniversary.title : APP_CONTENT.valentine.proposal}</h1>
                <motion.p key={funnyMessage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${themeColors.primary} font-bold tracking-widest uppercase text-[10px] lg:text-sm min-h-[20px]`}>{funnyMessage}</motion.p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6 pt-6 w-full px-10">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => setHasAccepted(true)} 
                  className={`w-full sm:w-auto px-12 py-4 lg:px-16 lg:py-6 ${themeColors.button} text-white rounded-full font-black uppercase tracking-widest text-sm lg:text-base shadow-xl transition-all border-2 border-white/10`}
                >
                  {isAnniversary ? APP_CONTENT.anniversary.yesButton : APP_CONTENT.valentine.yesButton}
                </motion.button>
                <motion.button 
                  ref={noButtonRef} 
                  animate={{ x: noButtonPos.x, y: noButtonPos.y, scale: isAnniversary ? 1 : Math.max(0.4, 1 - noCount * 0.15) }} 
                  onClick={handleNoClick} 
                  className={`w-full sm:w-auto px-8 py-4 lg:px-10 lg:py-5 bg-white/50 backdrop-blur-sm border ${isAnniversary ? 'border-amber-100 text-amber-400' : 'border-rose-100 text-rose-400'} rounded-full font-black uppercase tracking-widest text-xs lg:text-sm shadow-sm hover:bg-white transition-colors`}
                >
                  {isAnniversary ? APP_CONTENT.anniversary.noButton : APP_CONTENT.valentine.noButton} {noCount > 0 && `(${noCount})`}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="celebration" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-8 lg:gap-12 px-6">
              <div className="relative">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                   {isAnniversary ? (
                     <Stars className="w-24 h-24 lg:w-40 lg:h-40 text-amber-500 fill-amber-500 drop-shadow-2xl" />
                   ) : (
                     <Heart className="w-24 h-24 lg:w-40 lg:h-40 text-rose-500 fill-rose-500 drop-shadow-2xl" />
                   )}
                </motion.div>
                {[...Array(6)].map((_, i) => (
                  <motion.div key={i} className={`absolute inset-0 ${isAnniversary ? 'text-amber-400' : 'text-rose-400'}`} initial={{ scale: 1, opacity: 1 }} animate={{ scale: 3, opacity: 0, x: (i - 2.5) * 40, y: -100 }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
                    {isAnniversary ? <Sparkles size={16} fill="currentColor" /> : <Heart size={16} fill="currentColor" />}
                  </motion.div>
                ))}
              </div>
              <div className="space-y-4">
                <h1 className={`text-5xl lg:text-8xl font-black ${isAnniversary ? 'text-amber-950' : 'text-rose-950'} serif italic leading-none`}>
                  {(isAnniversary ? APP_CONTENT.anniversary.successTitle : (noCount > 0 ? APP_CONTENT.valentine.successTitleEvasive : APP_CONTENT.valentine.successTitle))}
                </h1>
                <p className={`${isAnniversary ? 'text-amber-800/60' : 'text-rose-800/60'} text-base lg:text-2xl italic serif max-w-lg mx-auto leading-relaxed`}>
                  {isAnniversary ? APP_CONTENT.anniversary.successQuote : APP_CONTENT.valentine.successQuote}
                </p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={onDismiss} 
                className={`group flex items-center gap-3 lg:gap-4 px-10 py-5 lg:px-14 lg:py-6 bg-stone-900 text-white rounded-full font-black uppercase tracking-widest text-xs lg:text-sm shadow-2xl hover:bg-black transition-all`}
              >
                {isAnniversary ? APP_CONTENT.anniversary.enterButton : APP_CONTENT.valentine.enterButton}
                <ArrowRight size={18} className={`group-hover:translate-x-1 transition-transform ${themeColors.accent}`} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute bottom-10 left-0 right-0 text-center opacity-40 pointer-events-none pb-[var(--safe-bottom,0px)]">
         <p className={`${isAnniversary ? 'text-amber-900' : 'text-rose-900'} font-black text-[8px] lg:text-xs uppercase tracking-[0.8em] italic`}>{isAnniversary ? APP_CONTENT.anniversary.footer : APP_CONTENT.valentine.footer}</p>
      </div>
    </motion.div>
  );
};

export default ValentineSplash;
