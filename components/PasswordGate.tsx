
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Sparkles, X } from 'lucide-react';
import { APP_CONTENT } from '../content';

interface Props {
  onLogin: () => void;
  onPlayTrigger?: () => void;
  isReentry: boolean;
}

const PasswordGate: React.FC<Props> = ({ onLogin, onPlayTrigger, isReentry }) => {
  const [month, setMonth] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<'month' | 'day' | 'year' | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Correct Date: Feb 25 2024
  const isCorrect = month === 'Feb' && day === '25' && year === '2024';

  const handleUnlock = () => {
    if (isCorrect) {
      setIsSuccess(true);
      if (onPlayTrigger) onPlayTrigger();
      setTimeout(onLogin, 800);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#fcfaf2] z-[5000] p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,1)_0%,_rgba(252,250,242,1)_100%)]" />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 bg-rose-200 blur-[120px] rounded-full pointer-events-none" 
      />

      <div className="relative w-full max-w-xl flex flex-col items-center space-y-12">
        <header className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-3xl shadow-xl border border-stone-100 flex items-center justify-center mx-auto mb-6"
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div key="unlock" initial={{ rotate: -15 }} animate={{ rotate: 0 }}>
                  <Unlock size={32} className="text-emerald-500" />
                </motion.div>
              ) : (
                <motion.div key="lock">
                  <Lock size={32} className={isCorrect ? "text-rose-400" : "text-stone-300"} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <h1 className="text-4xl lg:text-6xl font-black text-stone-900 serif italic tracking-tighter">
            {APP_CONTENT.auth.title}
          </h1>
          <p className="text-stone-400 text-[10px] lg:text-xs font-black uppercase tracking-[0.4em]">
            {APP_CONTENT.auth.subtitle}
          </p>
        </header>

        <div className="grid grid-cols-3 gap-3 lg:gap-6 w-full">
          <DatePart label={APP_CONTENT.auth.monthLabel} value={month} active={activePicker === 'month'} onClick={() => setActivePicker('month')} />
          <DatePart label={APP_CONTENT.auth.dayLabel} value={day} active={activePicker === 'day'} onClick={() => setActivePicker('day')} />
          <DatePart label={APP_CONTENT.auth.yearLabel} value={year} active={activePicker === 'year'} onClick={() => setActivePicker('year')} />
        </div>

        <div className="w-full pt-6">
          <motion.button
            whileHover={isCorrect ? { scale: 1.02 } : {}}
            whileTap={isCorrect ? { scale: 0.98 } : {}}
            disabled={!isCorrect || isSuccess}
            onClick={handleUnlock}
            className={`w-full py-6 lg:py-8 rounded-full font-black uppercase tracking-[0.5em] text-[10px] lg:text-xs transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden relative ${
              isCorrect ? 'bg-stone-900 text-white shadow-2xl' : 'bg-stone-100 text-stone-300 cursor-not-allowed'
            }`}
          >
            {isCorrect && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            )}
            <Sparkles size={16} className={isCorrect ? 'text-rose-400' : 'text-stone-200'} />
            <span>{isSuccess ? APP_CONTENT.auth.openingButton : APP_CONTENT.auth.unlockButton}</span>
            <Sparkles size={16} className={isCorrect ? 'text-rose-400' : 'text-stone-200'} />
            {isSuccess && (
              <motion.div 
                layoutId="progress"
                className="absolute bottom-0 left-0 h-1 bg-rose-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8 }}
              />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {activePicker && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActivePicker(null)} className="absolute inset-0 bg-stone-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white rounded-[3rem] p-8 lg:p-10 shadow-2xl border border-stone-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-stone-800 serif italic">{APP_CONTENT.auth.selectPrompt} {activePicker}</h3>
                <button onClick={() => setActivePicker(null)} className="p-2 hover:bg-stone-50 rounded-full text-stone-400 transition-colors"><X size={20} /></button>
              </div>
              <div className={`grid gap-2 ${activePicker === 'month' ? 'grid-cols-3' : activePicker === 'day' ? 'grid-cols-6' : 'grid-cols-2'}`}>
                {(activePicker === 'month' ? APP_CONTENT.auth.months : activePicker === 'day' ? APP_CONTENT.auth.days : APP_CONTENT.auth.years).map((val) => (
                  <button key={val} onClick={() => {
                      if (activePicker === 'month') setMonth(val);
                      if (activePicker === 'day') setDay(val);
                      if (activePicker === 'year') setYear(val);
                      setActivePicker(null);
                    }}
                    className={`py-4 rounded-2xl text-xs font-bold transition-all ${
                      (activePicker === 'month' && month === val) || (activePicker === 'day' && day === val) || (activePicker === 'year' && year === val)
                        ? 'bg-rose-500 text-white shadow-lg' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DatePart: React.FC<{ label: string, value: string | null, active: boolean, onClick: () => void }> = ({ label, value, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-4 lg:p-8 rounded-[2rem] border-2 transition-all duration-300 w-full group ${active ? 'bg-white border-rose-400 shadow-xl scale-105' : value ? 'bg-white border-stone-100 shadow-sm' : 'bg-white/50 border-stone-100/50'}`}>
    <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-stone-300 mb-2 group-hover:text-stone-500 transition-colors">{label}</span>
    <span className={`text-xl lg:text-4xl font-black serif italic tracking-tighter ${value ? 'text-stone-800' : 'text-stone-200'}`}>{value || '—'}</span>
  </button>
);

export default PasswordGate;
