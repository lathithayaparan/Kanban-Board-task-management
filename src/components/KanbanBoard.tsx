'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Task, TaskStatus } from '@/types';
import { getTasks, updateTaskStatus, ApiError } from '@/api/tasks';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchInput } from './SearchInput';
import { Column } from './Column';
import { AddTaskForm } from './AddTaskForm';
import styles from '@/styles/kanban.module.css';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'To do' },
  { status: 'IN_PROGRESS', title: 'In progress' },
  { status: 'DONE', title: 'Done' },
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

  // Search input state and custom 300ms debounced value
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Initial fetch of tasks on client component mount
  useEffect(() => {
    let isMounted = true;

    async function fetchTasks() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await getTasks();
        if (isMounted) {
          setTasks(data);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(
            err instanceof ApiError ? err.message : 'Failed to load tasks. Please refresh.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter tasks based on debounced search query
  const filteredTasks = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter((task) => task.title.toLowerCase().includes(query));
  }, [tasks, debouncedSearch]);

  // Handle optimistic moves with automatic rollback on failure
  const handleMoveTask = async (taskId: string, targetStatus: TaskStatus) => {
    const taskToMove = tasks.find((t) => t.id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) return;

    const originalStatus = taskToMove.status;

    // Optimistically update card position
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );
    setMovingTaskId(taskId);
    setActionError(null);

    try {
      const updatedTask = await updateTaskStatus(taskId, targetStatus);
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
      );
    } catch (err) {
      // Rollback to original status if the API call fails
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, status: originalStatus } : t))
      );

      const message =
        err instanceof ApiError
          ? err.message
          : 'Network error: could not move task';
      setActionError(message);
    } finally {
      setMovingTaskId(null);
    }
  };

  // Handle adding a newly created task
  const handleTaskCreated = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setActionError(null);
  };

  return (
    <div className={styles.boardWrapper}>
      <header className={styles.boardHeader}>
        <h1 className={styles.boardTitle}>Task Board</h1>
      </header>

      {/* Global action error notification (with rollback feedback) */}
      {actionError && (
        <div className={styles.errorBanner} role="alert" aria-live="assertive">
          <span>{actionError}</span>
          <button
            type="button"
            className={styles.dismissErrorButton}
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Search Input with 300ms debounce */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        disabled={isLoading}
      />

      {/* Initial loading state */}
      {isLoading ? (
        <div className={styles.loadingContainer} aria-busy="true">
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.loadingText}>Loading tasks...</p>
        </div>
      ) : loadError ? (
        <div className={styles.loadErrorContainer} role="alert">
          <p>{loadError}</p>
        </div>
      ) : (
        /* 3-column responsive Kanban grid */
        <main className={styles.columnsContainer}>
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.status === column.status
            );

            return (
              <Column
                key={column.status}
                status={column.status}
                title={column.title}
                tasks={columnTasks}
                onMoveTask={handleMoveTask}
                movingTaskId={movingTaskId}
              >
                {column.status === 'TODO' && (
                  <AddTaskForm onTaskCreated={handleTaskCreated} />
                )}
              </Column>
            );
          })}
        </main>
      )}
    </div>
  );
}
