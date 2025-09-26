# El Pollo Loco 🐔🌵🎮

A browser-based 2D jump-and-run **speedrun game** inspired by western vibes.  
The player controls the hero to fight enemies, collect items, defeat bosses, and survive across **5 challenging levels** in the desert world.
Even though it’s a practice project, it demonstrates a complete small-scale web game with animations, sounds, menus, persistence, and responsive controls.

---

## ✨ Features
- 🎨 Pixel-art characters, enemies, and backgrounds  
- 🔊 Sound effects & background music  
- 🕹️ Responsive controls (keyboard + mobile buttons)  
- 📊 Leaderboard stored in Firebase Realtime Database  
- ⏱️ Countdown, HUD overlays, game over & victory screens  
- 📱 Fully responsive design with touch support  
- 🐔 Classic platformer mechanics: movement, jumping, throwing bottles  
- 👾 Enemies with increasing difficulty and boss fight  

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari).  
- No installation or build step required.  

### 1. Clone the Repository
```bash
git clone https://github.com/DominikRapp/el-pollo-loco.git
cd el-pollo-loco
```

Or simply [download the ZIP](https://github.com/DominikRapp/el-pollo-loco/archive/refs/heads/main.zip).

### 2. Start a Local Web Server
Open the folder with a local server, e.g. **VSCode Live Server** or:
```bash
python3 -m http.server 8000
```
Then open:
```
http://localhost:8000
```

### 3. Setup Firebase (for Leaderboard)
This project uses Firebase **Realtime Database** for the leaderboard.  
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).  
2. Enable **Realtime Database** (test mode or with proper rules).  
3. Copy your Firebase config snippet and replace it in:
   ```
   js/api/init-firebase.js
   ```

### 4. Reset / Seed Database
A default dataset is included:

```
data/reset-data.json
```

You can import this into Firebase Realtime Database to initialize/reset the leaderboard.

---

## 🕹️ Controls
- **Move left/right:** Arrow keys, A/D or on-screen buttons
- **Jump:** SPACE or jump button
- **Throw bottles:** W or throw button

---

## 📂 Project Structure
```
el-pollo-loco/
│── index.html           # Game entry point
│── style.css            # Global styles
│── css/                 # UI and overlay styles
│── js/                  # Game logic & Firebase integration
│   ├── app/             # Core application scripts
│   ├── models-classes/  # Game objects & enemies
│   └── api/             # Firebase integration
│── img/                 # Sprites & backgrounds
│── audio/               # Sound & music
│── data/reset-data.json # Firebase seed/reset
│── fonts/               # Game fonts
│── legal/               # Terms, privacy, imprint pages
```

---

## 🛠️ Technologies Used
- **HTML5 Canvas** for rendering  
- **CSS3** for styling and responsive design  
- **Vanilla JavaScript (ES6)** for game logic and OOP  
- **Firebase Realtime Database** for leaderboard persistence  

---

## ⚠️ Important Notes
- Do **not** commit private Firebase service account keys.  
- `reset-data.json` contains only safe, public seed data.  
- Secure your Firebase project with proper rules if deployed publicly.  

---

## 📖 Learning Goals
This project was developed for a course to practice:
- DOM manipulation & rendering loops  
- OOP in JavaScript with classes  
- Handling animations & audio in web apps  
- Working with Firebase Realtime Database  
- Responsive design & mobile controls  

---

## 📜 License & Credits
This project was created for **educational purposes only**.  
You are free to fork and experiment with it.  

**Assets:**  
- 🎨 Sprites & some graphics: provided by the course instructor, CraftPix.net, and Pixabay (free resources).  
- 🔊 Sound effects: [freesound.org](https://freesound.org) (Creative Commons licensed).  
- 📜 Fonts: included open/free fonts.  

⚠️ **Not for commercial use**:  
The included graphics and sounds are licensed for learning and non-commercial purposes only.  
If you plan to publish or monetize a game, replace all third-party assets with your own or fully licensed material.

---
