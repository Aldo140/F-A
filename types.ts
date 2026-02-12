
export interface Note {
  id: string;
  author: 'Aldo' | 'Fiona';
  content: string;
  voiceUrl?: string; // Base64 encoded audio string
  date: string;
  isPinned: boolean;
}

export interface Photo {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption: string;
  date: string;
}

export interface FutureLetter {
  id: string;
  from: 'Aldo' | 'Fiona';
  to: 'Aldo' | 'Fiona';
  title: string;
  content: string;
  unlockDate: string;
  createdAt: string;
}

export type Availability = 'free' | 'busy' | 'maybe' | 'none';

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  aldoStatus: Availability;
  fionaStatus: Availability;
  note?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'show' | 'movie';
  posterUrl: string;
  status: 'watching' | 'watched';
  progress: string; // e.g., "S2 E4" or "01:20:00"
  year: string;
}
