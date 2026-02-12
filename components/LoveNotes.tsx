
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Mic, Play, Pause, Music, X, Send, Square } from 'lucide-react';
import { Note } from '../types';
import { isValentinesDate } from '../constants';
import { APP_CONTENT } from '../content';

const LoveNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('love_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAuthor, setActiveAuthor] = useState<'Aldo' | 'Fiona'>('Aldo');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isValentines = isValentinesDate();

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); }; }, []);

  const addNote = () => {
    if (!newNoteContent.trim() && !audioBase64) return;
    const newNote: Note = { id: Date.now().toString(), author: activeAuthor, content: newNoteContent, voiceUrl: audioBase64 || undefined, date: new Date().toLocaleDateString(), isPinned: false };
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('love_notes', JSON.stringify(updated));
    setNewNoteContent(''); setAudioBase64(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder; audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsProcessing(true);
        const reader = new FileReader();
        reader.readAsDataURL(new Blob(audioChunksRef.current));
        reader.onloadend = () => { setAudioBase64(reader.result as string); setIsProcessing(false); stream.getTracks().forEach(t => t.stop()); };
      };
      mediaRecorder.start(); setIsRecording(true); setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch (e) { alert("Mic Access Denied"); }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
  };

  return (
    <div className="w-full space-y-8 lg:space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl lg:text-5xl font-bold text-stone-800 serif italic tracking-tighter">{APP_CONTENT.letters.notes.title}</h2>
        </div>
        <div className="flex p-1 bg-white/60 backdrop-blur-xl border border-stone-100 rounded-full w-fit shadow-sm">
          {(['Aldo', 'Fiona'] as const).map(author => (
            <button key={author} onClick={() => setActiveAuthor(author)} className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeAuthor === author ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400'}`}>
              {author === 'Aldo' ? APP_CONTENT.letters.notes.authorAldo : APP_CONTENT.letters.notes.authorFiona}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-2xl mx-auto space-y-4">
        <div className="relative">
          <textarea value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder={isRecording ? APP_CONTENT.letters.notes.recording : APP_CONTENT.letters.notes.placeholder} disabled={isRecording || isProcessing} className="w-full h-44 p-8 rounded-[2.5rem] border border-stone-100 shadow-xl bg-white/80 backdrop-blur-md focus:bg-white outline-none transition-all text-stone-800 text-lg leading-relaxed resize-none" />
          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            <AnimatePresence>{audioBase64 && !isRecording && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Music size={14} /><span className="text-[9px] font-black uppercase">{APP_CONTENT.letters.notes.ready}</span><button onClick={() => setAudioBase64(null)} className="ml-1"><X size={14}/></button>
              </motion.div>
            )}</AnimatePresence>
            {isRecording ? (
              <div className="flex items-center gap-2">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="px-4 py-3 bg-rose-500 text-white rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="flex gap-1">{[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-white rounded-full animate-pulse" />)}</div>
                  <span className="text-sm font-bold">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                </motion.div>
                <button onClick={stopRecording} className="px-4 py-3 bg-stone-900 text-white rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Square size={12} fill="currentColor" />
                  Done
                </button>
              </div>
            ) : (
              <button onClick={startRecording} disabled={isProcessing} className="p-5 bg-white text-stone-600 rounded-3xl shadow-lg border border-stone-100 hover:scale-105 active:scale-95"><Mic size={24} /></button>
            )}
            <button onClick={addNote} disabled={isRecording || isProcessing || (!newNoteContent.trim() && !audioBase64)} className="p-5 bg-stone-900 text-white rounded-3xl shadow-2xl disabled:opacity-30 hover:scale-105"><Send size={24} /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">{notes.map((note) => (
            <motion.div key={note.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-8 rounded-[2rem] border border-stone-50 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col justify-between min-h-[200px] ${isValentines && 'ring-1 ring-rose-100'}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-stone-300">
                  <span className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${note.author === 'Aldo' ? 'bg-blue-400' : 'bg-rose-400'}`} />{note.author}</span>
                  <button onClick={() => { const u = notes.filter(n => n.id !== note.id); setNotes(u); localStorage.setItem('love_notes', JSON.stringify(u)); }}><Trash2 size={14}/></button>
                </div>
                {note.content && <p className="text-stone-800 italic serif text-xl leading-relaxed">{note.content}</p>}
                {note.voiceUrl && <NoteAudioPlayer url={note.voiceUrl} />}
              </div>
              <p className="mt-6 pt-4 border-t border-stone-50 text-[9px] font-black text-stone-300 tracking-widest">{note.date}</p>
            </motion.div>
        ))}</AnimatePresence>
      </div>
      {notes.length === 0 && (
        <div className="max-w-xl mx-auto text-center py-10 px-6 rounded-[2rem] border border-dashed border-stone-200 bg-white/70">
          <p className="text-stone-500 text-sm">No notes yet. Write one or record a voice note to start.</p>
        </div>
      )}
    </div>
  );
};

const NoteAudioPlayer: React.FC<{ url: string }> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toggle = () => { if (!audioRef.current) return; isPlaying ? audioRef.current.pause() : audioRef.current.play(); setIsPlaying(!isPlaying); };
  return (
    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
      <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} className="hidden" />
      <button onClick={toggle} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-rose-500">{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}</button>
      <div className="flex-grow h-1.5 bg-stone-200 rounded-full overflow-hidden"><motion.div className="h-full bg-rose-400" initial={{ width: 0 }} animate={{ width: isPlaying ? '100%' : '0%' }} transition={{ duration: isPlaying ? 10 : 0.2 }} /></div>
    </div>
  );
};

export default LoveNotes;
