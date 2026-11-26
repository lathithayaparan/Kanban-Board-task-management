'use client';

import React, { useState } from 'react';
import { createTask, ApiError } from '@/api/tasks';
import type { Task } from '@/types';
import styles from '@/styles/kanban.module.css';

interface AddTaskFormProps {
  onTaskCreated: (task: Task) => void;
}

export function AddTaskForm({ onTaskCreated }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    // Validate title length
    if (trimmedTitle.length === 0) {
      setError('Title is required');
      return;
    }

    if (trimmedTitle.length > 80) {
      setError('Title must be 80 characters or fewer');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const newTask = await createTask({
        title: trimmedTitle,
        status: 'TODO',
      });
      setTitle('');
      onTaskCreated(newTask);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create task');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (error) {
      // Clear error on type if within valid bounds
      if (e.target.value.trim().length > 0 && e.target.value.trim().length <= 80) {
        setError(null);
      }
    }
  };

  return (
    <form className={styles.addTaskForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.addTaskInputRow}>
        <label htmlFor="new-task-title" className="sr-only">
          New task title
        </label>
        <input
          id="new-task-title"
          type="text"
          className={`${styles.addTaskInput} ${error ? styles.inputError : ''}`}
          placeholder="New task"
          value={title}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={100}
        />
        <button
          type="submit"
          className={styles.addTaskButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add task'}
        </button>
      </div>

      {error && (
        <p id="new-task-error" className={styles.fieldError} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
