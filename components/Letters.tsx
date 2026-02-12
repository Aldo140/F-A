
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoveNotes from './LoveNotes';
import FutureLetters from './FutureLetters';
import { MessageSquare, Mail } from 'lucide-react';
import { APP_CONTENT } from '../content';

const Letters: React.FC = () => {
  const [subTab, setSubTab] = useState<'notes' | 'sealed'>('notes');

  return (
    <div className="w-full space-y-8 lg:space-y-12">
      <div className="flex flex-col items-center gap-6 lg:gap-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl lg:text-7xl font-bold text-stone-800 serif italic">{APP_CONTENT.letters.title}</h2>
          <p className="text-stone-400 text-sm lg:text-xl">{APP_CONTENT.letters.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full max-w-3xl">
          <button 
            onClick={() => setSubTab('notes')}
            className={`w-full p-4 lg:p-5 rounded-[1.75rem] border transition-all text-left ${subTab === 'notes' ? 'bg-stone-800 text-white shadow-lg border-stone-800' : 'bg-white/70 border-stone-100 text-stone-600 hover:border-stone-300'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${subTab === 'notes' ? 'bg-white/15' : 'bg-stone-100'}`}>
                <MessageSquare size={16} />
              </div>
              <div>
                <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest">{APP_CONTENT.letters.tabNotes}</p>
                <p className={`text-xs mt-1 ${subTab === 'notes' ? 'text-white/70' : 'text-stone-400'}`}>Quick check-ins and voice notes.</p>
              </div>
            </div>
          </button>
          <button 
            onClick={() => setSubTab('sealed')}
            className={`w-full p-4 lg:p-5 rounded-[1.75rem] border transition-all text-left ${subTab === 'sealed' ? 'bg-stone-800 text-white shadow-lg border-stone-800' : 'bg-white/70 border-stone-100 text-stone-600 hover:border-stone-300'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center relative ${subTab === 'sealed' ? 'bg-white/15' : 'bg-stone-100'}`}>
                <Mail size={16} />
                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${subTab === 'sealed' ? 'bg-rose-300' : 'bg-rose-500'} border border-white`} />
              </div>
              <div>
                <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest">{APP_CONTENT.letters.tabSealed}</p>
                <p className={`text-xs mt-1 ${subTab === 'sealed' ? 'text-white/70' : 'text-stone-400'}`}>Letters you open in the future.</p>
              </div>
            </div>
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
