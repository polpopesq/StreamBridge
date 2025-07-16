# 🎧 StreamBridge

**StreamBridge** is a full-stack web application that enables seamless **playlist transfer** between major music streaming platforms like **Spotify** and **YouTube**.

Designed with **scalability**, **user-friendliness**, and **modern architecture**, StreamBridge eliminates the barriers between music ecosystems and offers a powerful **open-source** alternative to expensive commercial tools.

> 🛠 Built with **React**, **TypeScript**, **Node.js**, **Express**, **PostgreSQL**, and **Docker**.

---

## 🚀 Features

- 🎼 Transfer playlists between **Spotify** & **YouTube**
- 🔐 **OAuth 2.0** login with **token refresh** logic
- 🧠 **Smart matching algorithm** with AI fallback & manual override
- 💾 **Persistent storage** of user sessions and transfer history
- 🔍 Manual **search & edit** unmatched tracks
- 📊 **Admin panel** for reviewing matches
- 🧩 **Modular MVC architecture** (Backend API + React SPA)
- 🌙 **Dark/light themes** with `localStorage` support
- 🔒 **JWT-based** authentication & secure cookies
- 🐳 **Containerized PostgreSQL DB** via Docker

---

## 🖼 Demo Screenshots

| Landing Page | Playlist Checkout | Manual Match |
|--------------|-------------------|---------------|
| ![landing](docs/screens/landing.png) | ![checkout](docs/screens/checkout.png) | ![manual-match](docs/screens/manual.png) |

---

## 🏗 Tech Stack

| Layer     | Tech Stack                                                                 |
|-----------|----------------------------------------------------------------------------|
| Frontend  | React, TypeScript, Material UI, React Router                              |
| Backend   | Node.js, Express, TypeScript, JWT, OAuth2                                 |
| Database  | PostgreSQL (Dockerized)                                                   |
| Tooling   | Docker, dotenv, pg, bcrypt, spotify-web-api-node                          |
| Hosting   | Ready for deployment on Heroku, Vercel, or any modern cloud VPS solution  |

---

## ⚙️ System Architecture



---

## 🚦 How It Works

### 1. User Authentication
- Email/password registration and login
- OAuth 2.0 authorization for Spotify/YouTube

### 2. Select Playlist
- Choose **source** and **destination** platforms
- Select a playlist to migrate

### 3. Matching Engine
- Normalize song names, apply fuzzy logic, use AI fallback
- User can manually review/edit track matches

### 4. Transfer & History
- Create new playlist on destination platform
- View transfer history in profile

---

## 📦 Getting Started

### 🔧 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- Spotify & YouTube API credentials

---

### 🛠 Setup Instructions

```bash
# Clone the repo
git clone https://github.com/your-user/StreamBridge.git
cd StreamBridge

# Start backend
cd backend
cp .env.example .env
docker-compose up -d
npm install
npm run dev

# Start frontend
cd ../frontend
npm install
npm start
```

### 🔐 Environment Variables
DB_USER=your_db_user
DB_PASSWORD=your_db_password
SPOTIFY_CLIENT_ID=your_spotify_client_id
YOUTUBE_API_KEY=your_youtube_api_key
JWT_SECRET=your_super_secret_key
...

### 📊 Admin Tools
Admins can:
- View all matched/unmatched songs
- Manually update cross-platform links
- Debug & monitor transfer performance
- Toggle isAdmin flag in DB for elevated access

🔐 Security & Performance
• 🔐 Encrypted HTTP-only cookies
• 🔑 JWT session handling
• 🛡 OAuth token refresh with cache fallback
• ⚙️ Clean async/await service architecture
• ⚡ Under 5s average matching time for 50+ track playlists

🧠 Matching Algorithm Highlights
🔁 Spotify → YouTube
• Simple keyword-based search

🔁 YouTube → Spotify (multi-strategy):
• Title normalization (remove "official", "HD", etc.)
• Channel name cleanup (e.g. VEVO, - Topic)

Strategy fallback:
-Title + channel
-Title only
-First words from description
-🤖 AI inference

Future Improvements
🔁 Scheduled sync between accounts (daily/weekly)
📱 React Native mobile app
📤 Import/export .csv & .json
💌 Email alerts for unmatched songs
🎧 Support for Apple Music, Tidal, Deezer
📊 Spotify Wrapped-style stats dashboard

🤝 *Contributing*
Contributions welcome!

```bash
git checkout -b feat/new-platform
git commit -m "Add Tidal integration"
git push origin feat/new-platform

```

👤 Author
Paul Popescu
🎓 Faculty of Cybernetics, ASE Bucharest
🔗 [LinkedIn](https://www.linkedin.com/in/paul-popescu-b19b33253)
