import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  INACTIVITY_THRESHOLD_DAYS,
  INACTIVITY_THRESHOLD_MS,
  WARNING_THRESHOLD_DAYS
} = require('../backend/utils/accountGovernance.js');

test('60-Day Inactive Account Governance Policy', async (t) => {
  await t.test('1. Inactivity threshold is exactly 60 days', () => {
    assert.equal(INACTIVITY_THRESHOLD_DAYS, 60);
    assert.equal(INACTIVITY_THRESHOLD_MS, 60 * 24 * 60 * 60 * 1000);
  });

  await t.test('2. Warning window is set to 53 days (7 days before purge)', () => {
    assert.equal(WARNING_THRESHOLD_DAYS, 53);
    const differenceInDays = INACTIVITY_THRESHOLD_DAYS - WARNING_THRESHOLD_DAYS;
    assert.equal(differenceInDays, 7);
  });

  await t.test('3. Evaluates active vs at-risk vs purge eligibility accurately', () => {
    const now = Date.now();
    const activeTimestamp = now - (10 * 24 * 60 * 60 * 1000); // 10 days ago
    const warningTimestamp = now - (55 * 24 * 60 * 60 * 1000); // 55 days ago
    const purgeTimestamp = now - (61 * 24 * 60 * 60 * 1000); // 61 days ago

    const cutoff = now - INACTIVITY_THRESHOLD_MS;
    const warningCutoff = now - (WARNING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

    // Active
    assert.ok(activeTimestamp >= warningCutoff, 'Active account should not be in warning zone');
    assert.ok(activeTimestamp >= cutoff, 'Active account should not be eligible for purge');

    // Warning
    assert.ok(warningTimestamp < warningCutoff, 'Account older than 53 days should enter warning zone');
    assert.ok(warningTimestamp >= cutoff, 'Account under 60 days should not be purged');

    // Purge
    assert.ok(purgeTimestamp < cutoff, 'Account older than 60 days must be eligible for purge');
  });
});
