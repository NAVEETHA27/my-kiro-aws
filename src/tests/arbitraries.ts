/**
 * Reusable fast-check arbitraries for the Kiro Todo List test suite.
 * Import these in test files instead of redefining them.
 */
import * as fc from 'fast-check';
import type { Priority, Todo, TodoFormValues } from '../types/todo';
import { todoReducer } from '../reducers/todoReducer';

// Non-empty, non-whitespace title
export const titleArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

// Whitespace-only string (spaces, tabs, newlines, non-breaking space)
export const whitespaceArb = fc.stringOf(
  fc.constantFrom(' ', '\t', '\n', '\r', '\u00A0'),
  { minLength: 1 }
);

// Valid ISO date string YYYY-MM-DD
export const isoDateArb = fc
  .date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })
  .map((d) => d.toISOString().slice(0, 10));

// Priority values
export const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high');

// Optional description (can be empty string)
export const descriptionArb = fc.oneof(fc.constant(''), fc.string());

// Optional due date (can be empty string or valid ISO date)
export const optionalDueDateArb = fc.oneof(fc.constant(''), isoDateArb);

// Valid TodoFormValues
export const todoFormValuesArb: fc.Arbitrary<TodoFormValues> = fc.record({
  title: titleArb,
  description: descriptionArb,
  priority: priorityArb,
  dueDate: optionalDueDateArb,
});

// Build a single Todo from TodoFormValues using the reducer (ensures UUID and timestamps)
export const todoArb: fc.Arbitrary<Todo> = todoFormValuesArb.map((values) => {
  const initialState = { todos: [], filter: 'all' as const, searchQuery: '' };
  const newState = todoReducer(initialState, { type: 'CREATE_TODO', payload: values });
  return newState.todos[0];
});

// Array of todos (possibly empty)
export const todoArrayArb: fc.Arbitrary<Todo[]> = fc.array(todoArb, { maxLength: 20 });

// Non-empty array of todos
export const nonEmptyTodoArrayArb: fc.Arbitrary<Todo[]> = fc.array(todoArb, {
  minLength: 1,
  maxLength: 20,
});
