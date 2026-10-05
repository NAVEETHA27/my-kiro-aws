import type { TodoFilter } from '../types/todo';

interface FilterTabsProps {
  activeFilter: TodoFilter;
  onChange: (filter: TodoFilter) => void;
}

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export function FilterTabs({ activeFilter, onChange }: FilterTabsProps): JSX.Element {
  return (
    <div className="filter-tabs" role="group" aria-label="Filter todos">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`filter-tabs__btn${activeFilter === value ? ' filter-tabs__btn--active' : ''}`}
          aria-pressed={activeFilter === value}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
