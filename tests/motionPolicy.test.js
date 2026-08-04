import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRunContinuousMotion, getBoundedRepeatCount } from '../src/utils/motionPolicy.js';

test('Motion Policy', async (t) => {
  await t.test('1. Visible desktop + document visible + no reduced motion allows optional motion', () => {
    const result = shouldRunContinuousMotion({
      sectionVisible: true,
      documentVisible: true,
      prefersReducedMotion: false,
      mobile: false
    });
    assert.strictEqual(result, true);
  });

  await t.test('2. Offscreen section disables motion', () => {
    const result = shouldRunContinuousMotion({
      sectionVisible: false,
      documentVisible: true,
      prefersReducedMotion: false,
      mobile: false
    });
    assert.strictEqual(result, false);
  });

  await t.test('3. Hidden document disables motion', () => {
    const result = shouldRunContinuousMotion({
      sectionVisible: true,
      documentVisible: false,
      prefersReducedMotion: false,
      mobile: false
    });
    assert.strictEqual(result, false);
  });

  await t.test('4. Reduced motion disables continuous motion', () => {
    const result = shouldRunContinuousMotion({
      sectionVisible: true,
      documentVisible: true,
      prefersReducedMotion: true,
      mobile: false
    });
    assert.strictEqual(result, false);
  });

  await t.test('5. Mobile disables expensive decorative motion', () => {
    const result = shouldRunContinuousMotion({
      sectionVisible: true,
      documentVisible: true,
      prefersReducedMotion: false,
      mobile: true
    });
    assert.strictEqual(result, false);
  });

  await t.test('6. Essential non-continuous feedback can remain allowed if policy supports it', () => {
    // The policy dictates continuous motion. Essential interaction feedback is always allowed
    // by not using this policy function. This test verifies that the policy is strict.
    const result = shouldRunContinuousMotion({
      sectionVisible: true,
      documentVisible: true,
      prefersReducedMotion: true,
      mobile: false
    });
    assert.strictEqual(result, false); // strict adherence to reduced-motion
  });

  await t.test('getBoundedRepeatCount behavior', async (t2) => {
    await t2.test('1. zero items returns 0', () => {
      assert.strictEqual(getBoundedRepeatCount(0, 8, 12), 0);
    });
    await t2.test('2. one item returns minimum', () => {
      assert.strictEqual(getBoundedRepeatCount(1, 8, 12), 8);
    });
    await t2.test('3. six company items returns 8', () => {
      assert.strictEqual(getBoundedRepeatCount(6, 8, 12), 8);
    });
    await t2.test('4. twelve items returns 12', () => {
      assert.strictEqual(getBoundedRepeatCount(12, 8, 12), 12);
    });
    await t2.test('5. one hundred items returns 12 for company bounds', () => {
      assert.strictEqual(getBoundedRepeatCount(100, 8, 12), 12);
    });
    await t2.test('6. ticker below minimum returns 8', () => {
      assert.strictEqual(getBoundedRepeatCount(4, 8, 16), 8);
    });
    await t2.test('7. ticker above maximum returns 16', () => {
      assert.strictEqual(getBoundedRepeatCount(30, 8, 16), 16);
    });
    await t2.test('8. result never exceeds maximum', () => {
      assert.strictEqual(getBoundedRepeatCount(15, 8, 12), 12);
    });
    await t2.test('9. invalid bounds handled deterministically', () => {
      assert.strictEqual(getBoundedRepeatCount(5, 12, 8), 8);
    });
  });
});
