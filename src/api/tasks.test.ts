// @vitest-environment jsdom
// The mock API only runs in the browser, so these tests use a simulated browser (jsdom).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  __resetTasks,
  __setFailRate,
  createTask,
  getTasks,
  updateTaskStatus,
} from './tasks';
import type { TaskStatus } from '@/types';

/** Runs an API call to completion, skipping the fake network delay. */
async function settle<T>(promise: Promise<T>): Promise<T> {
  // Attach a no-op handler so a rejection isn't reported as unhandled while timers run.
  promise.catch(() => {});
  await vi.runAllTimersAsync();
  return promise;
}

/** Runs an API call that should fail and returns the ApiError. */
async function settleError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await settle(promise);
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError;
  }
  throw new Error('Expected the call to fail, but it succeeded');
}

beforeEach(() => {
  vi.useFakeTimers();
  __resetTasks();
  __setFailRate(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  __setFailRate(null);
});

describe('getTasks', () => {
  it('returns the 12 seeded tasks', async () => {
    const tasks = await settle(getTasks());
    expect(tasks).toHaveLength(12);
  });

  it('returns copies, so changing the result does not change the stored tasks', async () => {
    const first = await settle(getTasks());
    first[0].title = 'Changed';
    first[0].status = 'DONE';
    first.pop();

    const second = await settle(getTasks());
    expect(second).toHaveLength(12);
    expect(second[0].title).not.toBe('Changed');
    expect(second[0].status).toBe('TODO');
  });

  it('waits between 300 and 800 ms', async () => {
    let done = false;
    getTasks().then(() => {
      done = true;
    });

    await vi.advanceTimersByTimeAsync(299);
    expect(done).toBe(false);

    await vi.advanceTimersByTimeAsync(501);
    expect(done).toBe(true);
  });
});

describe('createTask', () => {
  it.each(['', '   '])('rejects an empty title (%j) with status 400', async (title) => {
    const error = await settleError(createTask({ title }));
    expect(error.status).toBe(400);
  });

  it('rejects a title longer than 80 characters with status 400', async () => {
    const error = await settleError(createTask({ title: 'a'.repeat(81) }));
    expect(error.status).toBe(400);
  });

  it('accepts a title of exactly 80 characters', async () => {
    const task = await settle(createTask({ title: 'a'.repeat(80) }));
    expect(task.title).toHaveLength(80);
  });

  it('rejects an invalid status with status 400', async () => {
    const error = await settleError(
      createTask({ title: 'Valid', status: 'ARCHIVED' as TaskStatus }),
    );
    expect(error.status).toBe(400);
  });

  it.each(['2026-02-30', '2026-13-01', '28/02/2026', 'tomorrow', ''])(
    'rejects an invalid due date (%j) with status 400',
    async (dueDate) => {
      const error = await settleError(createTask({ title: 'Valid', dueDate }));
      expect(error.status).toBe(400);
    },
  );

  it('defaults status to TODO and fills in id and createdAt', async () => {
    const task = await settle(createTask({ title: '  New task  ', dueDate: '2027-03-01' }));

    expect(task.status).toBe('TODO');
    expect(task.title).toBe('New task');
    expect(task.dueDate).toBe('2027-03-01');
    expect(task.id).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(task.createdAt))).toBe(false);

    const tasks = await settle(getTasks());
    expect(tasks).toHaveLength(13);
  });

  it('does not fail randomly', async () => {
    __setFailRate(1);
    const task = await settle(createTask({ title: 'Still works' }));
    expect(task.title).toBe('Still works');
  });
});

describe('updateTaskStatus', () => {
  it('moves the task when the fail rate is 0', async () => {
    const [first] = await settle(getTasks());
    const updated = await settle(updateTaskStatus(first.id, 'DONE'));
    expect(updated.status).toBe('DONE');

    const tasks = await settle(getTasks());
    expect(tasks.find((t) => t.id === first.id)?.status).toBe('DONE');
  });

  it('always fails with status 503 when the fail rate is 1, and does not move the task', async () => {
    __setFailRate(1);
    const [first] = await settle(getTasks());

    for (let i = 0; i < 5; i++) {
      const error = await settleError(updateTaskStatus(first.id, 'DONE'));
      expect(error.status).toBe(503);
      expect(error.message).toBe('Network error: could not move task');
    }

    const tasks = await settle(getTasks());
    expect(tasks.find((t) => t.id === first.id)?.status).toBe(first.status);
  });

  it('rejects an unknown id with status 404', async () => {
    const error = await settleError(updateTaskStatus('does-not-exist', 'DONE'));
    expect(error.status).toBe(404);
  });

  it('reads the fail rate from the ?failRate= query param', async () => {
    __setFailRate(null);
    window.history.replaceState(null, '', '/?failRate=1');
    try {
      const error = await settleError(updateTaskStatus('task-01', 'DONE'));
      expect(error.status).toBe(503);

      window.history.replaceState(null, '', '/?failRate=0');
      const task = await settle(updateTaskStatus('task-01', 'DONE'));
      expect(task.status).toBe('DONE');
    } finally {
      window.history.replaceState(null, '', '/');
    }
  });
});

describe('browser-only guard', () => {
  it('throws a clear error when called outside the browser', async () => {
    vi.stubGlobal('window', undefined);
    await expect(getTasks()).rejects.toThrow(
      "The mock API runs in the browser only. Call it from a Client Component (add 'use client').",
    );
  });
});
