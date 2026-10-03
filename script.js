/**
 * PlanCraft - The 10-Minute Lesson Architect
 * Vanilla JavaScript (Zero Dependencies, Universal Device Support)
 *
 * Core Mandates:
 * 1. Takes topic, class level, and total minutes.
 * 2. Button displays plan split into pedagogical sections.
 * 3. Shows each section's own minutes, and the minutes add up EXACTLY to the total.
 * 4. Shows a message, and NO plan, if minutes are empty, zero, or negative.
 * 5. Still shows the plan after the page is reloaded (localStorage persistence).
 * 6. Dynamic rebalancing (+ / - 1m stepper) keeping exact sum invariant.
 * 7. Real-Time Bell Schedule & Notification Reminders.
 * 8. Tactile Web Audio pops & chimes, keyboard shortcuts, and theme engine.
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY = 'plancraft_active_plan_v2';
  const THEME_KEY = 'plancraft_theme_v2';
  const STASH_KEY = 'plancraft_stash_v2';

  // Curated Topics by Subject Category
  const TOPIC_PRESETS = {
    all: [
      { name: '🌱 Photosynthesis & Plant Cells', level: 'Middle School (Grades 6-8)', min: 45 },
      { name: '🍕 Fractions: Adding & Multiplying', level: 'Elementary School (Grades K-5)', min: 30 },
      { name: '⚔️ Causes of the American Revolution', level: 'High School (Grades 9-12)', min: 50 },
      { name: '✍️ Creative Writing: Show Don’t Tell', level: 'Middle School (Grades 6-8)', min: 45 },
      { name: "⚛️ Newton's 3 Laws of Motion", level: 'High School (Grades 9-12)', min: 60 },
      { name: '🌮 Spanish: Ordering Food & Etiquette', level: 'Middle School (Grades 6-8)', min: 40 },
    ],
    stem: [
      { name: '🌱 Photosynthesis & Cellular Energy', level: 'Middle School (Grades 6-8)', min: 45 },
      { name: '🧬 DNA Replication & Mutation', level: 'High School (Grades 9-12)', min: 60 },
      { name: '🌋 Plate Tectonics & Earthquakes', level: 'Middle School (Grades 6-8)', min: 40 },
      { name: '⚡ Circuits: Series vs Parallel', level: 'Middle School (Grades 6-8)', min: 45 },
      { name: '🧪 Acids, Bases & the pH Scale', level: 'High School (Grades 9-12)', min: 55 },
    ],
    math: [
      { name: '📐 Pythagorean Theorem & Triangles', level: 'Middle School (Grades 6-8)', min: 45 },
      { name: '📈 Quadratic Formula & Parabolas', level: 'High School (Grades 9-12)', min: 50 },
      { name: '🎲 Probability & Coin Flips', level: 'Middle School (Grades 6-8)', min: 35 },
      { name: '🔢 Linear Equations: Slope & Intercept', level: 'High School (Grades 9-12)', min: 45 },
      { name: '🍕 Fractions & Mixed Numbers', level: 'Elementary School (Grades K-5)', min: 30 },
    ],
    humanities: [
      { name: '📖 Analyzing Symbolism in The Great Gatsby', level: 'High School (Grades 9-12)', min: 50 },
      { name: '✍️ Persuasive Essays: Thesis Hook', level: 'High School (Grades 9-12)', min: 45 },
      { name: '🎭 Shakespeare: Dramatic Irony in Romeo & Juliet', level: 'High School (Grades 9-12)', min: 60 },
      { name: '🔍 Identifying Unreliable Narrators', level: 'College / Higher Education', min: 45 },
      { name: '📚 Story Arcs: Climax & Resolution', level: 'Elementary School (Grades K-5)', min: 30 },
    ],
    history: [
      { name: '💣 Causes of World War I (M-A-I-N)', level: 'High School (Grades 9-12)', min: 50 },
      { name: '🏛️ Ancient Rome: Republic vs Empire', level: 'Middle School (Grades 6-8)', min: 45 },
      { name: '📜 The US Constitution & Bill of Rights', level: 'High School (Grades 9-12)', min: 60 },
      { name: '🏭 The Industrial Revolution & Child Labor', level: 'Middle School (Grades 6-8)', min: 45 },
      { name: '🐪 The Silk Road Cultural Exchange', level: 'Middle School (Grades 6-8)', min: 40 },
    ],
    arts: [
      { name: '🎨 Color Theory: Complementary Pairs', level: 'Middle School (Grades 6-8)', min: 45 },
      { name: '💻 Python: Loops & Conditional Logic', level: 'High School (Grades 9-12)', min: 60 },
      { name: '🎵 Rhythm, Syncopation & Meter', level: 'Elementary School (Grades K-5)', min: 35 },
      { name: '📱 Digital Citizenship & AI Literacy', level: 'Middle School (Grades 6-8)', min: 45 },
      { name: '📸 Photography: Rule of Thirds', level: 'High School (Grades 9-12)', min: 40 },
    ],
  };

  // Color Palette for Phases
  const PHASE_COLORS = [
    '#38bdf8', // sky cyan
    '#c084fc', // purple
    '#4ade80', // bright green
    '#facc15', // yellow
    '#fb923c', // orange
    '#f43f5e', // rose
  ];

  // DOM Elements
  const form = document.getElementById('lesson-form');
  const topicInput = document.getElementById('topic-input');
  const classLevelSelect = document.getElementById('class-level-select');
  const minutesInput = document.getElementById('minutes-input');
  const styleSelect = document.getElementById('lesson-style-select');
  const startTimeInput = document.getElementById('start-time-input');
  const setNowTimeBtn = document.getElementById('set-now-time-btn');
  const reminderWarningSelect = document.getElementById('reminder-warning-select');
  const enableNotifsBtn = document.getElementById('enable-notifs-btn');
  const notifBtnIcon = document.getElementById('notif-btn-icon');
  const notifBtnText = document.getElementById('notif-btn-text');
  const notifStatusBadge = document.getElementById('notif-status-badge');

  const resetBtn = document.getElementById('reset-btn');
  const clearTopicBtn = document.getElementById('clear-topic-btn');
  const topicCharCount = document.getElementById('topic-char-count');
  const durationHelperText = document.getElementById('duration-helper-text');
  const topicChipsContainer = document.getElementById('topic-chips');
  const subjectPills = document.querySelectorAll('.subject-pill');

  // Messages & Banners
  const messageBanner = document.getElementById('message-banner');
  const messageTitle = document.getElementById('message-title');
  const messageText = document.getElementById('message-text');
  const dismissMessageBtn = document.getElementById('dismiss-message-btn');
  const planContainer = document.getElementById('plan-container');
  const toast = document.getElementById('toast');
  const mobileActionBar = document.getElementById('mobile-action-bar');
  const liveReminderHud = document.getElementById('live-reminder-hud');
  const hudStatusText = document.getElementById('hud-status-text');
  const hudOpenTimerBtn = document.getElementById('hud-open-timer-btn');
  const hudDismissBtn = document.getElementById('hud-dismiss-btn');

  // Theme Elements
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');

  // Timer Modal Elements
  const timerModal = document.getElementById('timer-modal');
  const closeTimerBtn = document.getElementById('close-timer-btn');
  const timerSectionName = document.getElementById('timer-section-name');
  const timerDisplay = document.getElementById('timer-display');
  const timerProgressBar = document.getElementById('timer-progress-bar');
  const timerGuideBox = document.getElementById('timer-guide-box');
  const timerWarningAlert = document.getElementById('timer-warning-alert');
  const timerToggleBtn = document.getElementById('timer-toggle-btn');
  const timerPrevBtn = document.getElementById('timer-prev-btn');
  const timerNextBtn = document.getElementById('timer-next-btn');
  const timerSoundBtn = document.getElementById('timer-sound-btn');

  // Stash Drawer Elements
  const savedPlansBtn = document.getElementById('saved-plans-btn');
  const savedPlansBadge = document.getElementById('saved-plans-badge');
  const savedPlansModal = document.getElementById('saved-plans-modal');
  const closeSavedModalBtn = document.getElementById('close-saved-modal-btn');
  const doneSavedModalBtn = document.getElementById('done-saved-modal-btn');
  const saveCurrentPlanBtn = document.getElementById('save-current-plan-btn');
  const clearAllPlansBtn = document.getElementById('clear-all-plans-btn');
  const savedPlansList = document.getElementById('saved-plans-list');

  // Share Modal Elements
  const shareModal = document.getElementById('share-modal');
  const closeShareModalBtn = document.getElementById('close-share-modal-btn');
  const shareUrlInput = document.getElementById('share-url-input');
  const copyShareUrlBtn = document.getElementById('copy-share-url-btn');

  // State Variables
  let activePlan = null;
  let timerInterval = null;
  let currentPhaseIndex = 0;
  let remainingSeconds = 0;
  let totalPhaseSeconds = 0;
  let isTimerRunning = false;
  let isAudioEnabled = true;

  // Live Bell Schedule Tracking Interval
  let bellTrackingInterval = null;
  let isBellTrackingActive = false;
  let lastTriggeredReminderPhase = -1;

  /* ==========================================================================
     Tactile Web Audio Synthesizer (Native Zero-Dependency Micro-Sounds)
     ========================================================================== */
  function playTactilePop(freq = 440, duration = 0.08) {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio policy safe
    }
  }

  function playSuccessChime() {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {
      // Audio policy safe
    }
  }

  function playWarningAlertSound() {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      [659.25, 587.33, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        gain.gain.setValueAtTime(0.15, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.28);
      });
    } catch (e) {
      // Audio policy safe
    }
  }

  /* ==========================================================================
     Theme Engine
     ========================================================================== */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        playTactilePop(500);
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      }
    }
  }

  /* ==========================================================================
     Notification Reminders API
     ========================================================================== */
  function initNotificationStatus() {
    if (!('Notification' in window)) {
      if (notifStatusBadge) {
        notifStatusBadge.textContent = 'Not Supported';
      }
      if (enableNotifsBtn) {
        enableNotifsBtn.disabled = true;
      }
      return;
    }

    updateNotifBadge(Notification.permission);

    if (enableNotifsBtn) {
      enableNotifsBtn.addEventListener('click', async () => {
        playTactilePop(550);
        try {
          const perm = await Notification.requestPermission();
          updateNotifBadge(perm);
          if (perm === 'granted') {
            sendPushNotification('🔔 Notifications Enabled!', 'PlanCraft will now alert you for upcoming phase transitions.');
            showToast('Browser notifications active!');
          } else {
            showToast('Notifications are blocked in your browser settings.');
          }
        } catch (err) {
          console.warn('Notification permission error:', err);
        }
      });
    }
  }

  function updateNotifBadge(permission) {
    if (!notifStatusBadge) return;
    if (permission === 'granted') {
      notifStatusBadge.textContent = '🔔 Active';
      notifStatusBadge.style.backgroundColor = '#bef264';
      notifStatusBadge.style.color = '#18181b';
      if (notifBtnText) notifBtnText.textContent = 'Notifications Enabled';
      if (notifBtnIcon) notifBtnIcon.textContent = '✅';
    } else if (permission === 'denied') {
      notifStatusBadge.textContent = '🔕 Blocked';
      notifStatusBadge.style.backgroundColor = '#fecaca';
      notifStatusBadge.style.color = '#991b1b';
      if (notifBtnText) notifBtnText.textContent = 'Notifications Blocked';
      if (notifBtnIcon) notifBtnIcon.textContent = '⚠️';
    } else {
      notifStatusBadge.textContent = 'Default';
      notifStatusBadge.style.backgroundColor = '';
      notifStatusBadge.style.color = '';
      if (notifBtnText) notifBtnText.textContent = 'Enable Browser Alerts';
      if (notifBtnIcon) notifBtnIcon.textContent = '🔔';
    }
  }

  function sendPushNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="20" font-size="20">⚡</text></svg>',
          tag: 'plancraft-reminder',
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }

  function triggerTransitionReminder(phaseNum, phaseName, message, isWarning = false) {
    if (isWarning) {
      playWarningAlertSound();
    } else {
      playSuccessChime();
    }

    sendPushNotification(
      isWarning ? `⚠️ Reminder: Phase ${phaseNum} Wrapping Up!` : `🔔 Phase ${phaseNum} Finished!`,
      message
    );

    showToast(message);

    if (liveReminderHud) {
      liveReminderHud.classList.remove('hidden');
      if (hudStatusText) {
        hudStatusText.textContent = message;
      }
    }
  }

  /* ==========================================================================
     Real-Time Clock & Bell Schedule Helpers
     ========================================================================== */
  function parseTimeString(timeStr) {
    if (!timeStr) return { hours: 9, minutes: 0 };
    const parts = timeStr.split(':');
    return {
      hours: parseInt(parts[0], 10) || 9,
      minutes: parseInt(parts[1], 10) || 0,
    };
  }

  function formatClockTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const minsStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minsStr} ${ampm}`;
  }

  function computeBellSchedule(startTimeStr, sections) {
    const { hours, minutes } = parseTimeString(startTimeStr);
    const startObj = new Date();
    startObj.setHours(hours, minutes, 0, 0);

    let currentCursor = new Date(startObj.getTime());

    return sections.map((sec) => {
      const slotStart = new Date(currentCursor.getTime());
      const slotEnd = new Date(currentCursor.getTime() + sec.durationMinutes * 60 * 1000);
      currentCursor = slotEnd;

      return {
        ...sec,
        clockStart: formatClockTime(slotStart),
        clockEnd: formatClockTime(slotEnd),
        clockRange: `${formatClockTime(slotStart)} – ${formatClockTime(slotEnd)}`,
        startTimeMs: slotStart.getTime(),
        endTimeMs: slotEnd.getTime(),
      };
    });
  }

  /* ==========================================================================
     Mathematical Time Allocation Engine
     Hare-Niemeyer (Largest Remainder) distribution.
     GUARANTEES that sum(section_minutes) === totalMinutes EXACTLY!
     ========================================================================== */
  function allocateExactMinutes(totalMin, weights) {
    const n = weights.length;
    if (totalMin < n) {
      return Array(totalMin).fill(1);
    }

    const base = 1;
    const remaining = totalMin - n * base;
    const allocations = [];
    const remainders = [];

    for (let i = 0; i < n; i++) {
      const raw = remaining * weights[i];
      const extra = Math.floor(raw);
      allocations.push(base + extra);
      remainders.push({ index: i, rem: raw - extra });
    }

    const allocatedSum = allocations.reduce((sum, v) => sum + v, 0);
    const diff = totalMin - allocatedSum;

    remainders.sort((a, b) => b.rem - a.rem);

    for (let i = 0; i < diff; i++) {
      const targetIdx = remainders[i % n].index;
      allocations[targetIdx] += 1;
    }

    return allocations;
  }

  /* ==========================================================================
     Pedagogical Phase Templates
     ========================================================================== */
  function getPhaseTemplates(totalMin, style) {
    if (totalMin <= 3) {
      return [
        {
          name: '⚡ Micro-Hook & Core Principle',
          weight: 0.6,
          purpose: 'Showcase the phenomenon or big idea with an instant punchy visual or demo.',
          teacherAction: 'Live-demonstrate or reveal the central puzzle on screen.',
          studentAction: 'Active observation; verbalize the core observation with a partner.',
          formativeCheck: 'Rapid thumbs-up/down or single cold-call summary.',
          prepTip: 'Have the key example already loaded on screen or board.',
        },
        {
          name: '🎯 Instant Mastery Check',
          weight: 0.4,
          purpose: 'Test retention and concept connection immediately.',
          teacherAction: 'Pose a single high-impact multiple-choice or short-answer question.',
          studentAction: 'Flash response on fingers or write one-sentence takeaway.',
          formativeCheck: '100% whole-class visual response audit.',
          prepTip: 'Prepare a single high-impact prompt.',
        },
      ];
    }

    if (totalMin <= 7) {
      return [
        {
          name: '🔥 Bellringer & Spark Hook',
          weight: 0.25,
          purpose: 'Hook attention immediately and frame the target skill.',
          teacherAction: 'Display provocative question or artifact; outline learning goal.',
          studentAction: 'Predict the outcome in pair-share (30 sec turn & talk).',
          formativeCheck: 'Cold-call 2 diverse student viewpoints.',
          prepTip: 'Write the objective on the board before class.',
        },
        {
          name: '💡 Modeling & Rapid Practice',
          weight: 0.5,
          purpose: 'Model the exact method step-by-step and guide parallel student practice.',
          teacherAction: 'Think aloud through one prime exemplar, highlighting common pitfalls.',
          studentAction: 'Solve identical parallel problem with shoulder partner.',
          formativeCheck: 'Scan table work during execution.',
          prepTip: 'Have pre-worked exemplar visible.',
        },
        {
          name: '🎟️ Exit Ticket & Wrap-Up',
          weight: 0.25,
          purpose: 'Capture individual accountability and summarize key insight.',
          teacherAction: 'Reframe key takeaway and collect index-card responses.',
          studentAction: 'Write answer to final exit question independently.',
          formativeCheck: 'Sort exit slips: Mastered, Close, Needs Help.',
          prepTip: 'Have exit question ready on board.',
        },
      ];
    }

    if (totalMin <= 20) {
      return [
        {
          name: '⚡ Hook & Retrieval Bellringer',
          weight: 0.2,
          purpose: 'Activate prior knowledge and hook relevance to real life.',
          teacherAction: 'Project curious starter puzzle or real-world dilemma.',
          studentAction: 'Jot 2-minute reaction in notebooks or mini-whiteboards.',
          formativeCheck: 'Sample 2 contrasting volunteer answers.',
          prepTip: 'Display prompt before students enter the room.',
        },
        {
          name: '🧠 Direct Instruction ("I Do")',
          weight: 0.35,
          purpose: 'Explicit teaching with structured visual scaffolding and think-alouds.',
          teacherAction: 'Teach core concept with crystal-clear steps and non-examples.',
          studentAction: 'Fill in structured skeletal notes or annotate diagram.',
          formativeCheck: 'Ask targeted conceptual check question.',
          prepTip: 'Keep lecture under 7 minutes to preserve high engagement.',
        },
        {
          name: '🤝 Guided Practice ("We Do")',
          weight: 0.3,
          purpose: 'Collaborative peer problem-solving with teacher coaching.',
          teacherAction: 'Circulate to provide scaffolding and spot-check accuracy.',
          studentAction: 'Work in pairs to solve assigned case or problem set.',
          formativeCheck: 'Use fist-to-five confidence scale or whiteboard reveals.',
          prepTip: 'Designate specific partner roles (Driver & Navigator).',
        },
        {
          name: '🎟️ Exit Ticket & Closure ("You Do")',
          weight: 0.15,
          purpose: 'Individual assessment of today’s learning objective.',
          teacherAction: 'Review the day’s target and collect exit tickets.',
          studentAction: 'Complete 2-question exit slip with zero peer assistance.',
          formativeCheck: 'Review ticket stack immediately after bell.',
          prepTip: 'Directly match exit question to stated objective.',
        },
      ];
    }

    if (totalMin <= 65) {
      const weights =
        style === 'interactive'
          ? [0.12, 0.25, 0.35, 0.18, 0.1]
          : style === 'direct'
          ? [0.1, 0.35, 0.25, 0.2, 0.1]
          : [0.12, 0.28, 0.28, 0.2, 0.12];

      return [
        {
          name: '⚡ Hook, Bellringer & Objective',
          weight: weights[0],
          purpose: 'Activate schema, set focus, and establish clear success criteria.',
          teacherAction: 'Display bellringer challenge, greet class, and unpack learning target.',
          studentAction: 'Begin bellringer challenge immediately; compare with table partner.',
          formativeCheck: 'Quick poll (fist-to-five) to assess prerequisite mastery.',
          prepTip: 'Project prompt with a visible 3-minute countdown timer.',
        },
        {
          name: '🧠 Direct Modeling & Think-Aloud ("I Do")',
          weight: weights[1],
          purpose: 'Teacher-led conceptual breakdown with explicit step-by-step modeling.',
          teacherAction: 'Conduct explicit instruction with think-alouds and deliberate error analysis.',
          studentAction: 'Take guided notes, highlight formulas/terms, and ask clarifying questions.',
          formativeCheck: 'Cold-call 2-3 students using equity sticks or random picker.',
          prepTip: 'Prepare 1 perfect exemplar and 1 common misconception example.',
        },
        {
          name: '🤝 Guided Practice & Collaboration ("We Do")',
          weight: weights[2],
          purpose: 'Support students in peer collaboration, discussions, and inquiry.',
          teacherAction: 'Facilitate discussions, prompt deeper reasoning, and intervene with struggling pairs.',
          studentAction: 'Collaborate with partner on multi-step problems and defend reasoning.',
          formativeCheck: 'Live whiteboard reveals; pause for whole-class correction if needed.',
          prepTip: 'Preset partner seating or number cards.',
        },
        {
          name: '🚀 Independent Application ("You Do")',
          weight: weights[3],
          purpose: 'Build autonomous mastery through individual execution.',
          teacherAction: 'Maintain quiet work environment; conduct targeted 1-on-1 conferring.',
          studentAction: 'Work silently and independently on tiered practice problems or analysis.',
          formativeCheck: 'Track student progress path around the room.',
          prepTip: 'Have spicy extension challenge ready for early finishers.',
        },
        {
          name: '🎟️ Reflection & Formative Exit Ticket',
          weight: weights[4],
          purpose: 'Consolidate takeaways, self-assess, and capture formative proof of learning.',
          teacherAction: 'Lead a 2-minute synthesis debrief and collect exit slips at the door.',
          studentAction: 'Complete exit slip: 1 key insight, 1 answered problem, 1 question.',
          formativeCheck: 'Analyze tickets to form tomorrow’s flexible small groups.',
          prepTip: 'Hand out physical slips 3 minutes before bell rings.',
        },
      ];
    }

    // Extended / Block Period (6 phases)
    return [
      {
        name: '⚡ Provocative Dilemma & Bellringer',
        weight: 0.1,
        purpose: 'Immerse students in the subject through a thought-provoking paradox or mystery.',
        teacherAction: 'Present case study or raw data; outline the inquiry arc of the block.',
        studentAction: 'Draft initial hypothesis and debate with a table partner.',
        formativeCheck: 'Sample 3 contrasting viewpoints before introducing content.',
        prepTip: 'Have guiding inquiry question written prominently on board.',
      },
      {
        name: '🧠 Conceptual Exploration & Deep Modeling',
        weight: 0.22,
        purpose: 'Deep dive into conceptual foundations with multi-modal demonstrations.',
        teacherAction: 'Deliver structured mini-lecture with interactive checks every 4 minutes.',
        studentAction: 'Complete analytical graphic organizer or double-entry notes.',
        formativeCheck: 'Have students summarize main point in exactly 6 words.',
        prepTip: 'Break lecture into two chunks with a 60-second processing pause.',
      },
      {
        name: '🔬 Collaborative Workshop / Lab Phase',
        weight: 0.28,
        purpose: 'Extensive hands-on lab investigation, group project, or collaborative artifact.',
        teacherAction: 'Coach teams, challenge advanced groups with stretch prompts, and scaffold.',
        studentAction: 'Execute experiment, build shared model, or analyze primary evidence in roles.',
        formativeCheck: 'Audit each team’s progress checklist and rubric.',
        prepTip: 'Pre-sort lab kits or digital templates into shared folders.',
      },
      {
        name: '🔄 Mid-Lesson Checkpoint & Peer Review',
        weight: 0.12,
        purpose: 'Immediate peer critique, misconception reset, and energy renewal.',
        teacherAction: 'Facilitate a structured gallery walk or peer feedback protocol.',
        studentAction: 'Provide one commendation and one actionable critique to a peer’s work.',
        formativeCheck: 'Check if student peer feedback is accurate and constructive.',
        prepTip: 'Use visible 4-minute timer for peer review rotations.',
      },
      {
        name: '🚀 Independent Synthesis & Problem Solving',
        weight: 0.18,
        purpose: 'Individual demonstration of deep analytical or technical mastery.',
        teacherAction: 'Confer 1-on-1 with targeted students needing differentiated support.',
        studentAction: 'Complete comprehensive synthesis problem or analytical essay independently.',
        formativeCheck: 'Spot-check rubric alignment against grade standards.',
        prepTip: 'Offer mild, medium, spicy difficulty tiers.',
      },
      {
        name: '🎟️ Debrief, Exit Ticket & Tomorrow Preview',
        weight: 0.1,
        purpose: 'Formal wrap-up, student self-assessment, and alignment with tomorrow’s class.',
        teacherAction: 'Guide whole-class metacognitive debrief and preview continuity for tomorrow.',
        studentAction: 'Submit formal exit ticket and complete self-rating rubric.',
        formativeCheck: 'Review ticket data to calibrate next lesson pace.',
        prepTip: 'Designate a drop-bin for finished tickets.',
      },
    ];
  }

  function getLevelAdjustments(level, topic) {
    const l = level.toLowerCase();
    if (l.includes('elementary')) {
      return {
        tone: 'Kinesthetic, playful, visual storytelling, and high warmth.',
        materials: 'Manipulatives, anchor charts, colored markers, picture cards.',
        diffTip: 'Pair visual learners with peer buddies; provide word banks and sentence frames.',
      };
    }
    if (l.includes('middle')) {
      return {
        tone: 'High energy, gamified, structured collaboration, and peer discourse.',
        materials: 'Graphic organizers, highlighters, mini-whiteboards, timer.',
        diffTip: 'Provide tiered challenge levels (Mild, Medium, Spicy); encourage think-pair-share.',
      };
    }
    if (l.includes('high')) {
      return {
        tone: 'Analytical, inquiry-focused, real-world relevance, and standards-aligned.',
        materials: 'Source texts, formula sheets, analytical rubrics, notebooks.',
        diffTip: 'Encourage cite-your-evidence discussions and open-ended synthesis.',
      };
    }
    if (l.includes('college') || l.includes('higher')) {
      return {
        tone: 'Academic seminar, theoretical evaluation, and self-directed synthesis.',
        materials: 'Case studies, academic readings, research decks, collaborative docs.',
        diffTip: 'Facilitate critical peer critique and evaluation of alternative hypotheses.',
      };
    }
    return {
      tone: 'Practical, applied, outcome-oriented, and immediately actionable.',
      materials: 'Workplace case templates, practice worksheets, quick reference guides.',
      diffTip: 'Connect every activity directly to immediate real-world workplace application.',
    };
  }

  function formatTimeOffset(m, totalMin) {
    const hrs = Math.floor(m / 60);
    const mins = m % 60;
    if (totalMin >= 60) {
      return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
    }
    return `${m < 10 ? '0' : ''}${m}:00`;
  }

  function generateLessonPlan(topic, classLevel, totalMin, lessonStyle, startTimeStr, reminderWarning) {
    const safeTopic = topic.trim() || 'General Concept & Inquiry';
    const templates = getPhaseTemplates(totalMin, lessonStyle);
    const weights = templates.map((t) => t.weight);
    const allocations = allocateExactMinutes(totalMin, weights);
    const levelInfo = getLevelAdjustments(classLevel, safeTopic);

    let runningOffset = 0;
    const baseSections = templates.slice(0, allocations.length).map((tpl, idx) => {
      const duration = allocations[idx];
      const startMin = runningOffset;
      const endMin = runningOffset + duration;
      runningOffset = endMin;

      return {
        number: idx + 1,
        name: tpl.name,
        durationMinutes: duration,
        timeRange: `${formatTimeOffset(startMin, totalMin)} – ${formatTimeOffset(endMin, totalMin)}`,
        startMin,
        endMin,
        color: PHASE_COLORS[idx % PHASE_COLORS.length],
        purpose: tpl.purpose.replace('the topic', `"${safeTopic}"`),
        teacherAction: `${tpl.teacherAction} Focus on "${safeTopic}" tailored for ${classLevel}.`,
        studentAction: `${tpl.studentAction}`,
        formativeCheck: tpl.formativeCheck,
        prepTip: tpl.prepTip,
        customNotes: '',
      };
    });

    const sumAllocated = baseSections.reduce((sum, s) => sum + s.durationMinutes, 0);
    const sectionsWithClock = computeBellSchedule(startTimeStr || '09:00', baseSections);

    return {
      id: 'plan_' + Date.now(),
      topic: safeTopic,
      classLevel,
      totalMinutes: totalMin,
      lessonStyle,
      startTime: startTimeStr || '09:00',
      reminderWarning: parseInt(reminderWarning, 10) || 2,
      generatedAt: new Date().toISOString(),
      sections: sectionsWithClock,
      sumAllocated,
      levelInfo,
    };
  }

  /* ==========================================================================
     Minute Rebalancer (+ / - 1 Minute)
     Allows teacher to adjust individual section times while preserving
     the EXACT total minute sum!
     ========================================================================== */
  function rebalanceSectionMinutes(targetSectionNumber, delta) {
    if (!activePlan || !activePlan.sections || activePlan.sections.length < 2) return;

    playTactilePop(delta > 0 ? 600 : 380);

    const targetIdx = targetSectionNumber - 1;
    const sections = activePlan.sections;
    const currentVal = sections[targetIdx].durationMinutes;

    if (delta > 0) {
      let donorIdx = -1;
      let maxMinutes = 1;
      for (let i = 0; i < sections.length; i++) {
        if (i !== targetIdx && sections[i].durationMinutes > maxMinutes) {
          maxMinutes = sections[i].durationMinutes;
          donorIdx = i;
        }
      }

      if (donorIdx === -1) {
        showToast('Cannot add time: other sections are at minimum 1 min.');
        return;
      }

      sections[targetIdx].durationMinutes += 1;
      sections[donorIdx].durationMinutes -= 1;
    } else if (delta < 0) {
      if (currentVal <= 1) {
        showToast('Section cannot be less than 1 minute.');
        return;
      }

      let recipientIdx = targetIdx === sections.length - 1 ? targetIdx - 1 : targetIdx + 1;
      sections[targetIdx].durationMinutes -= 1;
      sections[recipientIdx].durationMinutes += 1;
    }

    // Recompute offsets
    let offset = 0;
    sections.forEach((sec) => {
      sec.startMin = offset;
      sec.endMin = offset + sec.durationMinutes;
      sec.timeRange = `${formatTimeOffset(sec.startMin, activePlan.totalMinutes)} – ${formatTimeOffset(sec.endMin, activePlan.totalMinutes)}`;
      offset = sec.endMin;
    });

    activePlan.sumAllocated = sections.reduce((sum, s) => sum + s.durationMinutes, 0);

    // Recompute real clock schedule
    activePlan.sections = computeBellSchedule(activePlan.startTime || '09:00', sections);

    saveActivePlanToStorage();
    renderPlan(activePlan);
    showToast(`Rebalanced! Sum remains exact: ${activePlan.sumAllocated} min.`);
  }

  /* ==========================================================================
     UI Rendering
     ========================================================================== */
  function renderPlan(plan) {
    if (!plan || !plan.sections || plan.sections.length === 0) {
      planContainer.innerHTML = '';
      planContainer.classList.add('hidden');
      if (mobileActionBar) mobileActionBar.classList.add('hidden');
      if (liveReminderHud) liveReminderHud.classList.add('hidden');
      return;
    }

    activePlan = plan;

    // Timeline Chunks
    const timelineChunksHtml = plan.sections
      .map((sec) => {
        const percent = ((sec.durationMinutes / plan.totalMinutes) * 100).toFixed(1);
        return `
          <div 
            class="timeline-chunk" 
            style="width: ${percent}%; background-color: ${sec.color};"
            title="Phase ${sec.number}: ${sec.name} (${sec.durationMinutes} min, ${percent}%)"
          >
            ${sec.durationMinutes >= 3 ? `${sec.durationMinutes}m` : ''}
          </div>
        `;
      })
      .join('');

    const timelineChipsHtml = plan.sections
      .map((sec) => {
        return `
          <div class="timeline-chip-item">
            <span class="timeline-color-square" style="background-color: ${sec.color};"></span>
            <span><strong>P${sec.number}:</strong> ${sec.name} (${sec.durationMinutes}m)</span>
          </div>
        `;
      })
      .join('');

    // Bell Schedule Slots
    const bellScheduleSlotsHtml = plan.sections
      .map((sec) => {
        return `
          <div class="bell-slot-card" id="bell-slot-${sec.number}">
            <div class="slot-phase-name">
              <span>Phase ${sec.number}</span>
              <span class="slot-duration">${sec.durationMinutes}m</span>
            </div>
            <div class="slot-time-clock">${sec.clockRange}</div>
            <div style="font-size:0.75rem; color:var(--ink-secondary); margin-top:0.25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${escapeHtml(sec.name)}
            </div>
          </div>
        `;
      })
      .join('');

    // Section Bento Cards
    const sectionCardsHtml = plan.sections
      .map((sec) => {
        return `
          <article class="section-bento-card" id="section-card-${sec.number}">
            <div class="section-accent-spine" style="background-color: ${sec.color};"></div>

            <div class="section-head">
              <div class="section-head-left">
                <div class="section-avatar-badge" style="border-color: ${sec.color}; color: ${sec.color};">
                  P${sec.number}
                </div>
                <div>
                  <h3 class="section-title">${sec.name}</h3>
                  <div class="section-meta-row">
                    <!-- Interactive Minute Stepper -->
                    <div class="minute-stepper" title="Adjust minutes while keeping total exact">
                      <button type="button" class="stepper-btn dec-btn" data-section="${sec.number}" aria-label="Decrease 1 min">-</button>
                      <span class="stepper-value">${sec.durationMinutes} min</span>
                      <button type="button" class="stepper-btn inc-btn" data-section="${sec.number}" aria-label="Increase 1 min">+</button>
                    </div>
                    <span class="time-range-label">⏱️ ${sec.timeRange}</span>
                    <span class="clock-badge">🕒 ${sec.clockRange}</span>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                class="chunky-btn sm-btn outline-btn run-phase-timer-btn" 
                data-phase-index="${sec.number - 1}"
                title="Launch Live Timer for this section"
              >
                ⏱️ Teach Phase
              </button>
            </div>

            <div class="objective-banner">
              <strong>Objective:</strong> ${escapeHtml(sec.purpose)}
            </div>

            <!-- Two Role Bento Pods -->
            <div class="roles-bento-grid">
              <div class="role-bento-pod">
                <div class="role-pod-header">
                  <span>👩‍🏫</span> What You Do (Teacher)
                </div>
                <ul class="role-bullets">
                  <li>${escapeHtml(sec.teacherAction)}</li>
                  <li>Keep high pacing momentum to land on the ${sec.durationMinutes}-minute mark (${sec.clockEnd}).</li>
                </ul>
              </div>

              <div class="role-bento-pod">
                <div class="role-pod-header">
                  <span>🧑‍🎓</span> What Students Do
                </div>
                <ul class="role-bullets">
                  <li>${escapeHtml(sec.studentAction)}</li>
                  <li>Engage directly with partners or task material.</li>
                </ul>
              </div>
            </div>

            <!-- Formative Check & Pacing -->
            <div class="pedagogy-notes-box">
              <div class="pedagogy-row">
                <span class="pedagogy-label">🎯 Formative Check:</span>
                <span class="pedagogy-val">${escapeHtml(sec.formativeCheck)}</span>
              </div>
              <div class="pedagogy-row">
                <span class="pedagogy-label">💡 Teacher Pacing Tip:</span>
                <span class="pedagogy-val">${escapeHtml(sec.prepTip)}</span>
              </div>
            </div>

            <!-- Custom Notes Pod -->
            <div class="custom-notes-pod">
              <span class="custom-notes-title">✏️ Your Custom Notes / Textbook Pages:</span>
              <div 
                class="custom-notes-field" 
                contenteditable="true" 
                data-section="${sec.number}" 
                placeholder="Click to type textbook page, lab equipment, or whiteboard prompts..."
              >${escapeHtml(sec.customNotes || '')}</div>
            </div>

            <div class="section-foot">
              <label class="check-done-label">
                <input type="checkbox" class="mark-done-check" data-section="${sec.number}">
                <span>Mark phase completed during class</span>
              </label>
            </div>
          </article>
        `;
      })
      .join('');

    // Exact verification display check
    const isSumExact = plan.sumAllocated === plan.totalMinutes;
    const verificationBadgeHtml = isSumExact
      ? `
        <div class="math-audit-pill">
          <div class="math-audit-left">
            <span class="audit-check-icon">✓</span>
            <span>Mathematical Time Audit: All ${plan.sections.length} phases sum up exactly to the total duration.</span>
          </div>
          <div class="math-equation-pill">
            ${plan.sections.map((s) => `${s.durationMinutes}m`).join(' + ')} = ${plan.totalMinutes} min
          </div>
        </div>
      `
      : '';

    const firstSlot = plan.sections[0];
    const lastSlot = plan.sections[plan.sections.length - 1];

    // Assemble Full Plan View
    planContainer.innerHTML = `
      <!-- Plan Hero Dashboard Card -->
      <div class="plan-hero-card">
        <div class="plan-hero-top">
          <div>
            <div class="plan-hero-badges">
              <span class="sticker sticker-purple">${escapeHtml(plan.classLevel)}</span>
              <span class="sticker sticker-yellow">⏱️ ${plan.totalMinutes} MINS TOTAL</span>
              <span class="sticker sticker-lime">🔔 ${firstSlot.clockStart} – ${lastSlot.clockEnd}</span>
              <span class="sticker sticker-cyan">${escapeHtml(plan.lessonStyle.toUpperCase())}</span>
            </div>
            <h2 id="plan-heading" class="plan-heading-title">${escapeHtml(plan.topic)}</h2>
            <p class="plan-heading-meta">
              Tailored for ${escapeHtml(plan.classLevel)} &bull; ${plan.sections.length} Pedagogical Phases &bull; Vibe: ${escapeHtml(plan.levelInfo.tone)}
            </p>
          </div>
        </div>

        ${verificationBadgeHtml}

        <!-- Timeline Pacing Track -->
        <div class="timeline-deck" aria-label="Visual lesson pacing timeline">
          <div class="timeline-legend-top">
            <span>Class Start (${firstSlot.clockStart})</span>
            <span>Visual Pacing (${plan.totalMinutes} min)</span>
            <span>Class Dismissal (${lastSlot.clockEnd})</span>
          </div>
          <div class="timeline-chunky-track" role="img" aria-label="Pacing breakdown">
            ${timelineChunksHtml}
          </div>
          <div class="timeline-chips-row">
            ${timelineChipsHtml}
          </div>
        </div>

        <!-- Plan Actions Toolbar -->
        <div class="plan-toolbar">
          <button type="button" id="open-full-timer-btn" class="chunky-btn primary-btn glow-btn sm-btn">
            ⏱️ Presenter Timer
          </button>
          <button type="button" id="save-to-library-btn" class="chunky-btn outline-btn sm-btn">
            📁 Save to My Stash
          </button>
          <button type="button" id="copy-plan-btn" class="chunky-btn outline-btn sm-btn">
            📋 Copy Plan
          </button>
          <button type="button" id="print-plan-btn" class="chunky-btn outline-btn sm-btn">
            🖨️ Print / PDF
          </button>
          <button type="button" id="share-plan-btn" class="chunky-btn outline-btn sm-btn">
            🔗 Share Plan
          </button>
          <button type="button" id="save-txt-btn" class="chunky-btn outline-btn sm-btn">
            💾 Export TXT
          </button>
        </div>
      </div>

      <!-- Dedicated Time Section with Bell Schedule & Notification Reminders -->
      <section class="bell-schedule-bento" aria-labelledby="bell-schedule-title">
        <div class="bell-head-row">
          <div class="bell-title-wrap">
            <h3 id="bell-schedule-title">
              <span>🕒</span> Real-Time Bell Schedule & Notification Reminders
            </h3>
            <p>Mapped to your actual classroom clock from <strong>${firstSlot.clockStart}</strong> to <strong>${lastSlot.clockEnd}</strong>.</p>
          </div>
          <button type="button" id="toggle-bell-tracking-btn" class="chunky-btn sm-btn ${isBellTrackingActive ? 'danger-btn' : 'primary-btn'}">
            ${isBellTrackingActive ? '⏹️ Stop Tracking Reminders' : '▶️ Start Live Bell Tracking'}
          </button>
        </div>

        <div class="bell-grid-schedule">
          ${bellScheduleSlotsHtml}
        </div>

        <div class="bell-reminder-controls">
          <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.8125rem; font-weight:700;">
            <span>⚠️ Advance Reminder:</span>
            <span class="meta-tag highlight-tag">${plan.reminderWarning > 0 ? `${plan.reminderWarning}-minute warning before each phase ends` : 'End-of-phase only'}</span>
          </div>
          <div style="font-size:0.8125rem; color:var(--ink-secondary); font-weight:600;">
            ${'Notification' in window && Notification.permission === 'granted' ? '🔔 Browser alerts active' : '💡 Tip: Click "Enable Browser Notifications" above for desktop alerts'}
          </div>
        </div>
      </section>

      <!-- Rapid 10-Minute Teacher Prep Checklist Card -->
      <aside class="rapid-checklist-card">
        <h3 class="checklist-head-title">⚡ Teacher's 10-Minute Rapid Prep Checklist</h3>
        <p class="checklist-head-sub">Spend your remaining prep minutes on high-impact setup before the bell rings:</p>
        <ul class="checklist-stack">
          <li class="checklist-item">
            <input type="checkbox" id="prep-item-1">
            <label for="prep-item-1">Write topic (<strong>${escapeHtml(plan.topic)}</strong>) and objective on the whiteboard.</label>
          </li>
          <li class="checklist-item">
            <input type="checkbox" id="prep-item-2">
            <label for="prep-item-2">Load up Phase 1 starter prompt so students start right at ${firstSlot.clockStart}.</label>
          </li>
          <li class="checklist-item">
            <input type="checkbox" id="prep-item-3">
            <label for="prep-item-3">Gather materials: ${escapeHtml(plan.levelInfo.materials)}</label>
          </li>
          <li class="checklist-item">
            <input type="checkbox" id="prep-item-4">
            <label for="prep-item-4">Prep exit slips ready for ${lastSlot.clockStart} (final ${lastSlot.durationMinutes} min).</label>
          </li>
        </ul>
      </aside>

      <!-- Section Bento Flow -->
      <div class="sections-bento-flow" aria-label="Lesson sections">
        ${sectionCardsHtml}
      </div>
    `;

    planContainer.classList.remove('hidden');
    if (mobileActionBar) mobileActionBar.classList.remove('hidden');

    attachPlanInteractions(plan);
  }

  /* ==========================================================================
     Plan Interactions (Steppers, Checkboxes, Notes, Copy, Print)
     ========================================================================== */
  function attachPlanInteractions(plan) {
    // Stepper buttons
    planContainer.querySelectorAll('.inc-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const secNum = parseInt(e.currentTarget.getAttribute('data-section'), 10);
        rebalanceSectionMinutes(secNum, 1);
      });
    });

    planContainer.querySelectorAll('.dec-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const secNum = parseInt(e.currentTarget.getAttribute('data-section'), 10);
        rebalanceSectionMinutes(secNum, -1);
      });
    });

    // Custom notes auto-saving
    planContainer.querySelectorAll('.custom-notes-field').forEach((field) => {
      field.addEventListener('input', (e) => {
        const secNum = parseInt(e.target.getAttribute('data-section'), 10);
        if (activePlan && activePlan.sections[secNum - 1]) {
          activePlan.sections[secNum - 1].customNotes = e.target.innerText;
          saveActivePlanToStorage();
        }
      });
    });

    // Checkboxes
    planContainer.querySelectorAll('.mark-done-check').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        playTactilePop(e.target.checked ? 750 : 350);
        const secNum = e.target.getAttribute('data-section');
        const card = document.getElementById(`section-card-${secNum}`);
        if (card) card.classList.toggle('completed', e.target.checked);
      });
    });

    // Bell tracking toggle button
    const toggleBellTrackingBtn = document.getElementById('toggle-bell-tracking-btn');
    if (toggleBellTrackingBtn) {
      toggleBellTrackingBtn.addEventListener('click', () => {
        toggleBellTracking();
      });
    }

    // Copy Plan
    const copyBtn = document.getElementById('copy-plan-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        playTactilePop(520);
        copyPlanToClipboard(plan);
      });
    }

    // Print
    const printBtn = document.getElementById('print-plan-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        playTactilePop(520);
        window.print();
      });
    }

    // Share link
    const shareBtn = document.getElementById('share-plan-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        playTactilePop(520);
        openShareModal();
      });
    }

    // Save to Library
    const saveLibBtn = document.getElementById('save-to-library-btn');
    if (saveLibBtn) {
      saveLibBtn.addEventListener('click', () => {
        playTactilePop(650);
        savePlanToStash(plan);
      });
    }

    // Export TXT
    const exportBtn = document.getElementById('save-txt-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        playTactilePop(520);
        downloadPlanText(plan);
      });
    }

    // Full Timer trigger
    const fullTimerBtn = document.getElementById('open-full-timer-btn');
    if (fullTimerBtn) {
      fullTimerBtn.addEventListener('click', () => {
        playTactilePop(600);
        openTimerModal(0);
      });
    }

    // Individual phase timer buttons
    planContainer.querySelectorAll('.run-phase-timer-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        playTactilePop(600);
        const phaseIdx = parseInt(e.currentTarget.getAttribute('data-phase-index'), 10);
        openTimerModal(phaseIdx);
      });
    });
  }

  /* ==========================================================================
     Active Real-Time Bell Tracking & Reminders
     ========================================================================== */
  function toggleBellTracking() {
    if (isBellTrackingActive) {
      stopBellTracking();
    } else {
      startBellTracking();
    }
  }

  function startBellTracking() {
    if (!activePlan || !activePlan.sections) return;

    // Check if the scheduled bell schedule is already in the past!
    const now = new Date();
    const nowMs = now.getTime();
    const lastSec = activePlan.sections[activePlan.sections.length - 1];

    if (lastSec && lastSec.endTimeMs <= nowMs) {
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      activePlan.startTime = `${hrs}:${mins}`;
      if (startTimeInput) startTimeInput.value = `${hrs}:${mins}`;
      activePlan.sections = computeBellSchedule(activePlan.startTime, activePlan.sections);
      saveActivePlanToStorage();
      renderPlan(activePlan);
      showToast(`Schedule re-anchored to current time (${hrs}:${mins})!`);
    }

    isBellTrackingActive = true;
    lastTriggeredReminderPhase = -1;

    playTactilePop(700);
    showToast('Real-time bell tracking started! Reminders active.');

    const btn = document.getElementById('toggle-bell-tracking-btn');
    if (btn) {
      btn.textContent = '⏹️ Stop Tracking Reminders';
      btn.classList.remove('primary-btn');
      btn.classList.add('danger-btn');
    }

    if (liveReminderHud) {
      liveReminderHud.classList.remove('hidden');
    }

    // Run tick immediately then every second
    checkBellScheduleTick();
    if (bellTrackingInterval) clearInterval(bellTrackingInterval);
    bellTrackingInterval = setInterval(checkBellScheduleTick, 1000);
  }

  function stopBellTracking() {
    isBellTrackingActive = false;
    if (bellTrackingInterval) {
      clearInterval(bellTrackingInterval);
      bellTrackingInterval = null;
    }

    const btn = document.getElementById('toggle-bell-tracking-btn');
    if (btn) {
      btn.textContent = '▶️ Start Live Bell Tracking';
      btn.classList.remove('danger-btn');
      btn.classList.add('primary-btn');
    }

    // Clear active highlights
    document.querySelectorAll('.bell-slot-card').forEach((el) => el.classList.remove('active-slot'));

    if (liveReminderHud) {
      liveReminderHud.classList.add('hidden');
    }

    showToast('Bell tracking stopped.');
  }

  function checkBellScheduleTick() {
    if (!activePlan || !activePlan.sections || !isBellTrackingActive) return;

    const now = new Date();
    const nowMs = now.getTime();
    const sections = activePlan.sections;
    const warningMin = activePlan.reminderWarning || 2;
    const warningMs = warningMin * 60 * 1000;

    let activeIndex = -1;

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const slotEl = document.getElementById(`bell-slot-${sec.number}`);

      if (nowMs >= sec.startTimeMs && nowMs < sec.endTimeMs) {
        activeIndex = i;
        if (slotEl) slotEl.classList.add('active-slot');

        const remainingMs = sec.endTimeMs - nowMs;
        const remSecs = Math.floor(remainingMs / 1000);
        const remMins = Math.floor(remSecs / 60);
        const remSecsMod = remSecs % 60;
        const timeStr = `${remMins}:${remSecsMod < 10 ? '0' : ''}${remSecsMod}`;

        if (hudStatusText) {
          hudStatusText.textContent = `Active: Phase ${sec.number} (${sec.name}) • ${timeStr} left`;
        }

        // Check if pre-end warning reminder should fire
        if (warningMin > 0 && remainingMs <= warningMs && lastTriggeredReminderPhase !== sec.number) {
          lastTriggeredReminderPhase = sec.number;
          triggerTransitionReminder(
            sec.number,
            sec.name,
            `⚠️ ${warningMin}-Min Warning: Phase ${sec.number} (${sec.name}) ending soon at ${sec.clockEnd}!`,
            true
          );
        }
      } else {
        if (slotEl) slotEl.classList.remove('active-slot');
      }
    }

    // If past all sections
    const lastSec = sections[sections.length - 1];
    if (nowMs >= lastSec.endTimeMs && activeIndex === -1) {
      if (hudStatusText) {
        hudStatusText.textContent = `Class Dismissed at ${lastSec.clockEnd}!`;
      }
      stopBellTracking();
      triggerTransitionReminder(sections.length, 'Lesson Complete', `🎉 Class dismissed at ${lastSec.clockEnd}! Great job.`);
    }
  }

  /* ==========================================================================
     My Stash (Saved Plans Drawer & Local Storage)
     ========================================================================== */
  function getStash() {
    try {
      const raw = localStorage.getItem(STASH_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveStash(plans) {
    try {
      localStorage.setItem(STASH_KEY, JSON.stringify(plans));
      updateStashBadge();
    } catch (e) {
      console.warn('Could not save stash:', e);
    }
  }

  function updateStashBadge() {
    const plans = getStash();
    if (savedPlansBadge) {
      savedPlansBadge.textContent = plans.length;
    }
  }

  function savePlanToStash(plan) {
    if (!plan) return;
    const plans = getStash();
    const existingIdx = plans.findIndex((p) => p.topic === plan.topic && p.totalMinutes === plan.totalMinutes);

    if (existingIdx >= 0) {
      plans[existingIdx] = plan;
      showToast('Plan updated in your Stash!');
    } else {
      plans.unshift(plan);
      showToast('Plan saved to your Stash!');
    }

    saveStash(plans);
    renderStashList();
  }

  function renderStashList() {
    if (!savedPlansList) return;
    const plans = getStash();

    if (plans.length === 0) {
      savedPlansList.innerHTML = `
        <div class="empty-stash-card">
          <p style="font-size: 2rem; margin-bottom: 0.5rem;">🎒</p>
          <p>Your stash is empty!</p>
          <p style="font-size: 0.8125rem; margin-top: 0.35rem; color: var(--ink-muted);">Click "Save to My Stash" on any generated lesson plan to keep it here.</p>
        </div>
      `;
      return;
    }

    savedPlansList.innerHTML = plans
      .map((p, idx) => {
        const dateStr = p.generatedAt ? new Date(p.generatedAt).toLocaleDateString() : 'Recent';
        return `
          <div class="stash-item">
            <div>
              <h4>${escapeHtml(p.topic)}</h4>
              <p>${escapeHtml(p.classLevel)} &bull; ${p.totalMinutes} min &bull; ${dateStr}</p>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button type="button" class="chunky-btn primary-btn sm-btn load-stash-btn" data-index="${idx}">Load</button>
              <button type="button" class="chunky-btn outline-btn sm-btn delete-stash-btn" data-index="${idx}" title="Delete">&times;</button>
            </div>
          </div>
        `;
      })
      .join('');

    savedPlansList.querySelectorAll('.load-stash-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        playTactilePop(650);
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const plan = getStash()[idx];
        if (plan) {
          topicInput.value = plan.topic;
          classLevelSelect.value = plan.classLevel;
          minutesInput.value = plan.totalMinutes;
          styleSelect.value = plan.lessonStyle;
          if (startTimeInput && plan.startTime) startTimeInput.value = plan.startTime;
          if (reminderWarningSelect && plan.reminderWarning !== undefined) reminderWarningSelect.value = plan.reminderWarning;
          renderPlan(plan);
          saveActivePlanToStorage();
          savedPlansModal.classList.add('hidden');
          showToast(`Loaded "${plan.topic}"!`);
        }
      });
    });

    savedPlansList.querySelectorAll('.delete-stash-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        playTactilePop(350);
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const currentPlans = getStash();
        currentPlans.splice(idx, 1);
        saveStash(currentPlans);
        renderStashList();
        showToast('Plan removed from stash.');
      });
    });
  }

  /* ==========================================================================
     Share Modal
     ========================================================================== */
  function openShareModal() {
    if (!activePlan) return;
    const url = new URL(window.location.href);
    url.searchParams.set('topic', activePlan.topic);
    url.searchParams.set('level', activePlan.classLevel);
    url.searchParams.set('min', activePlan.totalMinutes);
    url.searchParams.set('style', activePlan.lessonStyle);
    url.searchParams.set('start', activePlan.startTime || '09:00');

    if (shareUrlInput) shareUrlInput.value = url.toString();
    if (shareModal) shareModal.classList.remove('hidden');
  }

  function closeShareModal() {
    if (shareModal) shareModal.classList.add('hidden');
  }

  function checkUrlParamsForPlan() {
    try {
      const url = new URL(window.location.href);
      const topic = url.searchParams.get('topic');
      const level = url.searchParams.get('level');
      const min = url.searchParams.get('min');
      const style = url.searchParams.get('style');
      const start = url.searchParams.get('start');

      if (topic && min && Number(min) > 0) {
        topicInput.value = topic;
        if (level) classLevelSelect.value = level;
        minutesInput.value = min;
        if (style) styleSelect.value = style;
        if (start && startTimeInput) startTimeInput.value = start;

        const newPlan = generateLessonPlan(
          topic,
          level || classLevelSelect.value,
          Number(min),
          style || 'balanced',
          start || '09:00',
          2
        );
        renderPlan(newPlan);
        saveActivePlanToStorage();
        showToast('Shared plan loaded from link!');
        return true;
      }
    } catch (e) {
      // Ignore URL parse errors
    }
    return false;
  }

  /* ==========================================================================
     Copy & Export Utilities
     ========================================================================== */
  function formatPlanAsPlainText(plan) {
    const firstSlot = plan.sections[0];
    const lastSlot = plan.sections[plan.sections.length - 1];

    let out = `LESSON PLAN: ${plan.topic.toUpperCase()}\n`;
    out += `Class Level: ${plan.classLevel}\n`;
    out += `Total Duration: ${plan.totalMinutes} Minutes (${firstSlot.clockStart} – ${lastSlot.clockEnd})\n`;
    out += `Pedagogical Style: ${plan.lessonStyle}\n`;
    out += `Time Verification: ${plan.sections.map((s) => `${s.durationMinutes}m`).join(' + ')} = ${plan.totalMinutes} min (Exact Match)\n`;
    out += `===================================================\n\n`;

    plan.sections.forEach((s) => {
      out += `PHASE ${s.number}: ${s.name} [${s.durationMinutes} min | ${s.clockRange}]\n`;
      out += `• Objective: ${s.purpose}\n`;
      out += `• Teacher Role: ${s.teacherAction}\n`;
      out += `• Student Task: ${s.studentAction}\n`;
      out += `• Formative Check: ${s.formativeCheck}\n`;
      out += `• Prep / Pacing: ${s.prepTip}\n`;
      if (s.customNotes) {
        out += `• Your Custom Notes: ${s.customNotes}\n`;
      }
      out += `\n`;
    });

    out += `RAPID PREP CHECKLIST:\n`;
    out += `• Target Materials: ${plan.levelInfo.materials}\n`;
    out += `• Differentiation Tip: ${plan.levelInfo.diffTip}\n`;

    return out;
  }

  function copyPlanToClipboard(plan) {
    const text = formatPlanAsPlainText(plan);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast('Lesson plan copied to clipboard!'))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Lesson plan copied to clipboard!');
    } catch (err) {
      showToast('Could not auto-copy. Please use Print / Export.');
    }
    document.body.removeChild(textArea);
  }

  function downloadPlanText(plan) {
    const text = formatPlanAsPlainText(plan);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lesson-Plan-${plan.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Lesson plan downloaded as text file.');
  }

  let toastTimeout = null;
  function showToast(message) {
    if (!toast) return;
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toast.textContent = message;
    toast.classList.remove('hidden');
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
      toastTimeout = null;
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ==========================================================================
     In-Class Live Countdown Timer
     ========================================================================== */
  function openTimerModal(phaseIndex) {
    if (!activePlan || !activePlan.sections) return;
    currentPhaseIndex = Math.max(0, Math.min(phaseIndex, activePlan.sections.length - 1));
    loadPhaseInTimer(currentPhaseIndex);
    timerModal.classList.remove('hidden');
  }

  function closeTimerModal() {
    pauseTimer();
    timerModal.classList.add('hidden');
  }

  function loadPhaseInTimer(index) {
    pauseTimer();
    currentPhaseIndex = index;
    const phase = activePlan.sections[currentPhaseIndex];
    totalPhaseSeconds = phase.durationMinutes * 60;
    remainingSeconds = totalPhaseSeconds;

    timerSectionName.textContent = `Phase ${phase.number} of ${activePlan.sections.length}: ${phase.name}`;
    timerSectionName.style.backgroundColor = phase.color;

    if (timerWarningAlert) {
      timerWarningAlert.classList.add('hidden');
    }

    timerGuideBox.innerHTML = `
      <strong>Phase Objective:</strong> ${escapeHtml(phase.purpose)}<br>
      <span style="display:inline-block; margin-top:0.4rem;">
        <strong>Teacher Move:</strong> ${escapeHtml(phase.teacherAction)}
      </span>
      <span style="display:block; margin-top:0.4rem; font-size:0.8125rem; color:var(--ink-muted);">
        🕒 Bell Schedule Target: ${phase.clockRange}
      </span>
      ${phase.customNotes ? `<br><span style="display:inline-block; margin-top:0.4rem; color: #18181b; background:#fef08a; padding:0.2rem 0.4rem; border-radius:4px; font-weight:800;"><strong>Your Notes:</strong> ${escapeHtml(phase.customNotes)}</span>` : ''}
    `;

    updateTimerDisplay();

    timerPrevBtn.disabled = currentPhaseIndex === 0;
    timerNextBtn.disabled = currentPhaseIndex === activePlan.sections.length - 1;
    timerToggleBtn.textContent = 'Start Timer (Space)';
  }

  function updateTimerDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerDisplay.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const percent = totalPhaseSeconds > 0 ? ((totalPhaseSeconds - remainingSeconds) / totalPhaseSeconds) * 100 : 0;
    timerProgressBar.style.width = `${percent}%`;
    timerProgressBar.style.backgroundColor = activePlan.sections[currentPhaseIndex].color;
  }

  function toggleTimer() {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    if (remainingSeconds <= 0) {
      remainingSeconds = totalPhaseSeconds;
    }
    isTimerRunning = true;
    timerToggleBtn.textContent = 'Pause Timer (Space)';
    playTactilePop(580);

    const warningThreshold = (activePlan ? activePlan.reminderWarning || 2 : 2) * 60;

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();

      // Check for countdown warning reminder
      if (warningThreshold > 0 && remainingSeconds === warningThreshold) {
        playWarningAlertSound();
        if (timerWarningAlert) {
          timerWarningAlert.textContent = `⚠️ ${Math.floor(warningThreshold / 60)}-Minute Warning: Wrap up discussion & transition!`;
          timerWarningAlert.classList.remove('hidden');
        }
        sendPushNotification(
          '⚠️ Timer Reminder',
          `${Math.floor(warningThreshold / 60)} minutes left in Phase ${currentPhaseIndex + 1}: ${activePlan.sections[currentPhaseIndex].name}`
        );
      }

      if (remainingSeconds <= 0) {
        pauseTimer();
        playSuccessChime();
        showToast(`Phase ${currentPhaseIndex + 1} completed!`);
        triggerTransitionReminder(
          currentPhaseIndex + 1,
          activePlan.sections[currentPhaseIndex].name,
          `Phase ${currentPhaseIndex + 1} Finished! Move to next phase.`
        );

        if (currentPhaseIndex < activePlan.sections.length - 1) {
          setTimeout(() => {
            loadPhaseInTimer(currentPhaseIndex + 1);
          }, 1200);
        }
      }
    }, 1000);
  }

  function pauseTimer() {
    isTimerRunning = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerToggleBtn.textContent = 'Start Timer (Space)';
  }

  /* ==========================================================================
     Validation & Plan Submission
     Requirement 4: Show a message, and NO plan, if minutes are empty, zero, or negative.
     Requirement 5: Still show the plan after the page is reloaded.
     ========================================================================== */
  function showErrorMessage(title, message) {
    messageTitle.textContent = title;
    messageText.textContent = message;
    messageBanner.classList.remove('hidden');

    // Requirement 4: MUST NOT show plan
    planContainer.innerHTML = '';
    planContainer.classList.add('hidden');
    if (mobileActionBar) mobileActionBar.classList.add('hidden');
    if (liveReminderHud) liveReminderHud.classList.add('hidden');
    stopBellTracking();
    activePlan = null;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  function hideErrorMessage() {
    messageBanner.classList.add('hidden');
  }

  function saveActivePlanToStorage() {
    if (!activePlan) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activePlan));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }

  function handleFormSubmit(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    hideErrorMessage();

    const rawMinutes = minutesInput.value.trim();
    const topic = topicInput.value.trim();
    const classLevel = classLevelSelect.value;
    const lessonStyle = styleSelect.value;
    const startTimeStr = startTimeInput ? startTimeInput.value.trim() : '09:00';
    const reminderWarning = reminderWarningSelect ? reminderWarningSelect.value : 2;

    // Validation: Empty check (Requirement 4)
    if (rawMinutes === '') {
      showErrorMessage(
        'Duration Required',
        'Please enter a class duration. A lesson plan cannot be generated without specifying the total minutes.'
      );
      minutesInput.focus();
      return false;
    }

    const minutesNum = Number(rawMinutes);

    // Validation: NaN check (Requirement 4)
    if (isNaN(minutesNum)) {
      showErrorMessage(
        'Invalid Duration Format',
        'Please enter a valid numeric value for total minutes.'
      );
      minutesInput.focus();
      return false;
    }

    // Validation: Zero or Negative check (Requirement 4)
    if (minutesNum <= 0) {
      showErrorMessage(
        'Invalid Duration Value',
        'The total minutes must be greater than zero. A lesson plan cannot be generated for empty, zero, or negative time.'
      );
      minutesInput.focus();
      return false;
    }

    const validMinutes = Math.round(minutesNum);
    if (validMinutes <= 0) {
      showErrorMessage(
        'Invalid Duration Value',
        'The total minutes must be at least 1 full minute. A lesson plan cannot be generated for empty, zero, or negative time.'
      );
      minutesInput.focus();
      return false;
    }

    const effectiveTopic = topic || 'General Topic & Concept Exploration';

    playSuccessChime();

    // Generate & Render Plan
    const newPlan = generateLessonPlan(
      effectiveTopic,
      classLevel,
      validMinutes,
      lessonStyle,
      startTimeStr,
      reminderWarning
    );
    renderPlan(newPlan);

    // Requirement 5: Save to localStorage for reload persistence
    saveActivePlanToStorage();

    planContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  function handleReset() {
    form.reset();
    hideErrorMessage();
    planContainer.innerHTML = '';
    planContainer.classList.add('hidden');
    if (mobileActionBar) mobileActionBar.classList.add('hidden');
    if (liveReminderHud) liveReminderHud.classList.add('hidden');
    stopBellTracking();
    activePlan = null;

    document.querySelectorAll('.min-preset-btn').forEach((b) => b.classList.remove('active'));
    const default45 = document.querySelector('.min-preset-btn[data-min="45"]');
    if (default45) default45.classList.add('active');

    if (startTimeInput) startTimeInput.value = '09:00';
    if (reminderWarningSelect) reminderWarningSelect.value = '2';

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }

    updateCharCount();
    topicInput.focus();
    playTactilePop(400);
    showToast('Planner reset.');
  }

  function renderTopicChips(category) {
    if (!topicChipsContainer) return;
    const presets = TOPIC_PRESETS[category] || TOPIC_PRESETS.all;

    topicChipsContainer.innerHTML = presets
      .map(
        (p) =>
          `<button type="button" class="topic-chip" data-topic="${escapeHtml(p.name)}" data-level="${escapeHtml(p.level)}" data-min="${p.min}">${escapeHtml(p.name)}</button>`
      )
      .join('');

    topicChipsContainer.querySelectorAll('.topic-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        playTactilePop(550);
        topicInput.value = chip.getAttribute('data-topic');
        const level = chip.getAttribute('data-level');
        const min = chip.getAttribute('data-min');

        if (level) classLevelSelect.value = level;
        if (min) {
          minutesInput.value = min;
          syncMinutePresets(min);
        }

        updateCharCount();
        topicInput.focus();
        hideErrorMessage();
      });
    });
  }

  function syncMinutePresets(minVal) {
    const presetBtns = document.querySelectorAll('.min-preset-btn');
    presetBtns.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-min') == minVal);
    });
    updateDurationHelper(minVal);
  }

  function updateDurationHelper(min) {
    if (!durationHelperText) return;
    const num = Number(min);
    if (!min || isNaN(num) || num <= 0) {
      durationHelperText.textContent = 'Enter duration';
      return;
    }
    if (num <= 10) {
      durationHelperText.textContent = 'Micro-Sprint';
    } else if (num <= 30) {
      durationHelperText.textContent = 'Mini-Lesson';
    } else if (num <= 55) {
      durationHelperText.textContent = 'Standard Period';
    } else if (num <= 75) {
      durationHelperText.textContent = 'Full Hour';
    } else {
      durationHelperText.textContent = 'Block Workshop';
    }
  }

  function updateCharCount() {
    const val = topicInput.value.trim();
    if (clearTopicBtn) {
      clearTopicBtn.classList.toggle('hidden', val.length === 0);
    }
    if (topicCharCount) {
      topicCharCount.textContent = val.length > 0 ? `${val.length} chars` : 'Required';
    }
  }

  /* ==========================================================================
     Initialization & Persistence Restoration (Requirement 5)
     ========================================================================== */
  function init() {
    initTheme();
    initNotificationStatus();
    updateStashBadge();

    form.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', handleReset);

    // Current time helper button
    if (setNowTimeBtn && startTimeInput) {
      setNowTimeBtn.addEventListener('click', () => {
        playTactilePop(550);
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        startTimeInput.value = `${hrs}:${mins}`;
        showToast(`Start time set to ${hrs}:${mins}!`);
        if (activePlan) {
          activePlan.startTime = `${hrs}:${mins}`;
          activePlan.sections = computeBellSchedule(activePlan.startTime, activePlan.sections);
          saveActivePlanToStorage();
          renderPlan(activePlan);
        }
      });
    }

    // If start time input changes while plan is rendered, update schedule immediately
    if (startTimeInput) {
      const syncStartTimeToPlan = () => {
        if (activePlan) {
          activePlan.startTime = startTimeInput.value;
          activePlan.sections = computeBellSchedule(activePlan.startTime, activePlan.sections);
          saveActivePlanToStorage();
          renderPlan(activePlan);
        }
      };
      startTimeInput.addEventListener('change', syncStartTimeToPlan);
      startTimeInput.addEventListener('input', syncStartTimeToPlan);
    }

    // Topic clear button
    if (clearTopicBtn) {
      clearTopicBtn.addEventListener('click', () => {
        topicInput.value = '';
        updateCharCount();
        topicInput.focus();
        playTactilePop(300);
      });
    }

    topicInput.addEventListener('input', updateCharCount);

    if (dismissMessageBtn) {
      dismissMessageBtn.addEventListener('click', hideErrorMessage);
    }

    // Subject Filter Tabs
    subjectPills.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        playTactilePop(500);
        subjectPills.forEach((t) => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const subject = e.currentTarget.getAttribute('data-subject');
        renderTopicChips(subject);
      });
    });

    renderTopicChips('all');

    // Minute preset buttons
    const presetBtns = document.querySelectorAll('.min-preset-btn');
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        playTactilePop(520);
        const val = btn.getAttribute('data-min');
        minutesInput.value = val;
        syncMinutePresets(val);
        hideErrorMessage();
      });
    });

    minutesInput.addEventListener('input', () => {
      const val = minutesInput.value.trim();
      syncMinutePresets(val);
      if (!messageBanner.classList.contains('hidden')) {
        const num = Number(val);
        if (!isNaN(num) && num > 0) {
          hideErrorMessage();
        }
      }
    });

    // Stash Drawer controls
    if (savedPlansBtn && savedPlansModal) {
      savedPlansBtn.addEventListener('click', () => {
        playTactilePop(500);
        renderStashList();
        savedPlansModal.classList.remove('hidden');
      });
      if (closeSavedModalBtn) closeSavedModalBtn.addEventListener('click', () => savedPlansModal.classList.add('hidden'));
      if (doneSavedModalBtn) doneSavedModalBtn.addEventListener('click', () => savedPlansModal.classList.add('hidden'));
      savedPlansModal.addEventListener('click', (e) => {
        if (e.target === savedPlansModal) savedPlansModal.classList.add('hidden');
      });
    }

    if (saveCurrentPlanBtn) {
      saveCurrentPlanBtn.addEventListener('click', () => {
        if (activePlan) {
          savePlanToStash(activePlan);
        } else {
          showToast('Generate a lesson plan first before saving.');
        }
      });
    }

    if (clearAllPlansBtn) {
      clearAllPlansBtn.addEventListener('click', () => {
        playTactilePop(300);
        saveStash([]);
        renderStashList();
        showToast('All saved plans removed.');
      });
    }

    // Share modal controls
    if (closeShareModalBtn) closeShareModalBtn.addEventListener('click', closeShareModal);
    if (shareModal) {
      shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) closeShareModal();
      });
    }
    if (copyShareUrlBtn && shareUrlInput) {
      copyShareUrlBtn.addEventListener('click', () => {
        playTactilePop(550);
        shareUrlInput.select();
        navigator.clipboard.writeText(shareUrlInput.value).then(() => {
          showToast('Share link copied to clipboard!');
          closeShareModal();
        });
      });
    }

    // Live HUD controls
    if (hudOpenTimerBtn) {
      hudOpenTimerBtn.addEventListener('click', () => {
        openTimerModal(currentPhaseIndex);
      });
    }

    if (hudDismissBtn && liveReminderHud) {
      hudDismissBtn.addEventListener('click', () => {
        liveReminderHud.classList.add('hidden');
      });
    }

    // Mobile action bar controls
    const mobileTimerBtn = document.getElementById('mobile-timer-btn');
    const mobileCopyBtn = document.getElementById('mobile-copy-btn');
    const mobilePrintBtn = document.getElementById('mobile-print-btn');
    const mobileShareBtn = document.getElementById('mobile-share-btn');

    if (mobileTimerBtn) mobileTimerBtn.addEventListener('click', () => openTimerModal(0));
    if (mobileCopyBtn) mobileCopyBtn.addEventListener('click', () => activePlan && copyPlanToClipboard(activePlan));
    if (mobilePrintBtn) mobilePrintBtn.addEventListener('click', () => window.print());
    if (mobileShareBtn) mobileShareBtn.addEventListener('click', openShareModal);

    // Timer modal controls
    closeTimerBtn.addEventListener('click', closeTimerModal);
    timerToggleBtn.addEventListener('click', toggleTimer);
    timerPrevBtn.addEventListener('click', () => {
      if (currentPhaseIndex > 0) {
        loadPhaseInTimer(currentPhaseIndex - 1);
      }
    });
    timerNextBtn.addEventListener('click', () => {
      if (activePlan && currentPhaseIndex < activePlan.sections.length - 1) {
        loadPhaseInTimer(currentPhaseIndex + 1);
      }
    });
    timerModal.addEventListener('click', (e) => {
      if (e.target === timerModal) closeTimerModal();
    });

    if (timerSoundBtn) {
      timerSoundBtn.addEventListener('click', () => {
        isAudioEnabled = !isAudioEnabled;
        timerSoundBtn.textContent = isAudioEnabled ? '🔔 Sound: On' : '🔕 Sound: Muted';
        showToast(isAudioEnabled ? 'Timer chime enabled' : 'Timer chime muted');
      });
    }

    // Keyboard Shortcuts (⌘/Ctrl + Enter to cook, Space to pause/resume timer)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleFormSubmit();
      }

      if (!timerModal.classList.contains('hidden')) {
        if (e.code === 'Space') {
          e.preventDefault();
          toggleTimer();
        } else if (e.key === 'n' || e.key === 'N') {
          if (activePlan && currentPhaseIndex < activePlan.sections.length - 1) {
            loadPhaseInTimer(currentPhaseIndex + 1);
          }
        } else if (e.key === 'p' || e.key === 'P') {
          if (currentPhaseIndex > 0) {
            loadPhaseInTimer(currentPhaseIndex - 1);
          }
        } else if (e.key === 'Escape') {
          closeTimerModal();
        }
      } else if (!savedPlansModal.classList.contains('hidden') && e.key === 'Escape') {
        savedPlansModal.classList.add('hidden');
      } else if (!shareModal.classList.contains('hidden') && e.key === 'Escape') {
        closeShareModal();
      }
    });

    const hasSharedPlan = checkUrlParamsForPlan();

    // Requirement 5: "still show the plan after the page is reloaded."
    if (!hasSharedPlan) {
      try {
        const savedRaw = localStorage.getItem(STORAGE_KEY);
        if (savedRaw) {
          const savedData = JSON.parse(savedRaw);
          if (
            savedData &&
            typeof savedData === 'object' &&
            Number(savedData.totalMinutes) > 0 &&
            Array.isArray(savedData.sections) &&
            savedData.sections.length > 0
          ) {
            if (savedData.topic) topicInput.value = savedData.topic;
            if (savedData.classLevel) classLevelSelect.value = savedData.classLevel;
            if (savedData.totalMinutes) minutesInput.value = savedData.totalMinutes;
            if (savedData.lessonStyle) styleSelect.value = savedData.lessonStyle;
            if (startTimeInput && savedData.startTime) startTimeInput.value = savedData.startTime;
            if (reminderWarningSelect && savedData.reminderWarning !== undefined) reminderWarningSelect.value = savedData.reminderWarning;

            syncMinutePresets(savedData.totalMinutes);
            updateCharCount();
            renderPlan(savedData);
          }
        }
        if (!savedRaw && startTimeInput) {
          const now = new Date();
          const hrs = String(now.getHours()).padStart(2, '0');
          const mins = String(now.getMinutes()).padStart(2, '0');
          startTimeInput.value = `${hrs}:${mins}`;
        }
      } catch (err) {
        console.error('Error restoring saved plan:', err);
      }
    }
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose to window for tests
  window.PlanCraft = {
    generatePlan: handleFormSubmit,
    allocateExactMinutes,
    getPhaseTemplates,
    renderPlan,
    rebalanceSectionMinutes,
    computeBellSchedule,
  };
})();
