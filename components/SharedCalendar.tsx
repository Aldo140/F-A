
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, X, Check, Clock, Minus, Gift, Sparkles, Award } from 'lucide-react';
import { CalendarDay, Availability } from '../types';
import { EVENTS, START_DATE } from '../constants';
import { APP_CONTENT } from '../content';

const MEME_MAP: Record<string, string> = { 'anniversary': 'https://i.giphy.com/3oriO0OEd9QIDdllqo.gif', 'holiday': 'https://i.giphy.com/l0HlvU6g3Aue21KCc.gif', 'birthday': 'https://i.giphy.com/l4KibWpBGWchOtCRy.gif', 'default': 'https://i.giphy.com/26BRv0ThflsHCqfJA.gif' };
const FALLBACK_SURPRISE = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format";
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const parseDateParts = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
};
const getSurpriseMedia = (eventType?: string) => {
  if (!eventType) return MEME_MAP.default;
  return MEME_MAP[eventType] || MEME_MAP.default;
};

const SharedCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysData, setDaysData] = useState<Record<string, CalendarDay>>(() => { const saved = localStorage.getItem('couple_calendar'); return saved ? JSON.parse(saved) : {}; });
  const [editingFlow, setEditingFlow] = useState<{ date: string, user: 'Aldo' | 'Fiona' | null } | null>(null);
  const [revealedMeme, setRevealedMeme] = useState(false);

  useEffect(() => { if (editingFlow) setRevealedMeme(false); }, [editingFlow?.date]);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear(); const month = currentMonth.getMonth(); const result = [];
    const firstDay = new Date(year, month, 1).getDay(); const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let i = 1; i <= totalDays; i++) result.push(new Date(year, month, i));
    return result;
  }, [currentMonth]);

  const updateStatus = (dateStr: string, user: 'Aldo' | 'Fiona', status: Availability) => {
    const current = daysData[dateStr] || { date: dateStr, aldoStatus: 'none', fionaStatus: 'none' };
    const updated = { ...current, [user === 'Aldo' ? 'aldoStatus' : 'fionaStatus']: status };
    const uMap = { ...daysData, [dateStr]: updated }; setDaysData(uMap); localStorage.setItem('couple_calendar', JSON.stringify(uMap));
    setEditingFlow(null);
  };

  const eventOnSelection = editingFlow ? (() => {
    const parts = parseDateParts(editingFlow.date);
    if (!parts.month || !parts.day) return null;
    const monthIndex = parts.month - 1;
    return EVENTS.find(e => e.month === monthIndex && e.day === parts.day) || null;
  })() : null;

  return (
    <div className="w-full h-full flex flex-col space-y-6 lg:space-y-10 pb-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between px-2">
        <div className="space-y-2">
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-6xl lg:text-8xl font-black text-stone-900 tracking-tighter serif italic leading-none">{APP_CONTENT.calendar.title}<span className="text-rose-400">.</span></motion.h2>
          <p className="text-stone-400 text-[10px] lg:text-sm font-black uppercase tracking-[0.3em] opacity-50">{APP_CONTENT.calendar.subtitle}</p>
        </div>
        <div className="flex items-center gap-1 bg-stone-900 text-white p-1 rounded-full shadow-2xl self-start lg:self-center">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-3 lg:p-4 hover:bg-white/10 rounded-full transition-all active:scale-75"><ChevronLeft size={16} /></button>
          <span className="px-4 lg:px-8 font-black text-[10px] lg:text-xs uppercase tracking-[0.4em] min-w-[140px] lg:min-w-[200px] text-center">{currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-3 lg:p-4 hover:bg-white/10 rounded-full transition-all active:scale-75"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="relative flex-grow bg-white/40 backdrop-blur-xl rounded-[3rem] lg:rounded-[4rem] p-4 lg:p-10 shadow-sm border border-white/60 overflow-hidden">
        <div className="grid grid-cols-7 gap-2 relative z-10 h-full content-start">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (<div key={d} className="text-center text-[9px] lg:text-xs font-black text-stone-300 py-3 uppercase tracking-[0.4em]">{d}</div>))}
          {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="aspect-square opacity-10" />;
            const dateStr = formatLocalDate(date); const data = daysData[dateStr];
            const event = EVENTS.find(e => e.month === date.getMonth() && e.day === date.getDate());
            const isMatch = data?.aldoStatus === 'free' && data?.fionaStatus === 'free';
            const isToday = formatLocalDate(new Date()) === dateStr;
            return (
              <motion.button key={dateStr} whileTap={{ scale: 0.95 }} onClick={() => setEditingFlow({ date: dateStr, user: null })} className={`group relative aspect-square rounded-[1.2rem] lg:rounded-[2.5rem] border transition-all flex flex-col items-center justify-between p-2 lg:p-6 overflow-hidden ${isMatch ? 'bg-rose-50 border-rose-200' : isToday ? 'bg-stone-900 border-stone-900 text-white scale-105 z-10 shadow-xl' : 'bg-white/80 border-stone-100 hover:border-rose-100'}`}>
                <div className="w-full flex justify-between items-start"><span className={`text-xs lg:text-2xl font-black ${isToday ? 'text-white' : event ? 'text-rose-500' : 'text-stone-300 group-hover:text-stone-900'}`}>{date.getDate()}</span>{event && <Heart size={10} className="text-rose-400 fill-rose-400 lg:w-5 lg:h-5" />}</div>
                <div className="flex gap-1 lg:gap-2"><div className={`w-1.5 lg:w-3 h-1.5 lg:h-3 rounded-full ${data?.aldoStatus === 'free' ? 'bg-emerald-400' : data?.aldoStatus === 'busy' ? 'bg-rose-400' : data?.aldoStatus === 'maybe' ? 'bg-amber-400' : 'bg-stone-100'}`} /><div className={`w-1.5 lg:w-3 h-1.5 lg:h-3 rounded-full ${data?.fionaStatus === 'free' ? 'bg-emerald-400' : data?.fionaStatus === 'busy' ? 'bg-rose-400' : data?.fionaStatus === 'maybe' ? 'bg-amber-400' : 'bg-stone-100'}`} /></div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {editingFlow && (
          <div className="fixed inset-0 z-[99999] flex flex-col justify-end lg:items-center lg:justify-center overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingFlow(null)} className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full lg:max-w-2xl bg-[#fdfcf9] rounded-t-[3.5rem] lg:rounded-[4rem] p-8 lg:p-12 space-y-6 shadow-2xl max-h-[95vh] overflow-y-auto z-[100001] mb-[var(--safe-bottom,0px)]">
              <div className="text-center space-y-4">
                <div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">{new Date(parseDateParts(editingFlow.date).year, (parseDateParts(editingFlow.date).month || 1) - 1, parseDateParts(editingFlow.date).day || 1).toLocaleDateString(undefined, { weekday: 'long' })}</p><h3 className="text-4xl lg:text-6xl font-black text-stone-900 tracking-tighter serif italic leading-tight">{new Date(parseDateParts(editingFlow.date).year, (parseDateParts(editingFlow.date).month || 1) - 1, parseDateParts(editingFlow.date).day || 1).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</h3></div>
                {eventOnSelection && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`py-6 space-y-8 rounded-[2.5rem] border ${eventOnSelection.type === 'anniversary' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50/50 border-rose-100'}`}>
                    <div className="flex flex-col items-center gap-3">
                      {eventOnSelection.type === 'anniversary' && <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2"><Award size={14} />{APP_CONTENT.calendar.milestoneBadge}</div>}
                      <div className="flex items-center gap-3 px-6"><Heart size={24} className="text-rose-500 fill-rose-500" /><h4 className="text-2xl lg:text-5xl font-bold serif italic leading-tight">{eventOnSelection.name}</h4><Heart size={24} className="text-rose-500 fill-rose-500" /></div>
                      <div className="flex items-center gap-2 opacity-40"><Sparkles size={12} /><span className="text-[9px] font-black uppercase tracking-[0.5em]">{eventOnSelection.type === 'anniversary' ? APP_CONTENT.calendar.daysUs : APP_CONTENT.calendar.defaultSpecial}</span><Sparkles size={12} /></div>
                    </div>
                    <div className="px-6"><AnimatePresence mode="wait">
                        {!revealedMeme ? (<motion.button onClick={() => setRevealedMeme(true)} className="w-full h-32 lg:h-48 rounded-[2rem] lg:rounded-[3rem] bg-white border-2 border-dashed flex flex-col items-center justify-center gap-3"><Gift size={32} className="text-rose-500" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">{APP_CONTENT.calendar.openSurprise}</span></motion.button>) 
                        : (<motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-video lg:aspect-[2/1] bg-stone-100"><img src={getSurpriseMedia(eventOnSelection.type)} className="w-full h-full object-cover" alt="Surprise" onError={(e) => (e.currentTarget.src = FALLBACK_SURPRISE)} /></motion.div>)}
                    </AnimatePresence></div>
                  </motion.div>
                )}
              </div>
              {!editingFlow.user ? (
                <div className="space-y-6 pt-4"><div className="flex items-center gap-4"><div className="h-px bg-stone-100 flex-grow" /><span className="text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">{APP_CONTENT.calendar.updateFor}</span><div className="h-px bg-stone-100 flex-grow" /></div><div className="grid grid-cols-2 gap-4 lg:gap-8"><button onClick={() => setEditingFlow({ ...editingFlow, user: 'Aldo' })} className="py-8 lg:py-12 bg-white rounded-3xl border border-stone-100 hover:border-stone-900 transition-all font-black text-xl lg:text-3xl text-stone-900">Aldo</button><button onClick={() => setEditingFlow({ ...editingFlow, user: 'Fiona' })} className="py-8 lg:py-12 bg-white rounded-3xl border border-stone-100 hover:border-stone-900 transition-all font-black text-xl lg:text-3xl text-stone-900">Fiona</button></div><button onClick={() => setEditingFlow(null)} className="w-full py-4 text-stone-400 text-[10px] font-black uppercase tracking-[0.4em] mt-4">{APP_CONTENT.calendar.closeDetails}</button></div>
              ) : (
                <div className="space-y-8 pt-4"><div className="flex items-center justify-between bg-stone-900 text-white rounded-[2rem] p-2 pl-6"><span className="text-xs font-black uppercase tracking-widest">{editingFlow.user}'s {APP_CONTENT.calendar.statusLabel}</span><button onClick={() => setEditingFlow({ ...editingFlow, user: null })} className="p-3 bg-white/10 rounded-full"><X size={16} /></button></div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatusBtn icon={<Check size={18} />} label={APP_CONTENT.calendar.statusFree} color="text-emerald-500 bg-emerald-50 border-emerald-100" onClick={() => updateStatus(editingFlow.date, editingFlow.user!, 'free')} />
                    <StatusBtn icon={<X size={18} />} label={APP_CONTENT.calendar.statusBusy} color="text-rose-500 bg-rose-50 border-rose-100" onClick={() => updateStatus(editingFlow.date, editingFlow.user!, 'busy')} />
                    <StatusBtn icon={<Clock size={18} />} label={APP_CONTENT.calendar.statusMaybe} color="text-amber-500 bg-amber-50 border-amber-100" onClick={() => updateStatus(editingFlow.date, editingFlow.user!, 'maybe')} />
                    <StatusBtn icon={<Minus size={18} />} label={APP_CONTENT.calendar.statusNone} color="text-stone-400 bg-stone-50 border-stone-200" onClick={() => updateStatus(editingFlow.date, editingFlow.user!, 'none')} />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusBtn: React.FC<{ icon: React.ReactNode, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center py-6 lg:py-8 rounded-3xl border transition-all active:scale-90 ${color}`}><div className="mb-2">{icon}</div><span className="text-[9px] font-black uppercase tracking-widest">{label}</span></button>
);

export default SharedCalendar;
