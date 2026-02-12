
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Heart, RotateCcw, X, Check, PartyPopper, Calendar } from 'lucide-react';
import { triggerAppReset } from '../constants';

const ProductionTestTools: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const applyAnniversary = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.setItem('debug_date', '2024-02-25');
    sessionStorage.removeItem('special_day_splash_dismissed'); 
    triggerAppReset();
  };

  const applyValentines = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.setItem('debug_date', '2024-02-14');
    sessionStorage.removeItem('special_day_splash_dismissed'); 
    triggerAppReset();
  };

  const resetEverything = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('debug_date');
    sessionStorage.removeItem('special_day_splash_dismissed');
    triggerAppReset();
  };

  const activeDate = localStorage.getItem('debug_date');
  const isAnniversaryForced = activeDate === '2024-02-25';
  const isValentinesForced = activeDate === '2024-02-14';

  return (
    <div className="fixed bottom-6 left-6 z-[10000]">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-2xl backdrop-blur-md border transition-all ${
          activeDate 
            ? 'bg-amber-500 text-white border-amber-400 animate-pulse' 
            : 'bg-white/20 text-stone-400 border-white/40 hover:bg-white/40'
        }`}
      >
        <Wrench size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 left-0 w-64 bg-white rounded-[2rem] shadow-2xl border border-stone-100 p-6 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-stone-400">Environment Tests</h4>
              <button type="button" onClick={() => setIsOpen(false)} className="text-stone-300 hover:text-stone-800"><X size={14}/></button>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight px-1">Special Events</p>
              
              <button 
                type="button"
                onClick={applyValentines}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                  isValentinesForced 
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-200' 
                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart size={16} fill={isValentinesForced ? 'currentColor' : 'none'} />
                  <span className="text-xs font-bold">Valentine's Day</span>
                </div>
                {isValentinesForced && <Check size={14} />}
              </button>

              <button 
                type="button"
                onClick={applyAnniversary}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                  isAnniversaryForced 
                    ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-200' 
                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PartyPopper size={16} fill={isAnniversaryForced ? 'currentColor' : 'none'} />
                  <span className="text-xs font-bold">Anniversary</span>
                </div>
                {isAnniversaryForced && <Check size={14} />}
              </button>

              <div className="h-px bg-stone-100 my-2" />

              <button 
                type="button"
                onClick={resetEverything}
                className="w-full flex items-center justify-center gap-2 p-3 text-stone-400 hover:text-stone-800 transition-colors"
              >
                <RotateCcw size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest text-balance">Reset Environment</span>
              </button>
            </div>

            <p className="text-[8px] text-stone-300 leading-tight italic text-center">
              Force a special date to see how the app reacts.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductionTestTools;
