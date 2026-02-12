
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Heart, 
  Calendar as CalendarIcon, 
  Camera, 
  Mail, 
  Volume2, 
  VolumeX, 
  LogOut,
  Sparkles,
  ArrowRight,
  Tv,
  Bell,
  AlertCircle,
  Music,
  Loader2
} from 'lucide-react';
import PasswordGate from './components/PasswordGate';
import Countdown from './components/Countdown';
import PhotoMemories from './components/PhotoMemories';
import Letters from './components/Letters';
import SharedCalendar from './components/SharedCalendar';
import ValentineEffect from './components/ValentineEffect';
import ValentineSplash from './components/ValentineSplash';
import MediaTracker from './components/MediaTracker';
import ProductionTestTools from './components/ProductionTestTools';
import { useAuth } from './useAuth';
import { useAudio } from './useAudio';
import { EVENTS, START_DATE, isSplashDay, getEffectiveDate } from './constants';
import { APP_CONTENT } from './content';

const App: React.FC = () => {
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const handleReset = () => {
      setResetKey(prev => prev + 1);
    };
    window.addEventListener('app-soft-reset', handleReset);
    return () => window.removeEventListener('app-soft-reset', handleReset);
  }, []);

  return (
    <div key={resetKey} className="w-full">
      <AppContent />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const { audioStatus, isMuted, toggleMute, retryAudio, playManual } = useAudio(isAuthenticated);
  
  const [activeTab, setActiveTab] = useState<'home' | 'photos' | 'correspondence' | 'calendar' | 'media'>('home');
  const [mediaCount, setMediaCount] = useState<number>(0);
  const [isHideUIPresent, setIsHideUIPresent] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // Scroll visibility logic
  useEffect(() => {
    const handleScroll = () => {
      if (isHideUIPresent) return;
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 20) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHideUIPresent]);

  // Sync state with Movie Mode
  useEffect(() => {
    const checkUIHide = () => {
      const isHidden = document.body.classList.contains('hide-global-ui');
      setIsHideUIPresent(isHidden);
    };
    const observer = new MutationObserver(checkUIHide);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateMediaCount = () => {
      const savedMedia = localStorage.getItem('couple_media');
      if (savedMedia) {
        try {
          const parsed = JSON.parse(savedMedia);
          setMediaCount(parsed.length);
        } catch (e) {
          setMediaCount(0);
        }
      }
    };
    updateMediaCount();
    window.addEventListener('storage', updateMediaCount);
    return () => window.removeEventListener('storage', updateMediaCount);
  }, []);

  const handleLogin = () => {
    login();
    playManual();
  };

  const handleDismissSplash = () => {
    setShowSplash(false);
    sessionStorage.setItem('special_day_splash_dismissed', 'true');
    playManual(); 
  };

  const isSpecial = isSplashDay();
  const [showSplash, setShowSplash] = useState(
    isSpecial && !sessionStorage.getItem('special_day_splash_dismissed')
  );

  const upcoming = EVENTS.map(event => {
    const effectiveNow = getEffectiveDate();
    let nextDate = new Date(effectiveNow.getFullYear(), event.month, event.day);
    
    // Normalize both dates to start of day for accurate "0 days left" calculation
    const today = new Date(effectiveNow.getFullYear(), effectiveNow.getMonth(), effectiveNow.getDate());
    
    if (nextDate < today) nextDate.setFullYear(effectiveNow.getFullYear() + 1);
    
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    let title = event.name;
    if (event.type === 'anniversary') {
      const years = nextDate.getFullYear() - START_DATE.getFullYear();
      const suffix = (n: number) => {
        if (n >= 11 && n <= 13) return 'th';
        switch (n % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
      title = `Our ${years}${suffix(years)} Anniversary`;
    }
    return { ...event, title, nextDate, daysUntil: diffDays };
  })
  .filter(m => m.daysUntil <= 90)
  .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className={`min-h-[100dvh] flex flex-col items-center selection:bg-rose-100 relative transition-colors duration-700 ${isHideUIPresent ? 'bg-black' : 'bg-[#fcfbf4]'}`}>
      <ValentineEffect />
      
      {!isAuthenticated && <ProductionTestTools />}
      
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div key="v-splash-wrapper" className="w-full h-full">
            <ValentineSplash key="splash" onDismiss={handleDismissSplash} />
          </motion.div>
        ) : !isAuthenticated ? (
          <motion.div 
            key="password-entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <PasswordGate onLogin={handleLogin} onPlayTrigger={playManual} isReentry={sessionStorage.getItem('is_auth') === 'true'} />
          </motion.div>
        ) : (
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center"
          >
            {!isHideUIPresent && (
              <motion.header 
                initial={{ y: 0 }}
                animate={{ y: showHeader ? 0 : -120 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-4 lg:px-12 py-4 lg:py-6 pointer-events-none pt-[calc(1rem+var(--safe-top,0px))]"
              >
                <div className="flex items-center gap-2 pointer-events-auto">
                  <Heart size={16} className="text-rose-400 fill-rose-100 heartbeat" />
                  <span className="serif italic font-medium text-stone-600 tracking-wide text-xs lg:text-base">{APP_CONTENT.navigation.signature}</span>
                </div>
                
                <div className="flex items-center gap-2 lg:gap-4 pointer-events-auto">
                  {audioStatus === 'loading' && (
                    <div className="p-2.5 lg:p-3 bg-white/40 backdrop-blur-md rounded-full border border-stone-100">
                        <Loader2 size={16} className="animate-custom-spin text-stone-400" />
                    </div>
                  )}
                  <button onClick={toggleMute} className={`p-2.5 lg:p-3 backdrop-blur-xl border rounded-full shadow-sm transition-all duration-500 ${isMuted ? 'bg-white/40 border-stone-200 text-stone-400' : 'bg-rose-50/80 border-rose-100 text-rose-500'}`}>
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <button onClick={logout} title={APP_CONTENT.navigation.logout} className="p-2.5 lg:p-3 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full shadow-sm hover:bg-white transition-all text-stone-600">
                    <LogOut size={16} />
                  </button>
                </div>
              </motion.header>
            )}

            <main className="w-full max-w-6xl px-4 lg:px-6 pt-24 pb-48 lg:pt-32 lg:pb-64 flex-grow">
              <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                  <motion.div key="home" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-12 lg:space-y-24">
                    <section className="text-center space-y-6 lg:space-y-8">
                      <div className="space-y-3 lg:space-y-4">
                        <Sparkles className="mx-auto text-rose-300 w-6 h-6 lg:w-10 lg:h-10 mb-1 opacity-50" />
                        <h1 className="text-4xl lg:text-8xl font-bold tracking-tight text-stone-800 leading-tight text-balance text-center w-full">{APP_CONTENT.home.heroTitle}</h1>
                        <p className="text-stone-400 italic text-base lg:text-2xl font-light max-w-2xl mx-auto px-4">{APP_CONTENT.home.heroQuote}</p>
                      </div>
                      <Countdown />
                    </section>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-stretch">
                      <HomeCard title={APP_CONTENT.home.thoughtTitle} content={APP_CONTENT.home.thoughtContent} icon={<Heart size={18} className="text-rose-400" />} footer={APP_CONTENT.home.thoughtFooter} />
                      <div className="relative group bg-rose-50/40 backdrop-blur-md border border-rose-100 p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-sm flex flex-col space-y-6 overflow-hidden min-h-[320px]">
                        <div className="flex items-center gap-3">
                          <Bell size={18} className="text-rose-500 heartbeat" />
                          <span className="text-[10px] lg:text-xs uppercase tracking-[0.25em] font-black text-rose-400">{APP_CONTENT.home.milestoneTitle}</span>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                          {upcoming.length > 0 ? (upcoming.map((milestone) => (
                              <div key={milestone.name} className="relative">
                                <p className="text-xl lg:text-2xl text-stone-800 font-bold serif leading-tight">{milestone.title}</p>
                                <div className="flex justify-between items-center mt-2 text-xs font-black uppercase tracking-widest text-stone-400">
                                  <span>{milestone.daysUntil === 0 ? APP_CONTENT.home.milestoneToday : `${milestone.daysUntil} ${APP_CONTENT.home.milestoneDaysLeft}`}</span>
                                  <span className="text-rose-400">{milestone.nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                              </div>
                          ))) : (<p className="text-stone-400 italic text-center py-10">{APP_CONTENT.home.milestoneEmpty}</p>)}
                        </div>
                      </div>
                      <div onClick={() => setActiveTab('media')} className="relative group bg-[#111111] text-stone-100 p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-2xl flex flex-col justify-between cursor-pointer active:scale-95 transition-all min-h-[320px]">
                        <div className="flex items-center gap-3">
                          <Tv size={18} className="text-rose-400" />
                          <span className="text-[10px] uppercase tracking-[0.25em] font-black text-stone-500">{APP_CONTENT.home.watchTitle}</span>
                        </div>
                        <div className="space-y-2">
                          <span className="px-3 py-1 bg-rose-500 text-[10px] font-black uppercase tracking-widest rounded-full">{mediaCount} {APP_CONTENT.home.watchBadge}</span>
                          <h2 className="text-2xl lg:text-4xl font-bold serif leading-tight">{APP_CONTENT.home.watchTitle}</h2>
                          <p className="text-stone-400 text-sm italic font-light">{APP_CONTENT.home.watchSubtitle}</p>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">{APP_CONTENT.home.watchExplore} <ArrowRight size={14} className="inline ml-1" /></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'photos' && <PhotoMemories key="photos" />}
                {activeTab === 'correspondence' && <Letters key="letters" />}
                {activeTab === 'calendar' && <SharedCalendar key="calendar" />}
                {activeTab === 'media' && <MediaTracker key="media" />}
              </AnimatePresence>
            </main>

            {!isHideUIPresent && (
              <nav className="fixed bottom-4 lg:bottom-12 left-1/2 -translate-x-1/2 w-[95%] max-w-xl lg:max-w-2xl bg-white/70 backdrop-blur-3xl border border-white/80 shadow-2xl rounded-[2.5rem] lg:rounded-[3.5rem] px-4 lg:px-14 py-3 lg:py-5 z-[100] flex items-center justify-between">
                <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Heart size={20} />} label={APP_CONTENT.navigation.us} />
                <NavButton active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} icon={<Camera size={20} />} label={APP_CONTENT.navigation.moments} />
                <NavButton active={activeTab === 'correspondence'} onClick={() => setActiveTab('correspondence')} icon={<Mail size={20} />} label={APP_CONTENT.navigation.letters} />
                <NavButton active={activeTab === 'media'} onClick={() => setActiveTab('media')} icon={<Tv size={20} />} label={APP_CONTENT.navigation.watch} />
                <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon size={20} />} label={APP_CONTENT.navigation.plans} />
              </nav>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HomeCard: React.FC<{ title: string, content: string, icon: React.ReactNode, footer: string }> = ({ title, content, icon, footer }) => (
  <div className="bg-white/50 backdrop-blur-md border border-white/80 p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-sm flex flex-col space-y-6 min-h-[320px]">
    <div className="flex items-center gap-3"><div className="p-2 bg-stone-50 rounded-xl">{icon}</div><span className="text-[10px] lg:text-xs uppercase tracking-[0.25em] font-black text-stone-400">{title}</span></div>
    <p className="text-xl lg:text-3xl text-stone-800 font-medium serif italic leading-relaxed flex-grow">"{content}"</p>
    <div className="pt-6 border-t border-stone-100/50 flex justify-between items-center"><span className="text-stone-300 text-[10px] font-black uppercase tracking-[0.2em]">{footer}</span></div>
  </div>
);

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center transition-all duration-200 ${active ? 'text-rose-500 scale-105' : 'text-stone-300 hover:text-stone-500'}`}
  >
    <div className={`p-2 lg:p-3 rounded-2xl transition-all duration-200 ${active ? 'bg-white shadow-md' : 'bg-transparent'}`}>{icon}</div>
    <span className={`text-[9px] mt-1.5 uppercase tracking-widest font-black hidden sm:block ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

export default App;
