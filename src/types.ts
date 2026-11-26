export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO datetime string
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus; // defaults to TODO
  dueDate?: string;
}
