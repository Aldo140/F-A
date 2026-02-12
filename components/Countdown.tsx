
import React, { useState, useEffect } from 'react';
import { START_DATE } from '../constants';
import { motion } from 'framer-motion';
import { APP_CONTENT } from '../content';

const Countdown: React.FC = () => {
  const [timeSince, setTimeSince] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      let years = now.getFullYear() - START_DATE.getFullYear();
      let lastAnniversary = new Date(START_DATE);
      lastAnniversary.setFullYear(START_DATE.getFullYear() + years);
      if (lastAnniversary > now) {
        years--;
        lastAnniversary = new Date(START_DATE);
        lastAnniversary.setFullYear(START_DATE.getFullYear() + years);
      }
      const diff = now.getTime() - lastAnniversary.getTime();
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      setTimeSince({ years, days, hours, minutes, seconds });
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap justify-center gap-3 lg:gap-8 w-full px-2">
      <TimeUnit value={timeSince.years} label={APP_CONTENT.countdown.years} />
      <TimeUnit value={timeSince.days} label={APP_CONTENT.countdown.days} />
      <TimeUnit value={timeSince.hours} label={APP_CONTENT.countdown.hours} />
      <TimeUnit value={timeSince.minutes} label={APP_CONTENT.countdown.minutes} />
      <TimeUnit value={timeSince.seconds} label={APP_CONTENT.countdown.seconds} pulse />
    </motion.div>
  );
};

const TimeUnit: React.FC<{ value: number, label: string, pulse?: boolean }> = ({ value, label, pulse }) => (
  <div className="relative group min-w-[100px] lg:min-w-[160px] flex-grow flex-shrink-0 lg:flex-grow-0">
    <div className="absolute inset-0 bg-rose-200/10 blur-2xl rounded-full opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700" />
    <div className="relative flex flex-col items-center bg-white/40 backdrop-blur-xl rounded-[2rem] lg:rounded-[3rem] py-4 lg:py-10 border border-white/60 shadow-sm transition-all duration-500 lg:hover:shadow-xl lg:hover:-translate-y-1">
      <span className={`text-2xl lg:text-7xl font-bold text-stone-800 tabular-nums tracking-tighter ${pulse ? 'animate-pulse' : ''}`}>{value.toString().padStart(2, '0')}</span>
      <span className="text-[8px] lg:text-[11px] uppercase tracking-[0.3em] font-black text-stone-400 mt-1 lg:mt-3 opacity-70">{label}</span>
    </div>
  </div>
);

export default Countdown;
