import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { createTask } from '../services/taskService';
import { getAllEmployees, getEmployeesByTeamLead } from '../services/adminService';
import type { User } from '../types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assignedTo: z.string().min(1, 'Assignee is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AddTaskFormProps {
  onTaskCreated?: () => void;
}

const AddTaskForm = ({ onTaskCreated }: AddTaskFormProps) => {
  const { user } = useAuth();
  const [assignees, setAssignees] = useState<User[]>([]);
  const [loadingAssignees, setLoadingAssignees] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    const fetchAssignees = async () => {
      if (!user) {
        setAssignees([]);
        setLoadingAssignees(false);
        return;
      }

      setLoadingAssignees(true);
      setServerError(null);

      try {
        if (user.role === 'manager') {
          const employees = await getAllEmployees();
          setAssignees(employees.filter((employee) => employee.role === 'teamLead'));
        } else if (user.role === 'teamLead') {
          const teamDevelopers = await getEmployeesByTeamLead(user._id);
          setAssignees(teamDevelopers);
        } else {
          setAssignees([]);
        }
      } catch (error: any) {
        setServerError(error.response?.data?.error || 'Failed to load assignees.');
      } finally {
        setLoadingAssignees(false);
      }
    };

    fetchAssignees();
  }, [user]);

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      await createTask({
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
      });

      setSuccessMessage('Task created successfully.');
      reset();
      onTaskCreated?.();
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'Failed to create task.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role === 'developer') {
    return null;
  }

  const assigneeLabel = user.role === 'manager' ? 'Assign to Team Lead' : 'Assign to Developer';
  const assigneePlaceholder = user.role === 'manager' ? 'Select a Team Lead...' : 'Select a Developer...';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-4 text-xl font-semibold text-indigo-400">Add Task</h2>
      {serverError && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
          {serverError}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
          <input
            type="text"
            {...register('title')}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
          />
          {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <textarea
            rows={4}
            {...register('description')}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
          />
          {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">{assigneeLabel}</label>
          {loadingAssignees ? (
            <p className="text-sm text-slate-400">Loading assignees...</p>
          ) : (
            <select
              {...register('assignedTo')}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">{assigneePlaceholder}</option>
              {assignees.map((assignee) => (
                <option key={assignee._id} value={assignee._id}>
                  {assignee.name} ({assignee.email})
                </option>
              ))}
            </select>
          )}
          {errors.assignedTo && <p className="mt-1 text-xs text-red-400">{errors.assignedTo.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || loadingAssignees || assignees.length === 0}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating task...' : 'Create Task'}
        </button>
        {assignees.length === 0 && !loadingAssignees && (
          <p className="text-sm text-slate-400">No available {user.role === 'manager' ? 'team leads' : 'developers'} to assign.</p>
        )}
      </form>
    </div>
  );
};

export default AddTaskForm;
