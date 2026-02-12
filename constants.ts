
export const PASSWORD = "Feb 25 2024";
// JavaScript months are 0-indexed, so February is 1
export const START_DATE = new Date(2024, 1, 25, 0, 0, 0);
export const AUTO_LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const EVENTS = [
  { name: "Our Anniversary", month: 1, day: 25, type: 'anniversary' },
  { name: "Valentine's Day", month: 1, day: 14, type: 'holiday' },
  { name: "Fiona's Birthday", month: 2, day: 9, type: 'birthday' },
  { name: "Aldo's Birthday", month: 5, day: 14, type: 'birthday' },
];

/**
 * Gets the current date, allowing for a debug override.
 */
export const getEffectiveDate = () => {
  const debugDate = localStorage.getItem('debug_date');
  if (debugDate) {
    // Replace hyphens with slashes to ensure local time parsing across browsers
    return new Date(debugDate.replace(/-/g, '/'));
  }
  return new Date();
};

export const isValentinesDate = () => {
  const date = getEffectiveDate();
  return date.getMonth() === 1 && date.getDate() === 14;
};

export const isAnniversaryDate = () => {
  const date = getEffectiveDate();
  return date.getMonth() === 1 && date.getDate() === 25;
};

export const isSplashDay = () => {
  return isValentinesDate() || isAnniversaryDate();
};

/**
 * Audio Sources
 */
export const AUDIO_SOURCES = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://ia801602.us.archive.org/11/items/TheOfficeThemeSong/The%20Office%20Theme%20Song.mp3"
];

/**
 * Utility to trigger a soft app reset by remounting the component tree
 */
export const triggerAppReset = () => {
  window.dispatchEvent(new CustomEvent('app-soft-reset'));
};
