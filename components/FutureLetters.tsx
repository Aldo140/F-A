
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Unlock, Calendar, Eye, Send, X } from 'lucide-react';
import { FutureLetter } from '../types';
import { APP_CONTENT } from '../content';

const FutureLetters: React.FC = () => {
  const [letters, setLetters] = useState<FutureLetter[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<FutureLetter | null>(null);
  const [newLetter, setNewLetter] = useState({ title: '', content: '', unlockDate: '', from: 'Aldo' as 'Aldo' | 'Fiona' });

  useEffect(() => {
    const saved = localStorage.getItem('future_letters');
    if (saved) setLetters(JSON.parse(saved));
    else setLetters([{ id: '1', from: 'Aldo', to: 'Fiona', title: 'A message for our 5th anniversary', content: 'I hope we are sitting on a porch somewhere...', unlockDate: '2029-02-25', createdAt: '2024-02-25' }]);
  }, []);

  const handleCompose = () => {
    if (!newLetter.title || !newLetter.content || !newLetter.unlockDate) return;
    const letter: FutureLetter = { id: Date.now().toString(), ...newLetter, to: newLetter.from === 'Aldo' ? 'Fiona' : 'Aldo', createdAt: new Date().toISOString().split('T')[0] };
    const u = [...letters, letter]; setLetters(u); localStorage.setItem('future_letters', JSON.stringify(u));
    setShowCompose(false); setNewLetter({ title: '', content: '', unlockDate: '', from: 'Aldo' });
  };

  const isUnlocked = (date: string) => new Date() >= new Date(date);

  return (
    <div className="w-full space-y-8 lg:space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-6">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl lg:text-6xl font-bold text-stone-800 serif italic">{APP_CONTENT.letters.sealed.title}</h2>
          <p className="text-stone-400 mt-1 lg:mt-2 text-sm lg:text-lg">{APP_CONTENT.letters.sealed.subtitle}</p>
        </div>
        <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 px-6 py-3 lg:py-4 bg-stone-800 text-white rounded-full text-xs lg:text-sm font-black uppercase tracking-widest hover:bg-stone-900 transition-all shadow-xl active:scale-95"><Mail size={16} />{APP_CONTENT.letters.sealed.writeButton}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        {letters.map((letter) => (
          <motion.div key={letter.id} whileHover={{ y: -5 }} className={`p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-stone-50 shadow-sm relative flex flex-col items-center text-center cursor-pointer transition-all ${isUnlocked(letter.unlockDate) ? 'bg-white hover:shadow-2xl' : 'bg-white/30 backdrop-blur-sm'}`} onClick={() => isUnlocked(letter.unlockDate) && setSelectedLetter(letter)}>
            <div className={`mb-6 p-4 rounded-full ${isUnlocked(letter.unlockDate) ? 'bg-rose-50 text-rose-500 shadow-inner' : 'bg-stone-100 text-stone-300'}`}>{isUnlocked(letter.unlockDate) ? <Unlock size={24} className="lg:w-8 lg:h-8" /> : <Lock size={24} className="lg:w-8 lg:h-8" />}</div>
            <h3 className={`text-lg lg:text-2xl font-bold serif leading-tight ${!isUnlocked(letter.unlockDate) ? 'blur-[3px] opacity-40' : 'text-stone-800'}`}>{letter.title}</h3>
            <p className="text-[9px] lg:text-[10px] uppercase tracking-widest text-stone-400 mt-4 font-black">{APP_CONTENT.letters.sealed.fromLabel} {letter.from} {APP_CONTENT.letters.sealed.toLabel} {letter.to}</p>
            {!isUnlocked(letter.unlockDate) ? (
              <div className="mt-8 space-y-1"><p className="text-[10px] uppercase font-black text-stone-300 tracking-[0.2em]">{APP_CONTENT.letters.sealed.unlocksOn}</p><div className="flex items-center justify-center gap-1.5 text-stone-500 font-bold"><Calendar size={14} /><span className="text-sm lg:text-base">{new Date(letter.unlockDate).toLocaleDateString()}</span></div></div>
            ) : (<div className="mt-8 flex items-center gap-2 text-rose-400 font-black uppercase tracking-widest text-[10px] lg:text-xs"><Eye size={14} /> {APP_CONTENT.letters.sealed.readMessage}</div>)}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCompose && (
          <div className="fixed inset-0 z-[600] flex items-end lg:items-center justify-center p-0 lg:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCompose(false)} className="absolute inset-0 bg-stone-900/40 backdrop-blur-md" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-2xl bg-white rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl p-8 lg:p-12 space-y-6 lg:space-y-10">
              <div className="flex justify-between items-start"><div><h3 className="text-2xl lg:text-4xl font-bold text-stone-800 serif italic">{APP_CONTENT.letters.sealed.modalTitle}</h3><p className="text-stone-400 text-sm mt-1">{APP_CONTENT.letters.sealed.modalSubtitle}</p></div><button onClick={() => setShowCompose(false)} className="p-2 text-stone-200 hover:text-stone-800 transition-colors"><X size={24}/></button></div>
              <div className="space-y-4 lg:space-y-6 overflow-y-auto max-h-[60vh] lg:max-h-none pr-1">
                <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-[10px] lg:text-[11px] uppercase tracking-widest font-black text-stone-400">{APP_CONTENT.letters.sealed.fromLabel}</label><select value={newLetter.from} onChange={(e) => setNewLetter({ ...newLetter, from: e.target.value as any })} className="w-full p-4 rounded-2xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm font-bold"><option value="Aldo">Aldo</option><option value="Fiona">Fiona</option></select></div><div className="space-y-1.5"><label className="text-[10px] lg:text-[11px] uppercase tracking-widest font-black text-stone-400">{APP_CONTENT.letters.sealed.dateLabel}</label><input type="date" value={newLetter.unlockDate} onChange={(e) => setNewLetter({ ...newLetter, unlockDate: e.target.value })} className="w-full p-4 rounded-2xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm font-bold"/></div></div>
                <div className="space-y-1.5"><label className="text-[10px] lg:text-[11px] uppercase tracking-widest font-black text-stone-400">{APP_CONTENT.letters.sealed.subjectLabel}</label><input type="text" placeholder={APP_CONTENT.letters.sealed.subjectPlaceholder} value={newLetter.title} onChange={(e) => setNewLetter({ ...newLetter, title: e.target.value })} className="w-full p-4 rounded-2xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm font-bold"/></div>
                <div className="space-y-1.5"><label className="text-[10px] lg:text-[11px] uppercase tracking-widest font-black text-stone-400">{APP_CONTENT.letters.sealed.contentLabel}</label><textarea placeholder={APP_CONTENT.letters.sealed.contentPlaceholder} value={newLetter.content} onChange={(e) => setNewLetter({ ...newLetter, content: e.target.value })} className="w-full h-40 lg:h-56 p-6 rounded-2xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm font-medium resize-none leading-relaxed"/></div>
                <button onClick={handleCompose} className="w-full py-5 bg-stone-800 text-white rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl hover:bg-stone-900 transition-all active:scale-95 text-xs lg:text-sm">{APP_CONTENT.letters.sealed.submitButton}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-0 lg:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLetter(null)} className="absolute inset-0 bg-stone-950/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full h-full lg:h-auto lg:max-w-3xl bg-[#fdfcf0] lg:rounded-[3rem] shadow-2xl p-10 lg:p-20 font-serif flex flex-col space-y-10 lg:space-y-12 overflow-y-auto">
              <div className="flex justify-between items-start pt-10 lg:pt-0"><div className="space-y-1 lg:space-y-2"><p className="text-stone-400 italic text-sm lg:text-lg">{APP_CONTENT.letters.sealed.readerGreeting} {selectedLetter.to},</p><h3 className="text-3xl lg:text-5xl font-bold text-stone-800 leading-tight">{selectedLetter.title}</h3></div><button onClick={() => setSelectedLetter(null)} className="p-2 text-stone-300 hover:text-stone-800 transition-all"><X size={32} /></button></div>
              <p className="text-lg lg:text-2xl leading-[2] text-stone-700 font-light whitespace-pre-wrap px-1">{selectedLetter.content}</p>
              <div className="mt-12 pt-8 border-t border-stone-200 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 italic text-stone-500 pb-10 lg:pb-0">
                <div><p className="text-sm">{APP_CONTENT.letters.sealed.readerClosing}</p><p className="text-2xl lg:text-3xl mt-2 text-stone-800 font-bold tracking-tight">{selectedLetter.from}</p></div>
                <div className="text-left lg:text-right text-[10px] lg:text-xs uppercase tracking-widest font-black opacity-60"><p>{APP_CONTENT.letters.sealed.readerSealed}: {selectedLetter.createdAt}</p><p>{APP_CONTENT.letters.sealed.readerUnveiled}: {new Date().toLocaleDateString()}</p></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FutureLetters;
