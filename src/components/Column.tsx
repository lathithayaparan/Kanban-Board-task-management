'use client';

import React from 'react';
import type { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import styles from '@/styles/kanban.module.css';

interface ColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onMoveTask: (taskId: string, targetStatus: TaskStatus) => void;
  movingTaskId: string | null;
  children?: React.ReactNode; // For inline form in TODO column
}

export function Column({
  status,
  title,
  tasks,
  onMoveTask,
  movingTaskId,
  children,
}: ColumnProps) {
  return (
    <section className={styles.column} aria-labelledby={`column-header-${status}`}>
      <div className={styles.columnHeader}>
        <h2 id={`column-header-${status}`} className={styles.columnTitle}>
          {title} <span className={styles.columnCount}>({tasks.length})</span>
        </h2>
      </div>

      {children && <div className={styles.columnHeaderAction}>{children}</div>}

      <div className={styles.taskList} role="list">
        {tasks.map((task) => (
          <div key={task.id} role="listitem">
            <TaskCard
              task={task}
              onMove={onMoveTask}
              isMoving={movingTaskId === task.id}
            />
          </div>
        ))}

        {tasks.length === 0 && (
          <p className={styles.emptyColumn}>No tasks</p>
        )}
      </div>
    </section>
  );
}
