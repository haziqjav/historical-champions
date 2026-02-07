# ⚔️ Historical Champions – Legends of the Crusade

An **AI-powered cinematic 2D fighting game** where legendary historical warriors clash in epic duels — enhanced with **real-time AI narration powered by Google Gemini**.

Built for the **Google DeepMind Gemini 3 Hackathon**.

---

## 🚀 Elevator Pitch

> Fight like a legend. Hear your story narrated by AI.

Historical Champions blends arcade combat with dynamic storytelling. Every battle is narrated live using Gemini AI, turning gameplay into a cinematic experience.

---

## 🎮 Live Demo

👉 Play here:  
https://aistudio.google.com/apps/drive/1H2Gs5nNhVRDBf2ybO48iWtcfOSPp18ns

---

## ✨ Features

### ⚔️ Real-Time Combat
- 2D fighting mechanics
- Health bars
- Character cards
- Smooth action gameplay

### 🧠 AI Narration (Gemini Powered)
- Pre-match hype narration
- Live battle commentary
- Post-battle storytelling
- Dynamic responses based on gameplay

### 🔊 Immersive Audio System
- Voice narration
- Combat sound effects
- Loudness + guidance controls
- Low-latency playback

### ⚡ Zero-Lag AI Trigger System
- Narration generated during fight
- No pauses or gameplay freeze
- Designed for smooth experience

### 📱 Cross Platform
- Desktop (keyboard)
- Mobile (touch)

---

## 🧠 How Gemini is Used (Core Hackathon Requirement)

This project deeply integrates **Google Gemini models**:

| Feature | Gemini Usage |
|--------|--------------|
| Match narration | Text generation |
| Storytelling | Creative AI responses |
| Commentary | Real-time prompts |
| Voice scripts | Dynamic text-to-speech |

### Flow
1. Game event happens (attack / win / damage)
2. Prompt sent to Gemini API
3. Gemini generates narration text
4. Converted to speech
5. Played instantly in game

This creates **AI-driven storytelling gameplay**.

---

## 🛠️ Built With

React, TypeScript, HTML5, CSS, Google Gemini API, Google AI Studio, Web Audio API, JavaScript, Vite, Canvas Rendering

---

## 📂 Project Structure

historical-champions/
├── components/
│ ├── Combat/
│ │ ├── CombatScene.tsx
│ │ └── HealthBar.tsx
│ └── CharacterCard.tsx
├── services/
│ ├── audioUtils.ts
│ ├── gameService.ts
│ └── soundService.ts
├── App.tsx
├── index.tsx
├── index.html
├── constants.ts
├── types.ts
├── metadata.json


---

## 🏗️ How I Built It

This game was created entirely using **AI-assisted development with Google AI Studio**.

### Steps:
1. Designed combat mechanics with React components
2. Built modular service layer for game logic + audio
3. Connected Gemini API for narration generation
4. Implemented Web Audio playback
5. Optimized for low latency
6. Added mobile + desktop support

---

## 📚 What I Learned

- Prompt engineering for game narration
- Integrating Gemini API in real-time apps
- Audio synchronization
- Low latency AI calls
- React game architecture
- Building AI-first gameplay experiences

---

## ⚠️ Challenges Faced

### 🔹 API latency
Solved using background generation + prefetch triggers

### 🔹 Voice timing
Balanced narration speed to match gameplay pacing

### 🔹 Free quota limits
Optimized calls using lightweight models (Gemini Flash)

### 🔹 Cross-device performance
Implemented responsive design

---

## ▶️ Run Locally

```bash
🖼️ Screenshots

/screenshots/HOMEPAGE.jpg
/screenshots/combat.png.jpg
/screenshots/narration.png.jpg


💡 Future Improvements
Multiplayer battles

More historical characters

Voice personalities

Online leaderboard

Story campaign mode

👤 Author
Haziq Javaid
GitHub: https://github.com/haziqjav

🏆 Hackathon Submission
Created for Google DeepMind Gemini 3 Hackathon
Built using Gemini API as the core gameplay engine.
