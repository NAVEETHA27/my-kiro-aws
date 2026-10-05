import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

import { validateTodoForm } from '../utils/validation';
import type { TodoFormValues } from '../types/todo';
import { titleArb, whitespaceArb, isoDateArb, priorityArb, optionalDueDateArb } from './arbitraries';

function makeValues(overrides: Partial<TodoFormValues> = {}): TodoFormValues {
  return {
    title: 'Buy groceries',
    description: '',
    priority: 'medium',
    dueDate: '',
    ...overrides,
  };
}

describe('validateTodoForm — unit tests', () => {
  it('should return valid for a normal title and no due date', () => {
    const result = validateTodoForm(makeValues({ title: 'Buy groceries' }));
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should return valid for a title with leading/trailing spaces (trimmed)', () => {
    // The form trims on submit; validator should accept trimmed length > 0
    const result = validateTodoForm(makeValues({ title: '  valid title  ' }));
    expect(result.valid).toBe(true);
  });

  it('should reject an empty title', () => {
    const result = validateTodoForm(makeValues({ title: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeTruthy();
  });

  it('should reject a whitespace-only title (single space)', () => {
    const result = validateTodoForm(makeValues({ title: ' ' }));
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeTruthy();
  });

  it('should reject a whitespace-only title (tabs and newlines)', () => {
    const result = validateTodoForm(makeValues({ title: '\t\n  \t' }));
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeTruthy();
  });

  it('should return valid when dueDate is empty string (optional)', () => {
    const result = validateTodoForm(makeValues({ dueDate: '' }));
    expect(result.valid).toBe(true);
    expect(result.errors.dueDate).toBeUndefined();
  });

  it('should return valid for a well-formed dueDate', () => {
    const result = validateTodoForm(makeValues({ dueDate: '2025-12-31' }));
    expect(result.valid).toBe(true);
  });

  it('should reject a dueDate that is not in YYYY-MM-DD format', () => {
    const result = validateTodoForm(makeValues({ dueDate: 'not-a-date' }));
    expect(result.valid).toBe(false);
    expect(result.errors.dueDate).toBeTruthy();
  });

  it('should reject a dueDate with wrong format (DD-MM-YYYY)', () => {
    const result = validateTodoForm(makeValues({ dueDate: '31-12-2025' }));
    expect(result.valid).toBe(false);
    expect(result.errors.dueDate).toBeTruthy();
  });

  it('should reject a dueDate that is not a valid calendar date (2024-02-30)', () => {
    const result = validateTodoForm(makeValues({ dueDate: '2024-02-30' }));
    expect(result.valid).toBe(false);
    expect(result.errors.dueDate).toBeTruthy();
  });

  it('should reject a dueDate with invalid month (2024-13-01)', () => {
    const result = validateTodoForm(makeValues({ dueDate: '2024-13-01' }));
    expect(result.valid).toBe(false);
    expect(result.errors.dueDate).toBeTruthy();
  });
});

// Feature: todo, Property 2: Whitespace Title Is Always Invalid
describe('validateTodoForm — property tests', () => {
  it('Property 2: any whitespace-only title should always be invalid', () => {
    fc.assert(
      fc.property(whitespaceArb, (ws) => {
        const result = validateTodoForm(makeValues({ title: ws }));
        expect(result.valid).toBe(false);
        expect(typeof result.errors.title).toBe('string');
        expect((result.errors.title ?? '').length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: todo, Property 3: Valid Inputs Produce No Validation Errors
  it('Property 3: any valid title with any priority and optional due date should always be valid', () => {
    fc.assert(
      fc.property(titleArb, priorityArb, optionalDueDateArb, (title, priority, dueDate) => {
        const result = validateTodoForm({ title, description: '', priority, dueDate });
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual({});
      }),
      { numRuns: 100 }
    );
  });

  it('any valid ISO date should always pass dueDate validation', () => {
    fc.assert(
      fc.property(isoDateArb, titleArb, (dueDate, title) => {
        const result = validateTodoForm(makeValues({ title, dueDate }));
        expect(result.valid).toBe(true);
        expect(result.errors.dueDate).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });
});
