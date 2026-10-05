import type { Todo, TodoFilter, TaskCounts } from '../types/todo';

/**
 * Filters a list of todos by the given filter value.
 * 'all' returns the full list unchanged.
 * 'pending' returns only incomplete todos.
 * 'completed' returns only completed todos.
 */
export function applyFilter(todos: Todo[], filter: TodoFilter): Todo[] {
  switch (filter) {
    case 'all':
      return todos;
    case 'pending':
      return todos.filter((t) => !t.completed);
    case 'completed':
      return todos.filter((t) => t.completed);
  }
}

/**
 * Filters todos whose title or description contains the search query.
 * The match is case-insensitive.
 * An empty query returns the input list unchanged.
 */
export function applySearch(todos: Todo[], query: string): Todo[] {
  if (query.trim() === '') return todos;
  const lower = query.toLowerCase();
  return todos.filter(
    (t) =>
      t.title.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower)
  );
}

/**
 * Computes total, pending, and completed counts from the full todos list.
 * Always satisfies the invariant: total === pending + completed.
 */
export function computeCounts(todos: Todo[]): TaskCounts {
  const completed = todos.filter((t) => t.completed).length;
  return {
    total: todos.length,
    pending: todos.length - completed,
    completed,
  };
}
