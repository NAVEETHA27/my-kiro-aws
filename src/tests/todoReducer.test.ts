import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

import { todoReducer } from '../reducers/todoReducer';
import type { TodoState, TodoFormValues } from '../types/todo';
import { todoFormValuesArb, nonEmptyTodoArrayArb, todoArb } from './arbitraries';

function makeInitialState(): TodoState {
  return { todos: [], filter: 'all', searchQuery: '' };
}

function makeValues(overrides: Partial<TodoFormValues> = {}): TodoFormValues {
  return {
    title: 'Test todo',
    description: '',
    priority: 'medium',
    dueDate: '',
    ...overrides,
  };
}

describe('todoReducer — unit tests', () => {
  it('should create a todo with correct fields', () => {
    const state = todoReducer(makeInitialState(), {
      type: 'CREATE_TODO',
      payload: makeValues({ title: 'Buy milk', priority: 'high', dueDate: '2025-12-31' }),
    });
    expect(state.todos).toHaveLength(1);
    const todo = state.todos[0];
    expect(todo.title).toBe('Buy milk');
    expect(todo.priority).toBe('high');
    expect(todo.dueDate).toBe('2025-12-31');
    expect(todo.completed).toBe(false);
    expect(typeof todo.id).toBe('string');
    expect(todo.id.length).toBeGreaterThan(0);
    expect(typeof todo.createdAt).toBe('string');
  });

  it('should trim whitespace from title on create', () => {
    const state = todoReducer(makeInitialState(), {
      type: 'CREATE_TODO',
      payload: makeValues({ title: '  Padded title  ' }),
    });
    expect(state.todos[0].title).toBe('Padded title');
  });

  it('should prepend new todos (newest first)', () => {
    let state = todoReducer(makeInitialState(), {
      type: 'CREATE_TODO',
      payload: makeValues({ title: 'First' }),
    });
    state = todoReducer(state, {
      type: 'CREATE_TODO',
      payload: makeValues({ title: 'Second' }),
    });
    expect(state.todos[0].title).toBe('Second');
    expect(state.todos[1].title).toBe('First');
  });

  it('should update a todo by id', () => {
    let state = todoReducer(makeInitialState(), {
      type: 'CREATE_TODO',
      payload: makeValues({ title: 'Original' }),
    });
    const id = state.todos[0].id;
    state = todoReducer(state, {
      type: 'UPDATE_TODO',
      payload: { id, values: makeValues({ title: 'Updated', priority: 'low' }) },
    });
    expect(state.todos[0].title).toBe('Updated');
    expect(state.todos[0].priority).toBe('low');
  });

  it('should delete a todo by id', () => {
    let state = todoReducer(makeInitialState(), {
      type: 'CREATE_TODO',
      payload: makeValues({ title: 'To delete' }),
    });
    const id = state.todos[0].id;
    state = todoReducer(state, { type: 'DELETE_TODO', payload: { id } });
    expect(state.todos).toHaveLength(0);
  });

  it('should toggle a todo from pending to completed', () => {
    let state = todoReducer(makeInitialState(), {
      type: 'CREATE_TODO',
      payload: makeValues(),
    });
    const id = state.todos[0].id;
    expect(state.todos[0].completed).toBe(false);
    state = todoReducer(state, { type: 'TOGGLE_TODO', payload: { id } });
    expect(state.todos[0].completed).toBe(true);
  });

  it('should toggle a todo from completed back to pending', () => {
    let state = todoReducer(makeInitialState(), {
      type: 'CREATE_TODO',
      payload: makeValues(),
    });
    const id = state.todos[0].id;
    state = todoReducer(state, { type: 'TOGGLE_TODO', payload: { id } });
    state = todoReducer(state, { type: 'TOGGLE_TODO', payload: { id } });
    expect(state.todos[0].completed).toBe(false);
  });

  it('should set the filter', () => {
    let state = todoReducer(makeInitialState(), {
      type: 'SET_FILTER',
      payload: { filter: 'completed' },
    });
    expect(state.filter).toBe('completed');
    state = todoReducer(state, { type: 'SET_FILTER', payload: { filter: 'pending' } });
    expect(state.filter).toBe('pending');
  });

  it('should set the search query', () => {
    const state = todoReducer(makeInitialState(), {
      type: 'SET_SEARCH',
      payload: { query: 'groceries' },
    });
    expect(state.searchQuery).toBe('groceries');
  });

  it('should not mutate original state', () => {
    const original = makeInitialState();
    const next = todoReducer(original, {
      type: 'CREATE_TODO',
      payload: makeValues(),
    });
    expect(original.todos).toHaveLength(0);
    expect(next.todos).toHaveLength(1);
  });
});

// Feature: todo, Property 1: Todo Creation Round-Trip
describe('todoReducer — property tests', () => {
  it('Property 1: created todo fields match the provided form values', () => {
    fc.assert(
      fc.property(todoFormValuesArb, (values) => {
        const state = todoReducer(makeInitialState(), { type: 'CREATE_TODO', payload: values });
        expect(state.todos).toHaveLength(1);
        const todo = state.todos[0];
        expect(todo.title).toBe(values.title.trim());
        expect(todo.description).toBe(values.description.trim());
        expect(todo.priority).toBe(values.priority);
        expect(todo.dueDate).toBe(values.dueDate);
        expect(todo.completed).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: todo, Property 7: Toggle Completion Is a Round-Trip
  it('Property 7: toggling a todo twice restores its original completed state', () => {
    fc.assert(
      fc.property(todoArb, (todo) => {
        const initialCompleted = todo.completed;
        const stateWithTodo: TodoState = { todos: [todo], filter: 'all', searchQuery: '' };
        const afterFirst = todoReducer(stateWithTodo, { type: 'TOGGLE_TODO', payload: { id: todo.id } });
        const afterSecond = todoReducer(afterFirst, { type: 'TOGGLE_TODO', payload: { id: todo.id } });
        expect(afterSecond.todos[0].completed).toBe(initialCompleted);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: todo, Property 8: Delete Removes Exactly One Todo
  it('Property 8: deleting a todo reduces the list by exactly 1 and removes it', () => {
    fc.assert(
      fc.property(nonEmptyTodoArrayArb, (todos) => {
        // Pick the first todo to delete
        const target = todos[0];
        const state: TodoState = { todos, filter: 'all', searchQuery: '' };
        const next = todoReducer(state, { type: 'DELETE_TODO', payload: { id: target.id } });
        expect(next.todos).toHaveLength(todos.length - 1);
        expect(next.todos.find((t) => t.id === target.id)).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('creating N todos results in exactly N todos in state', () => {
    fc.assert(
      fc.property(fc.array(todoFormValuesArb, { minLength: 1, maxLength: 10 }), (valuesList) => {
        let state = makeInitialState();
        for (const values of valuesList) {
          state = todoReducer(state, { type: 'CREATE_TODO', payload: values });
        }
        expect(state.todos).toHaveLength(valuesList.length);
      }),
      { numRuns: 100 }
    );
  });

  it('all todo IDs are unique after multiple creates', () => {
    fc.assert(
      fc.property(fc.array(todoFormValuesArb, { minLength: 2, maxLength: 15 }), (valuesList) => {
        let state = makeInitialState();
        for (const values of valuesList) {
          state = todoReducer(state, { type: 'CREATE_TODO', payload: values });
        }
        const ids = state.todos.map((t) => t.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
      }),
      { numRuns: 100 }
    );
  });
});
