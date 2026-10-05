import type { TaskCounts } from '../types/todo';

interface TaskCountProps {
  counts: TaskCounts;
}

export function TaskCount({ counts }: TaskCountProps): JSX.Element {
  return (
    <div className="task-count" role="status" aria-live="polite" aria-label="Task summary">
      <div className="task-count__chip task-count__chip--total">
        <span className="task-count__number">{counts.total}</span>
        <span className="task-count__label">Total</span>
      </div>
      <div className="task-count__chip task-count__chip--pending">
        <span className="task-count__number">{counts.pending}</span>
        <span className="task-count__label">Pending</span>
      </div>
      <div className="task-count__chip task-count__chip--completed">
        <span className="task-count__number">{counts.completed}</span>
        <span className="task-count__label">Done</span>
      </div>
    </div>
  );
}
