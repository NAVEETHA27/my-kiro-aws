import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

import { computeCounts } from '../utils/filters';
import type { Todo } from '../types/todo';
import { todoArrayArb } from './arbitraries';

function makeTodo(completed: boolean): Todo {
  return {
    id: crypto.randomUUID(),
    title: 'Task',
    description: '',
    completed,
    priority: 'medium',
    dueDate: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('computeCounts — unit tests', () => {
  it('should return zeros for empty list', () => {
    const counts = computeCounts([]);
    expect(counts.total).toBe(0);
    expect(counts.pending).toBe(0);
    expect(counts.completed).toBe(0);
  });

  it('should count a single pending todo', () => {
    const counts = computeCounts([makeTodo(false)]);
    expect(counts.total).toBe(1);
    expect(counts.pending).toBe(1);
    expect(counts.completed).toBe(0);
  });

  it('should count a single completed todo', () => {
    const counts = computeCounts([makeTodo(true)]);
    expect(counts.total).toBe(1);
    expect(counts.pending).toBe(0);
    expect(counts.completed).toBe(1);
  });

  it('should correctly count a mixed list', () => {
    const todos = [
      makeTodo(false),
      makeTodo(true),
      makeTodo(false),
      makeTodo(true),
      makeTodo(true),
    ];
    const counts = computeCounts(todos);
    expect(counts.total).toBe(5);
    expect(counts.pending).toBe(2);
    expect(counts.completed).toBe(3);
  });

  it('total should equal pending + completed for all-pending list', () => {
    const todos = [makeTodo(false), makeTodo(false), makeTodo(false)];
    const { total, pending, completed } = computeCounts(todos);
    expect(total).toBe(pending + completed);
    expect(completed).toBe(0);
  });

  it('total should equal pending + completed for all-completed list', () => {
    const todos = [makeTodo(true), makeTodo(true)];
    const { total, pending, completed } = computeCounts(todos);
    expect(total).toBe(pending + completed);
    expect(pending).toBe(0);
  });
});

// Feature: todo, Property 9: TaskCount Invariant
describe('computeCounts — property tests', () => {
  it('Property 9: total always equals pending + completed for any list', () => {
    fc.assert(
      fc.property(todoArrayArb, (todos) => {
        const { total, pending, completed } = computeCounts(todos);
        // Core invariant: total = pending + completed
        expect(total).toBe(pending + completed);
        // Sanity: no negative counts
        expect(total).toBeGreaterThanOrEqual(0);
        expect(pending).toBeGreaterThanOrEqual(0);
        expect(completed).toBeGreaterThanOrEqual(0);
        // Sanity: counts match actual list state
        expect(total).toBe(todos.length);
        expect(pending).toBe(todos.filter((t) => !t.completed).length);
        expect(completed).toBe(todos.filter((t) => t.completed).length);
      }),
      { numRuns: 200 }
    );
  });

  it('counts should update correctly after toggling any todo', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ completed: fc.boolean() }),
          { minLength: 1, maxLength: 20 }
        ),
        fc.integer({ min: 0, max: 19 }),
        (items, rawIndex) => {
          const todos: Todo[] = items.map((item, i) => ({
            id: String(i),
            title: 'T',
            description: '',
            completed: item.completed,
            priority: 'medium' as const,
            dueDate: '',
            createdAt: '',
            updatedAt: '',
          }));
          const index = rawIndex % todos.length;
          const beforeCounts = computeCounts(todos);
          // Toggle one todo
          const toggled = todos.map((t, i) =>
            i === index ? { ...t, completed: !t.completed } : t
          );
          const afterCounts = computeCounts(toggled);
          // Invariant still holds
          expect(afterCounts.total).toBe(afterCounts.pending + afterCounts.completed);
          // Toggle direction check
          if (todos[index].completed) {
            expect(afterCounts.completed).toBe(beforeCounts.completed - 1);
            expect(afterCounts.pending).toBe(beforeCounts.pending + 1);
          } else {
            expect(afterCounts.completed).toBe(beforeCounts.completed + 1);
            expect(afterCounts.pending).toBe(beforeCounts.pending - 1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
