import { useTodos } from '../hooks/useTodos';
import { TaskCount } from './TaskCount';
import { FilterTabs } from './FilterTabs';
import { SearchBar } from './SearchBar';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { ErrorBoundary } from './ErrorBoundary';

export function TodoApp(): JSX.Element {
  const {
    filteredTodos,
    filter,
    searchQuery,
    counts,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    setFilter,
    setSearch,
  } = useTodos();

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">Kiro Todo List</h1>
          <p className="app__subtitle">Stay organized, stay productive.</p>
        </header>

        <main className="app__main">
          <section className="app__stats" aria-label="Task statistics">
            <TaskCount counts={counts} />
          </section>

          <section className="app__add" aria-label="Add new todo">
            <h2 className="sr-only">Add a new task</h2>
            <TodoForm mode="create" onSubmit={createTodo} />
          </section>

          <section className="app__controls" aria-label="Filter and search">
            <FilterTabs activeFilter={filter} onChange={setFilter} />
            <SearchBar
              query={searchQuery}
              onChange={setSearch}
              onClear={() => setSearch('')}
            />
          </section>

          <section className="app__list" aria-label="Todo list">
            <TodoList
              todos={filteredTodos}
              filter={filter}
              searchQuery={searchQuery}
              onToggle={toggleTodo}
              onEdit={updateTodo}
              onDelete={deleteTodo}
            />
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
}
