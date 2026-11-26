import type { Task } from '@/types';

/**
 * The tasks the mock API starts with. They are restored every time the page
 * reloads.
 */
export const seedTasks: Task[] = [
  // TODO (5)
  {
    id: 'task-01',
    title: 'Set up CI pipeline',
    description: 'Run lint, tests and build on every pull request.',
    status: 'TODO',
    dueDate: '2026-12-04',
    createdAt: '2026-11-02T09:15:00.000Z',
  },
  {
    id: 'task-02',
    title: 'Write onboarding docs',
    description: 'Cover local setup, branching rules and how to deploy to staging.',
    status: 'TODO',
    dueDate: '2026-11-10',
    createdAt: '2026-11-03T10:40:00.000Z',
  },
  {
    id: 'task-03',
    title: 'Fix typo on pricing page',
    status: 'TODO',
    createdAt: '2026-11-05T14:05:00.000Z',
  },
  {
    id: 'task-04',
    title: 'Investigate why the nightly export job sometimes times out for large accounts',
    description: 'Started after the database upgrade. Check the query plan first.',
    status: 'TODO',
    dueDate: '2027-01-15',
    createdAt: '2026-11-06T08:30:00.000Z',
  },
  {
    id: 'task-05',
    title: 'Plan Q1 roadmap',
    status: 'TODO',
    dueDate: '2026-12-19',
    createdAt: '2026-11-08T16:20:00.000Z',
  },

  // IN_PROGRESS (4)
  {
    id: 'task-06',
    title: 'Add password reset flow',
    description: 'Email link expires after 30 minutes.',
    status: 'IN_PROGRESS',
    dueDate: '2026-11-14',
    createdAt: '2026-10-28T11:00:00.000Z',
  },
  {
    id: 'task-07',
    title: 'Migrate images to CDN',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-30T13:45:00.000Z',
  },
  {
    id: 'task-08',
    title: 'Review accessibility audit findings',
    description: 'Start with the colour contrast and keyboard navigation issues.',
    status: 'IN_PROGRESS',
    dueDate: '2026-12-01',
    createdAt: '2026-11-01T09:00:00.000Z',
  },
  {
    id: 'task-09',
    title: 'Refactor invoice service',
    status: 'IN_PROGRESS',
    createdAt: '2026-11-04T15:30:00.000Z',
  },

  // DONE (3)
  {
    id: 'task-10',
    title: 'Choose error tracking tool',
    description: 'Compared three options and picked the one with the best free tier.',
    status: 'DONE',
    dueDate: '2026-10-31',
    createdAt: '2026-10-20T10:10:00.000Z',
  },
  {
    id: 'task-11',
    title: 'Update dependencies',
    status: 'DONE',
    createdAt: '2026-10-22T12:00:00.000Z',
  },
  {
    id: 'task-12',
    title: 'Design new empty states',
    description: 'For the dashboard, search results and notifications.',
    status: 'DONE',
    createdAt: '2026-10-25T17:25:00.000Z',
  },
];
