# Ye Beats 🎵

## Overview

**Ye Beats** is a premium, immersive music streaming interface built with modern web technologies. Designed to replicate the polish of top-tier streaming services, it features a dynamic, time-aware homepage, real-time music discovery via the YouTube Data API, and a buttery-smooth responsive design that adapts perfectly from desktop to mobile.

## ✨ Key Features

### 🏠 Dynamic Home Experience

- **Time-Aware Greetings**: Personalized "Good Morning", "Good Afternoon", or "Good Evening" headers that change with the time of day.
- **Real-Time Charts**: Automatically fetches the **Billboard Top 100** and **Trending Music Videos**.
- **Smart Caching**: Implements intelligent local caching to minimize API usage and load pages instantly.

### 🎧 Advanced Music Player

- **Seamless Playback**: Queue management, shuffle, repeat, and history tracking.
- **Lyrics Integration**: View synchronized, scrolling lyrics for supported tracks.
- **Video Integration**: Toggle between music video and album art modes.
- **Mini Player**: Persistent playback controls while you browse.

### 🔍 Discovery & Search

- **Instant Search**: Fast, responsive search with "Songs", "Artists", and "Albums" filters.
- **Recent History**: Remembers your recent searches for quick access.
- **Smart Suggestions**: Auto-complete suggestions as you type.

### 📱 fully Responsive Design

- **Desktop**: Full sidebar navigation and expansive grid layouts.
- **Mobile**: Native-app feel with bottom tab navigation and touch-optimized controls.

## 🛠️ Tech Stack

- **Core**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data**: YouTube Data API v3

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/ye-beats.git
    cd ye-beats
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **🔑 Environmental Setup (CRITICAL)**
    This app requires a YouTube Data API Key to function. Without it, the app will run in **Mock Mode**.

    - Get a free API key from the [Google Cloud Console](https://console.cloud.google.com/).
    - Create a file named `.env.local` in the root directory.
    - Add your key:
      ```env
      YOUTUBE_API_KEY=AIzaSy...YourActualKeyHere
      ```
    - _Note: `.env.local` is git-ignored to keep your secrets safe._

4.  **Run locally**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` to start listening.

## 📦 Deployment (Vercel)

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  **Important**: In the Vercel Dashboard, go to **Settings > Environment Variables**.
4.  Add a new variable:
    - **Key**: `YOUTUBE_API_KEY`
    - **Value**: `your_actual_api_key_starts_with_AIza`
5.  Deploy.

## 🔒 Security Note

Since this is a client-side application, your API key is technically exposed in the browser's network requests. To prevent misuse:

1.  Go to **Google Cloud Console > Credentials**.
2.  Edit your API Key.
3.  Under **Application restrictions**, select **HTTP referrers (websites)**.
4.  Add your domains (e.g., `localhost:3000`, `your-app.vercel.app`).

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

_Created with ❤️ for music lovers._
