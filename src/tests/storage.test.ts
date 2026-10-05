import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';

import { loadTodos, saveTodos } from '../utils/storage';
import { STORAGE_KEY } from '../types/todo';
import { todoArrayArb } from './arbitraries';

// Restore all mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('loadTodos — unit tests', () => {
  it('should return an empty array when localStorage has no data', () => {
    expect(loadTodos()).toEqual([]);
  });

  it('should return todos from localStorage when data is valid', () => {
    const todos = [
      {
        id: '1',
        title: 'Test',
        description: '',
        completed: false,
        priority: 'medium',
        dueDate: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    const result = loadTodos();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test');
  });

  it('should return empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');
    expect(loadTodos()).toEqual([]);
  });

  it('should return empty array when localStorage value is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: 'value' }));
    expect(loadTodos()).toEqual([]);
  });

  it('should filter out malformed todo items and return the valid ones', () => {
    const mixed = [
      { id: '1', title: 'Valid', description: '', completed: false, priority: 'medium', dueDate: '', createdAt: '', updatedAt: '' },
      { title: 'No ID' }, // missing required fields
      null,
      42,
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mixed));
    const result = loadTodos();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Valid');
  });

  it('should return empty array when localStorage throws on getItem', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    expect(loadTodos()).toEqual([]);
  });
});

describe('saveTodos — unit tests', () => {
  it('should write todos to localStorage', () => {
    const todos = [
      {
        id: '1',
        title: 'Saved',
        description: '',
        completed: false,
        priority: 'medium' as const,
        dueDate: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    saveTodos(todos);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('Saved');
  });

  it('should not throw when localStorage.setItem fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    expect(() => saveTodos([])).not.toThrow();
  });
});

// Feature: todo, Property 11: Persistence Round-Trip (JSON Serialization)
describe('storage round-trip — property tests', () => {
  it('Property 11: saveTodos then loadTodos returns structurally equivalent todos', () => {
    fc.assert(
      fc.property(todoArrayArb, (todos) => {
        localStorage.clear();
        saveTodos(todos);
        const loaded = loadTodos();
        expect(loaded).toHaveLength(todos.length);
        todos.forEach((original, i) => {
          expect(loaded[i].id).toBe(original.id);
          expect(loaded[i].title).toBe(original.title);
          expect(loaded[i].description).toBe(original.description);
          expect(loaded[i].completed).toBe(original.completed);
          expect(loaded[i].priority).toBe(original.priority);
          expect(loaded[i].dueDate).toBe(original.dueDate);
          expect(loaded[i].createdAt).toBe(original.createdAt);
          expect(loaded[i].updatedAt).toBe(original.updatedAt);
        });
      }),
      { numRuns: 100 }
    );
  });
});
