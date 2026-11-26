'use client';

import React from 'react';
import styles from '@/styles/kanban.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SearchInput({ value, onChange, disabled }: SearchInputProps) {
  return (
    <div className={styles.searchContainer}>
      <label htmlFor="task-search-input" className={styles.searchLabel}>
        Search tasks
      </label>
      <input
        id="task-search-input"
        type="search"
        className={styles.searchInput}
        placeholder="Filter by title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Filter tasks by title"
      />
    </div>
  );
}
