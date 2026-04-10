# 🎧 FocusBeats: Your Ultimate Productivity Station

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://focusbeats.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**FocusBeats** is a premium, distraction-free productivity platform designed to help you enter the "Flow State." Built with a sophisticated 3x3 grid architecture, it integrates a focus timer, ambient music player, task management, and visual analytics into a single, unified experience.

---

## ✨ Key Features

### 🏢 Premium Grid Architecture
Our **Productivity Station** layout uses a curated 3x3 CSS grid system. No overlapping windows, no clutter—just a perfectly organized workspace that keeps your essential tools within reach.

### ⏱️ High-Performance Focus Timer
- **Pomodoro Mode**: Preset sessions to optimize cognitive load.
- **Custom Sessions**: Tailor focus time to your specific workflow.
- **Session Summaries**: Get immediate feedback on every completed session.

### 🎵 Integrated Music Player
- **Docked Widgets**: The player is natively built into the grid, ensuring your beats never stop.
- **Curated Playlists**: Lo-fi, ambient, and white noise tracks designed for deep concentration.

### 📊 Insightful Analytics
- **Visual Trends**: Track your productivity growth with interactive Recharts.
- **Historical Data**: Monitor your focus time daily, weekly, and monthly.

### 📝 Smart Planner & Tasks
- **Context-Aware Tasks**: Manage your to-do lists directly from the dashboard.
- **Long-term Planning**: Integrated planner for mapping out your big wins.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS 4, Modern Glassmorphism |
| **State** | React Context API |
| **Database** | MongoDB & Mongoose |
| **Backend** | Node.js, Express.js |
| **Auth** | JWT (JSON Web Tokens) & Bcrypt |
| **Charts** | Recharts |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TrishaMohanty/FocusBeats.git
   cd FocusBeats
   ```

2. **Install Dependencies**
   ```bash
   # Install Frontend & Backend dependencies
   npm install
   cd backend && npm install
   cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the root and `backend/` directories with the following:
   ```env
   # Root .env (Automatically switches, but you can override here)
   VITE_API_BASE_URL=http://localhost:5000 

   # Backend .env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   PORT=5000
   ```

   > [!TIP]
   > The frontend now **automatically switches** between `localhost:5000` (development) and your production Vercel URL. You only need to set `VITE_API_BASE_URL` in the root if you want to override this default behavior.

4. **Run the Application**
   ```bash
   # Run Frontend
   npm run dev

   # Run Backend (in a separate terminal)
   cd backend
   node server.js
   ```

---

## 🎨 Design Philosophy
FocusBeats prioritizes **Visual Excellence**. We avoid generic colors and browser defaults. Our design system features:
- **HSL-tailored Palettes**: Harmonious colors for better focus.
- **Micro-animations**: Subtle feedback for enhanced engagement.
- **Glassmorphism**: A sleek, modern aesthetic that feels premium.

---

## 📄 License
This project is licensed under the **MIT License**.

---

<p align="center">
  Developed with ❤️ by <a href="https://github.com/TrishaMohanty">Trisha Mohanty</a>
</p>
