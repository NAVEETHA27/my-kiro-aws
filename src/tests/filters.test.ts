import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

import { applyFilter, applySearch, computeCounts } from '../utils/filters';
import { sortByCreatedAt } from '../utils/sorting';
import type { Todo } from '../types/todo';
import { todoArrayArb, todoArb, titleArb } from './arbitraries';

// ── Helper: build a simple Todo for unit tests ────────────────────────────────
function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: crypto.randomUUID(),
    title: 'Test',
    description: '',
    completed: false,
    priority: 'medium',
    dueDate: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── applyFilter unit tests ────────────────────────────────────────────────────
describe('applyFilter — unit tests', () => {
  it('should return all todos when filter is "all"', () => {
    const todos = [makeTodo({ completed: false }), makeTodo({ completed: true })];
    expect(applyFilter(todos, 'all')).toHaveLength(2);
  });

  it('should return only pending todos when filter is "pending"', () => {
    const todos = [makeTodo({ completed: false }), makeTodo({ completed: true })];
    const result = applyFilter(todos, 'pending');
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(false);
  });

  it('should return only completed todos when filter is "completed"', () => {
    const todos = [makeTodo({ completed: false }), makeTodo({ completed: true })];
    const result = applyFilter(todos, 'completed');
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(true);
  });

  it('should return empty array when no todos match the filter', () => {
    const todos = [makeTodo({ completed: false })];
    expect(applyFilter(todos, 'completed')).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    expect(applyFilter([], 'all')).toHaveLength(0);
  });
});

// ── applySearch unit tests ────────────────────────────────────────────────────
describe('applySearch — unit tests', () => {
  it('should return all todos when query is empty', () => {
    const todos = [makeTodo({ title: 'Buy milk' })];
    expect(applySearch(todos, '')).toHaveLength(1);
  });

  it('should match title case-insensitively', () => {
    const todos = [makeTodo({ title: 'Buy MILK' }), makeTodo({ title: 'call doctor' })];
    const result = applySearch(todos, 'milk');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Buy MILK');
  });

  it('should match description case-insensitively', () => {
    const todos = [makeTodo({ description: 'Whole milk preferred' })];
    const result = applySearch(todos, 'WHOLE');
    expect(result).toHaveLength(1);
  });

  it('should return empty when no match', () => {
    const todos = [makeTodo({ title: 'Buy milk' })];
    expect(applySearch(todos, 'zzz-nomatch')).toHaveLength(0);
  });

  it('should return all todos when query is whitespace only', () => {
    const todos = [makeTodo({ title: 'Buy milk' })];
    expect(applySearch(todos, '   ')).toHaveLength(1);
  });
});

// ── sortByCreatedAt unit tests ────────────────────────────────────────────────
describe('sortByCreatedAt — unit tests', () => {
  it('should sort todos newest first', () => {
    const older = makeTodo({ createdAt: '2024-01-01T00:00:00.000Z' });
    const newer = makeTodo({ createdAt: '2024-06-01T00:00:00.000Z' });
    const result = sortByCreatedAt([older, newer]);
    expect(result[0].createdAt).toBe('2024-06-01T00:00:00.000Z');
  });

  it('should not mutate the input array', () => {
    const todos = [
      makeTodo({ createdAt: '2024-01-01T00:00:00.000Z' }),
      makeTodo({ createdAt: '2024-06-01T00:00:00.000Z' }),
    ];
    sortByCreatedAt(todos);
    expect(todos[0].createdAt).toBe('2024-01-01T00:00:00.000Z');
  });
});

// ── computeCounts unit tests ──────────────────────────────────────────────────
describe('computeCounts — unit tests', () => {
  it('should return all zeros for an empty list', () => {
    const counts = computeCounts([]);
    expect(counts).toEqual({ total: 0, pending: 0, completed: 0 });
  });

  it('should correctly count mixed todos', () => {
    const todos = [
      makeTodo({ completed: false }),
      makeTodo({ completed: true }),
      makeTodo({ completed: false }),
    ];
    const counts = computeCounts(todos);
    expect(counts.total).toBe(3);
    expect(counts.pending).toBe(2);
    expect(counts.completed).toBe(1);
  });
});

// ── Property-based tests ──────────────────────────────────────────────────────

// Feature: todo, Property 4: Filter Returns Correct Subset
describe('applyFilter — property tests', () => {
  it('Property 4: filtered result is always a subset matching the predicate', () => {
    fc.assert(
      fc.property(
        todoArrayArb,
        fc.constantFrom<'all' | 'pending' | 'completed'>('all', 'pending', 'completed'),
        (todos, filter) => {
          const result = applyFilter(todos, filter);
          // Result must be a subset of input
          result.forEach((t) => {
            expect(todos.some((orig) => orig.id === t.id)).toBe(true);
          });
          // All items satisfying the predicate must be in the result
          if (filter === 'pending') {
            const pending = todos.filter((t) => !t.completed);
            expect(result).toHaveLength(pending.length);
          } else if (filter === 'completed') {
            const completed = todos.filter((t) => t.completed);
            expect(result).toHaveLength(completed.length);
          } else {
            expect(result).toHaveLength(todos.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: todo, Property 5: Search Returns Matching Subset
describe('applySearch — property tests', () => {
  it('Property 5: search result is always a subset where every item matches the query', () => {
    fc.assert(
      fc.property(todoArrayArb, fc.string({ minLength: 1, maxLength: 10 }), (todos, query) => {
        const result = applySearch(todos, query);
        const lower = query.toLowerCase();
        // Every result item must actually match
        result.forEach((t) => {
          const matches =
            t.title.toLowerCase().includes(lower) ||
            t.description.toLowerCase().includes(lower);
          expect(matches).toBe(true);
        });
        // Result must be a subset of input
        result.forEach((t) => {
          expect(todos.some((orig) => orig.id === t.id)).toBe(true);
        });
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: todo, Property 6: Filter+Search Confluence
describe('filter+search confluence — property tests', () => {
  it('Property 6: applySearch(applyFilter(todos, f), q) === applyFilter(applySearch(todos, q), f)', () => {
    fc.assert(
      fc.property(
        todoArrayArb,
        fc.constantFrom<'all' | 'pending' | 'completed'>('all', 'pending', 'completed'),
        fc.string({ minLength: 0, maxLength: 10 }),
        (todos, filter, query) => {
          const filterFirst = applySearch(applyFilter(todos, filter), query);
          const searchFirst = applyFilter(applySearch(todos, query), filter);
          // Both orderings should produce the same set of IDs
          const idsA = filterFirst.map((t) => t.id).sort();
          const idsB = searchFirst.map((t) => t.id).sort();
          expect(idsA).toEqual(idsB);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: todo, Property 9: TaskCount Invariant
describe('computeCounts — property tests', () => {
  it('Property 9: total always equals pending + completed', () => {
    fc.assert(
      fc.property(todoArrayArb, (todos) => {
        const { total, pending, completed } = computeCounts(todos);
        expect(total).toBe(pending + completed);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: todo, Property 10: Sort Order Invariant
describe('sortByCreatedAt — property tests', () => {
  it('Property 10: sorted list is in non-increasing createdAt order and contains same items', () => {
    fc.assert(
      fc.property(todoArrayArb, (todos) => {
        const sorted = sortByCreatedAt(todos);
        // Same length
        expect(sorted).toHaveLength(todos.length);
        // Same IDs (set equality)
        const origIds = todos.map((t) => t.id).sort();
        const sortedIds = sorted.map((t) => t.id).sort();
        expect(sortedIds).toEqual(origIds);
        // Non-increasing order
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].createdAt <= sorted[i - 1].createdAt).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('search result always contains items matching the query (including from generated todos)', () => {
    fc.assert(
      fc.property(todoArb, titleArb, (todo, searchTitle) => {
        // Create a todo whose title starts with searchTitle to guarantee a match
        const matchingTodo = { ...todo, title: searchTitle + ' extra', description: '' };
        const todos = [matchingTodo, todo];
        const query = searchTitle.slice(0, Math.max(1, Math.floor(searchTitle.length / 2)));
        if (query.trim().length === 0) return; // skip if query is whitespace
        const result = applySearch(todos, query);
        // At a minimum, matchingTodo should appear if query matches its title
        const lower = query.toLowerCase();
        if (matchingTodo.title.toLowerCase().includes(lower)) {
          expect(result.some((t) => t.id === matchingTodo.id)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
