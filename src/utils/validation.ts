import type { TodoFormValues, ValidationResult } from '../types/todo';

// Regex for a valid YYYY-MM-DD date string
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates user-provided form values for creating or editing a Todo.
 * Returns a ValidationResult with a valid flag and a map of field-level error messages.
 * Errors are returned as data — never thrown as exceptions.
 */
export function validateTodoForm(values: TodoFormValues): ValidationResult {
  const errors: Partial<Record<keyof TodoFormValues, string>> = {};

  // Title: required, must not be empty or whitespace-only
  if (values.title.trim().length === 0) {
    errors.title = 'Title is required and cannot be blank.';
  }

  // DueDate: optional — if provided, must be a valid YYYY-MM-DD date
  if (values.dueDate !== '') {
    if (!ISO_DATE_REGEX.test(values.dueDate)) {
      errors.dueDate = 'Due date must be in YYYY-MM-DD format.';
    } else {
      // Verify it is an actual calendar date (e.g., not 2024-02-30)
      const parsed = new Date(values.dueDate + 'T00:00:00');
      if (isNaN(parsed.getTime())) {
        errors.dueDate = 'Due date is not a valid calendar date.';
      } else {
        // Double-check the date didn't roll over (e.g., 2024-02-30 → March 1)
        const [year, month, day] = values.dueDate.split('-').map(Number);
        if (
          parsed.getFullYear() !== year ||
          parsed.getMonth() + 1 !== month ||
          parsed.getDate() !== day
        ) {
          errors.dueDate = 'Due date is not a valid calendar date.';
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
