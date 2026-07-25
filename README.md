# 🕰️ ChronoSync - Frictionless Global Timezones

![ChronoSync Preview](https://via.placeholder.com/1200x600/12101F/FADB5F?text=ChronoSync+-+Frictionless+Timezones)

ChronoSync is a beautiful, visual timezone coordinator built for the **Stardance Hackathon** "Frictionless" mission. It completely eliminates the mental math of scheduling global meetings, hackathon sessions, or gaming lobbies by providing a tactile, visual master clock.

## 🚀 The Problem Solved
The internet has made the world smaller, but coordinating across timezones remains a massive, daily annoyance. Trying to schedule a meeting requires constantly asking, "If it's 3 PM for me, what time is it in Tokyo? Is London asleep?"

ChronoSync removes this friction entirely. Instead of using clunky timezone converter websites that require you to manually type in times, ChronoSync gives you a "Master Clock" slider.

## ✨ 3 Major Quality-of-Life (QoL) Improvements
1. **The Visual Master Clock**: Simply drag the master slider to scrub through time. It instantly syncs everyone's local time, allowing you to find the perfect overlap in seconds. No mental math required.
2. **Smart Day/Night Indicators**: The UI dynamically color-codes team members based on their local time. It glows warmly during their day, dims in the evening, and turns deep purple when they are asleep—instantly warning you if you're scheduling a meeting at 3 AM for a teammate.
3. **Frictionless URL State Sharing**: There are no annoying login screens. When you add your team, the entire state is encoded securely into the URL. Click "Share Session", paste the link to your team, and they see your exact dashboard instantly without needing an account.

## 🛠️ Tech Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3.
- **Build Tool**: Vite (for lightning-fast HMR and bundling).
- **Design System**: Custom CSS Glassmorphism, CSS 3D Transforms, and a Stardance-inspired premium space theme.
- **Time Logic**: Native `Intl.DateTimeFormat` API for accurate, zero-dependency timezone calculations.

## 💻 How to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yugpatel-09/chrono-Sync.git
   cd chrono-Sync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173/`

## 🎨 Design Decisions
- **Typography**: Uses `Playfair Display` for elegant, italicized headers, perfectly contrasting with modern sans-serifs like `Outfit` and `Space Grotesk`.
- **Interactions**: Subtle 3D tilt effects on cards when hovering, smooth state transitions, and a dynamic starfield background.
- **Accessibility**: A functional Settings page allows users to toggle 24-hour time formats and disable 3D CSS effects for better performance on low-end devices.

---
*Built with ❤️ for the Stardance "Frictionless" Hackathon.*
