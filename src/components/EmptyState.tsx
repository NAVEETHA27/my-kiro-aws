import type { TodoFilter } from '../types/todo';

interface EmptyStateProps {
  filter: TodoFilter;
  hasSearch: boolean;
}

function getMessage(filter: TodoFilter, hasSearch: boolean): string {
  if (hasSearch) return 'No todos match your search. Try a different term.';
  switch (filter) {
    case 'all':
      return 'No todos yet — add your first task above!';
    case 'pending':
      return 'No pending todos. Great job keeping up!';
    case 'completed':
      return 'No completed todos yet. Start checking things off!';
  }
}

export function EmptyState({ filter, hasSearch }: EmptyStateProps): JSX.Element {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <span className="empty-state__icon" aria-hidden="true">📋</span>
      <p className="empty-state__message">{getMessage(filter, hasSearch)}</p>
    </div>
  );
}
