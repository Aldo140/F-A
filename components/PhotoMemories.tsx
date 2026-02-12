
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Plus, Film, Sparkles, Music, Edit2, Trash2, Calendar, Check, Play, PlayCircle, Loader2 } from 'lucide-react';
import { Photo } from '../types';
import { getAllMemories, saveMemory, deleteMemory } from '../db';
import { APP_CONTENT } from '../content';

const MediaRenderer: React.FC<{ photo: Photo, className?: string, autoPlay?: boolean, muted?: boolean, loop?: boolean, onEnded?: () => void, controls?: boolean }> = ({ photo, className, autoPlay, muted, loop, onEnded, controls }) => {
  if (photo.type === 'video') return <video src={photo.url} className={`${className} object-contain`} autoPlay={autoPlay} muted={muted} loop={loop} onEnded={onEnded} controls={controls} playsInline />;
  return <img src={photo.url} className={className} alt={photo.caption} />;
};

const PhotoMemories: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [view, setView] = useState<'slideshow' | 'grid'>('slideshow');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isMoviePlaying, setIsMoviePlaying] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const movieIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        let data = await getAllMemories();
        if (data.length === 0) {
          const defaults: Photo[] = [
            { id: 'vc-1', url: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=1200&auto=format', type: 'image', caption: 'Late night calls 🌙', date: '2024-02-14' },
            { id: '1', url: 'https://images.unsplash.com/photo-1516589174184-c6858b16ecb0?q=80&w=1200&auto=format', type: 'image', caption: 'Our first sunset together.', date: '2023-03-12' },
            { id: '2', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format', type: 'image', caption: 'The smile that changed my world.', date: '2023-04-05' },
          ];
          for (const d of defaults) await saveMemory(d);
          data = await getAllMemories();
        }
        setPhotos(data);
      } catch (err) { console.error("Failed to load memories:", err); } finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  const nextLightbox = useCallback(() => { if (lightboxIndex !== null) setLightboxIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0)); }, [lightboxIndex, photos.length]);
  const prevLightbox = useCallback(() => { if (lightboxIndex !== null) setLightboxIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0)); }, [lightboxIndex, photos.length]);

  useEffect(() => {
    if ((isMoviePlaying && lightboxIndex !== null) || editingPhoto) document.body.classList.add('hide-global-ui');
    else document.body.classList.remove('hide-global-ui');
    return () => document.body.classList.remove('hide-global-ui');
  }, [isMoviePlaying, lightboxIndex, editingPhoto]);

  useEffect(() => {
    if (isMoviePlaying && lightboxIndex !== null) {
      const currentMedia = photos[lightboxIndex];
      if (currentMedia?.type === 'image') movieIntervalRef.current = window.setInterval(nextLightbox, 8000); 
    } else if (movieIntervalRef.current) clearInterval(movieIntervalRef.current);
    return () => { if (movieIntervalRef.current) clearInterval(movieIntervalRef.current); };
  }, [isMoviePlaying, photos, lightboxIndex, nextLightbox]);

  const startMovieFrom = (index: number) => { setLightboxIndex(index); setIsMoviePlaying(true); setEditingPhoto(null); };
  const resetMovieTimer = () => { if (isMoviePlaying) { if (movieIntervalRef.current) clearInterval(movieIntervalRef.current); const currentMedia = photos[lightboxIndex || 0]; if (currentMedia?.type === 'image') movieIntervalRef.current = window.setInterval(nextLightbox, 8000); } };
  const handleManualNext = (e?: React.MouseEvent) => { e?.stopPropagation(); nextLightbox(); resetMovieTimer(); };
  const handleManualPrev = (e?: React.MouseEvent) => { e?.stopPropagation(); prevLightbox(); resetMovieTimer(); };

  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;
    try { await saveMemory(editingPhoto); const updated = await getAllMemories(); setPhotos(updated); setEditingPhoto(null); } catch (err) { alert("Failed to update memory."); }
  };

  const handleDeletePhoto = async () => {
    if (!editingPhoto || !confirm(APP_CONTENT.memories.deleteConfirm)) return;
    try { await deleteMemory(editingPhoto.id); const updated = await getAllMemories(); setPhotos(updated); setEditingPhoto(null); } catch (err) { alert("Failed to delete memory."); }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      setIsLoading(true);
      const uploadPromises = files.map(file => new Promise<Photo>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ id: Math.random().toString(36).substring(2, 9) + Date.now(), url: reader.result as string, type: file.type.startsWith('video') ? 'video' : 'image', caption: 'New Memory', date: new Date().toISOString().split('T')[0] });
        reader.readAsDataURL(file);
      }));
      Promise.all(uploadPromises).then(async (newPhotos) => { for (const p of newPhotos) await saveMemory(p); const updated = await getAllMemories(); setPhotos(updated); setIsLoading(false); }).catch(() => { setIsLoading(false); alert("Upload failed."); });
    }
  };

  if (isLoading && photos.length === 0) return (
    <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-custom-spin text-rose-400" size={48} />
      <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">{APP_CONTENT.memories.loading}</p>
    </div>
  );

  return (
    <div className="w-full space-y-6 lg:space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl lg:text-6xl font-bold text-stone-800 serif italic">{APP_CONTENT.memories.title}</h2>
          <p className="text-stone-400 mt-1 text-xs lg:text-lg">{APP_CONTENT.memories.subtitle}</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-2 bg-white/70 backdrop-blur-xl p-1.5 rounded-full border border-white/80 shadow-sm">
          <button onClick={() => setView('slideshow')} className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all ${view === 'slideshow' ? 'bg-stone-800 text-white' : 'text-stone-400'}`}>{APP_CONTENT.memories.viewSlideshow}</button>
          <button onClick={() => setView('grid')} className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all ${view === 'grid' ? 'bg-stone-800 text-white' : 'text-stone-400'}`}>{APP_CONTENT.memories.viewGrid}</button>
          <button onClick={() => startMovieFrom(0)} disabled={photos.length === 0} className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"><Film size={14} className="heartbeat" /> {APP_CONTENT.memories.playMovie}</button>
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-stone-100 text-stone-800 rounded-full text-[10px] font-bold">{isLoading ? APP_CONTENT.memories.uploading : APP_CONTENT.memories.addMedia}</button>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleUpload} />
      </div>

      <AnimatePresence mode="wait">
        {view === 'slideshow' ? (
          <motion.div key="slideshow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-[45vh] lg:h-[75vh] rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden shadow-2xl bg-stone-100 cursor-pointer group" onClick={() => startMovieFrom(activeIndex)}>
            {photos.length > 0 && (
              <div className="absolute inset-0">
                <MediaRenderer photo={photos[activeIndex]} className="w-full h-full object-cover" autoPlay muted loop />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 lg:bottom-20 lg:left-20">
                  <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-white text-2xl lg:text-6xl font-bold serif italic leading-tight">"{photos[activeIndex].caption}"</motion.p>
                  <p className="text-rose-400 text-[10px] uppercase tracking-[0.4em] font-black mt-3">{photos[activeIndex].date}</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl"><Film className="text-white" size={32} /></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
              <button onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length); }} className="p-4 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white pointer-events-auto transition-all"><ChevronLeft size={24} /></button>
              <button onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev + 1) % photos.length); }} className="p-4 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white pointer-events-auto transition-all"><ChevronRight size={24} /></button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10">
            {photos.map((photo, index) => (
              <div key={photo.id} onClick={() => setEditingPhoto(photo)} className="aspect-[4/5] rounded-[2rem] lg:rounded-[3rem] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl border border-stone-100 group relative transition-all hover:-translate-y-2">
                <MediaRenderer photo={photo} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">{photo.type === 'video' ? <PlayCircle size={32} className="text-white" /> : <Edit2 size={32} className="text-white" />}</div>
                <div className="absolute bottom-4 left-4 right-4 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center"><span>{photo.date}</span>{photo.type === 'video' && <Film size={12} />}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingPhoto && (
          <div className="fixed inset-0 z-[2147483647] flex items-center justify-center overflow-hidden">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingPhoto(null)} className="absolute inset-0 bg-stone-950/90 backdrop-blur-2xl" />
             <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="relative w-full h-full lg:h-auto lg:max-w-6xl bg-white lg:rounded-[4rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden">
                <div className="absolute top-4 right-4 lg:top-10 lg:right-10 z-[10]"><button onClick={() => setEditingPhoto(null)} className="p-3 bg-white/20 hover:bg-rose-500 hover:text-white backdrop-blur-xl rounded-full text-stone-800 transition-all border border-white/40"><X size={24} strokeWidth={3} /></button></div>
                <div className="relative w-full lg:w-3/5 h-1/2 lg:h-[80vh] bg-stone-100 flex items-center justify-center overflow-hidden"><MediaRenderer photo={editingPhoto} className="w-full h-full object-contain" controls autoPlay muted /><div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" /><div className="absolute bottom-8 left-8 flex gap-4"><button onClick={() => { const idx = photos.findIndex(p => p.id === editingPhoto.id); startMovieFrom(idx); }} className="flex items-center gap-3 px-8 py-4 bg-white text-stone-900 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"><Play size={16} fill="currentColor" /> {APP_CONTENT.memories.playFromHere}</button></div></div>
                <div className="w-full lg:w-2/5 p-8 lg:p-20 flex flex-col justify-center space-y-10">
                   <div className="space-y-1"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400">{APP_CONTENT.memories.editMemory}</span><h3 className="text-3xl lg:text-5xl font-bold text-stone-800 serif italic">{APP_CONTENT.memories.refineMoment}</h3></div>
                   <div className="space-y-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">{APP_CONTENT.memories.captionLabel}</label><textarea value={editingPhoto.caption} onChange={(e) => setEditingPhoto({...editingPhoto, caption: e.target.value})} className="w-full bg-stone-50 border-none rounded-3xl p-6 text-xl lg:text-2xl font-medium serif italic text-stone-800 focus:ring-2 focus:ring-rose-200 transition-all outline-none resize-none h-32" placeholder={APP_CONTENT.memories.captionPlaceholder} /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">{APP_CONTENT.memories.dateLabel}</label><div className="relative"><input type="date" value={editingPhoto.date} onChange={(e) => setEditingPhoto({...editingPhoto, date: e.target.value})} className="w-full bg-stone-50 border-none rounded-2xl p-6 text-lg font-bold text-stone-800 focus:ring-2 focus:ring-rose-200 transition-all outline-none" /><Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={20} /></div></div>
                   </div>
                   <div className="pt-10 flex flex-col gap-4"><button onClick={handleUpdatePhoto} className="w-full py-6 bg-stone-900 text-white rounded-3xl font-black uppercase tracking-[0.4em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"><Check size={18} strokeWidth={3} /> {APP_CONTENT.memories.saveChanges}</button><button onClick={handleDeletePhoto} className="w-full py-6 bg-rose-50 text-rose-500 rounded-3xl font-black uppercase tracking-[0.4em] text-xs hover:bg-rose-100 transition-all active:scale-95 flex items-center justify-center gap-3"><Trash2 size={18} /> {APP_CONTENT.memories.deleteMemory}</button></div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2147483647] bg-black flex flex-col items-center justify-center overflow-hidden select-none" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden"><div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-screen" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,1)_100%)] opacity-70" /><motion.div animate={{ opacity: [0, 0.15, 0], x: ['-100%', '100%'], y: ['10%', '-10%'] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-[200vw] h-[200vh] bg-rose-500/10 blur-[150px] rotate-45 pointer-events-none" /></div>
            <button onClick={() => { setLightboxIndex(null); setIsMoviePlaying(false); }} className="absolute top-4 right-4 lg:top-6 lg:right-6 z-[2147483649] p-3 lg:p-4 rounded-full bg-white text-black hover:bg-rose-500 hover:text-white transition-all duration-500 shadow-2xl flex items-center justify-center"><X size={20} strokeWidth={3} /></button>
            <div className="relative w-full h-full perspective-[4000px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait"><motion.div key={photos[lightboxIndex]?.id + '-date'} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 0.7, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 1 }} className="absolute top-12 lg:top-20 z-[2147483648] flex justify-center items-center gap-4 pointer-events-none"><div className="h-px w-8 lg:w-12 bg-white/20" /><span className="text-white font-black tracking-[1.5em] uppercase text-[9px] lg:text-[11px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{photos[lightboxIndex]?.date}</span><div className="h-px w-8 lg:w-12 bg-white/20" /></motion.div></AnimatePresence>
              <AnimatePresence mode="popLayout">
                <motion.div key={photos[lightboxIndex]?.id || 'empty'} initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }} transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 flex flex-col items-center justify-center px-4 py-8 lg:p-24 origin-center">
                  <div className="relative max-w-5xl w-full h-[55vh] lg:h-[65vh] flex flex-col items-center justify-center rounded-[4px] overflow-hidden bg-stone-900 shadow-[0_40px_100px_rgba(0,0,0,1)] border border-white/10 group"><MediaRenderer photo={photos[lightboxIndex]} className="w-full h-full object-contain z-0" autoPlay={isMoviePlaying} muted={false} onEnded={() => { if (isMoviePlaying) handleManualNext(); }} /><div className="absolute inset-0 flex z-30 pointer-events-auto"><div className="w-1/2 h-full cursor-pointer" onClick={handleManualPrev} /><div className="w-1/2 h-full cursor-pointer" onClick={handleManualNext} /></div></div>
                  <div className="text-center px-4 lg:px-20 max-w-5xl pt-8 lg:pt-16 min-h-[120px] lg:min-h-[200px]"><motion.h3 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1.2 }} className="text-white text-3xl lg:text-7xl font-bold serif italic tracking-tight lg:tracking-tighter leading-tight drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)]">"{photos[lightboxIndex]?.caption}"</motion.h3></div>
                </motion.div>
              </AnimatePresence>
              {!isMoviePlaying && <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-between px-12 pointer-events-none"><button onClick={handleManualPrev} className="p-8 text-white/20 hover:text-white transition-all bg-white/5 rounded-full pointer-events-auto"><ChevronLeft size={48} /></button><button onClick={handleManualNext} className="p-8 text-white/20 hover:text-white transition-all bg-white/5 rounded-full pointer-events-auto"><ChevronRight size={48} /></button></div>}
              {isMoviePlaying && (
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16 flex flex-col items-center gap-6 lg:gap-8 z-[2147483648] bg-gradient-to-t from-black via-transparent to-transparent">
                  <div className="w-full max-w-xl lg:max-w-2xl h-[3px] bg-white/10 rounded-full overflow-hidden relative shadow-lg"><motion.div key={lightboxIndex + (photos[lightboxIndex]?.type || '')} initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: photos[lightboxIndex]?.type === 'video' ? 0 : 8, ease: "linear" }} className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]" /></div>
                  <div className="flex items-center gap-6 opacity-60"><Sparkles size={16} className="text-amber-300 animate-pulse" /><span className="text-white text-[10px] lg:text-[14px] font-black uppercase tracking-[1.2em]">{APP_CONTENT.memories.signature}</span><Sparkles size={16} className="text-amber-300 animate-pulse" /></div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`body.hide-global-ui, body.hide-global-ui html { background-color: #000000 !important; overflow: hidden !important; } body.hide-global-ui header, body.hide-global-ui nav { display: none !important; } body.hide-global-ui .mesh-bg, body.hide-global-ui .grain { display: none !important; }`}</style>
    </div>
  );
};

export default PhotoMemories;
