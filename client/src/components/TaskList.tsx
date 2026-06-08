import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Deployed';
  assignedTo?: { name: string };
  createdAt: string;
}

interface TaskListProps {
  tasks?: Task[];
  isMyTasks?: boolean;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

const TaskList = ({ tasks = [], isMyTasks = false, onStatusChange }: TaskListProps) => {
  const mockTasks: Task[] = [
    {
      _id: '1',
      title: 'Setup Database',
      description: 'Configure MongoDB cluster',
      status: 'In Progress',
      assignedTo: { name: 'John Doe' },
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'API Integration',
      description: 'Integrate payment API',
      status: 'Pending',
      assignedTo: { name: 'Jane Smith' },
      createdAt: new Date().toISOString(),
    },
    {
      _id: '3',
      title: 'UI Redesign',
      description: 'Revamp dashboard UI',
      status: 'Deployed',
      assignedTo: { name: 'Bob Wilson' },
      createdAt: new Date().toISOString(),
    },
  ];

  const displayTasks = tasks.length > 0 ? tasks : mockTasks;

  const statusConfig = {
    Pending: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    'In Progress': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    Deployed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{isMyTasks ? 'My Tasks' : 'All Tasks'}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 font-semibold text-slate-300">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-300">Description</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-300">Assigned To</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayTasks.map((task) => {
              const config = statusConfig[task.status as keyof typeof statusConfig];
              const Icon = config.icon;
              return (
                <tr key={task._id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-white font-medium">{task.title}</td>
                  <td className="px-4 py-3 text-slate-400">{task.description}</td>
                  <td className="px-4 py-3 text-slate-400">{task.assignedTo?.name || 'Unassigned'}</td>
                  <td className="px-4 py-3">
                    {isMyTasks ? (
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange?.(task._id, e.target.value)}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold cursor-pointer transition ${config.bg} ${config.border} text-white focus:outline-none`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Deployed">Deployed</option>
                      </select>
                    ) : (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border w-fit ${config.bg} ${config.border}`}>
                        <Icon size={16} className={config.color} />
                        <span className={`text-xs font-semibold ${config.color}`}>{task.status}</span>
                      </div>
                    )}
                  </td>
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
