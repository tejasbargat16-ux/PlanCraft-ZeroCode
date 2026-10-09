import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Import PlanCraft module
await import('../script.js');
const PlanCraft = globalThis.PlanCraft;

describe('PlanCraft 2.0 Test Suite', () => {
  describe('Phase 1 & 5 — Duration Validation', () => {
    test('rejects empty, null, and whitespace-only duration inputs', () => {
      const inputs = ['', '   ', null, undefined];
      for (const input of inputs) {
        const res = PlanCraft.validateDurationInput(input);
        assert.equal(res.valid, false);
        assert.equal(res.title, 'Duration Required');
      }
    });

    test('rejects zero and negative durations', () => {
      const inputs = [0, -1, -45, '-10', '0'];
      for (const input of inputs) {
        const res = PlanCraft.validateDurationInput(input);
        assert.equal(res.valid, false);
        assert.equal(res.title, 'Invalid Duration Value');
      }
    });

    test('rejects non-numeric, NaN, and non-finite values', () => {
      const inputs = ['abc', 'ten', NaN, Infinity, -Infinity];
      for (const input of inputs) {
        const res = PlanCraft.validateDurationInput(input);
        assert.equal(res.valid, false);
        assert.match(res.title, /Invalid Duration/);
      }
    });

    test('rejects durations exceeding the configurable upper limit (480 minutes)', () => {
      const inputs = [481, 500, 1000, 10000];
      for (const input of inputs) {
        const res = PlanCraft.validateDurationInput(input);
        assert.equal(res.valid, false);
        assert.equal(res.title, 'Duration Exceeds Maximum Limit');
      }
    });

    test('accepts valid boundary durations (1 min to 480 min)', () => {
      const minRes = PlanCraft.validateDurationInput(1);
      assert.equal(minRes.valid, true);
      assert.equal(minRes.minutes, 1);

      const maxRes = PlanCraft.validateDurationInput(480);
      assert.equal(maxRes.valid, true);
      assert.equal(maxRes.minutes, 480);

      const normalRes = PlanCraft.validateDurationInput('45');
      assert.equal(normalRes.valid, true);
      assert.equal(normalRes.minutes, 45);
    });

    test('cleanly rounds fractional durations to nearest integer', () => {
      const res1 = PlanCraft.validateDurationInput(44.6);
      assert.equal(res1.valid, true);
      assert.equal(res1.minutes, 45);
      assert.equal(res1.wasRounded, true);

      const res2 = PlanCraft.validateDurationInput('12.2');
      assert.equal(res2.valid, true);
      assert.equal(res2.minutes, 12);
      assert.equal(res2.wasRounded, true);
    });
  });

  describe('Phase 1 & 5 — Time Allocation Invariants (Hare-Niemeyer Engine)', () => {
    const durationsToTest = [1, 2, 3, 4, 5, 7, 10, 15, 20, 30, 45, 50, 60, 75, 90, 120, 180, 240, 360, 480];

    for (const duration of durationsToTest) {
      test(`guarantees exact sum invariant and duration >= 1 for ${duration}-minute lesson`, () => {
        const styles = ['balanced', 'interactive', 'direct'];
        for (const style of styles) {
          const templates = PlanCraft.getPhaseTemplates(duration, style);
          assert.ok(templates.length >= 1, 'At least 1 phase must be defined');
          assert.ok(templates.length <= duration, 'Phase count cannot exceed total minutes');

          const weights = templates.map((t) => t.weight);
          const allocations = PlanCraft.allocateExactMinutes(duration, weights);

          assert.equal(allocations.length, templates.length, 'Allocation count matches template count');

          const sum = allocations.reduce((acc, v) => acc + v, 0);
          assert.equal(sum, duration, `Allocated minutes sum (${sum}) MUST equal totalMinutes (${duration})`);

          for (let i = 0; i < allocations.length; i++) {
            assert.ok(
              allocations[i] >= 1,
              `Phase ${i + 1} duration (${allocations[i]}) must be >= 1 min in ${duration}m lesson`
            );
            assert.ok(Number.isInteger(allocations[i]), `Phase duration must be integer`);
          }
        }
      });
    }

    test('ultra-short 1-minute sprint returns exactly 1 phase with 1 min', () => {
      const plan = PlanCraft.generateLessonPlan('Emergency Kickoff', 'Middle School', 1, 'balanced');
      assert.equal(plan.sections.length, 1);
      assert.equal(plan.sections[0].durationMinutes, 1);
      assert.equal(plan.sumAllocated, 1);
    });

    test('ultra-short 2-minute sprint returns exactly 2 phases (1m each)', () => {
      const plan = PlanCraft.generateLessonPlan('Quick Concept', 'High School', 2, 'balanced');
      assert.equal(plan.sections.length, 2);
      assert.equal(plan.sections[0].durationMinutes, 1);
      assert.equal(plan.sections[1].durationMinutes, 1);
      assert.equal(plan.sumAllocated, 2);
    });

    test('3-minute sprint returns exactly 3 phases summing to 3 min', () => {
      const plan = PlanCraft.generateLessonPlan('Fast Check', 'Elementary', 3, 'balanced');
      assert.equal(plan.sections.length, 3);
      const total = plan.sections.reduce((sum, s) => sum + s.durationMinutes, 0);
      assert.equal(total, 3);
      assert.equal(plan.sumAllocated, 3);
    });
  });

  describe('Phase 1 & 5 — Bell Schedule & Rebalancing Engine', () => {
    test('computes sequential, non-overlapping clock intervals based on start time', () => {
      const plan = PlanCraft.generateLessonPlan('Photosynthesis', 'Middle School', 45, 'balanced', '09:00');
      assert.equal(plan.sections[0].clockStart, '09:00');

      for (let i = 0; i < plan.sections.length - 1; i++) {
        const current = plan.sections[i];
        const next = plan.sections[i + 1];
        assert.equal(
          current.clockEnd,
          next.clockStart,
          `Phase ${i + 1} clockEnd must match Phase ${i + 2} clockStart`
        );
      }

      const last = plan.sections[plan.sections.length - 1];
      assert.equal(last.clockEnd, '09:45');
    });

    test('handles schedule roll-overs across the hour boundary', () => {
      const plan = PlanCraft.generateLessonPlan('Civil War', 'High School', 50, 'balanced', '09:30');
      assert.equal(plan.sections[0].clockStart, '09:30');
      const last = plan.sections[plan.sections.length - 1];
      assert.equal(last.clockEnd, '10:20');
    });

    test('rebalances section minutes dynamically while preserving exact sum invariant', () => {
      const plan = PlanCraft.generateLessonPlan('Calculus Intro', 'College', 45, 'balanced', '10:00');
      const originalSum = plan.sumAllocated;
      assert.equal(originalSum, 45);

      // Mutate plan in memory and test schedule recalculation
      plan.sections[0].durationMinutes += 1;
      plan.sections[1].durationMinutes -= 1;
      const recomputed = PlanCraft.computeBellSchedule('10:00', plan.sections);

      const newSum = recomputed.reduce((s, sec) => s + sec.durationMinutes, 0);
      assert.equal(newSum, 45);
      assert.equal(recomputed[0].clockStart, '10:00');
      assert.equal(recomputed[recomputed.length - 1].clockEnd, '10:45');
    });
  });

  describe('Phase 2 — Lesson-Quality Alignment Rubric', () => {
    test('analyzes student autonomy ratio and formative assessment density', () => {
      const plan = PlanCraft.generateLessonPlan('Ecology Food Webs', 'Middle School', 45, 'balanced');
      const quality = PlanCraft.analyzeLessonQuality(plan);

      assert.ok(quality.score >= 50 && quality.score <= 100);
      assert.ok(quality.autonomyRatio >= 0 && quality.autonomyRatio <= 100);
      assert.ok(quality.formativeCount > 0);
      assert.ok(typeof quality.advice === 'string' && quality.advice.length > 0);
    });

    test('flags pacing alerts when a single teacher modeling phase exceeds 20 minutes', () => {
      const plan = PlanCraft.generateLessonPlan('Lecture Marathon', 'High School', 60, 'direct');
      // Artificially extend modeling phase to 25 minutes
      plan.sections[1].name = '🧠 Direct Instruction ("I Do")';
      plan.sections[1].durationMinutes = 25;

      const quality = PlanCraft.analyzeLessonQuality(plan);
      assert.ok(quality.pacingAlerts.length > 0);
      assert.match(quality.pacingAlerts[0], /exceeds 20m|Consider inserting/);
    });
  });

  describe('Phase 2 — Objectives, Success Criteria, and 3-Tier Quiz Generator', () => {
    test('generates SWBAT learning objectives and measurable success criteria', () => {
      const objs = PlanCraft.generateDefaultObjectives('Newtonian Mechanics', 'High School');
      assert.ok(objs.swbat.includes('Newtonian Mechanics'));
      assert.equal(objs.criteria.length, 3);
      for (const c of objs.criteria) {
        assert.match(c, /^I can /);
      }
    });

    test('generates Beginner, Intermediate, and Advanced assessment items', () => {
      const items = PlanCraft.generateAssessmentItems('Plate Tectonics', 'Middle School');
      assert.equal(items.length, 3);
      assert.equal(items[0].tier, 'beginner');
      assert.equal(items[1].tier, 'intermediate');
      assert.equal(items[2].tier, 'advanced');

      for (const item of items) {
        assert.ok(item.question.length > 10);
        assert.ok(item.sampleAnswer.length > 10);
      }
    });
  });

  describe('Phase 1 & 5 — Data Migration & Corrupt Storage Handling', () => {
    test('migrates legacy v1/v2 schema to v3 without data loss', () => {
      const legacyPlan = {
        topic: 'Ancient Egypt',
        classLevel: 'Middle School (Grades 6-8)',
        totalMinutes: 45,
        lessonStyle: 'balanced',
        sections: [
          { number: 1, name: 'Hook', durationMinutes: 5, clockRange: '09:00 – 09:05' },
          { number: 2, name: 'Core', durationMinutes: 40, clockRange: '09:05 – 09:45' },
        ],
      };

      const migrated = PlanCraft.migratePlanData(legacyPlan);
      assert.equal(migrated.schemaVersion, 3);
      assert.equal(migrated.topic, 'Ancient Egypt');
      assert.ok(migrated.objectives);
      assert.ok(migrated.quizItems);
      assert.equal(migrated.prepChecklist.length, 4);
      assert.equal(migrated.sections[0].completed, false);
    });

    test('handles corrupt or null storage gracefully', () => {
      assert.equal(PlanCraft.migratePlanData(null), null);
      assert.equal(PlanCraft.migratePlanData(undefined), null);
      assert.equal(PlanCraft.migratePlanData('string'), null);
    });
  });

  describe('Phase 1 & 5 — HTML Escaping & Injection Prevention', () => {
    test('escapes HTML special characters in user inputs and attributes', () => {
      const malicious = '<script>alert("XSS")</script>&<tag>\'quote\'';
      const escaped = PlanCraft.escapeHtml(malicious);

      assert.ok(!escaped.includes('<script>'));
      assert.ok(!escaped.includes('</script>'));
      assert.ok(escaped.includes('&lt;script&gt;'));
      assert.ok(escaped.includes('&amp;'));
      assert.ok(escaped.includes('&quot;'));
      assert.ok(escaped.includes('&#39;'));
    });

    test('handles null, undefined, and non-string inputs safely in escapeHtml', () => {
      assert.equal(PlanCraft.escapeHtml(null), '');
      assert.equal(PlanCraft.escapeHtml(undefined), '');
      assert.equal(PlanCraft.escapeHtml(123), '123');
      assert.equal(PlanCraft.escapeHtml(false), 'false');
    });
  });

  describe('Phase 2 — Plaintext Export Formatting', () => {
    test('formats complete lesson plan into structured plaintext dossier', () => {
      const plan = PlanCraft.generateLessonPlan('Cell Mitosis', 'High School', 45, 'balanced');
      const text = PlanCraft.formatPlanAsPlainText(plan);

      assert.ok(text.includes('PLANCRAFT PEDAGOGICAL LESSON PLAN'));
      assert.ok(text.includes('Topic: Cell Mitosis'));
      assert.ok(text.includes('LEARNING TARGET (SWBAT):'));
      assert.ok(text.includes('3-TIER ASSESSMENT QUESTIONS:'));
      assert.ok(text.includes('Phase 1:'));
      assert.ok(text.includes('Generated with PlanCraft 2.0'));
    });
  });
});
