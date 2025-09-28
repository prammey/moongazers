# 🌙 MoonGazers

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/) 
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/) 
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/) 
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/) 
[![MIT License](https://img.shields.io/badge/license-MIT-green)](LICENSE) 
[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://moongazers.prameet.space/)

MoonGazers is a web app that helps anyone, from beginners to astronomy clubs to find the **best 90-minute windows for stargazing**.  
Instead of overwhelming charts, it translates forecast and sky data into a single, simple recommendation.  

--

## ✨ Features
- **Location-aware**: Enter your ZIP code or city for local conditions.  
- **Best Viewing Windows**: Groups adjacent good hours into 90-minute blocks.  
- **At-a-Glance Sky**: Cloud cover, temperature, wind, moon phase, and visible planets/stars.  
- **Simple Output**: A clear answer to *“When should I go outside?”*  
- **Responsive UI**: Mobile-friendly design built with Tailwind CSS.  

---

## 🛠 Tech Stack
- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS  
- **Backend**: Next.js API Routes (TypeScript) with server-side caching  
- **Data**: Weather forecasts + astronomical calculations (moon, planets, bright stars)  
- **Resilience**: Fallback pipeline if a primary upstream fails  

---

## 🔍 How It Works
1. Input ZIP code or city  
2. API fetches forecast + sky data  
3. Each hour is **scored**:  
   - Clear skies = higher score  
   - Bright moon = penalty  
   - Only nighttime hours count  
4. Good hours merged into **90-minute observing windows**  
5. Returns JSON → rendered in UI  

*(Diagram idea: “Location → Forecast + Sky → Scoring → 90-min Blocks → Best Times”)*  

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+  
- npm or yarn  

### Installation
```bash
git clone https://github.com/prammey/moongazers.git
cd moongazers
npm install


## Create .env.local:

ASTROSPHERIC_KEY=...
TIMEZONEDB_KEY=...

```

## 🧮 Scoring Model

Cloud cover: Lower is better
Moonlight: Penalty when bright & above horizon
Night hours only: After sunset, before sunrise
Window grouping: Merge good hours into 90-minute blocks

## 🧱 Caching & Fallback

Cache TTLs: geocoding ~30 days; forecasts ~6 hours; sky data ~12 hours
Fallback: If the primary upstream times out or errors, a backup path ensures the same JSON response shape

## 🔒 Security Notes

API keys are required but must stay in .env.local (never in source).
Only server code should reference keys.
Validate user input (ZIP/city), apply timeouts, and rate-limit requests.
Add security headers in next.config.ts for production.

## 📜 License

MIT License — feel free to use, fork, and build on this project.

## 🙏 Credits

MoonGazers would not be possible without these data sources and tools:

- Astrospheric API 
- Open-Meteo
- TimeZoneDB


Special thanks to the astronomy community for inspiring this project.

## 👤 Author

Prameet Guha — high school student passionate about astronomy + computer science.
🌐 Portfolio: prameet.space
🚀 Live App: moongazers.prameet.space
