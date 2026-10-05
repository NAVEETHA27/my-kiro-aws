// Core priority levels for a Todo
export type Priority = 'low' | 'medium' | 'high';

// Filter options for the Todo list view
export type TodoFilter = 'all' | 'pending' | 'completed';

// The core Todo entity stored in the application
export interface Todo {
  id: string;           // UUID v4
  title: string;        // non-empty string
  description: string;  // optional detail text (empty string when not provided)
  completed: boolean;
  priority: Priority;
  dueDate: string;      // ISO date YYYY-MM-DD, empty string when not set
  createdAt: string;    // ISO datetime string
  updatedAt: string;    // ISO datetime string
}

// Form values submitted by the user (no system-managed fields)
export interface TodoFormValues {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // '' when not set
}

// Result returned by the validator
export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof TodoFormValues, string>>;
}

// The full application state managed by useReducer
export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
  searchQuery: string;
}

// All actions that can be dispatched to the reducer
export type TodoAction =
  | { type: 'CREATE_TODO'; payload: TodoFormValues }
  | { type: 'UPDATE_TODO'; payload: { id: string; values: TodoFormValues } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'SET_FILTER'; payload: { filter: TodoFilter } }
  | { type: 'SET_SEARCH'; payload: { query: string } };

// Task count summary derived from the todo list
export interface TaskCounts {
  total: number;
  pending: number;
  completed: number;
}

// localStorage key — defined as a constant to avoid magic strings
export const STORAGE_KEY = 'kiro-todos';
