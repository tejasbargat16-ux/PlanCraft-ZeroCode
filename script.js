/**
 * PlanCraft 2.0 — The 10-Minute Lesson Architect
 * Production-Quality Upgrade | Offline-First Vanilla JavaScript
 * Zero Runtime Dependencies • Pedagogical Accuracy • Universal Device Support
 *
 * Core Architecture & Mandates:
 * 1. Finite, positive integer duration validation with configurable bounds (1 - 480 min).
 * 2. Exact Time Allocation Invariant: Hare-Niemeyer integer distribution guarantees
 *    that every phase has duration >= 1 min and sum(durations) === totalMinutes exactly.
 * 3. Dedicated models for ultra-short lessons (1m sprint, 2m kickoff, 3m triple-step).
 * 4. Absolute Deadline Classroom Presenter Timer with tab visibility-change resynchronization,
 *    duplicate interval guards, stale timeout cancellation, and fullscreen presentation.
 * 5. Complete state persistence (notes, phase completions, prep checklist, active timer state).
 * 6. Robust Schema v3 versioning, migration for legacy records, and storage quota guard.
 * 7. Universal HTML escaping to prevent dynamic HTML injection across all user-generated content.
 * 8. Lesson-Quality Alignment Rubric (Active student autonomy ratio, formative density, pacing alerts).
 * 9. Editable Learning Objectives (SWBAT) and measurable success criteria ("I Can" statements).
 * 10. 3-Tier Quiz & Exit Ticket Generator (Beginner, Intermediate, Advanced) with editable prompts.
 * 11. Dual Print Modes: Teacher Master Dossier vs. Student Guided Worksheet.
 * 12. Stash Library with search, filter, duplicate, rename, single JSON import/export, and full backup/restore.
 * 13. Multi-Day Unit-Planning Workspace for curricular lesson sequencing.
 * 14. Teaching Progress Analytics and classroom session logger.
 * 15. Optional AI Provider Interface with zero client-side secret keys, timeout handling, and offline fallback.
 */

(function () {
  'use strict';

  /* ==========================================================================
     Configuration & Storage Keys
     ========================================================================== */
  const MIN_MINUTES = 1;
  const MAX_MINUTES = 480; // 8 hours maximum
  const SCHEMA_VERSION = 3;

  const STORAGE_KEY = 'plancraft_active_plan_v3';
  const LEGACY_STORAGE_KEY_V2 = 'plancraft_active_plan_v2';
  const THEME_KEY = 'plancraft_theme_v2';
  const STASH_KEY = 'plancraft_stash_v3';
  const LEGACY_STASH_KEY_V2 = 'plancraft_stash_v2';
  const UNITS_KEY = 'plancraft_units_v2';
  const ANALYTICS_KEY = 'plancraft_analytics_v2';
  const AI_CONFIG_KEY = 'plancraft_ai_config_v2';
  const TIMER_STATE_KEY = 'plancraft_timer_state_v3';

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

  /* ==========================================================================
     DOM Elements Cache (Safe for Headless & Node.js Test Environments)
     ========================================================================== */
  const doc = typeof document !== 'undefined' ? document : null;
  const win = typeof window !== 'undefined' ? window : null;
  const getEl = (id) => (doc ? doc.getElementById(id) : null);
  const getQuery = (sel) => (doc ? doc.querySelector(sel) : null);
  const getQueryAll = (sel) => (doc ? doc.querySelectorAll(sel) : []);

  const form = getEl('lesson-form');
  const topicInput = getEl('topic-input');
  const classLevelSelect = getEl('class-level-select');
  const minutesInput = getEl('minutes-input');
  const styleSelect = getEl('lesson-style-select');
  const startTimeInput = getEl('start-time-input');
  const setNowTimeBtn = getEl('set-now-time-btn');
  const reminderWarningSelect = getEl('reminder-warning-select');
  const enableNotifsBtn = getEl('enable-notifs-btn');
  const notifBtnIcon = getEl('notif-btn-icon');
  const notifBtnText = getEl('notif-btn-text');
  const notifStatusBadge = getEl('notif-status-badge');

  const resetBtn = getEl('reset-btn');
  const clearTopicBtn = getEl('clear-topic-btn');
  const topicCharCount = getEl('topic-char-count');
  const durationHelperText = getEl('duration-helper-text');
  const topicChipsContainer = getEl('topic-chips');
  const subjectPills = getQueryAll('.subject-pill');

  // Messages & Banners
  const messageBanner = getEl('message-banner');
  const messageTitle = getEl('message-title');
  const messageText = getEl('message-text');
  const dismissMessageBtn = getEl('dismiss-message-btn');
  const planContainer = getEl('plan-container');
  const toast = getEl('toast');
  const mobileActionBar = getEl('mobile-action-bar');
  const liveReminderHud = getEl('live-reminder-hud');
  const hudStatusText = getEl('hud-status-text');
  const hudOpenTimerBtn = getEl('hud-open-timer-btn');
  const hudDismissBtn = getEl('hud-dismiss-btn');

  // Theme & Network
  const themeToggleBtn = getEl('theme-toggle-btn');
  const sunIcon = getQuery('.sun-icon');
  const moonIcon = getQuery('.moon-icon');
  const networkStatusIndicator = getEl('network-status-indicator');
  const networkStatusLabel = getEl('network-status-label');

  // Timer Modal Elements
  const timerModal = getEl('timer-modal');
  const closeTimerBtn = getEl('close-timer-btn');
  const timerSectionName = getEl('timer-section-name');
  const timerDisplay = getEl('timer-display');
  const timerProgressBar = getEl('timer-progress-bar');
  const timerGuideBox = getEl('timer-guide-box');
  const timerWarningAlert = getEl('timer-warning-alert');
  const timerToggleBtn = getEl('timer-toggle-btn');
  const timerPrevBtn = getEl('timer-prev-btn');
  const timerNextBtn = getEl('timer-next-btn');
  const timerResetBtn = getEl('timer-reset-btn');
  const timerFullscreenBtn = getEl('timer-fullscreen-btn');
  const timerSoundBtn = getEl('timer-sound-btn');

  // Stash Drawer Elements
  const savedPlansBtn = getEl('saved-plans-btn');
  const savedPlansBadge = getEl('saved-plans-badge');
  const savedPlansModal = getEl('saved-plans-modal');
  const closeSavedModalBtn = getEl('close-saved-modal-btn');
  const doneSavedModalBtn = getEl('done-saved-modal-btn');
  const saveCurrentPlanBtn = getEl('save-current-plan-btn');
  const clearAllPlansBtn = getEl('clear-all-plans-btn');
  const savedPlansList = getEl('saved-plans-list');
  const stashSearchInput = getEl('stash-search-input');
  const stashFilterLevel = getEl('stash-filter-level');
  const exportBackupBtn = getEl('export-backup-btn');
  const restoreBackupFileInput = getEl('restore-backup-file-input');

  // Share Modal Elements
  const shareModal = getEl('share-modal');
  const closeShareModalBtn = getEl('close-share-modal-btn');
  const shareUrlInput = getEl('share-url-input');
  const copyShareUrlBtn = getEl('copy-share-url-btn');

  // Unit Modal Elements
  const unitPlannerBtn = getEl('unit-planner-btn');
  const unitModal = getEl('unit-modal');
  const closeUnitModalBtn = getEl('close-unit-modal-btn');
  const closeUnitFootBtn = getEl('close-unit-foot-btn');
  const unitTitleInput = getEl('unit-title-input');
  const unitEssentialQuestion = getEl('unit-essential-question');
  const addUnitDayBtn = getEl('add-unit-day-btn');
  const linkActiveToUnitBtn = getEl('link-active-to-unit-btn');
  const unitDaysContainer = getEl('unit-days-container');
  const unitTotalDaysBadge = getEl('unit-total-days-badge');
  const unitTotalMinsBadge = getEl('unit-total-mins-badge');
  const exportUnitJsonBtn = getEl('export-unit-json-btn');
  const saveUnitBtn = getEl('save-unit-btn');

  // Analytics Modal Elements
  const analyticsBtn = getEl('analytics-btn');
  const analyticsModal = getEl('analytics-modal');
  const closeAnalyticsModalBtn = getEl('close-analytics-modal-btn');
  const doneAnalyticsModalBtn = getEl('done-analytics-modal-btn');
  const statSessionsCount = getEl('stat-sessions-count');
  const statMinutesDelivered = getEl('stat-minutes-delivered');
  const statCompletionRate = getEl('stat-completion-rate');
  const statActiveStashCount = getEl('stat-active-stash-count');
  const logCurrentSessionBtn = getEl('log-current-session-btn');
  const exportAnalyticsBtn = getEl('export-analytics-btn');
  const sessionLogList = getEl('session-log-list');
  const clearAnalyticsBtn = getEl('clear-analytics-btn');

  // AI Settings Modal Elements
  const aiSettingsBtn = getEl('ai-settings-btn');
  const aiSettingsModal = getEl('ai-settings-modal');
  const closeAiModalBtn = getEl('close-ai-modal-btn');
  const cancelAiSettingsBtn = getEl('cancel-ai-settings-btn');
  const saveAiSettingsBtn = getEl('save-ai-settings-btn');
  const aiModeOffline = getEl('ai-mode-offline');
  const aiModeProxy = getEl('ai-mode-proxy');
  const proxyEndpointGroup = getEl('proxy-endpoint-group');
  const customEndpointUrl = getEl('custom-endpoint-url');
  const aiPrivacyConsentCheck = getEl('ai-privacy-consent-check');

  // Print Modal Elements
  const printModal = getEl('print-modal');
  const closePrintModalBtn = getEl('close-print-modal-btn');
  const cancelPrintBtn = getEl('cancel-print-btn');
  const executePrintBtn = getEl('execute-print-btn');
  const printIncludeQuiz = getEl('print-include-quiz');
  const printIncludeNotes = getEl('print-include-notes');

  /* ==========================================================================
     Application State
     ========================================================================== */
  let activePlan = null;
  let isAudioEnabled = true;

  // Absolute Deadline Timer State
  let activeTimerState = {
    isRunning: false,
    phaseIndex: 0,
    remainingSeconds: 0,
    totalSeconds: 0,
    targetEndTimeMs: 0,
    warningNotified: false,
    completionNotified: false,
  };
  let timerInterval = null;
  let pendingAdvanceTimeout = null;

  // Bell Tracking State
  let bellTrackingInterval = null;
  let isBellTrackingActive = false;
  let lastTriggeredReminderPhase = -1;

  // Multi-Day Unit Workspace State
  let currentUnit = {
    id: 'unit_' + Date.now(),
    title: '',
    essentialQuestion: '',
    days: [],
    updatedAt: new Date().toISOString(),
  };

  /* ==========================================================================
     Sanitization & Safe Escaping
     ========================================================================== */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ==========================================================================
     Tactile Web Audio Synthesizer (Native Zero-Dependency Micro-Sounds)
     ========================================================================== */
  let sharedAudioCtx = null;

  function getAudioContext() {
    if (!sharedAudioCtx && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        sharedAudioCtx = new AudioCtx();
      } catch (e) {
        // Audio unavailable
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  }

  // Unlock AudioContext on first user interaction
  if (win) {
    ['click', 'keydown', 'touchstart'].forEach((evt) => {
      win.addEventListener(
        evt,
        () => {
          getAudioContext();
        },
        { once: true, passive: true }
      );
    });
  }

  function playTactilePop(freq = 440, duration = 0.08) {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
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
      const ctx = getAudioContext();
      if (!ctx) return;
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
      const ctx = getAudioContext();
      if (!ctx) return;
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
     Theme & Network State Engine
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
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
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

  function initNetworkStatus() {
    const updateStatus = () => {
      const isOnline = navigator.onLine !== false;
      if (networkStatusLabel) {
        networkStatusLabel.textContent = isOnline ? 'Local Offline App' : '100% Offline (No Net)';
      }
      if (networkStatusIndicator) {
        networkStatusIndicator.title = isOnline
          ? 'Application running locally with client-side persistence'
          : 'Offline mode active. All local features remain fully functional.';
      }
    };
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  }

  /* ==========================================================================
     Notification Reminders API
     ========================================================================== */
  function initNotificationStatus() {
    if (!('Notification' in window)) {
      if (notifStatusBadge) notifStatusBadge.textContent = 'Not Supported';
      if (enableNotifsBtn) enableNotifsBtn.disabled = true;
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
            sendPushNotification('🔔 Notifications Enabled!', 'PlanCraft will alert you for upcoming phase transitions.');
            showToast('Browser notifications active!');
          } else {
            showToast('Notifications blocked in browser settings.');
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

  function formatClockTime(dateObj) {
    const hrs = dateObj.getHours();
    const mins = dateObj.getMinutes();
    const formattedHrs = hrs < 10 ? `0${hrs}` : hrs;
    const formattedMins = mins < 10 ? `0${mins}` : mins;
    return `${formattedHrs}:${formattedMins}`;
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
     Input Duration Validation (Phase 1 Mandate)
     ========================================================================== */
  function validateDurationInput(rawMinutes) {
    if (rawMinutes === null || rawMinutes === undefined || String(rawMinutes).trim() === '') {
      return {
        valid: false,
        title: 'Duration Required',
        message: 'Please enter a class duration. A lesson plan cannot be generated without specifying the total minutes.',
      };
    }

    const trimmed = String(rawMinutes).trim();
    const num = Number(trimmed);

    if (!Number.isFinite(num) || isNaN(num)) {
      return {
        valid: false,
        title: 'Invalid Duration Format',
        message: 'Please enter a valid numeric value for total minutes.',
      };
    }

    if (num <= 0) {
      return {
        valid: false,
        title: 'Invalid Duration Value',
        message: 'The total minutes must be greater than zero. A lesson plan cannot be generated for empty, zero, or negative time.',
      };
    }

    if (num > MAX_MINUTES) {
      return {
        valid: false,
        title: 'Duration Exceeds Maximum Limit',
        message: `Class duration cannot exceed ${MAX_MINUTES} minutes (8 hours). Please specify a duration between 1 and ${MAX_MINUTES} minutes.`,
      };
    }

    const validMinutes = Math.round(num);
    if (validMinutes < MIN_MINUTES) {
      return {
        valid: false,
        title: 'Invalid Duration Value',
        message: `The total minutes must be at least ${MIN_MINUTES} full minute.`,
      };
    }

    return {
      valid: true,
      minutes: validMinutes,
      wasRounded: validMinutes !== num,
    };
  }

  /* ==========================================================================
     Mathematical Time Allocation Engine
     Hare-Niemeyer (Largest Remainder) distribution.
     GUARANTEES:
     1. Every phase duration >= 1 minute.
     2. sum(section_minutes) === totalMinutes EXACTLY across all durations!
     ========================================================================== */
  function allocateExactMinutes(totalMin, weights) {
    const n = weights.length;
    // When total minutes is smaller than template count, clamp to available minutes
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
     Pedagogical Phase Templates (Short, Normal, and Block Periods)
     Guarantees that for any duration >= 1, the number of phases <= totalMinutes.
     ========================================================================== */
  function getPhaseTemplates(totalMin, style) {
    // 1-minute lesson sprint: exactly 1 phase
    if (totalMin === 1) {
      return [
        {
          name: '⚡ Focused Concept Sprint',
          weight: 1.0,
          purpose: 'Deliver the central concept or core insight with instant visual clarity.',
          teacherAction: 'Present the single most essential principle or model on screen.',
          studentAction: 'Absorb the core definition and verbalize the key takeaway.',
          formativeCheck: 'Immediate whole-class visual response (thumbs/fingers).',
          prepTip: 'Have the prime definition or visual ready before class.',
        },
      ];
    }

    // 2-minute lesson sprint: exactly 2 phases
    if (totalMin === 2) {
      return [
        {
          name: '⚡ Micro-Hook & Concept Kickoff',
          weight: 0.5,
          purpose: 'Spark immediate interest with an engaging phenomenon or starter puzzle.',
          teacherAction: 'Display provocative visual or challenge prompt.',
          studentAction: 'Identify key question and discuss 30s with partner.',
          formativeCheck: 'Cold-call 1 student observation.',
          prepTip: 'Display starter on board.',
        },
        {
          name: '🎯 Instant Mastery Check',
          weight: 0.5,
          purpose: 'Check retention and concept application immediately.',
          teacherAction: 'Pose a single high-impact check question.',
          studentAction: 'Flash response on fingers or mini-whiteboard.',
          formativeCheck: '100% visual audit.',
          prepTip: 'Have exit question ready.',
        },
      ];
    }

    // 3-minute lesson: 3 phases (1m each)
    if (totalMin === 3) {
      return [
        {
          name: '⚡ Micro-Hook & Starter',
          weight: 0.34,
          purpose: 'Spark curiosity and introduce the target idea.',
          teacherAction: 'Present provocative hook or essential question.',
          studentAction: 'Turn and talk to predict answer.',
          formativeCheck: 'Fist-to-five or quick thumbs check.',
          prepTip: 'Prompt ready on screen.',
        },
        {
          name: '💡 Core Principle Demonstration',
          weight: 0.33,
          purpose: 'Demonstrate the key formula or concept in action.',
          teacherAction: 'Live think-aloud through one exemplar.',
          studentAction: 'Track key step in notes.',
          formativeCheck: 'Targeted verification question.',
          prepTip: 'Exemplar visible on board.',
        },
        {
          name: '🎯 Instant Mastery Check',
          weight: 0.33,
          purpose: 'Confirm immediate grasp before closing.',
          teacherAction: 'Ask decisive check prompt.',
          studentAction: 'Display independent response.',
          formativeCheck: 'Rapid visual audit.',
          prepTip: 'Exit prompt displayed.',
        },
      ];
    }

    // 4 to 7 minutes: 3 phases
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

    // 8 to 20 minutes: 4 phases
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

    // 21 to 65 minutes: 5 phases (style dependent)
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

    // Extended / Block Period (66m to 480m): 6 phases with mid-period checkpoint
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
    const l = (level || '').toLowerCase();
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

  /* ==========================================================================
     Lesson-Quality Alignment Rubric (Phase 2 Mandate)
     Evaluates alignment between objectives, active student autonomy,
     formative checks, and time distributions.
     ========================================================================== */
  function analyzeLessonQuality(plan) {
    if (!plan || !plan.sections || plan.sections.length === 0) {
      return {
        score: 0,
        grade: 'N/A',
        autonomyRatio: 0,
        formativeCount: 0,
        pacingAlerts: [],
        recommendations: 'No plan active.',
      };
    }

    const totalMin = plan.totalMinutes;
    let studentActiveMinutes = 0;
    let teacherHeavyMinutes = 0;
    let formativeCount = 0;
    const pacingAlerts = [];

    plan.sections.forEach((s) => {
      const name = s.name.toLowerCase();
      if (
        name.includes('practice') ||
        name.includes('application') ||
        name.includes('workshop') ||
        name.includes('lab') ||
        name.includes('exit ticket') ||
        name.includes('synthesis') ||
        name.includes('mastery')
      ) {
        studentActiveMinutes += s.durationMinutes;
      } else {
        teacherHeavyMinutes += s.durationMinutes;
      }

      if (s.formativeCheck && s.formativeCheck.trim().length > 0) {
        formativeCount++;
      }

      // Check for pacing stress: single teacher modeling phase exceeding 20 minutes
      if (s.durationMinutes > 20 && (name.includes('direct') || name.includes('model') || name.includes('instruction'))) {
        pacingAlerts.push(`Phase ${s.number} (${s.name}) is ${s.durationMinutes}m. Consider inserting an active student checkpoint.`);
      }
    });

    const autonomyRatio = Math.round((studentActiveMinutes / totalMin) * 100);
    let score = 70; // baseline

    // Autonomy scoring
    if (autonomyRatio >= 40 && autonomyRatio <= 70) {
      score += 15;
    } else if (autonomyRatio >= 30) {
      score += 10;
    }

    // Formative coverage scoring
    if (formativeCount >= plan.sections.length * 0.75) {
      score += 15;
    } else if (formativeCount > 0) {
      score += 8;
    }

    // Deduct for pacing alerts
    if (pacingAlerts.length > 0) {
      score -= pacingAlerts.length * 8;
    }

    score = Math.min(100, Math.max(50, score));

    let advice = 'Optimal pedagogical structure! High student engagement balance.';
    if (autonomyRatio < 35) {
      advice = 'Teacher modeling is dominant. Consider shifting 3–5 minutes from modeling to student guided practice.';
    } else if (autonomyRatio > 75) {
      advice = 'Very high independent time. Ensure foundational scaffolding is fully covered before independent work.';
    }

    return {
      score,
      autonomyRatio,
      studentActiveMinutes,
      teacherHeavyMinutes,
      formativeCount,
      totalPhases: plan.sections.length,
      pacingAlerts,
      advice,
    };
  }

  /* ==========================================================================
     Learning Objectives & Success Criteria Generator
     ========================================================================== */
  function generateDefaultObjectives(topic, classLevel) {
    const safeTopic = topic || 'Target Concept';
    return {
      swbat: `Students will be able to analyze and apply key principles of ${safeTopic} by constructing evidence-based solutions in guided and independent practice.`,
      criteria: [
        `I can define and explain the core vocabulary and concepts of ${safeTopic}.`,
        `I can model and solve a standard problem or scenario step-by-step with accuracy.`,
        `I can justify my reasoning to a peer and complete the independent exit ticket with confidence.`,
      ],
    };
  }

  /* ==========================================================================
     3-Tier Quiz & Exit Ticket Generator (Phase 2 Mandate)
     Generates Beginner, Intermediate, and Advanced questions clearly labeled
     as editable pedagogical drafts.
     ========================================================================== */
  function generateAssessmentItems(topic, classLevel) {
    const safeTopic = topic || 'Today\'s Topic';
    return [
      {
        tier: 'beginner',
        label: 'Tier 1: Beginner (Recall & Identify)',
        question: `Define the primary term in ${safeTopic} and state one essential characteristic.`,
        sampleAnswer: `Exemplar: Accurately names the central principle of ${safeTopic} and identifies its main real-world role.`,
      },
      {
        tier: 'intermediate',
        label: 'Tier 2: Intermediate (Apply & Explain)',
        question: `How would you apply the rules of ${safeTopic} to solve a scenario where the initial conditions are altered?`,
        sampleAnswer: `Exemplar: Explains the cause-and-effect relationship in ${safeTopic} step-by-step with supporting evidence.`,
      },
      {
        tier: 'advanced',
        label: 'Tier 3: Advanced (Analyze & Transfer)',
        question: `Evaluate a common misconception regarding ${safeTopic}. Construct an argument defending why that misconception fails.`,
        sampleAnswer: `Exemplar: Critically dissects the misconception, defends the accurate principle, and transfers the insight to an unfamiliar context.`,
      },
    ];
  }

  /* ==========================================================================
     Core Lesson Plan Generator Engine
     ========================================================================== */
  function generateLessonPlan(topic, classLevel, totalMin, lessonStyle, startTimeStr, reminderWarning) {
    const safeTopic = (topic || '').trim() || 'General Concept & Inquiry';
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
        completed: false,
      };
    });

    const sumAllocated = baseSections.reduce((sum, s) => sum + s.durationMinutes, 0);
    const sectionsWithClock = computeBellSchedule(startTimeStr || '09:00', baseSections);
    const objectives = generateDefaultObjectives(safeTopic, classLevel);
    const quizItems = generateAssessmentItems(safeTopic, classLevel);

    return {
      schemaVersion: SCHEMA_VERSION,
      id: 'plan_' + Date.now(),
      topic: safeTopic,
      classLevel: classLevel || 'Middle School (Grades 6-8)',
      totalMinutes: totalMin,
      lessonStyle: lessonStyle || 'balanced',
      startTime: startTimeStr || '09:00',
      reminderWarning: parseInt(reminderWarning, 10) || 2,
      generatedAt: new Date().toISOString(),
      sections: sectionsWithClock,
      sumAllocated,
      levelInfo,
      objectives,
      quizItems,
      prepChecklist: [false, false, false, false],
      isAiGenerated: false,
    };
  }

  /* ==========================================================================
     Minute Rebalancer (+ / - 1 Minute)
     Allows teacher to adjust individual section times while preserving
     the EXACT total minute sum! Preserves user edits before re-render.
     ========================================================================== */
  function rebalanceSectionMinutes(targetSectionNumber, delta) {
    if (!activePlan || !activePlan.sections || activePlan.sections.length < 2) return;

    // Sync any pending DOM edits before re-rendering
    syncDomEditsToActivePlan();

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
    activePlan.sections = computeBellSchedule(activePlan.startTime || '09:00', sections);

    saveActivePlanToStorage();
    renderPlan(activePlan);
    showToast(`Rebalanced! Sum remains exact: ${activePlan.sumAllocated} min.`);
  }

  function syncDomEditsToActivePlan() {
    if (!activePlan || !planContainer) return;

    // Sync notes
    planContainer.querySelectorAll('.custom-notes-field').forEach((field) => {
      const secNum = parseInt(field.getAttribute('data-section'), 10);
      if (activePlan.sections[secNum - 1]) {
        activePlan.sections[secNum - 1].customNotes = field.innerText;
      }
    });

    // Sync phase completion checkboxes
    planContainer.querySelectorAll('.mark-done-check').forEach((cb) => {
      const secNum = parseInt(cb.getAttribute('data-section'), 10);
      if (activePlan.sections[secNum - 1]) {
        activePlan.sections[secNum - 1].completed = cb.checked;
      }
    });

    // Sync prep checklist
    const checklistChecks = planContainer.querySelectorAll('.prep-check-input');
    if (checklistChecks.length > 0) {
      activePlan.prepChecklist = Array.from(checklistChecks).map((c) => c.checked);
    }
  }

  /* ==========================================================================
     UI Rendering Engine (Phase 2 & Phase 4 Mandate)
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

    // Quality Rubric Analysis
    const quality = analyzeLessonQuality(plan);

    // AI Draft Banner
    const aiBannerHtml = plan.isAiGenerated
      ? `
        <div class="ai-draft-banner" role="status">
          <span>🤖 AI-Assisted Pedagogical Draft &bull; Review & customize for your curriculum standards.</span>
          <span class="meta-tag highlight-tag">Editable</span>
        </div>
      `
      : '';

    // Quality Rubric Card
    const qualityRubricHtml = `
      <section class="quality-rubric-card" aria-label="Lesson Quality and Pedagogical Alignment">
        <div class="quality-rubric-head">
          <div class="quality-title-wrap">
            <span>🎯</span>
            <span>Pedagogical Alignment & Quality Audit</span>
          </div>
          <span class="quality-score-badge ${quality.score >= 85 ? 'high' : 'mid'}">
            Score: ${quality.score}/100 &bull; ${quality.score >= 85 ? 'Exemplary' : 'Good Pacing'}
          </span>
        </div>
        <div class="quality-metrics-grid">
          <div class="quality-metric-item">
            <span class="quality-metric-label">Active Student Autonomy</span>
            <span class="quality-metric-value">${quality.autonomyRatio}%</span>
            <span class="quality-metric-desc">${quality.studentActiveMinutes}m of ${plan.totalMinutes}m in practice/execution</span>
          </div>
          <div class="quality-metric-item">
            <span class="quality-metric-label">Formative Density</span>
            <span class="quality-metric-value">${quality.formativeCount} of ${quality.totalPhases}</span>
            <span class="quality-metric-desc">Phases with concrete check protocols</span>
          </div>
          <div class="quality-metric-item">
            <span class="quality-metric-label">Cognitive Arc</span>
            <span class="quality-metric-value">${escapeHtml(plan.lessonStyle.toUpperCase())}</span>
            <span class="quality-metric-desc">Calibrated for ${escapeHtml(plan.classLevel)}</span>
          </div>
        </div>
        ${
          quality.pacingAlerts.length > 0
            ? `<div class="quality-advice-box" style="border-left-color: #f59e0b;">
                 ⚠️ <strong>Pacing Consideration:</strong> ${quality.pacingAlerts.map((a) => escapeHtml(a)).join('<br>')}
               </div>`
            : ''
        }
        <div class="quality-advice-box">
          💡 <strong>Instructional Recommendation:</strong> ${escapeHtml(quality.advice)}
        </div>
      </section>
    `;

    // Objectives Deck Card
    const obj = plan.objectives || generateDefaultObjectives(plan.topic, plan.classLevel);
    const objectivesDeckHtml = `
      <section class="objectives-deck-card" aria-label="Learning Objectives and Success Criteria">
        <div class="objectives-head-row">
          <h3 class="objectives-title">🎯 Learning Objectives & Measurable Success Criteria</h3>
          <span class="meta-tag">Click to edit inline</span>
        </div>
        <div class="objectives-body-grid">
          <div class="objective-box">
            <span class="objective-box-label">Learning Target (SWBAT)</span>
            <div id="editable-swbat" class="editable-objective-text" contenteditable="true" data-type="swbat">${escapeHtml(obj.swbat)}</div>
          </div>
          <div class="objective-box">
            <span class="objective-box-label">Measurable Success Criteria ("I Can")</span>
            <ul class="criteria-list">
              ${(obj.criteria || [])
                .map(
                  (c, i) =>
                    `<li><span class="editable-objective-text" contenteditable="true" data-type="criteria" data-index="${i}">${escapeHtml(c)}</span></li>`
                )
                .join('')}
            </ul>
          </div>
        </div>
      </section>
    `;

    // Timeline Chunks
    const timelineChunksHtml = plan.sections
      .map((sec) => {
        const percent = ((sec.durationMinutes / plan.totalMinutes) * 100).toFixed(1);
        return `
          <div 
            class="timeline-chunk" 
            style="width: ${percent}%; background-color: ${sec.color};"
            title="Phase ${sec.number}: ${escapeHtml(sec.name)} (${sec.durationMinutes} min, ${percent}%)"
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
            <span><strong>P${sec.number}:</strong> ${escapeHtml(sec.name)} (${sec.durationMinutes}m)</span>
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
            <div class="slot-time-clock">${escapeHtml(sec.clockRange)}</div>
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
          <article class="section-bento-card ${sec.completed ? 'completed' : ''}" id="section-card-${sec.number}">
            <div class="section-accent-spine" style="background-color: ${sec.color};"></div>

            <div class="section-head">
              <div class="section-head-left">
                <div class="section-avatar-badge" style="border-color: ${sec.color}; color: ${sec.color};">
                  P${sec.number}
                </div>
                <div>
                  <h3 class="section-title">${escapeHtml(sec.name)}</h3>
                  <div class="section-meta-row">
                    <!-- Interactive Minute Stepper -->
                    <div class="minute-stepper" title="Adjust minutes while keeping total exact">
                      <button type="button" class="stepper-btn dec-btn" data-section="${sec.number}" aria-label="Decrease 1 min">-</button>
                      <span class="stepper-value">${sec.durationMinutes} min</span>
                      <button type="button" class="stepper-btn inc-btn" data-section="${sec.number}" aria-label="Increase 1 min">+</button>
                    </div>
                    <span class="time-range-label">⏱️ ${escapeHtml(sec.timeRange)}</span>
                    <span class="clock-badge">🕒 ${escapeHtml(sec.clockRange)}</span>
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
                  <li>Keep high pacing momentum to land on the ${sec.durationMinutes}-minute mark (${escapeHtml(sec.clockEnd)}).</li>
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
                <input type="checkbox" class="mark-done-check" data-section="${sec.number}" ${sec.completed ? 'checked' : ''}>
                <span>Mark phase completed during class</span>
              </label>
            </div>
          </article>
        `;
      })
      .join('');

    // Quiz & Exit Ticket Assessment Card
    const quizItems = plan.quizItems || generateAssessmentItems(plan.topic, plan.classLevel);
    const quizDeckHtml = `
      <section class="quiz-deck-card" aria-label="3-Tier Quiz and Exit Ticket Generator">
        <div class="quiz-head-row">
          <h3 class="quiz-heading">🎟️ 3-Tier Quiz & Exit Ticket Assessment</h3>
          <span class="quiz-disclaimer-pill">ℹ️ Educational Draft Template &bull; Click to edit</span>
        </div>
        <div class="quiz-tiers-stack">
          ${quizItems
            .map(
              (q, idx) => `
            <div class="quiz-tier-card">
              <div class="quiz-tier-head">
                <span class="tier-badge tier-${escapeHtml(q.tier)}">${escapeHtml(q.label)}</span>
              </div>
              <div class="quiz-question-text" contenteditable="true" data-quiz-idx="${idx}" data-field="question">${escapeHtml(q.question)}</div>
              <div class="quiz-sample-answer" contenteditable="true" data-quiz-idx="${idx}" data-field="sampleAnswer">${escapeHtml(q.sampleAnswer)}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `;

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
    const prepChecks = plan.prepChecklist || [false, false, false, false];

    // Assemble Full Plan View
    planContainer.innerHTML = `
      ${aiBannerHtml}

      <!-- Student Worksheet Print Header (Hidden on screen, revealed in @media print) -->
      <div class="student-worksheet-header">
        <div style="display:flex; justify-content:space-between; margin-bottom:8pt;">
          <strong>Name: ____________________________________</strong>
          <strong>Date: ______________</strong>
          <strong>Period: _____</strong>
        </div>
        <h2 style="margin: 4pt 0; font-size:16pt;">${escapeHtml(plan.topic)}</h2>
        <p style="margin: 2pt 0; font-size:10pt;"><strong>Target:</strong> ${escapeHtml(obj.swbat)}</p>
      </div>

      <!-- Plan Hero Dashboard Card -->
      <div class="plan-hero-card">
        <div class="plan-hero-top">
          <div>
            <div class="plan-hero-badges">
              <span class="sticker sticker-purple">${escapeHtml(plan.classLevel)}</span>
              <span class="sticker sticker-yellow">⏱️ ${plan.totalMinutes} MINS TOTAL</span>
              <span class="sticker sticker-lime">🔔 ${escapeHtml(firstSlot.clockStart)} – ${escapeHtml(lastSlot.clockEnd)}</span>
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
            <span>Class Start (${escapeHtml(firstSlot.clockStart)})</span>
            <span>Visual Pacing (${plan.totalMinutes} min)</span>
            <span>Class Dismissal (${escapeHtml(lastSlot.clockEnd)})</span>
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

      ${qualityRubricHtml}
      ${objectivesDeckHtml}

      <!-- Dedicated Time Section with Bell Schedule & Notification Reminders -->
      <section class="bell-schedule-bento" aria-labelledby="bell-schedule-title">
        <div class="bell-head-row">
          <div class="bell-title-wrap">
            <h3 id="bell-schedule-title">
              <span>🕒</span> Real-Time Bell Schedule & Notification Reminders
            </h3>
            <p>Mapped to your actual classroom clock from <strong>${escapeHtml(firstSlot.clockStart)}</strong> to <strong>${escapeHtml(lastSlot.clockEnd)}</strong>.</p>
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
            <input type="checkbox" id="prep-item-1" class="prep-check-input" data-index="0" ${prepChecks[0] ? 'checked' : ''}>
            <label for="prep-item-1">Write topic (<strong>${escapeHtml(plan.topic)}</strong>) and objective on the whiteboard.</label>
          </li>
          <li class="checklist-item">
            <input type="checkbox" id="prep-item-2" class="prep-check-input" data-index="1" ${prepChecks[1] ? 'checked' : ''}>
            <label for="prep-item-2">Load up Phase 1 starter prompt so students start right at ${escapeHtml(firstSlot.clockStart)}.</label>
          </li>
          <li class="checklist-item">
            <input type="checkbox" id="prep-item-3" class="prep-check-input" data-index="2" ${prepChecks[2] ? 'checked' : ''}>
            <label for="prep-item-3">Gather materials: ${escapeHtml(plan.levelInfo.materials)}</label>
          </li>
          <li class="checklist-item">
            <input type="checkbox" id="prep-item-4" class="prep-check-input" data-index="3" ${prepChecks[3] ? 'checked' : ''}>
            <label for="prep-item-4">Prep exit slips ready for ${escapeHtml(lastSlot.clockStart)} (final ${lastSlot.durationMinutes} min).</label>
          </li>
        </ul>
      </aside>

      <!-- Section Bento Flow -->
      <div class="sections-bento-flow" aria-label="Lesson sections">
        ${sectionCardsHtml}
      </div>

      ${quizDeckHtml}

      <!-- Student Worksheet Notes Box (revealed only in print) -->
      <div class="student-notes-area">
        <strong>Guided Notes & Independent Practice Workspace:</strong>
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

    // Phase completion checkboxes
    planContainer.querySelectorAll('.mark-done-check').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        playTactilePop(e.target.checked ? 750 : 350);
        const secNum = parseInt(e.target.getAttribute('data-section'), 10);
        const card = document.getElementById(`section-card-${secNum}`);
        if (card) card.classList.toggle('completed', e.target.checked);
        if (activePlan && activePlan.sections[secNum - 1]) {
          activePlan.sections[secNum - 1].completed = e.target.checked;
          saveActivePlanToStorage();
        }
      });
    });

    // Prep checklist persistence
    planContainer.querySelectorAll('.prep-check-input').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        playTactilePop(e.target.checked ? 700 : 320);
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        if (activePlan) {
          if (!activePlan.prepChecklist) activePlan.prepChecklist = [false, false, false, false];
          activePlan.prepChecklist[idx] = e.target.checked;
          saveActivePlanToStorage();
        }
      });
    });

    // Objectives editable updates
    const editableSwbat = planContainer.querySelector('#editable-swbat');
    if (editableSwbat) {
      editableSwbat.addEventListener('input', (e) => {
        if (activePlan && activePlan.objectives) {
          activePlan.objectives.swbat = e.target.innerText;
          saveActivePlanToStorage();
        }
      });
    }

    planContainer.querySelectorAll('[data-type="criteria"]').forEach((el) => {
      el.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        if (activePlan && activePlan.objectives && activePlan.objectives.criteria) {
          activePlan.objectives.criteria[idx] = e.target.innerText;
          saveActivePlanToStorage();
        }
      });
    });

    // Quiz editable updates
    planContainer.querySelectorAll('[data-quiz-idx]').forEach((el) => {
      el.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-quiz-idx'), 10);
        const field = e.target.getAttribute('data-field');
        if (activePlan && activePlan.quizItems && activePlan.quizItems[idx]) {
          activePlan.quizItems[idx][field] = e.target.innerText;
          saveActivePlanToStorage();
        }
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
        openPrintModal();
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
    if (!activePlan || !activePlan.sections || activePlan.sections.length === 0) return;

    if (bellTrackingInterval) {
      clearInterval(bellTrackingInterval);
      bellTrackingInterval = null;
    }

    isBellTrackingActive = true;
    lastTriggeredReminderPhase = -1;

    const toggleBtn = document.getElementById('toggle-bell-tracking-btn');
    if (toggleBtn) {
      toggleBtn.textContent = '⏹️ Stop Tracking Reminders';
      toggleBtn.classList.remove('primary-btn');
      toggleBtn.classList.add('danger-btn');
    }

    showToast('Live bell schedule tracking active!');
    if (liveReminderHud) {
      liveReminderHud.classList.remove('hidden');
    }

    checkBellScheduleTick();
    bellTrackingInterval = setInterval(checkBellScheduleTick, 1000);
  }

  function stopBellTracking() {
    isBellTrackingActive = false;
    if (bellTrackingInterval) {
      clearInterval(bellTrackingInterval);
      bellTrackingInterval = null;
    }

    const toggleBtn = document.getElementById('toggle-bell-tracking-btn');
    if (toggleBtn) {
      toggleBtn.textContent = '▶️ Start Live Bell Tracking';
      toggleBtn.classList.remove('danger-btn');
      toggleBtn.classList.add('primary-btn');
    }

    if (liveReminderHud) {
      liveReminderHud.classList.add('hidden');
    }

    document.querySelectorAll('.bell-slot-card').forEach((slot) => {
      slot.classList.remove('active-bell-slot');
    });

    showToast('Bell tracking stopped.');
  }

  function checkBellScheduleTick() {
    if (!activePlan || !activePlan.sections || !isBellTrackingActive) return;

    const now = new Date();
    const currentMs = now.getTime();
    const sections = activePlan.sections;
    const warningMin = activePlan.reminderWarning || 2;
    const warningMs = warningMin * 60 * 1000;

    let activePhase = null;
    let nextPhase = null;

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      if (currentMs >= s.startTimeMs && currentMs < s.endTimeMs) {
        activePhase = s;
        nextPhase = sections[i + 1] || null;
        break;
      }
    }

    sections.forEach((s) => {
      const card = document.getElementById(`bell-slot-${s.number}`);
      if (card) {
        card.classList.toggle('active-bell-slot', activePhase && activePhase.number === s.number);
      }
    });

    if (activePhase) {
      const remainingMs = activePhase.endTimeMs - currentMs;
      const remSec = Math.max(0, Math.floor(remainingMs / 1000));
      const remMins = Math.floor(remSec / 60);
      const remSecs = remSec % 60;
      const formattedRem = `${remMins}:${remSecs < 10 ? '0' : ''}${remSecs}`;

      if (hudStatusText) {
        hudStatusText.textContent = `Phase ${activePhase.number}: ${activePhase.name} • ${formattedRem} remaining (Ends ${activePhase.clockEnd})`;
      }

      if (warningMs > 0 && remainingMs <= warningMs && remainingMs > warningMs - 2000) {
        if (lastTriggeredReminderPhase !== activePhase.number * 100) {
          lastTriggeredReminderPhase = activePhase.number * 100;
          triggerTransitionReminder(
            activePhase.number,
            activePhase.name,
            `⚠️ ${warningMin}-min warning: Wrap up Phase ${activePhase.number}! Prepare for ${nextPhase ? nextPhase.name : 'Dismissal'}`,
            true
          );
        }
      }

      if (remainingMs <= 1500 && remainingMs > 0) {
        if (lastTriggeredReminderPhase !== activePhase.number) {
          lastTriggeredReminderPhase = activePhase.number;
          triggerTransitionReminder(
            activePhase.number,
            activePhase.name,
            `🔔 Phase ${activePhase.number} finished! Bell indicates transition to ${nextPhase ? nextPhase.name : 'Closure'}`,
            false
          );
        }
      }
    } else {
      if (hudStatusText) {
        const firstSlot = sections[0];
        const lastSlot = sections[sections.length - 1];
        if (currentMs < firstSlot.startTimeMs) {
          hudStatusText.textContent = `Schedule set. Class starts at ${firstSlot.clockStart}.`;
        } else if (currentMs > lastSlot.endTimeMs) {
          hudStatusText.textContent = `Class completed at ${lastSlot.clockEnd}.`;
        }
      }
    }
  }

  /* ==========================================================================
     In-Class Live Countdown Presenter (Phase 1 Mandate)
     Uses an ABSOLUTE DEADLINE (targetEndTimeMs) to eliminate background tab drift.
     ========================================================================== */
  function openTimerModal(phaseIndex) {
    if (!activePlan || !activePlan.sections) return;
    const clampedIndex = Math.max(0, Math.min(phaseIndex, activePlan.sections.length - 1));
    loadPhaseInTimer(clampedIndex);
    timerModal.classList.remove('hidden');
    saveTimerStateToStorage();
  }

  function closeTimerModal() {
    pauseTimer();
    timerModal.classList.remove('timer-modal-fullscreen');
    timerModal.classList.add('hidden');
    saveTimerStateToStorage();
  }

  function toggleFullscreenTimer() {
    const card = timerModal.querySelector('.modal-bento-card');
    if (!card) return;

    if (!document.fullscreenElement) {
      if (card.requestFullscreen) {
        card.requestFullscreen().catch(() => {
          timerModal.classList.toggle('timer-modal-fullscreen');
        });
      } else {
        timerModal.classList.toggle('timer-modal-fullscreen');
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      timerModal.classList.remove('timer-modal-fullscreen');
    }
  }

  function loadPhaseInTimer(index) {
    pauseTimer();
    activeTimerState.phaseIndex = index;
    const phase = activePlan.sections[index];
    activeTimerState.totalSeconds = phase.durationMinutes * 60;
    activeTimerState.remainingSeconds = activeTimerState.totalSeconds;
    activeTimerState.warningNotified = false;
    activeTimerState.completionNotified = false;

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
        🕒 Bell Schedule Target: ${escapeHtml(phase.clockRange)}
      </span>
      ${phase.customNotes ? `<br><span style="display:inline-block; margin-top:0.4rem; color: #18181b; background:#fef08a; padding:0.2rem 0.4rem; border-radius:4px; font-weight:800;"><strong>Your Notes:</strong> ${escapeHtml(phase.customNotes)}</span>` : ''}
    `;

    updateTimerDisplay();

    timerPrevBtn.disabled = index === 0;
    timerNextBtn.disabled = index === activePlan.sections.length - 1;
    timerToggleBtn.textContent = 'Start Timer (Space)';
    saveTimerStateToStorage();
  }

  function updateTimerDisplay() {
    const rem = Math.max(0, activeTimerState.remainingSeconds);
    const mins = Math.floor(rem / 60);
    const secs = rem % 60;
    timerDisplay.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const total = activeTimerState.totalSeconds;
    const percent = total > 0 ? ((total - rem) / total) * 100 : 0;
    timerProgressBar.style.width = `${percent}%`;
    if (activePlan && activePlan.sections[activeTimerState.phaseIndex]) {
      timerProgressBar.style.backgroundColor = activePlan.sections[activeTimerState.phaseIndex].color;
    }
  }

  function toggleTimer() {
    if (activeTimerState.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (pendingAdvanceTimeout) {
      clearTimeout(pendingAdvanceTimeout);
      pendingAdvanceTimeout = null;
    }

    if (activeTimerState.remainingSeconds <= 0) {
      activeTimerState.remainingSeconds = activeTimerState.totalSeconds;
      activeTimerState.warningNotified = false;
      activeTimerState.completionNotified = false;
    }

    activeTimerState.isRunning = true;
    activeTimerState.targetEndTimeMs = Date.now() + activeTimerState.remainingSeconds * 1000;
    timerToggleBtn.textContent = 'Pause Timer (Space)';
    playTactilePop(580);

    const warningThreshold = (activePlan ? activePlan.reminderWarning || 2 : 2) * 60;

    timerInterval = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.round((activeTimerState.targetEndTimeMs - now) / 1000));
      activeTimerState.remainingSeconds = diffSec;
      updateTimerDisplay();

      // Advance warning check
      if (warningThreshold > 0 && diffSec <= warningThreshold && !activeTimerState.warningNotified) {
        activeTimerState.warningNotified = true;
        playWarningAlertSound();
        if (timerWarningAlert) {
          timerWarningAlert.textContent = `⚠️ ${Math.floor(warningThreshold / 60)}-Minute Warning: Wrap up discussion & transition!`;
          timerWarningAlert.classList.remove('hidden');
        }
        sendPushNotification(
          '⚠️ Timer Reminder',
          `${Math.floor(warningThreshold / 60)} minutes left in Phase ${activeTimerState.phaseIndex + 1}: ${activePlan.sections[activeTimerState.phaseIndex].name}`
        );
      }

      // Phase completion check
      if (diffSec <= 0) {
        handlePhaseCompletion();
      }
    }, 1000);

    saveTimerStateToStorage();
  }

  function pauseTimer() {
    activeTimerState.isRunning = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (pendingAdvanceTimeout) {
      clearTimeout(pendingAdvanceTimeout);
      pendingAdvanceTimeout = null;
    }
    timerToggleBtn.textContent = 'Start Timer (Space)';
    saveTimerStateToStorage();
  }

  function resetCurrentPhaseTimer() {
    pauseTimer();
    activeTimerState.remainingSeconds = activeTimerState.totalSeconds;
    activeTimerState.warningNotified = false;
    activeTimerState.completionNotified = false;
    if (timerWarningAlert) timerWarningAlert.classList.add('hidden');
    updateTimerDisplay();
    playTactilePop(400);
    showToast('Phase timer reset.');
    saveTimerStateToStorage();
  }

  function handlePhaseCompletion() {
    pauseTimer();
    if (!activeTimerState.completionNotified) {
      activeTimerState.completionNotified = true;
      playSuccessChime();
      showToast(`Phase ${activeTimerState.phaseIndex + 1} completed!`);
      triggerTransitionReminder(
        activeTimerState.phaseIndex + 1,
        activePlan.sections[activeTimerState.phaseIndex].name,
        `Phase ${activeTimerState.phaseIndex + 1} Finished! Move to next phase.`
      );

      // Auto-mark completed in plan
      if (activePlan && activePlan.sections[activeTimerState.phaseIndex]) {
        activePlan.sections[activeTimerState.phaseIndex].completed = true;
        saveActivePlanToStorage();
        const card = document.getElementById(`section-card-${activeTimerState.phaseIndex + 1}`);
        if (card) card.classList.add('completed');
        const cb = planContainer ? planContainer.querySelector(`.mark-done-check[data-section="${activeTimerState.phaseIndex + 1}"]`) : null;
        if (cb) cb.checked = true;
      }
    }

    if (activeTimerState.phaseIndex < activePlan.sections.length - 1) {
      pendingAdvanceTimeout = setTimeout(() => {
        loadPhaseInTimer(activeTimerState.phaseIndex + 1);
        startTimer();
      }, 1200);
    }
  }

  // Handle visibility change: Resync absolute deadline when returning to tab
  if (doc) {
    doc.addEventListener('visibilitychange', () => {
      if (!doc.hidden && activeTimerState.isRunning) {
        const now = Date.now();
        const diffSec = Math.max(0, Math.round((activeTimerState.targetEndTimeMs - now) / 1000));
        activeTimerState.remainingSeconds = diffSec;
        updateTimerDisplay();
        if (diffSec <= 0) {
          handlePhaseCompletion();
        }
      }
    });
  }

  /* ==========================================================================
     Storage & Persistence (Schema v3 with Migration)
     ========================================================================== */
  function migratePlanData(rawPlan) {
    if (!rawPlan || typeof rawPlan !== 'object') return null;

    // Migrate v1/v2 schema to v3
    const totalMinutes = Number(rawPlan.totalMinutes) || 45;
    const topic = (rawPlan.topic || 'General Lesson').trim();
    const classLevel = rawPlan.classLevel || 'Middle School (Grades 6-8)';
    const lessonStyle = rawPlan.lessonStyle || 'balanced';
    const startTime = rawPlan.startTime || '09:00';
    const reminderWarning = rawPlan.reminderWarning !== undefined ? rawPlan.reminderWarning : 2;

    const objectives = rawPlan.objectives || generateDefaultObjectives(topic, classLevel);
    const quizItems = rawPlan.quizItems || generateAssessmentItems(topic, classLevel);
    const prepChecklist = Array.isArray(rawPlan.prepChecklist) ? rawPlan.prepChecklist : [false, false, false, false];

    const sections = (rawPlan.sections || []).map((s, idx) => ({
      ...s,
      number: idx + 1,
      completed: Boolean(s.completed),
      customNotes: s.customNotes || '',
    }));

    return {
      schemaVersion: SCHEMA_VERSION,
      id: rawPlan.id || 'plan_' + Date.now(),
      topic,
      classLevel,
      totalMinutes,
      lessonStyle,
      startTime,
      reminderWarning,
      generatedAt: rawPlan.generatedAt || new Date().toISOString(),
      sections,
      sumAllocated: rawPlan.sumAllocated || totalMinutes,
      levelInfo: rawPlan.levelInfo || getLevelAdjustments(classLevel, topic),
      objectives,
      quizItems,
      prepChecklist,
      isAiGenerated: Boolean(rawPlan.isAiGenerated),
    };
  }

  function saveActivePlanToStorage() {
    if (!activePlan) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activePlan));
    } catch (err) {
      handleStorageQuotaError(err);
    }
  }

  function saveTimerStateToStorage() {
    try {
      const data = {
        phaseIndex: activeTimerState.phaseIndex,
        remainingSeconds: activeTimerState.remainingSeconds,
        totalSeconds: activeTimerState.totalSeconds,
        isRunning: false, // Always persist as paused to prevent background audio on restart
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function handleStorageQuotaError(err) {
    console.warn('LocalStorage save failed:', err);
    if (err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014)) {
      showToast('⚠️ Storage full! Back up your Stash and clear older plans.');
    }
  }

  /* ==========================================================================
     My Stash (Saved Plans Library, Search, Filter, Backup, Restore)
     ========================================================================== */
  function getStash() {
    try {
      const raw = localStorage.getItem(STASH_KEY) || localStorage.getItem(LEGACY_STASH_KEY_V2);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((p) => migratePlanData(p)).filter(Boolean);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  function saveStash(plans) {
    try {
      localStorage.setItem(STASH_KEY, JSON.stringify(plans));
      updateStashBadge();
    } catch (e) {
      handleStorageQuotaError(e);
    }
  }

  function updateStashBadge() {
    const plans = getStash();
    if (savedPlansBadge) {
      savedPlansBadge.textContent = plans.length;
    }
    if (statActiveStashCount) {
      statActiveStashCount.textContent = plans.length;
    }
  }

  function savePlanToStash(plan) {
    if (!plan) return;
    syncDomEditsToActivePlan();

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
    const query = stashSearchInput ? stashSearchInput.value.toLowerCase().trim() : '';
    const levelFilter = stashFilterLevel ? stashFilterLevel.value.toLowerCase().trim() : '';

    const filtered = plans.filter((p) => {
      const matchesQuery = !query || p.topic.toLowerCase().includes(query) || (p.objectives && p.objectives.swbat.toLowerCase().includes(query));
      const matchesLevel = !levelFilter || p.classLevel.toLowerCase().includes(levelFilter);
      return matchesQuery && matchesLevel;
    });

    if (filtered.length === 0) {
      savedPlansList.innerHTML = `
        <div class="empty-stash-card" style="padding: 1.5rem; text-align: center; color: var(--ink-secondary);">
          <p style="font-size: 2rem; margin-bottom: 0.5rem;">🎒</p>
          <p><strong>${plans.length === 0 ? 'Your stash is empty!' : 'No matching lesson plans found.'}</strong></p>
          <p style="font-size: 0.8125rem; margin-top: 0.35rem; color: var(--ink-muted);">
            ${plans.length === 0 ? 'Click "Save to My Stash" on any generated lesson plan to keep it here.' : 'Try adjusting your search terms or filter.'}
          </p>
        </div>
      `;
      return;
    }

    savedPlansList.innerHTML = filtered
      .map((p, idx) => {
        const actualIdx = plans.findIndex((orig) => orig.id === p.id);
        const dateStr = p.generatedAt ? new Date(p.generatedAt).toLocaleDateString() : 'Recent';
        return `
          <div class="stash-item">
            <div style="flex: 1; min-width: 0;">
              <h4 style="margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.topic)}</h4>
              <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem; color: var(--ink-secondary);">
                ${escapeHtml(p.classLevel)} &bull; ${p.totalMinutes} min &bull; ${dateStr}
              </p>
            </div>
            <div style="display:flex; gap:0.35rem; align-items:center;">
              <button type="button" class="chunky-btn primary-btn sm-btn load-stash-btn" data-index="${actualIdx}" title="Load Plan">Load</button>
              <button type="button" class="chunky-btn outline-btn sm-btn dup-stash-btn" data-index="${actualIdx}" title="Duplicate Plan">📋</button>
              <button type="button" class="chunky-btn outline-btn sm-btn export-single-btn" data-index="${actualIdx}" title="Export JSON">📦</button>
              <button type="button" class="chunky-btn outline-btn sm-btn delete-stash-btn" data-index="${actualIdx}" title="Delete">&times;</button>
            </div>
          </div>
        `;
      })
      .join('');

    // Stash item action listeners
    savedPlansList.querySelectorAll('.load-stash-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        playTactilePop(650);
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const plan = plans[idx];
        if (plan) {
          topicInput.value = plan.topic;
          classLevelSelect.value = plan.classLevel;
          minutesInput.value = plan.totalMinutes;
          styleSelect.value = plan.lessonStyle;
          if (startTimeInput && plan.startTime) startTimeInput.value = plan.startTime;
          if (reminderWarningSelect && plan.reminderWarning !== undefined) reminderWarningSelect.value = plan.reminderWarning;
          syncMinutePresets(plan.totalMinutes);
          updateCharCount();
          renderPlan(plan);
          saveActivePlanToStorage();
          savedPlansModal.classList.add('hidden');
          showToast(`Loaded "${plan.topic}"!`);
        }
      });
    });

    savedPlansList.querySelectorAll('.dup-stash-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        playTactilePop(500);
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const plan = plans[idx];
        if (plan) {
          const cloned = JSON.parse(JSON.stringify(plan));
          cloned.id = 'plan_' + Date.now();
          cloned.topic = `[Copy] ${plan.topic}`;
          cloned.generatedAt = new Date().toISOString();
          plans.unshift(cloned);
          saveStash(plans);
          renderStashList();
          showToast(`Duplicated as "${cloned.topic}"!`);
        }
      });
    });

    savedPlansList.querySelectorAll('.export-single-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        playTactilePop(520);
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const plan = plans[idx];
        if (plan) {
          downloadJsonFile(plan, `plancraft-${slugify(plan.topic)}.json`);
        }
      });
    });

    savedPlansList.querySelectorAll('.delete-stash-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        playTactilePop(350);
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        plans.splice(idx, 1);
        saveStash(plans);
        renderStashList();
        showToast('Plan removed from stash.');
      });
    });
  }

  function exportFullBackup() {
    const plans = getStash();
    const units = getSavedUnits();
    const backup = {
      app: 'PlanCraft',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      stash: plans,
      units,
    };
    downloadJsonFile(backup, `plancraft-backup-${new Date().toISOString().slice(0, 10)}.json`);
    showToast('Full backup downloaded!');
  }

  function handleBackupImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed !== 'object') {
          showToast('Invalid JSON file format.');
          return;
        }

        // Check if single plan or full backup
        if (Array.isArray(parsed.stash)) {
          // Full backup
          const validStash = parsed.stash.map((p) => migratePlanData(p)).filter(Boolean);
          const currentPlans = getStash();
          const merged = [...validStash, ...currentPlans.filter((c) => !validStash.some((v) => v.id === c.id))];
          saveStash(merged);

          if (Array.isArray(parsed.units)) {
            const currentUnits = getSavedUnits();
            const mergedUnits = [...parsed.units, ...currentUnits.filter((cu) => !parsed.units.some((pu) => pu.id === cu.id))];
            saveUnits(mergedUnits);
          }

          renderStashList();
          showToast(`Restored ${validStash.length} plans successfully!`);
        } else if (parsed.topic && parsed.sections) {
          // Single plan import
          const migrated = migratePlanData(parsed);
          if (migrated) {
            const currentPlans = getStash();
            currentPlans.unshift(migrated);
            saveStash(currentPlans);
            renderStashList();
            showToast(`Imported "${migrated.topic}" into Stash!`);
          }
        } else {
          showToast('JSON does not contain recognizable PlanCraft schema.');
        }
      } catch (err) {
        showToast('Error reading JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  /* ==========================================================================
     Multi-Day Unit-Planning Workspace (Phase 2 Mandate)
     ========================================================================== */
  function getSavedUnits() {
    try {
      const raw = localStorage.getItem(UNITS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveUnits(units) {
    try {
      localStorage.setItem(UNITS_KEY, JSON.stringify(units));
    } catch (e) {
      handleStorageQuotaError(e);
    }
  }

  function renderUnitWorkspace() {
    if (!unitDaysContainer) return;

    if (unitTitleInput) unitTitleInput.value = currentUnit.title || '';
    if (unitEssentialQuestion) unitEssentialQuestion.value = currentUnit.essentialQuestion || '';

    if (!currentUnit.days || currentUnit.days.length === 0) {
      unitDaysContainer.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; border: 1.5px dashed var(--border-color); border-radius: var(--radius-sm); color: var(--ink-secondary);">
          <p style="font-size: 1.8rem; margin: 0 0 0.5rem 0;">📚</p>
          <p><strong>No lesson days added to this unit yet.</strong></p>
          <p style="font-size: 0.8rem; color: var(--ink-muted); margin-top: 0.25rem;">
            Click "+ Add Next Day" or "Attach Current Active Plan" to sequence your curriculum.
          </p>
        </div>
      `;
    } else {
      unitDaysContainer.innerHTML = currentUnit.days
        .map(
          (d, idx) => `
        <div class="unit-day-card">
          <div class="unit-day-info">
            <h4>Day ${idx + 1}: ${escapeHtml(d.topic)}</h4>
            <p>${escapeHtml(d.classLevel || 'General')} &bull; ${d.durationMinutes} min &bull; ${escapeHtml(d.focusObjective || 'Core Progression')}</p>
          </div>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <button type="button" class="chunky-btn sm-btn outline-btn load-unit-day-btn" data-index="${idx}">Load Plan</button>
            <button type="button" class="chunky-btn sm-btn outline-btn remove-unit-day-btn" data-index="${idx}">&times;</button>
          </div>
        </div>
      `
        )
        .join('');

      unitDaysContainer.querySelectorAll('.load-unit-day-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          playTactilePop(500);
          const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
          const d = currentUnit.days[idx];
          if (d) {
            topicInput.value = d.topic;
            minutesInput.value = d.durationMinutes;
            handleFormSubmit();
            unitModal.classList.add('hidden');
          }
        });
      });

      unitDaysContainer.querySelectorAll('.remove-unit-day-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          playTactilePop(350);
          const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
          currentUnit.days.splice(idx, 1);
          renderUnitWorkspace();
        });
      });
    }

    const totalDays = currentUnit.days.length;
    const totalMins = currentUnit.days.reduce((sum, d) => sum + (d.durationMinutes || 0), 0);
    if (unitTotalDaysBadge) unitTotalDaysBadge.textContent = `${totalDays} Day${totalDays === 1 ? '' : 's'} Planned`;
    if (unitTotalMinsBadge) unitTotalMinsBadge.textContent = `${totalMins} Total Minutes`;
  }

  function addDayToUnit() {
    playTactilePop(550);
    const dayNum = currentUnit.days.length + 1;
    currentUnit.days.push({
      dayNumber: dayNum,
      topic: `${activePlan ? activePlan.topic : 'Lesson'} Part ${dayNum}`,
      durationMinutes: activePlan ? activePlan.totalMinutes : 45,
      classLevel: activePlan ? activePlan.classLevel : 'Middle School (Grades 6-8)',
      focusObjective: 'Sequential mastery building on prerequisite foundations.',
    });
    renderUnitWorkspace();
  }

  function attachActivePlanToUnit() {
    if (!activePlan) {
      showToast('Generate a lesson plan first to attach it.');
      return;
    }
    playTactilePop(600);
    const dayNum = currentUnit.days.length + 1;
    currentUnit.days.push({
      dayNumber: dayNum,
      topic: activePlan.topic,
      durationMinutes: activePlan.totalMinutes,
      classLevel: activePlan.classLevel,
      focusObjective: activePlan.objectives ? activePlan.objectives.swbat : 'Mastery target',
      planId: activePlan.id,
    });
    renderUnitWorkspace();
    showToast(`Attached "${activePlan.topic}" as Day ${dayNum}!`);
  }

  function saveCurrentUnit() {
    currentUnit.title = unitTitleInput ? unitTitleInput.value.trim() || 'Untitled Unit' : 'Untitled Unit';
    currentUnit.essentialQuestion = unitEssentialQuestion ? unitEssentialQuestion.value.trim() : '';
    currentUnit.updatedAt = new Date().toISOString();

    const units = getSavedUnits();
    const existingIdx = units.findIndex((u) => u.id === currentUnit.id);
    if (existingIdx >= 0) {
      units[existingIdx] = currentUnit;
    } else {
      units.unshift(currentUnit);
    }
    saveUnits(units);
    playTactilePop(650);
    showToast(`Unit "${currentUnit.title}" saved!`);
  }

  /* ==========================================================================
     Teaching Progress Analytics & Classroom Session Logger
     ========================================================================== */
  function getAnalyticsLog() {
    try {
      const raw = localStorage.getItem(ANALYTICS_KEY);
      return raw ? JSON.parse(raw) : { sessions: [] };
    } catch (e) {
      return { sessions: [] };
    }
  }

  function saveAnalyticsLog(log) {
    try {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(log));
    } catch (e) {
      handleStorageQuotaError(e);
    }
  }

  function renderAnalytics() {
    const log = getAnalyticsLog();
    const sessions = log.sessions || [];

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.totalMinutes || 0), 0);
    let totalCompletedPhases = 0;
    let totalPossiblePhases = 0;

    sessions.forEach((s) => {
      totalCompletedPhases += s.completedPhasesCount || 0;
      totalPossiblePhases += s.totalPhasesCount || 0;
    });

    const completionRate = totalPossiblePhases > 0 ? Math.round((totalCompletedPhases / totalPossiblePhases) * 100) : 100;

    if (statSessionsCount) statSessionsCount.textContent = totalSessions;
    if (statMinutesDelivered) statMinutesDelivered.textContent = `${totalMinutes}m`;
    if (statCompletionRate) statCompletionRate.textContent = `${totalSessions > 0 ? completionRate : 0}%`;
    if (statActiveStashCount) statActiveStashCount.textContent = getStash().length;

    if (sessionLogList) {
      if (sessions.length === 0) {
        sessionLogList.innerHTML = `
          <div style="padding: 1rem; text-align:center; color:var(--ink-muted); font-size:0.85rem;">
            No teaching sessions logged yet. Teach a class and click "Log Current Lesson Session as Completed".
          </div>
        `;
      } else {
        sessionLogList.innerHTML = sessions
          .slice(-10)
          .reverse()
          .map(
            (s) => `
          <div class="session-log-item">
            <div>
              <strong>${escapeHtml(s.topic)}</strong>
              <div style="font-size:0.75rem; color:var(--ink-secondary); margin-top:0.15rem;">
                ${s.date} &bull; ${s.classLevel} &bull; ${s.totalMinutes}m
              </div>
            </div>
            <span class="meta-tag highlight-tag">${s.completedPhasesCount}/${s.totalPhasesCount} Phases</span>
          </div>
        `
          )
          .join('');
      }
    }
  }

  function logCurrentLessonSession() {
    if (!activePlan) {
      showToast('Generate a lesson plan first before logging.');
      return;
    }
    syncDomEditsToActivePlan();

    const log = getAnalyticsLog();
    const completedCount = activePlan.sections.filter((s) => s.completed).length;

    const newSession = {
      id: 'sess_' + Date.now(),
      date: new Date().toLocaleDateString(),
      topic: activePlan.topic,
      classLevel: activePlan.classLevel,
      totalMinutes: activePlan.totalMinutes,
      completedPhasesCount: completedCount,
      totalPhasesCount: activePlan.sections.length,
      timestamp: Date.now(),
    };

    log.sessions.push(newSession);
    saveAnalyticsLog(log);
    playTactilePop(700);
    showToast(`Logged session for "${activePlan.topic}"!`);
    renderAnalytics();
  }

  /* ==========================================================================
     Optional AI Provider Interface (Phase 3 Mandate)
     Keeps API credentials strictly server-side. Zero secret keys on client.
     Validated schemas, network timeout handling, and 100% offline fallback.
     ========================================================================== */
  function getAiConfig() {
    try {
      const raw = localStorage.getItem(AI_CONFIG_KEY);
      return raw ? JSON.parse(raw) : { mode: 'offline', endpointUrl: '', consentGiven: false };
    } catch (e) {
      return { mode: 'offline', endpointUrl: '', consentGiven: false };
    }
  }

  function saveAiConfig(cfg) {
    try {
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg));
    } catch (e) {}
  }

  async function requestAiAssistedPlan(topic, classLevel, totalMin, lessonStyle, startTimeStr, reminderWarning) {
    const config = getAiConfig();

    if (config.mode === 'custom-proxy' && config.endpointUrl && config.consentGiven) {
      showToast('Contacting configured proxy endpoint...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second safety timeout

      try {
        const res = await fetch(config.endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            classLevel,
            totalMinutes: totalMin,
            lessonStyle,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json && json.sections && Array.isArray(json.sections) && json.sections.length > 0) {
            const plan = migratePlanData(json);
            plan.isAiGenerated = true;
            return plan;
          }
        }
        showToast('Proxy returned invalid schema. Falling back to offline core.');
      } catch (err) {
        clearTimeout(timeoutId);
        showToast(`Proxy connection failed (${err.name === 'AbortError' ? 'Timeout' : 'Network'}). Used offline fallback.`);
      }
    }

    // Default 100% Offline Pedagogical Core
    return generateLessonPlan(topic, classLevel, totalMin, lessonStyle, startTimeStr, reminderWarning);
  }

  /* ==========================================================================
     Print & Handout Dossier Selector (Phase 2 Mandate)
     Teacher Master Dossier vs. Student Guided Worksheet
     ========================================================================== */
  function openPrintModal() {
    if (!activePlan) {
      showToast('Generate a lesson plan first before printing.');
      return;
    }
    if (printModal) printModal.classList.remove('hidden');
  }

  function executePrint() {
    const isStudent = document.querySelector('input[name="printFormat"]:checked')?.value === 'student';
    if (printModal) printModal.classList.add('hidden');

    if (isStudent) {
      document.body.classList.add('print-student-active');
    } else {
      document.body.classList.remove('print-student-active');
    }

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-student-active');
      }, 500);
    }, 150);
  }

  /* ==========================================================================
     Share & URL Link Generator
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
      const rawTopic = url.searchParams.get('topic');
      const rawLevel = url.searchParams.get('level');
      const rawMin = url.searchParams.get('min');
      const rawStyle = url.searchParams.get('style');
      const rawStart = url.searchParams.get('start');

      if (rawTopic && rawMin) {
        const valRes = validateDurationInput(rawMin);
        if (valRes.valid) {
          const safeTopic = rawTopic.slice(0, 150);
          topicInput.value = safeTopic;
          if (rawLevel) classLevelSelect.value = rawLevel;
          minutesInput.value = valRes.minutes;
          if (rawStyle) styleSelect.value = rawStyle;
          if (rawStart && startTimeInput) startTimeInput.value = rawStart;

          const newPlan = generateLessonPlan(
            safeTopic,
            rawLevel || classLevelSelect.value,
            valRes.minutes,
            rawStyle || 'balanced',
            rawStart || '09:00',
            2
          );
          renderPlan(newPlan);
          saveActivePlanToStorage();
          showToast('Shared plan loaded from link!');
          return true;
        }
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
    if (!plan || !plan.sections) return '';
    const obj = plan.objectives || generateDefaultObjectives(plan.topic, plan.classLevel);
    const divider = '==================================================';

    let out = `${divider}\n`;
    out += `PLANCRAFT PEDAGOGICAL LESSON PLAN\n`;
    out += `Topic: ${plan.topic}\n`;
    out += `Class Level: ${plan.classLevel}\n`;
    out += `Total Duration: ${plan.totalMinutes} Minutes\n`;
    out += `Pedagogical Arc: ${plan.lessonStyle.toUpperCase()}\n`;
    out += `Bell Schedule: ${plan.sections[0].clockStart} – ${plan.sections[plan.sections.length - 1].clockEnd}\n`;
    out += `${divider}\n\n`;

    out += `LEARNING TARGET (SWBAT):\n${obj.swbat}\n\n`;
    out += `SUCCESS CRITERIA:\n`;
    (obj.criteria || []).forEach((c) => {
      out += `• ${c}\n`;
    });
    out += `\n${divider}\nPHASE BREAKDOWN:\n${divider}\n\n`;

    plan.sections.forEach((s) => {
      out += `Phase ${s.number}: ${s.name} (${s.durationMinutes} min | ${s.clockRange})\n`;
      out += `  • Objective: ${s.purpose}\n`;
      out += `  • Teacher Move: ${s.teacherAction}\n`;
      out += `  • Student Action: ${s.studentAction}\n`;
      out += `  • Formative Check: ${s.formativeCheck}\n`;
      out += `  • Pacing Tip: ${s.prepTip}\n`;
      if (s.customNotes) {
        out += `  • Custom Notes: ${s.customNotes}\n`;
      }
      out += `\n`;
    });

    if (plan.quizItems && plan.quizItems.length > 0) {
      out += `${divider}\n3-TIER ASSESSMENT QUESTIONS:\n${divider}\n\n`;
      plan.quizItems.forEach((q) => {
        out += `[${q.label}]\nQ: ${q.question}\nA: ${q.sampleAnswer}\n\n`;
      });
    }

    out += `Generated with PlanCraft 2.0 (Zero-Dependency Offline Architecture)\n`;
    return out;
  }

  function copyPlanToClipboard(plan) {
    const text = formatPlanAsPlainText(plan);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast('Lesson plan copied to clipboard!');
        })
        .catch(() => {
          fallbackCopyToClipboard(text);
        });
    } else {
      fallbackCopyToClipboard(text);
    }
  }

  function fallbackCopyToClipboard(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Lesson plan copied to clipboard!');
    } catch (e) {
      showToast('Could not copy automatically. Please copy manually.');
    }
    document.body.removeChild(ta);
  }

  function downloadPlanText(plan) {
    const text = formatPlanAsPlainText(plan);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plancraft-${slugify(plan.topic)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Lesson plan .txt exported!');
  }

  function downloadJsonFile(obj, filename) {
    const str = JSON.stringify(obj, null, 2);
    const blob = new Blob([str], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function slugify(text) {
    return (text || 'lesson')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }

  let toastTimeout = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
      toastTimeout = null;
    }, 2800);
  }

  /* ==========================================================================
     Validation & Plan Submission (Phase 1 Mandate)
     ========================================================================== */
  function showErrorMessage(title, message) {
    messageTitle.textContent = title;
    messageText.textContent = message;
    messageBanner.classList.remove('hidden');

    // Requirement 4: MUST NOT show plan when duration is invalid
    planContainer.innerHTML = '';
    planContainer.classList.add('hidden');
    if (mobileActionBar) mobileActionBar.classList.add('hidden');
    if (liveReminderHud) liveReminderHud.classList.add('hidden');
    stopBellTracking();
    activePlan = null;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function hideErrorMessage() {
    messageBanner.classList.add('hidden');
  }

  async function handleFormSubmit(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    hideErrorMessage();

    const rawMinutes = minutesInput.value;
    const topic = topicInput.value.trim();
    const classLevel = classLevelSelect.value;
    const lessonStyle = styleSelect.value;
    const startTimeStr = startTimeInput ? startTimeInput.value.trim() : '09:00';
    const reminderWarning = reminderWarningSelect ? reminderWarningSelect.value : 2;

    const valResult = validateDurationInput(rawMinutes);

    if (!valResult.valid) {
      showErrorMessage(valResult.title, valResult.message);
      minutesInput.focus();
      return false;
    }

    const validMinutes = valResult.minutes;
    const effectiveTopic = topic || 'General Topic & Concept Exploration';

    playSuccessChime();

    // Generate & Render Plan (AI-assisted if configured, otherwise offline core)
    const newPlan = await requestAiAssistedPlan(
      effectiveTopic,
      classLevel,
      validMinutes,
      lessonStyle,
      startTimeStr,
      reminderWarning
    );

    renderPlan(newPlan);
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
      localStorage.removeItem(TIMER_STATE_KEY);
    } catch (e) {}

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
     Initialization & Event Binding
     ========================================================================== */
  function init() {
    initTheme();
    initNetworkStatus();
    initNotificationStatus();
    updateStashBadge();

    form.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', handleReset);

    // Current time button
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

    // Clear topic button
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
        const res = validateDurationInput(val);
        if (res.valid) {
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

    if (stashSearchInput) stashSearchInput.addEventListener('input', renderStashList);
    if (stashFilterLevel) stashFilterLevel.addEventListener('change', renderStashList);
    if (exportBackupBtn) exportBackupBtn.addEventListener('click', exportFullBackup);
    if (restoreBackupFileInput) {
      restoreBackupFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleBackupImportFile(e.target.files[0]);
          e.target.value = '';
        }
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

    // Unit modal controls
    if (unitPlannerBtn && unitModal) {
      unitPlannerBtn.addEventListener('click', () => {
        playTactilePop(500);
        renderUnitWorkspace();
        unitModal.classList.remove('hidden');
      });
      if (closeUnitModalBtn) closeUnitModalBtn.addEventListener('click', () => unitModal.classList.add('hidden'));
      if (closeUnitFootBtn) closeUnitFootBtn.addEventListener('click', () => unitModal.classList.add('hidden'));
      if (addUnitDayBtn) addUnitDayBtn.addEventListener('click', addDayToUnit);
      if (linkActiveToUnitBtn) linkActiveToUnitBtn.addEventListener('click', attachActivePlanToUnit);
      if (saveUnitBtn) saveCurrentUnit();
      if (exportUnitJsonBtn) {
        exportUnitJsonBtn.addEventListener('click', () => {
          downloadJsonFile(currentUnit, `plancraft-unit-${slugify(currentUnit.title)}.json`);
        });
      }
      unitModal.addEventListener('click', (e) => {
        if (e.target === unitModal) unitModal.classList.add('hidden');
      });
    }

    // Analytics modal controls
    if (analyticsBtn && analyticsModal) {
      analyticsBtn.addEventListener('click', () => {
        playTactilePop(500);
        renderAnalytics();
        analyticsModal.classList.remove('hidden');
      });
      if (closeAnalyticsModalBtn) closeAnalyticsModalBtn.addEventListener('click', () => analyticsModal.classList.add('hidden'));
      if (doneAnalyticsModalBtn) doneAnalyticsModalBtn.addEventListener('click', () => analyticsModal.classList.add('hidden'));
      if (logCurrentSessionBtn) logCurrentSessionBtn.addEventListener('click', logCurrentLessonSession);
      if (exportAnalyticsBtn) {
        exportAnalyticsBtn.addEventListener('click', () => {
          downloadJsonFile(getAnalyticsLog(), 'plancraft-teaching-analytics.json');
        });
      }
      if (clearAnalyticsBtn) {
        clearAnalyticsBtn.addEventListener('click', () => {
          playTactilePop(300);
          saveAnalyticsLog({ sessions: [] });
          renderAnalytics();
          showToast('Analytics log cleared.');
        });
      }
      analyticsModal.addEventListener('click', (e) => {
        if (e.target === analyticsModal) analyticsModal.classList.add('hidden');
      });
    }

    // AI Settings modal controls
    if (aiSettingsBtn && aiSettingsModal) {
      aiSettingsBtn.addEventListener('click', () => {
        playTactilePop(500);
        const cfg = getAiConfig();
        if (cfg.mode === 'custom-proxy') {
          if (aiModeProxy) aiModeProxy.checked = true;
          if (proxyEndpointGroup) proxyEndpointGroup.classList.remove('hidden');
        } else {
          if (aiModeOffline) aiModeOffline.checked = true;
          if (proxyEndpointGroup) proxyEndpointGroup.classList.add('hidden');
        }
        if (customEndpointUrl) customEndpointUrl.value = cfg.endpointUrl || '';
        if (aiPrivacyConsentCheck) aiPrivacyConsentCheck.checked = Boolean(cfg.consentGiven);
        aiSettingsModal.classList.remove('hidden');
      });

      if (closeAiModalBtn) closeAiModalBtn.addEventListener('click', () => aiSettingsModal.classList.add('hidden'));
      if (cancelAiSettingsBtn) cancelAiSettingsBtn.addEventListener('click', () => aiSettingsModal.classList.add('hidden'));

      if (aiModeOffline) {
        aiModeOffline.addEventListener('change', () => {
          if (proxyEndpointGroup) proxyEndpointGroup.classList.add('hidden');
        });
      }
      if (aiModeProxy) {
        aiModeProxy.addEventListener('change', () => {
          if (proxyEndpointGroup) proxyEndpointGroup.classList.remove('hidden');
        });
      }

      if (saveAiSettingsBtn) {
        saveAiSettingsBtn.addEventListener('click', () => {
          playTactilePop(550);
          const isProxy = aiModeProxy && aiModeProxy.checked;
          const endpoint = customEndpointUrl ? customEndpointUrl.value.trim() : '';
          const consent = aiPrivacyConsentCheck ? aiPrivacyConsentCheck.checked : false;

          if (isProxy && !consent) {
            showToast('Consent checkbox required to transmit data to proxy.');
            return;
          }

          saveAiConfig({
            mode: isProxy ? 'custom-proxy' : 'offline',
            endpointUrl: endpoint,
            consentGiven: consent,
          });

          aiSettingsModal.classList.add('hidden');
          showToast(isProxy ? 'Custom proxy endpoint saved!' : 'Offline heuristic engine active!');
        });
      }

      aiSettingsModal.addEventListener('click', (e) => {
        if (e.target === aiSettingsModal) aiSettingsModal.classList.add('hidden');
      });
    }

    // Print modal controls
    if (closePrintModalBtn) closePrintModalBtn.addEventListener('click', () => printModal.classList.add('hidden'));
    if (cancelPrintBtn) cancelPrintBtn.addEventListener('click', () => printModal.classList.add('hidden'));
    if (executePrintBtn) executePrintBtn.addEventListener('click', executePrint);
    if (printModal) {
      printModal.addEventListener('click', (e) => {
        if (e.target === printModal) printModal.classList.add('hidden');
      });
    }

    // Live HUD controls
    if (hudOpenTimerBtn) {
      hudOpenTimerBtn.addEventListener('click', () => {
        openTimerModal(activeTimerState.phaseIndex);
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
    if (mobilePrintBtn) mobilePrintBtn.addEventListener('click', openPrintModal);
    if (mobileShareBtn) mobileShareBtn.addEventListener('click', openShareModal);

    // Timer modal controls
    closeTimerBtn.addEventListener('click', closeTimerModal);
    timerToggleBtn.addEventListener('click', toggleTimer);
    if (timerResetBtn) timerResetBtn.addEventListener('click', resetCurrentPhaseTimer);
    if (timerFullscreenBtn) timerFullscreenBtn.addEventListener('click', toggleFullscreenTimer);

    timerPrevBtn.addEventListener('click', () => {
      if (activeTimerState.phaseIndex > 0) {
        loadPhaseInTimer(activeTimerState.phaseIndex - 1);
      }
    });

    timerNextBtn.addEventListener('click', () => {
      if (activePlan && activeTimerState.phaseIndex < activePlan.sections.length - 1) {
        loadPhaseInTimer(activeTimerState.phaseIndex + 1);
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

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + Enter to generate
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleFormSubmit();
      }

      // Timer modal active shortcuts
      if (!timerModal.classList.contains('hidden')) {
        if (e.code === 'Space') {
          e.preventDefault();
          toggleTimer();
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleFullscreenTimer();
        } else if (e.key === 'n' || e.key === 'N') {
          if (activePlan && activeTimerState.phaseIndex < activePlan.sections.length - 1) {
            loadPhaseInTimer(activeTimerState.phaseIndex + 1);
          }
        } else if (e.key === 'p' || e.key === 'P') {
          if (activeTimerState.phaseIndex > 0) {
            loadPhaseInTimer(activeTimerState.phaseIndex - 1);
          }
        } else if (e.key === 'Escape') {
          closeTimerModal();
        }
      } else if (!savedPlansModal.classList.contains('hidden') && e.key === 'Escape') {
        savedPlansModal.classList.add('hidden');
      } else if (!shareModal.classList.contains('hidden') && e.key === 'Escape') {
        closeShareModal();
      } else if (unitModal && !unitModal.classList.contains('hidden') && e.key === 'Escape') {
        unitModal.classList.add('hidden');
      } else if (analyticsModal && !analyticsModal.classList.contains('hidden') && e.key === 'Escape') {
        analyticsModal.classList.add('hidden');
      } else if (aiSettingsModal && !aiSettingsModal.classList.contains('hidden') && e.key === 'Escape') {
        aiSettingsModal.classList.add('hidden');
      } else if (printModal && !printModal.classList.contains('hidden') && e.key === 'Escape') {
        printModal.classList.add('hidden');
      }
    });

    // Check URL parameters for shared plan
    const hasSharedPlan = checkUrlParamsForPlan();

    // Reload persistence (Requirement 5)
    if (!hasSharedPlan) {
      try {
        const savedRaw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY_V2);
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          const migrated = migratePlanData(parsed);

          if (migrated && migrated.sections.length > 0) {
            if (migrated.topic) topicInput.value = migrated.topic;
            if (migrated.classLevel) classLevelSelect.value = migrated.classLevel;
            if (migrated.totalMinutes) minutesInput.value = migrated.totalMinutes;
            if (migrated.lessonStyle) styleSelect.value = migrated.lessonStyle;
            if (startTimeInput && migrated.startTime) startTimeInput.value = migrated.startTime;
            if (reminderWarningSelect && migrated.reminderWarning !== undefined) {
              reminderWarningSelect.value = migrated.reminderWarning;
            }

            syncMinutePresets(migrated.totalMinutes);
            updateCharCount();
            renderPlan(migrated);
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

  // DOM Ready
  if (doc) {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  /* ==========================================================================
     Public Export for Testing & External Invocations
     ========================================================================== */
  const api = {
    validateDurationInput,
    allocateExactMinutes,
    getPhaseTemplates,
    generateLessonPlan,
    rebalanceSectionMinutes,
    computeBellSchedule,
    analyzeLessonQuality,
    generateDefaultObjectives,
    generateAssessmentItems,
    migratePlanData,
    formatPlanAsPlainText,
    escapeHtml,
    MIN_MINUTES,
    MAX_MINUTES,
    SCHEMA_VERSION,
  };

  if (typeof window !== 'undefined') {
    window.PlanCraft = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.PlanCraft = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
