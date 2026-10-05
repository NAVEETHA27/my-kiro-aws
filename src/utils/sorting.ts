import type { Todo } from '../types/todo';

/**
 * Sorts todos by createdAt descending (newest first).
 * Returns a new array — does not mutate the input.
 */
export function sortByCreatedAt(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    // ISO datetime strings sort lexicographically in the same order as chronological
    if (a.createdAt < b.createdAt) return 1;
    if (a.createdAt > b.createdAt) return -1;
    return 0;
  });
}
