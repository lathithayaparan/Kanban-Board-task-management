/**
 * Mock tasks API
 * ==============
 *
 * Do not modify this file. Treat it as an external API you cannot change.
 *
 * It behaves like a slow, slightly unreliable network API:
 * - Every call waits a random 300–800 ms before it resolves or rejects.
 * - `updateTaskStatus` fails randomly (20% of the time by default).
 * - Errors are thrown as `ApiError`, which has a `status` (400, 404 or 503).
 *
 * The data lives in memory in the browser and resets when the page reloads.
 * Every function returns copies, so changing a returned task does not change
 * the "server" data.
 *
 * Browser only: call these functions from Client Components ('use client').
 * Calling them on the server throws an error.
 *
 * Changing the failure rate (first match wins):
 *   1. URL query param, e.g. http://localhost:3000/?failRate=0.5 (0 to 1)
 *   2. Env var NEXT_PUBLIC_FAIL_RATE
 *   3. Default: 0.2
 */

import type { CreateTaskInput, Task, TaskStatus } from '@/types';
import { seedTasks } from './seed';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** The error every API function rejects with. */
export class ApiError extends Error {
  /** HTTP-style status code: 400 (bad input), 404 (not found) or 503 (network error). */
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Returns all tasks. Never fails. */
export async function getTasks(): Promise<Task[]> {
  assertBrowser();
  await randomDelay();
  return copy(tasks);
}

/**
 * Creates a task and returns it. Does not fail randomly.
 *
 * Rejects with `ApiError` status 400 if:
 * - `title` is empty (after trimming) or longer than 80 characters
 * - `status` is not a valid `TaskStatus`
 * - `dueDate` is not a valid YYYY-MM-DD date
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  assertBrowser();
  await randomDelay();

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (title.length === 0) {
    throw new ApiError(400, 'Title is required');
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new ApiError(400, `Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
  }
  if (input.status !== undefined && !isValidStatus(input.status)) {
    throw new ApiError(400, `Invalid status: ${String(input.status)}`);
  }
  if (input.dueDate !== undefined && !isValidDate(input.dueDate)) {
    throw new ApiError(400, 'Due date must be a valid date in YYYY-MM-DD format');
  }

  const task: Task = {
    id: crypto.randomUUID(),
    title,
    status: input.status ?? 'TODO',
    createdAt: new Date().toISOString(),
  };
  if (input.description !== undefined) task.description = input.description;
  if (input.dueDate !== undefined) task.dueDate = input.dueDate;

  tasks.push(task);
  return copy(task);
}

/**
 * Moves a task to another column and returns the updated task.
 *
 * Rejects with `ApiError`:
 * - status 503 at random, based on the failure rate ("Network error: could not move task")
 * - status 404 if no task has this id
 * - status 400 if `status` is not a valid `TaskStatus`
 */
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  assertBrowser();
  await randomDelay();

  if (Math.random() < getFailRate()) {
    throw new ApiError(503, 'Network error: could not move task');
  }
  if (!isValidStatus(status)) {
    throw new ApiError(400, `Invalid status: ${String(status)}`);
  }

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new ApiError(404, `Task not found: ${id}`);
  }

  task.status = status;
  return copy(task);
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/**
 * Test helper, do not use in the app.
 * Overrides the failure rate (0 to 1). Pass `null` to go back to the normal rules.
 */
export function __setFailRate(rate: number | null): void {
  failRateOverride = rate;
}

/**
 * Test helper, do not use in the app.
 * Restores the seed tasks.
 */
export function __resetTasks(): void {
  tasks = copy(seedTasks);
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const MAX_TITLE_LENGTH = 80;
const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;
const DEFAULT_FAIL_RATE = 0.2;
const VALID_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

/** The "server" data. Never hand this out directly; always return copies. */
let tasks: Task[] = copy(seedTasks);
let failRateOverride: number | null = null;

function assertBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error(
      "The mock API runs in the browser only. Call it from a Client Component (add 'use client').",
    );
  }
}

function randomDelay(): Promise<void> {
  const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFailRate(): number {
  if (failRateOverride !== null) return failRateOverride;

  const fromUrl = parseRate(new URLSearchParams(window.location.search).get('failRate'));
  if (fromUrl !== null) return fromUrl;

  const fromEnv = parseRate(process.env.NEXT_PUBLIC_FAIL_RATE);
  if (fromEnv !== null) return fromEnv;

  return DEFAULT_FAIL_RATE;
}

/** Turns "0.5" into 0.5. Returns null for missing or invalid values (not a number, or outside 0–1). */
function parseRate(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === '') return null;
  const rate = Number(value);
  if (Number.isNaN(rate) || rate < 0 || rate > 1) return null;
  return rate;
}

function isValidStatus(value: unknown): value is TaskStatus {
  return VALID_STATUSES.includes(value as TaskStatus);
}

/** True for real calendar dates like "2026-02-28", false for "2026-02-30" or "28/02/2026". */
function isValidDate(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function copy<T>(value: T): T {
  return structuredClone(value);
}
