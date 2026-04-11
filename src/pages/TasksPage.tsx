import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { api } from '../lib/api';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';

export function TasksPage() {
  const { user } = useAuth();
  const { openSessionModal } = useSession();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const data = await api.get('/tasks');
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingTask) {
        const updated = await api.patch(`/tasks/${editingTask._id}`, data);
        setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
      } else {
        const created = await api.post('/tasks', data);
        setTasks(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFocus = (task: any) => {
    openSessionModal({ 
      task_name: task.title,
      task_id: task._id 
    });
  };

  const sections = useMemo(() => {
    return {
      active: tasks.filter(t => !t.completed),
      completed: tasks.filter(t => t.completed)
    };
  }, [tasks]);

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-end mb-lg border-b border-border pb-md">
           <div className="flex flex-col gap-xs">
             <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">Management</p>
             <h2 className="text-4xl font-extrabold text-text tracking-tight">Active Tasks</h2>
           </div>
        </div>
        <div className="bg-surface border-2 border-border/60 p-16 rounded-[40px] shadow-glass flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-warning/10 text-warning rounded-3xl flex items-center justify-center mb-8 border border-warning/20">
            <span className="material-symbols-rounded text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock_person</span>
          </div>
          <h3 className="text-3xl font-black text-text mb-3 tracking-tight">Sync Across Devices</h3>
          <p className="text-text-muted font-bold mb-10 max-w-sm leading-relaxed">Login to FocusBeats to manage your complex task workflows and sync them everywhere.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-12 py-4 bg-text text-bg font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-bg/10"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-lg border-b border-border pb-md">
        <div className="flex flex-col gap-xs">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">Command Center</p>
          <h2 className="text-4xl font-extrabold text-text tracking-tight">Tasks & Missions</h2>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95"
        >
          <span className="material-symbols-rounded text-lg">add_task</span>
          New Mission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-10">
          {/* Active Tasks */}
          <section>
            <div className="flex items-center gap-3 mb-6">
               <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
               <h3 className="text-xl font-black text-text tracking-tight">Active Operations</h3>
            </div>
            
            {loading ? (
              <div className="py-12 flex justify-center"><span className="material-symbols-rounded animate-spin text-primary-500">refresh</span></div>
            ) : sections.active.length === 0 ? (
              <div className="bg-surface border-2 border-dashed border-border/60 p-12 rounded-[32px] flex flex-col items-center justify-center text-center group hover:border-primary-500/30 transition-colors">
                <div className="w-16 h-16 bg-bg text-text-muted rounded-2xl flex items-center justify-center border border-border/60 mb-6">
                  <span className="material-symbols-rounded text-3xl">inventory_2</span>
                </div>
                <h4 className="text-lg font-black text-text mb-1">Board is Clear</h4>
                <p className="text-sm text-text-muted font-bold">All missions completed. Ready for a new challenge?</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sections.active.map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onUpdate={fetchTasks}
                    onDelete={handleDelete}
                    onFocus={handleFocus}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Completed Archive */}
          {sections.completed.length > 0 && (
            <section className="opacity-60">
               <div className="flex items-center gap-3 mb-6">
                 <h3 className="text-lg font-bold text-text-muted tracking-tight">Archive</h3>
              </div>
              <div className="grid gap-4">
                {sections.completed.map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onUpdate={fetchTasks}
                    onDelete={handleDelete}
                    onFocus={handleFocus}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: Analytics & Recs */}
        <div className="md:col-span-4 space-y-6">
           <div className="bg-surface border border-border p-8 rounded-[32px] shadow-glass relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl"></div>
              <h4 className="text-lg font-black text-text mb-2 tracking-tight">Mission Status</h4>
              <p className="text-text-muted text-sm font-bold mb-6">Current execution efficiency</p>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <p className="text-xs font-black uppercase tracking-wider text-text-muted">Completed</p>
                    <p className="text-2xl font-black text-text">{sections.completed.length}</p>
                 </div>
                 <div className="w-full h-2 bg-bg rounded-full overflow-hidden border border-border">
                    <div 
                      className="h-full bg-primary-500 transition-all duration-1000" 
                      style={{ width: `${tasks.length ? (sections.completed.length / tasks.length) * 100 : 0}%` }}
                    ></div>
                 </div>
              </div>

              <button 
                onClick={() => navigate('/timer')}
                className="w-full mt-8 py-4 bg-text text-bg font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-sm shadow-premium"
              >
                Launch Deep Focus
              </button>
           </div>
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTask}
      />
    </div>
  );
}

