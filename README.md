# PlanCraft — The 10-Minute Lesson Architect

> **Instant, high-energy lesson planning for educators.**
> Enter your topic, select your grade level and class duration, and generate an exact, mathematically timed pedagogical plan with real-time bell reminders and an interactive classroom timer.

![PlanCraft Preview](./screenshots/preview.png)

---

## Overview

**PlanCraft** is a lightweight, zero-runtime-dependency web application built for teachers who need structured lesson plans fast. Whether you're prepping in the 10 minutes before the first period bell or structuring a long block seminar, PlanCraft calculates exact phase timings, calibrates pacing for different age groups, maps the session to the real classroom clock, and stores everything offline in the browser.

---

## Features

### ⏱️ Pedagogical Planning & Exact Time Allocation

- **Exact-Duration Guarantee**: Uses the Hare-Niemeyer (Largest Remainder) algorithm so every phase's minutes sum to **exactly** the requested total — no rounding drift or lost minutes.
- **Dynamic Minute Rebalancing**: In-plan `+` / `-` steppers let teachers shift minutes between phases on the fly while keeping the total duration fixed.
- **Class-Level Adaptation**: Adjusts cognitive load, autonomy level, and discussion strategies for Elementary (K-5), Middle School (6-8), High School (9-12), College, and Adult Education.
- **Pedagogical Format Styles**:
  - **Standard Balanced** — Hook • Model • Practice • Exit
  - **Interactive Collaboration** — heavy peer-group / lab focus
  - **Direct Instruction & Mastery** — step-by-step drills
  - **Socratic Inquiry & Debate** — critical-thinking arc
- **Curated Starter Chips**: Filterable quick-select topics across Science/STEM, Mathematics, English/ELA, History/Social Studies, and Arts/Code.

### 🕒 Real-Time Clock & Classroom Timer

- **Live Bell Schedule Mapping**: Converts phase durations into actual wall-clock intervals (e.g. `09:00 – 09:08`, `09:08 – 09:23`) based on the class start time.
- **In-Class Countdown Presenter**: Fullscreen-ready timer modal with a large digital readout, phase progress bar, active teacher prompts, and keyboard shortcuts:
  - `Space` — pause / resume
  - `P` — previous phase
  - `N` — next phase
- **Audio & Push Reminders**: Built-in Web Audio synthesized chimes (no external audio files) and optional browser notifications with configurable advance warning (1, 2, or 3 minutes before a transition).

### 📁 Persistence, Sharing & Export

- **100% Offline Local Storage**: Active lesson plans and custom notes survive browser refreshes.
- **"My Stash" Library**: Save, name, review, and manage multiple lesson plans locally.
- **One-Tap URL Sharing**: Encodes topic, duration, grade level, style, and start time into shareable link parameters.
- **Clean Print / PDF Output**: A dedicated `@media print` stylesheet formats the plan into a distraction-free handout.
- **Plaintext Export**: Copy to clipboard or download a `.txt` file with phase objectives, teacher moves, and formative checks.

### 🎨 Visual Design & Usability

- **Neo-Bento Aesthetic**: High-contrast, tactile interface with clear visual hierarchy, color-coded phase tracks, and smooth micro-animations.
- **Dark & Light Mode**: Persistent theme toggle that respects system preferences.
- **Responsive Layout**: Fluid desktop grid with a sticky quick-action dock on mobile and tablet.

---

## Tech Stack

PlanCraft is intentionally built with vanilla web standards for speed, security, and long-term maintainability.

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic, accessible structure with ARIA roles and live regions |
| **Vanilla CSS3** | Custom properties, CSS Grid, Flexbox, media queries, print styles |
| **Vanilla JavaScript (ES6+)** | Zero-dependency app logic, state management, and DOM orchestration |
| **Web Audio API** | Synthetic audio chimes and tactile feedback (no audio assets) |
| **Notifications API** | Transition warnings and bell alerts |
| **LocalStorage API** | Client-side persistence with no backend |
| **Vite (dev server)** | Optional fast local preview server |

---

## How It Works

```text
┌─────────────────────────────────┐
│ 1. Input Details                │ ── Topic, Grade Level, Duration, Style, Start Time
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ 2. Mathematical Engine          │ ── Largest-Remainder integer minute distribution
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ 3. Interactive Dashboard        │ ── Visual timeline, bell schedule & pedagogical cards
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ 4. In-Class Execution           │ ── Presenter countdown timer, audio bells, notes
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ 5. Persist / Share / Print      │ ── Stash library, URL sharing, PDF printing, TXT
└─────────────────────────────────┘
```

1. **Enter lesson parameters**: Type a topic (or tap a starter chip), select the grade level, choose total minutes (or a preset like *10m Sprint* / *45m Period*), and set the class start time.
2. **Generate the plan**: Click **Generate Lesson Plan** (`⌘ + Enter` / `Ctrl + Enter`).
3. **Review & fine-tune**: Inspect the visual timeline and section breakdown, and adjust phase minutes with the `+` / `-` steppers.
4. **Teach with live pacing**: Click **Teach Phase** or **Presenter Timer** to launch the countdown with stage-by-stage instructions.
5. **Save, share, or export**: Save to **My Stash**, copy the plan, export a `.txt` file, generate a shareable URL, or print to PDF.

---

## Project Structure

```text
plancraft/
├── index.html        # Application structure and modal dialogs
├── style.css         # Neo-Bento design system, themes, mobile & print styles
├── script.js         # Core pedagogical engine, timer, persistence & audio
├── vite.config.js    # Minimal Vite dev configuration
├── package.json      # Project metadata and lightweight dev scripts
├── LICENSE           # MIT License
├── .gitignore        # Git exclusion rules
├── screenshots/      # Application interface preview
│   └── preview.png
└── README.md         # Project documentation
```

---

## Running Locally

Because PlanCraft is built with pure web standards, you can run it in two ways.

### Option A: Standalone (No Node.js Required)

Open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari), or serve it with any static server:

```bash
# Python 3
python -m http.server 3000

# or PHP
php -S localhost:3000
```

### Option B: Vite Dev Server

For a hot-reloading local server:

1. Install dev dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm run dev
   ```

3. Open the URL printed in the terminal (the port is set in `vite.config.js`, e.g. [http://localhost:3000](http://localhost:3000)).

---

## Responsive Design

PlanCraft is designed to work across common viewport sizes:

- **Desktop (1024px+)**: Multi-column bento grid with a full timeline tracker and integrated control deck.
- **Tablet (768px – 1023px)**: Adaptive wrapping, touch-friendly steppers, and accessible modal overlays.
- **Mobile (< 768px)**: Single-column card flow, full-width touch targets, and a fixed bottom quick-action bar for in-class use.
- **Print / PDF**: Clean black-and-white layout that hides UI controls and navigation for crisp printouts.

---

## Competition

This project was developed for the **ZeroCode** prompt-engineering competition, showing how pedagogical design principles, mathematical time guarantees, and client-side web standards can come together in an instant, practical teaching tool.

---

## Future Improvements

- [ ] Customizable phase templates and user-defined default duration weights
- [ ] Export to Google Classroom and LMS calendar formats (`.ics`)
- [ ] Multi-day unit planning with sequenced lesson chains
- [ ] Multi-language localization for international classrooms

---

## License

This project is open-source and available under the [MIT License](LICENSE).
