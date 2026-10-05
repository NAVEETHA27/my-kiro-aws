import { useState } from 'react';

import type { TodoFormValues, Priority, ValidationResult } from '../types/todo';
import { validateTodoForm } from '../utils/validation';

interface TodoFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<TodoFormValues>;
  onSubmit: (values: TodoFormValues) => void;
  onCancel?: () => void;
}

const DEFAULT_VALUES: TodoFormValues = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
};

export function TodoForm({ mode, initialValues, onSubmit, onCancel }: TodoFormProps): JSX.Element {
  const [values, setValues] = useState<TodoFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<ValidationResult['errors']>({});

  function handleChange(field: keyof TodoFormValues, value: string): void {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as the user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const result = validateTodoForm(values);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    onSubmit(values);
    if (mode === 'create') {
      setValues(DEFAULT_VALUES);
      setErrors({});
    }
  }

  function handleCancel(): void {
    setValues({ ...DEFAULT_VALUES, ...initialValues });
    setErrors({});
    onCancel?.();
  }

  const titleId = mode === 'create' ? 'create-title' : 'edit-title';
  const descId = mode === 'create' ? 'create-desc' : 'edit-desc';
  const priorityId = mode === 'create' ? 'create-priority' : 'edit-priority';
  const dueDateId = mode === 'create' ? 'create-duedate' : 'edit-duedate';

  return (
    <form
      className={`todo-form todo-form--${mode}`}
      onSubmit={handleSubmit}
      noValidate
      aria-label={mode === 'create' ? 'Add new todo' : 'Edit todo'}
    >
      <div className="todo-form__field">
        <label htmlFor={titleId} className="todo-form__label">
          Title <span aria-hidden="true" className="todo-form__required">*</span>
        </label>
        <input
          id={titleId}
          type="text"
          className={`todo-form__input${errors.title ? ' todo-form__input--error' : ''}`}
          placeholder="What needs to be done?"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          aria-required="true"
          aria-describedby={errors.title ? `${titleId}-error` : undefined}
          autoFocus={mode === 'create'}
        />
        {errors.title && (
          <span id={`${titleId}-error`} className="todo-form__error" role="alert">
            {errors.title}
          </span>
        )}
      </div>

      <div className="todo-form__field">
        <label htmlFor={descId} className="todo-form__label">
          Description
        </label>
        <textarea
          id={descId}
          className="todo-form__textarea"
          placeholder="Add details (optional)…"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
        />
      </div>

      <div className="todo-form__row">
        <div className="todo-form__field">
          <label htmlFor={priorityId} className="todo-form__label">
            Priority
          </label>
          <select
            id={priorityId}
            className="todo-form__select"
            value={values.priority}
            onChange={(e) => handleChange('priority', e.target.value as Priority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="todo-form__field">
          <label htmlFor={dueDateId} className="todo-form__label">
            Due Date
          </label>
          <input
            id={dueDateId}
            type="date"
            className={`todo-form__input${errors.dueDate ? ' todo-form__input--error' : ''}`}
            value={values.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            aria-describedby={errors.dueDate ? `${dueDateId}-error` : undefined}
          />
          {errors.dueDate && (
            <span id={`${dueDateId}-error`} className="todo-form__error" role="alert">
              {errors.dueDate}
            </span>
          )}
        </div>
      </div>

      <div className="todo-form__actions">
        <button type="submit" className="btn btn--primary">
          {mode === 'create' ? 'Add Todo' : 'Save Changes'}
        </button>
        {mode === 'edit' && (
          <button type="button" className="btn btn--secondary" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
