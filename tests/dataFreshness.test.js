import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFreshnessMessage,
  isValidFreshnessMessage,
  createMessageDeduper,
  createFreshnessRouter,
  SENDER_ID
} from '../src/utils/dataFreshness.js';

test('dataFreshness pure functions', async (t) => {
  const now = Date.now();

  await t.test('1. Valid message creation', () => {
    const msg = createFreshnessMessage('jobs', 'create', '123');
    assert.strictEqual(msg.version, 1);
    assert.strictEqual(msg.domain, 'jobs');
    assert.strictEqual(msg.mutationType, 'create');
    assert.strictEqual(msg.entityId, '123');
    assert.ok(msg.timestamp > 0);
  });

  await t.test('2. crypto/fallback message ID presence', () => {
    const msg = createFreshnessMessage('jobs', 'update');
    assert.ok(typeof msg.msgId === 'string');
    assert.ok(msg.msgId.length > 5);
    assert.ok(typeof msg.senderId === 'string');
  });

  await t.test('3. Allowed domain', () => {
    const msg = createFreshnessMessage('jobs', 'update');
    assert.ok(isValidFreshnessMessage(msg, now));
  });

  await t.test('4. Rejection of unknown domain', () => {
    const msg = createFreshnessMessage('unknown_domain', 'update');
    assert.equal(isValidFreshnessMessage(msg, now), false);
  });

  await t.test('5. Allowed mutation types', () => {
    const validMutations = ['create', 'update', 'delete', 'feature', 'today', 'visibility', 'refresh'];
    validMutations.forEach(mut => {
      const msg = createFreshnessMessage('jobs', mut);
      assert.ok(isValidFreshnessMessage(msg, now));
    });
  });

  await t.test('6. Rejection of unknown mutation type', () => {
    const msg = createFreshnessMessage('jobs', 'invalid_mutation');
    assert.equal(isValidFreshnessMessage(msg, now), false);
  });

  await t.test('7. Expired-message rejection', () => {
    const msg = createFreshnessMessage('jobs', 'update');
    msg.timestamp = now - 15000;
    assert.equal(isValidFreshnessMessage(msg, now), false);
  });

  await t.test('8. Future-message rejection', () => {
    const msg = createFreshnessMessage('jobs', 'update');
    msg.timestamp = now + 15000;
    assert.equal(isValidFreshnessMessage(msg, now), false);
  });

  await t.test('9. Malformed/null payload rejection', () => {
    assert.equal(isValidFreshnessMessage(null, now), false);
    assert.equal(isValidFreshnessMessage(undefined, now), false);
    assert.equal(isValidFreshnessMessage('not_an_object', now), false);
    assert.equal(isValidFreshnessMessage({ version: 2 }, now), false);
    assert.equal(isValidFreshnessMessage({ version: 1, domain: 'jobs' }, now), false);
  });

  await t.test('10. First message accepted', () => {
    const deduper = createMessageDeduper(10);
    assert.equal(deduper.isDuplicate('msg-1', now), false);
  });

  await t.test('11. Duplicate msgId rejected', () => {
    const deduper = createMessageDeduper(10);
    deduper.isDuplicate('msg-1', now);
    assert.equal(deduper.isDuplicate('msg-1', now), true);
  });

  await t.test('12. Bounded tracker cleanup', () => {
    const deduper = createMessageDeduper(5);
    for (let i = 0; i < 6; i++) {
      deduper.isDuplicate(`msg-${i}`, now - 20000);
    }
    assert.ok(deduper._getSize() <= 5);
  });

  await t.test('13. Same entity with different msgIds accepted', () => {
    const deduper = createMessageDeduper(10);
    assert.equal(deduper.isDuplicate('msg-A', now), false);
    assert.equal(deduper.isDuplicate('msg-B', now), false);
  });

  await t.test('14. Missing optional entityId accepted when appropriate', () => {
    const msg = createFreshnessMessage('jobs', 'refresh');
    assert.strictEqual(msg.entityId, null);
    assert.ok(isValidFreshnessMessage(msg, now));
  });
});

test('dataFreshness pure router', async (t) => {
  await t.test('1. Same-tab publication delivered exactly once', () => {
    const router = createFreshnessRouter();
    let count = 0;
    router.subscribe('jobs', () => count++);
    const msg = createFreshnessMessage('jobs', 'update');
    router.dispatch(msg, true);
    assert.strictEqual(count, 1);
  });

  await t.test('2. Same message delivered twice accepted once', () => {
    const router = createFreshnessRouter();
    let count = 0;
    router.subscribe('jobs', () => count++);
    const msg = createFreshnessMessage('jobs', 'update');
    msg.senderId = 'other'; // Simulate remote message
    router.dispatch(msg, false);
    router.dispatch(msg, false); // duplicate delivery
    assert.strictEqual(count, 1);
  });

  await t.test('3. Same msgId through simulated channel and storage accepted once', () => {
    const router = createFreshnessRouter();
    let count = 0;
    router.subscribe('jobs', () => count++);
    const msg = createFreshnessMessage('jobs', 'update');
    msg.senderId = 'other';
    router.dispatch(msg, false); // From channel
    router.dispatch(msg, false); // From storage
    assert.strictEqual(count, 1);
  });

  await t.test('4. Different msgIds for the same entity both accepted', () => {
    const router = createFreshnessRouter();
    let count = 0;
    router.subscribe('jobs', () => count++);
    const msg1 = createFreshnessMessage('jobs', 'update', '123');
    msg1.senderId = 'other';
    const msg2 = createFreshnessMessage('jobs', 'update', '123');
    msg2.senderId = 'other';
    router.dispatch(msg1, false);
    router.dispatch(msg2, false);
    assert.strictEqual(count, 2);
  });

  await t.test('5. Wrong sender rejected on remote-only dispatch when appropriate', () => {
    const router = createFreshnessRouter();
    let count = 0;
    router.subscribe('jobs', () => count++);
    const msg = createFreshnessMessage('jobs', 'update');
    msg.senderId = SENDER_ID; // Simulating echo from remote channel
    router.dispatch(msg, false); // allowSelf=false
    assert.strictEqual(count, 0);
  });

  await t.test('6. Local allowSelf dispatch accepted', () => {
    const router = createFreshnessRouter();
    let count = 0;
    router.subscribe('jobs', () => count++);
    const msg = createFreshnessMessage('jobs', 'update');
    msg.senderId = SENDER_ID;
    router.dispatch(msg, true); // allowSelf=true
    assert.strictEqual(count, 1);
  });

  await t.test('7. Domain-specific subscription', () => {
    const router = createFreshnessRouter();
    let jobsCount = 0;
    let otherCount = 0;
    router.subscribe('jobs', () => jobsCount++);
    // Assuming we could subscribe to 'companies' theoretically
    router.subscribe('companies', () => otherCount++);
    const msg = createFreshnessMessage('jobs', 'update');
    msg.senderId = 'other';
    router.dispatch(msg, false);
    assert.strictEqual(jobsCount, 1);
    assert.strictEqual(otherCount, 0);
  });

  await t.test('8. Unsubscribe prevents future callbacks', () => {
    const router = createFreshnessRouter();
    let count = 0;
    const unsub = router.subscribe('jobs', () => count++);
    const msg1 = createFreshnessMessage('jobs', 'update');
    msg1.senderId = 'other';
    router.dispatch(msg1, false);
    assert.strictEqual(count, 1);

    unsub();

    const msg2 = createFreshnessMessage('jobs', 'update');
    msg2.senderId = 'other';
    router.dispatch(msg2, false);
    assert.strictEqual(count, 1);
  });

  await t.test('9. Two subscribers each receive one callback', () => {
    const router = createFreshnessRouter();
    let c1 = 0;
    let c2 = 0;
    router.subscribe('jobs', () => c1++);
    router.subscribe('jobs', () => c2++);
    const msg = createFreshnessMessage('jobs', 'update');
    msg.senderId = 'other';
    router.dispatch(msg, false);
    assert.strictEqual(c1, 1);
    assert.strictEqual(c2, 1);
  });

  await t.test('10. One throwing listener does not block another', () => {
    const router = createFreshnessRouter();
    let c1 = 0;
    router.subscribe('jobs', () => { throw new Error('Boom'); });
    router.subscribe('jobs', () => c1++);
    const msg = createFreshnessMessage('jobs', 'update');
    msg.senderId = 'other';

    const originalConsoleError = console.error;
    console.error = () => {}; // suppress error output for test
    router.dispatch(msg, false);
    console.error = originalConsoleError;

    assert.strictEqual(c1, 1);
  });

  await t.test('11. Strict Mode-style subscribe/unsubscribe/subscribe', () => {
    const router = createFreshnessRouter();
    let count = 0;
    const cb = () => count++;

    const unsub1 = router.subscribe('jobs', cb);
    unsub1();
    const unsub2 = router.subscribe('jobs', cb);

    assert.strictEqual(router._getListenerCount(), 1);

    const msg = createFreshnessMessage('jobs', 'update');
    msg.senderId = 'other';
    router.dispatch(msg, false);

    assert.strictEqual(count, 1);
  });

  await t.test('12. Bounded deduper remains bounded', () => {
    const deduper = createMessageDeduper(5);
    const router = createFreshnessRouter({ deduper });
    let count = 0;
    router.subscribe('jobs', () => count++);

    for(let i=0; i<6; i++) {
      const msg = createFreshnessMessage('jobs', 'update');
      msg.senderId = 'other';
      msg.timestamp = Date.now() - 20000; // Force immediate expiry
      router.dispatch(msg, false);
    }

    assert.ok(deduper._getSize() <= 5);
  });
});
