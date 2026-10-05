interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  onClear: () => void;
}

export function SearchBar({ query, onChange, onClear }: SearchBarProps): JSX.Element {
  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden="true">🔍</span>
      <label htmlFor="search-input" className="search-bar__label sr-only">
        Search todos
      </label>
      <input
        id="search-input"
        type="search"
        className="search-bar__input"
        placeholder="Search by title or description…"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search todos"
      />
      {query.length > 0 && (
        <button
          type="button"
          className="search-bar__clear"
          aria-label="Clear search"
          onClick={onClear}
        >
          ✕
        </button>
      )}
    </div>
  );
}
