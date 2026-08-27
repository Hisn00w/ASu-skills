import assert from 'node:assert/strict';
import test from 'node:test';

import { apply } from '../lib/index.js';

test('reports rejected loader creation promises', async () => {
  const errors = [];
  const originalError = console.error;
  let cleanup;

  console.error = (...args) => errors.push(args);
  try {
    const ctx = {
      effect(effect) {
        cleanup = effect();
      },
      loader: {
        create: async () => {
          throw new Error('loader unavailable');
        },
        remove() {},
      },
    };

    apply(ctx);
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(errors.length, 1);
    assert.match(errors[0][0], /Failed to load @deepseek-ai\/dsh-skill-filesystem for asu-skills/);
    assert.equal(errors[0][1].message, 'loader unavailable');
  } finally {
    cleanup?.();
    console.error = originalError;
  }
});
