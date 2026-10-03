# PlanCraft — The 10-Minute Lesson Architect

> **Instant, high-energy lesson planning for educators.** Enter your topic, select your grade level and class duration, and generate an exact, mathematically timed pedagogical plan with real-time bell reminders and an interactive classroom timer.

![PlanCraft Preview](./screenshots/preview.png)

---

## Overview

**PlanCraft** is a lightweight, zero-runtime-dependency web application engineered for teachers who need structured, pedagogical lesson plans fast. Whether prepping in the 10 minutes before the first period bell or structuring an intensive block seminar, PlanCraft calculates exact phase timings, calibrates pacing for student age groups, maps sessions to the real classroom clock, and stores everything offline in the browser.

---

## Features

### ⏱️ Pedagogical Planning & Exact Time Allocation
- **Mathematical Exact-Duration Guarantee**: Uses the Hare-Niemeyer (Largest Remainder) algorithm so every phase's minutes sum up **exactly** to the requested total duration—no rounding drift or lost minutes.
- **Dynamic Minute Rebalancing**: In-plan `+` / `-` steppers let teachers shift minutes between phases on the fly while preserving the exact class duration invariant.
- **Class-Level Adaptation**: Configures cognitive load, autonomy level, and discussion strategies for Elementary (K-5), Middle School (6-8), High School (9-12), College, and Adult Education.
- **Pedagogical Format Styles**: Choose between **Standard Balanced** (Hook • Model • Practice • Exit), **Interactive Collaboration** (Heavy peer group/lab focus), **Direct Instruction & Mastery** (Step-by-step drills), and **Socratic Inquiry & Debate** (Critical thinking arc).
- **Curated Starters Cloud**: Filterable quick-select topic chips across Science/STEM, Mathematics, English/ELA, History/Social Studies, and Arts/Code.

### 🕒 Real-Time Clock & Classroom Timer
- **Live Bell Schedule Mapping**: Converts phase durations into actual wall-clock intervals (e.g., `09:00 – 09:08`, `09:08 – 09:23`) based on class start time.
- **In-Class Live Countdown Presenter**: Fullscreen-ready timer modal with large digital readout, phase progress bar, active teacher prompts, and keyboard shortcuts (`Space` to pause/resume, `P` for previous, `N` for next).
- **Audio & Push Reminders**: Built-in native Web Audio synthesizer chimes (no external audio files needed) and optional browser Web Notifications with configurable advance warning (1, 2, or 3 minutes before transition).

### 📁 Persistence, Sharing & Export
- **100% Offline Local Storage**: Active lesson plans and custom notes automatically survive browser refreshes.
- **"My Stash" Library**: Save, name, review, and manage multiple lesson plans locally.
- **One-Tap URL Sharing**: Encodes lesson topic, duration, grade level, style, and start time into shareable link parameters.
- **Clean Print / PDF Output**: Dedicated `@media print` stylesheet formats the plan into a clean, distraction-free handout or binder page.
- **Plaintext Export**: Instant clipboard copy and `.txt` file download formatted with phase objectives, teacher moves, and formative checks.

### 🎨 Visual Design & Usability
- **Neo-Bento Aesthetic**: High-contrast, tactile interface with distinct visual hierarchy, color-coded phase tracks, and smooth micro-animations.
- **Dark & Light Mode**: Persistent theme toggle respecting system preferences.
- **Responsive Layout**: Fluid desktop grid with adaptive sticky quick-action dock on mobile and tablet devices.

---

## Tech Stack

PlanCraft is intentionally built with vanilla web standards for speed, security, and long-term maintainability:

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic, accessible structure with ARIA roles and live regions |
| **Vanilla CSS3** | Custom properties (CSS variables), CSS Grid, Flexbox, media queries, print styles |
| **Vanilla JavaScript (ES6+)** | Zero-dependency application logic, state management, and DOM orchestration |
| **Web Audio API** | Real-time synthetic audio chimes and tactile feedback (zero external audio assets) |
| **Notifications API** | Desktop transition warnings and bell alerts |
| **LocalStorage API** | Instant client-side persistence with zero backend requirements |
| **Vite (Dev Server)** | Fast local development preview server (optional) |

---

## How It Works

```text
┌─────────────────────────────────┐
│  1. Input Details               │ ── Topic, Grade Level, Duration, Style, Start Time
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  2. Mathematical Engine         │ ── Largest-Remainder integer minute distribution
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  3. Interactive Dashboard       │ ── Visual timeline, bell schedule & pedagogical cards
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  4. In-Class Execution          │ ── Presenter countdown timer, audio bells, notes
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  5. Persist / Share / Print     │ ── Stash library, URL sharing, PDF printing, TXT
└─────────────────────────────────┘
```

1. **Enter Lesson Parameters**: Type a topic (or tap an auto-fill chip), select target grade level, choose total minutes (or click a preset like 10m Sprint or 45m Period), and set your class start time.
2. **Generate the Plan**: Click **Generate Lesson Plan** (`⌘ + Enter` / `Ctrl + Enter`).
3. **Review & Fine-Tune**: Inspect the visual timeline and section breakdown. Adjust individual phase minutes with the `+` / `-` steppers as desired.
4. **Teach with Live Pacing**: Click **Teach Phase** or **Presenter Timer** to launch the countdown timer with stage-by-stage instructions.
5. **Save, Share, or Export**: Save to **My Stash** for future classes, copy the plan, export a `.txt` file, generate a shareable URL, or print directly to PDF.

---

## Project Structure

```text
plancraft/
├── index.html          # Application structure and modal dialogs
├── style.css           # Neo-Bento design system, themes, mobile & print styles
├── script.js           # Core pedagogical engine, timer, persistence & audio
├── vite.config.js      # Minimal Vite dev configuration
├── package.json        # Project metadata and lightweight dev scripts
├── LICENSE             # MIT License
├── .gitignore          # Git exclusion rules
├── screenshots/        # Application interface preview
│   └── preview.png
└── README.md           # Project documentation
```

---

## Running Locally

Because PlanCraft is built with pure web standards, you can run it in two ways:

### Option A: Standalone (No Node.js Required)
Simply double-click `index.html` or open it directly in any modern web browser (Chrome, Edge, Firefox, Safari).

Alternatively, serve with any static server:
```bash
# Python 3
python -m http.server 3000

# or PHP
php -S localhost:3000
```

### Option B: Using the Vite Dev Server
If you prefer a hot-reloading local development server:

1. **Install dev dependencies:**
   ```bash
   npm install
   ```

2. **Start the local server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## Responsive Design

PlanCraft is thoroughly tested and optimized across viewport sizes:
- **Desktop (1024px+)**: Multi-column bento grid with side-by-side role pods, full timeline tracker, and integrated control decks.
- **Tablet (768px – 1023px)**: Adaptive wrapping, touch-friendly steppers, and accessible modal overlays.
- **Mobile (< 768px)**: Single-column streamlined card flow, full-width touch targets, and a fixed bottom quick-action bar for rapid in-class access.
- **Print / PDF**: Clean black-and-white layout hiding UI controls and navigational banners for crisp paper printouts.

---

## Competition

This project was developed for the **ZeroCode** prompt-engineering competition, demonstrating how precise pedagogical design principles, mathematical time guarantees, and client-side web standards can be synthesized into an instant, practical teaching tool.

---

## Future Improvements

- [ ] Customizable phase templates and user-defined default duration weights.
- [ ] Export directly to Google Classroom and LMS calendar formats (`.ics`).
- [ ] Multi-day unit planning with sequenced lesson chains.
- [ ] Multi-language localization for international classrooms.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
#   P l a n C r a f t - Z e r o C o d e  
 