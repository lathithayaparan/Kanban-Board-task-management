'use client';

import React from 'react';
import type { Task, TaskStatus } from '@/types';
import styles from '@/styles/kanban.module.css';

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, targetStatus: TaskStatus) => void;
  isMoving?: boolean;
}

export function TaskCard({ task, onMove, isMoving = false }: TaskCardProps) {
  return (
    <article className={styles.taskCard}>
      <h3 className={styles.cardTitle}>{task.title}</h3>

      {task.description && (
        <p className={styles.cardDescription}>{task.description}</p>
      )}

      {task.dueDate && (
        <p className={styles.cardDueDate}>Due {task.dueDate}</p>
      )}

      <div className={styles.cardActions}>
        {task.status !== 'TODO' && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onMove(task.id, 'TODO')}
            disabled={isMoving}
            aria-label={`Move "${task.title}" to To do`}
          >
            Move to To do
          </button>
        )}

        {task.status !== 'IN_PROGRESS' && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onMove(task.id, 'IN_PROGRESS')}
            disabled={isMoving}
            aria-label={`Move "${task.title}" to In progress`}
          >
            Move to In progress
          </button>
        )}

        {task.status !== 'DONE' && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onMove(task.id, 'DONE')}
            disabled={isMoving}
            aria-label={`Move "${task.title}" to Done`}
          >
            Move to Done
          </button>
        )}
      </div>
    </article>
  );
}
