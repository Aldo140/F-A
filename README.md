# Aldo & Fiona's Private Space

A premium, private romantic web app. This digital sanctuary is designed for Aldo and Fiona to celebrate their relationship, store memories safely, and share future promises.

---

## Quick Start

Requires [Node.js](https://nodejs.org/) (v18+). Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000. To build for production: `npm run build`.

---

## 🚀 Tech Stack

- **Frontend**: React 19
- **Build**: Vite 6 (dev server and production builds)
- **Styling**: Tailwind CSS (CDN)
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **AI**: Google Gemini API (`@google/genai`) for smart media tagging and discovery.
- **Storage**: IndexedDB (`db.ts`) for large media files + `localStorage` for app settings.

---

## 🎵 Audio System

The app features a background ambient music system designed to set a romantic mood.

### How it works:
- **Logic**: Managed by `useAudio.ts`.
- **Auto-Play**: Modern browsers block auto-playing audio until the user interacts with the page. To solve this, the audio "unlocks" and starts playing immediately when the user clicks **"Unlock Memories"** or interacts with the **Valentine Splash**.
- **Playlist**: The app will attempt to play the first source. If it fails (broken link), it automatically tries the next one in the list.
- **Volume**: Defaulted to `0.3` (30%) to remain ambient and not overpowering.

### How to change music:
1. Open `constants.ts`.
2. Find the `AUDIO_SOURCES` array.
3. Replace the URLs with your own direct links (ending in `.mp3` or `.wav`).
   * *Note: Ensure the hosting site allows cross-origin requests (CORS) or use a reliable public host like Internet Archive or your own cloud storage.*

---

## 📂 Project Structure

- `index.html`: The entry point. Handles fonts, background mesh animations, and grain effects.
- `App.tsx`: The heart of the app. Manages navigation and global state.
- `constants.ts`: Core configuration. **Change your relationship start date and password here.**
- `content.ts`: **Centralized Text File.** Update any wording on the site here.
- `db.ts`: IndexedDB logic. Essential for storing high-quality photos/videos without crashing the browser's storage limit.
- `components/`: Modular UI elements (Calendar, Photos, Letters, etc.).

---

## 🖼 Asset Management

### 1. Gallery Defaults
In `components/PhotoMemories.tsx`, edit the `defaults` array to change what shows up before you've uploaded anything.

### 2. Calendar Surprise Media
In `components/SharedCalendar.tsx`, edit the `MEME_MAP` object. Use direct image/GIF links.

---

## 📱 Synchronization & Sharing

**Current State (Local):** Data is stored in your phone's browser. If you upload a photo, Fiona won't see it on her phone yet.

### To enable "Submission Sync" (Recommended):
To have a truly shared experience where you both see updates instantly, you must move to a Cloud Backend.
1. **Supabase (Easiest)**: Set up a free project. Replace the logic in `db.ts` with Supabase API calls.
2. **Cloud Storage**: Instead of storing images as "Base64 strings" (which makes the database huge), upload them to a Supabase Storage Bucket and save the URL.
3. **Realtime**: Supabase provides a "Realtime" listener that will refresh the page content for Fiona the moment Aldo saves a new memory.

---

## 🔒 Security & Privacy

- **The Password Gate**: The password is saved in `constants.ts`. While effective for keeping out casual observers, a technical user could find it in the source code.
- **True Privacy**: Once you move to a backend (like Supabase), you should implement proper "User Authentication" so only Aldo and Fiona's accounts can access the data.

---

## 🛠 Maintenance & Testing

- **Production Test Tools**: Click the **Wrench Icon** (bottom-left) to force special events (like the Anniversary Splash) or reset the local environment for testing.
- **Mobile Safe Areas**: The app uses `viewport-fit=cover` and CSS variables (`--safe-top`, `--safe-bottom`) to ensure UI elements don't get cut off by phone notches or home bars.
- **Performance**: Large videos can take time to process into Base64 for local storage. For videos longer than 30 seconds, a Cloud Backend is highly recommended.

---

## 🚀 Deployment

### GitHub Pages

**Live at:** https://aldo140.github.io/F-A/

1. Push the repo to GitHub.
2. **Important:** In your repo go to **Settings** → **Pages** → **Build and deployment** → **Source**. Change from "Deploy from a branch" to **GitHub Actions**.
3. Push to `main`; the workflow builds and deploys automatically.

**Optional (Media Tracker search):** In **Settings** → **Secrets and variables** → **Actions**, add a secret named `GEMINI_API_KEY` with your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). The app works without it; only Media Tracker search will be disabled.

### Other platforms

- **Vercel** (drag and drop the folder)
- **Netlify**

### Environment variables

For Media Tracker search (Gemini API) to work:

1. Copy `.env.example` to `.env` locally.
2. Replace `your_api_key_here` with your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
3. When deploying, add `GEMINI_API_KEY` to your hosting platform's environment variables (GitHub: repo Secrets; Vercel: Project Settings → Environment Variables; Netlify: Site settings → Environment variables).

The app runs without a key; only Media Tracker search features will fail without it.