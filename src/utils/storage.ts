import type { Todo } from '../types/todo';
import { STORAGE_KEY } from '../types/todo';

/**
 * Type guard: checks that a value looks like a Todo object.
 * Protects against corrupted or migrated localStorage data.
 */
function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    typeof obj['title'] === 'string' &&
    typeof obj['completed'] === 'boolean' &&
    (obj['priority'] === 'low' || obj['priority'] === 'medium' || obj['priority'] === 'high') &&
    typeof obj['createdAt'] === 'string' &&
    typeof obj['updatedAt'] === 'string'
  );
}

/**
 * Loads todos from localStorage.
 * Returns an empty array if localStorage is unavailable, empty, or contains
 * invalid/corrupted data. Individual malformed items are filtered out.
 */
export function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      console.warn('[TodoStore] localStorage data is not an array — resetting.');
      return [];
    }

    const valid = parsed.filter((item): item is Todo => {
      const ok = isTodo(item);
      if (!ok) console.warn('[TodoStore] Filtered out malformed todo item:', item);
      return ok;
    });

    return valid;
  } catch (error) {
    console.error('[TodoStore] Failed to load todos from localStorage:', error);
    return [];
  }
}

/**
 * Saves todos to localStorage.
 * Logs an error if writing fails (e.g., private browsing, storage quota exceeded)
 * but does not propagate the error — the app continues to function.
 */
export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('[TodoStore] Failed to save todos to localStorage:', error);
  }
}
