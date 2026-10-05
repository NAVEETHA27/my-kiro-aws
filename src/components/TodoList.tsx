import type { Todo, TodoFilter, TodoFormValues } from '../types/todo';
import { TodoItem } from './TodoItem';
import { EmptyState } from './EmptyState';

interface TodoListProps {
  todos: Todo[];
  filter: TodoFilter;
  searchQuery: string;
  onToggle: (id: string) => void;
  onEdit: (id: string, values: TodoFormValues) => void;
  onDelete: (id: string) => void;
}

export function TodoList({
  todos,
  filter,
  searchQuery,
  onToggle,
  onEdit,
  onDelete,
}: TodoListProps): JSX.Element {
  if (todos.length === 0) {
    return <EmptyState filter={filter} hasSearch={searchQuery.trim().length > 0} />;
  }

  return (
    <ul className="todo-list" aria-label="Todo items">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
