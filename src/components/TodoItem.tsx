import { useState } from 'react';

import type { Todo, TodoFormValues } from '../types/todo';
import { TodoForm } from './TodoForm';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, values: TodoFormValues) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function isOverdue(dueDate: string, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);

  function handleEditSubmit(values: TodoFormValues): void {
    onEdit(todo.id, values);
    setIsEditing(false);
  }

  const overdue = isOverdue(todo.dueDate, todo.completed);

  if (isEditing) {
    return (
      <li className="todo-item todo-item--editing">
        <TodoForm
          mode="edit"
          initialValues={{
            title: todo.title,
            description: todo.description,
            priority: todo.priority,
            dueDate: todo.dueDate,
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li
      className={`todo-item${todo.completed ? ' todo-item--completed' : ''}`}
      data-priority={todo.priority}
    >
      <div className="todo-item__main">
        <button
          type="button"
          className={`todo-item__toggle${todo.completed ? ' todo-item__toggle--checked' : ''}`}
          aria-label={todo.completed ? 'Mark as pending' : 'Mark as completed'}
          onClick={() => onToggle(todo.id)}
        >
          {todo.completed ? '✓' : ''}
        </button>

        <div className="todo-item__content">
          <span className={`todo-item__title${todo.completed ? ' todo-item__title--done' : ''}`}>
            {todo.title}
          </span>
          {todo.description && (
            <span className="todo-item__description">{todo.description}</span>
          )}
          <div className="todo-item__meta">
            <span className={`priority-badge priority-badge--${todo.priority}`}>
              {PRIORITY_LABELS[todo.priority]}
            </span>
            {todo.dueDate && (
              <span className={`todo-item__due${overdue ? ' todo-item__due--overdue' : ''}`}>
                {overdue ? '⚠ Overdue: ' : 'Due: '}
                {todo.dueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="todo-item__actions">
        <button
          type="button"
          className="btn btn--icon"
          aria-label={`Edit todo: ${todo.title}`}
          onClick={() => setIsEditing(true)}
        >
          ✏
        </button>
        <button
          type="button"
          className="btn btn--icon btn--danger"
          aria-label={`Delete todo: ${todo.title}`}
          onClick={() => onDelete(todo.id)}
        >
          🗑
        </button>
      </div>
    </li>
  );
}
