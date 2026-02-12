
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, CheckCircle2, PlayCircle, Loader2, Film, Tv as TvIcon } from 'lucide-react';
import { MediaItem } from '../types';
import { APP_CONTENT } from '../content';

const RELIABLE_PLACEHOLDER = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&auto=format&fit=crop";

const MediaTracker: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showProgressModal, setShowProgressModal] = useState<MediaItem | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => { const saved = localStorage.getItem('couple_media'); if (saved) setItems(JSON.parse(saved)); }, []);

  const getSuggestions = async (query: string) => {
    if (query.trim().length < 2) { setSuggestions([]); return; }
    setIsSearching(true);
    try {
      const q = encodeURIComponent(query.trim());
      const [showsRes, moviesRes] = await Promise.all([
        fetch(`https://api.tvmaze.com/search/shows?q=${q}`),
        fetch(`https://itunes.apple.com/search?term=${q}&entity=movie&limit=10`)
      ]);

      const showData = showsRes.ok ? await showsRes.json() : [];
      const movieData = moviesRes.ok ? await moviesRes.json() : { results: [] };

      const showSuggestions = (Array.isArray(showData) ? showData : [])
        .slice(0, 10)
        .map((entry: any) => ({
          title: entry?.show?.name || 'Untitled',
          year: entry?.show?.premiered ? String(entry.show.premiered).slice(0, 4) : 'N/A',
          type: 'show'
        }));

      const movieSuggestions = (Array.isArray(movieData?.results) ? movieData.results : [])
        .slice(0, 10)
        .map((entry: any) => ({
          title: entry?.trackName || 'Untitled',
          year: entry?.releaseDate ? String(entry.releaseDate).slice(0, 4) : 'N/A',
          type: 'movie'
        }));

      const merged = [...showSuggestions, ...movieSuggestions];
      const deduped = merged.filter((item, index, arr) => {
        const key = `${item.type}:${item.title.toLowerCase()}:${item.year}`;
        return arr.findIndex((x) => `${x.type}:${x.title.toLowerCase()}:${x.year}` === key) === index;
      });

      setSuggestions(deduped.slice(0, 12));
    } catch (e) { console.error(e); } finally { setIsSearching(false); }
  };

  const addMedia = (s: any) => {
    const newItem: MediaItem = { id: Date.now().toString(), title: s.title, type: s.type, posterUrl: RELIABLE_PLACEHOLDER, status: 'watching', progress: s.type === 'show' ? 'S1 E1' : '0:00', year: s.year };
    const u = [newItem, ...items]; setItems(u); localStorage.setItem('couple_media', JSON.stringify(u));
    setSearchQuery(''); setSuggestions([]);
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="text-center lg:text-left"><h2 className="text-2xl lg:text-6xl font-bold text-stone-800 serif italic">{APP_CONTENT.watchlist.title}</h2><p className="text-stone-400 mt-1 text-xs lg:text-lg">{APP_CONTENT.watchlist.subtitle}</p></div>
        <div className="relative w-full lg:max-w-md">
          <input type="text" placeholder={APP_CONTENT.watchlist.placeholder} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); searchTimeoutRef.current = window.setTimeout(() => getSuggestions(e.target.value), 400); }} className="w-full py-4 pl-12 rounded-full bg-white border border-stone-100 shadow-xl outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
          <AnimatePresence>{isSearching && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 className="animate-custom-spin text-rose-400" size={18} /></motion.div>}</AnimatePresence>
          <AnimatePresence>{suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden z-[150]">
              {suggestions.map((s, i) => (<button key={i} onClick={() => addMedia(s)} className="w-full px-5 py-4 text-left hover:bg-rose-50 flex items-center justify-between border-b last:border-none"><div><p className="font-bold text-stone-800 text-sm">{s.title}</p><p className="text-stone-400 text-[10px] uppercase tracking-widest">{s.type} • {s.year}</p></div><Plus size={16} className="text-rose-400" /></button>))}
            </motion.div>
          )}</AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>{items.map((item) => (
            <motion.div layout key={item.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-stone-100 flex gap-4">
              <div className="w-24 h-36 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-stone-100"><img src={item.posterUrl} className="w-full h-full object-cover" alt={item.title} onError={(e) => (e.currentTarget.src = RELIABLE_PLACEHOLDER)} /></div>
              <div className="flex-grow flex flex-col justify-between py-1">
                <div><div className="flex items-center gap-1.5 mb-1">{item.type === 'movie' ? <Film size={12} className="text-rose-400" /> : <TvIcon size={12} className="text-blue-400" />}<span className="text-[10px] font-black uppercase tracking-widest text-stone-300">{item.type} • {item.year}</span></div><h3 className="text-lg font-bold text-stone-800 serif leading-tight">{item.title}</h3></div>
                <div className="space-y-2"><button onClick={() => setShowProgressModal(item)} className="text-stone-800 font-black text-sm flex items-center gap-2"><PlayCircle size={16} className="text-rose-400" /> {item.progress}</button>
                  <div className="flex gap-2">
                    <button onClick={() => { const u = items.map(i => i.id === item.id ? { ...i, status: i.status === 'watching' ? 'watched' : 'watching' } : i); setItems(u as any); localStorage.setItem('couple_media', JSON.stringify(u)); }} className={`p-2 rounded-lg transition-all ${item.status === 'watched' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-400'}`}><CheckCircle2 size={16} /></button>
                    <button onClick={() => { const u = items.filter(i => i.id !== item.id); setItems(u); localStorage.setItem('couple_media', JSON.stringify(u)); }} className="p-2 bg-stone-50 text-stone-400 hover:text-rose-500 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
        ))}</AnimatePresence>
      </div>

      <AnimatePresence>{showProgressModal && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowProgressModal(null)} className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" />
          <motion.div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <div className="text-center"><h3 className="text-2xl font-bold text-stone-800 serif">{APP_CONTENT.watchlist.progress}</h3><p className="text-stone-400 text-xs mt-1">{APP_CONTENT.watchlist.updateFor} {showProgressModal.title}</p></div>
            <input type="text" defaultValue={showProgressModal.progress} id="progress-input" className="w-full py-4 px-4 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-rose-100 text-2xl font-bold text-center" />
            <button onClick={() => { const val = (document.getElementById('progress-input') as HTMLInputElement).value; const u = items.map(i => i.id === showProgressModal.id ? { ...i, progress: val } : i); setItems(u as any); localStorage.setItem('couple_media', JSON.stringify(u)); setShowProgressModal(null); }} className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg">{APP_CONTENT.watchlist.save}</button>
          </motion.div>
        </div>
      )}</AnimatePresence>
    </div>
  );
};

export default MediaTracker;
