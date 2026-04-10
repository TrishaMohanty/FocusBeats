import { useState } from 'react';
import { api } from '../lib/api';

interface Task {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  due_date?: string;
}

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onFocus: (task: Task) => void;
}

export function TaskCard({ task, onUpdate, onDelete, onFocus }: TaskCardProps) {
  const [loading, setLoading] = useState(false);

  const toggleComplete = async () => {
    setLoading(true);
    try {
      const updated = await api.patch(`/tasks/${task._id}`, { completed: !task.completed });
      onUpdate(updated);
    } catch (error) {
       console.error("Failed to toggle task", error);
    } finally {
      setLoading(false);
    }
  };

  const priorityStyles = {
    high: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  return (
    <div className={`p-4 bg-surface border border-border rounded-2xl flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:border-primary-500/30 group ${task.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={toggleComplete}
        disabled={loading}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          task.completed 
            ? 'bg-success border-success text-white' 
            : 'border-border hover:border-primary-500'
        }`}
      >
        {task.completed && <span className="material-symbols-rounded text-sm font-bold">check</span>}
      </button>

      {/* Title & Meta */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-text truncate ${task.completed ? 'line-through' : ''}`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
          {task.due_date && (
            <span className="text-[10px] text-text-muted font-bold flex items-center gap-1">
              <span className="material-symbols-rounded text-xs">event</span>
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {!task.completed && (
          <button
            onClick={() => onFocus(task)}
            className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all shadow-sm"
            title="Focus this task"
          >
            <span className="material-symbols-rounded text-lg">rocket_launch</span>
          </button>
        )}
        <button
          onClick={() => onDelete(task._id)}
          className="w-10 h-10 rounded-xl bg-text/5 text-text-muted flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all"
        >
          <span className="material-symbols-rounded text-lg">delete</span>
        </button>
      </div>
    </div>
  );
}
