
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoveNotes from './LoveNotes';
import FutureLetters from './FutureLetters';
import { MessageSquare, Mail } from 'lucide-react';

const Letters: React.FC = () => {
  const [subTab, setSubTab] = useState<'notes' | 'sealed'>('notes');

  return (
    <div className="w-full space-y-8 lg:space-y-12">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl lg:text-7xl font-bold text-stone-800 serif italic">Letters</h2>
          <p className="text-stone-400 text-sm lg:text-xl">Shared thoughts, saved for now and forever.</p>
        </div>

        <div className="flex p-1.5 bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-sm w-full max-w-sm">
          <button 
            onClick={() => setSubTab('notes')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.75rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${subTab === 'notes' ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <MessageSquare size={14} />
            Notes
          </button>
          <button 
            onClick={() => setSubTab('sealed')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.75rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${subTab === 'sealed' ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <div className="relative">
              <Mail size={14} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white" />
            </div>
            Sealed
          </button>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {subTab === 'notes' ? (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <LoveNotes />
            </motion.div>
          ) : (
            <motion.div
              key="sealed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FutureLetters />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Letters;
