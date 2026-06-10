import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react';
import * as taskService from '../services/taskService';
import { useAuth } from '../hooks/useAuth';
import type { Task } from '../types';

interface TaskListProps {
  isMyTasks?: boolean;
  refreshKey?: number;
}

const TaskList = ({ isMyTasks = false, refreshKey }: TaskListProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await taskService.getAllTasks();
        setTasks(fetchedTasks);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [refreshKey]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const updated = await taskService.updateTaskStatus(
        taskId,
        newStatus as 'pending' | 'in-progress' | 'completed'
      );
      setTasks(tasks.map(t => t._id === taskId ? updated : t));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update task status');
    }
  };

  const statusConfig = {
    pending: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    'in-progress': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
        <p className="text-slate-400">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-white">{isMyTasks ? 'My Tasks' : 'All Tasks'}</h3>
        </div>
        <p className="text-slate-400">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-white">{isMyTasks ? 'My Tasks' : 'All Tasks'}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 font-semibold text-slate-300">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-300">Description</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-300">Assigned To</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-300">Status</th>
              {user?.role === 'manager' && (
                <th className="text-left px-4 py-3 font-semibold text-slate-300">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const config = statusConfig[task.status as keyof typeof statusConfig];
              const Icon = config.icon;
              const assignedName = typeof task.assignedTo === 'string' 
                ? 'Loading...' 
                : task.assignedTo.name;

              return (
                <tr key={task._id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-white font-medium">{task.title}</td>
                  <td className="px-4 py-3 text-slate-400">{task.description}</td>
                  <td className="px-4 py-3 text-slate-400">{assignedName}</td>
                  <td className="px-4 py-3">
                    {(isMyTasks || user?.role === 'manager' || user?.role === 'teamLead') ? (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold cursor-pointer transition ${config.bg} ${config.border} text-white focus:outline-none`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border w-fit ${config.bg} ${config.border}`}>
                        <Icon size={16} className={config.color} />
                        <span className={`text-xs font-semibold ${config.color}`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    )}
                  </td>
                  {user?.role === 'manager' && (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Delete this task?')) return;
                          try {
                            await taskService.deleteTask(task._id);
                            setTasks(tasks.filter((t) => t._id !== task._id));
                          } catch (err: any) {
                            alert(err.response?.data?.error || 'Failed to delete task');
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
