import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addEmployee, getAllEmployees } from '../services/adminService';
import type { CreateEmployeeData, User } from '../types';

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['teamLead', 'developer']),
  teamLeadId: z.string().optional(),
}).refine(
  (data) => {
    // If role is developer, teamLeadId must be provided
    if (data.role === 'developer' && !data.teamLeadId) {
      return false;
    }
    return true;
  },
  {
    message: 'Team Lead is required for developers',
    path: ['teamLeadId'],
  }
);

type EmployeeFormData = z.infer<typeof employeeSchema>;

const AddEmployeeForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [teamLeads, setTeamLeads] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<'teamLead' | 'developer'>('developer');

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      role: 'developer',
    },
  });

  const role = watch('role');

  useEffect(() => {
    setSelectedRole(role as 'teamLead' | 'developer');
  }, [role]);

  useEffect(() => {
    // Fetch team leads for the dropdown
    const fetchTeamLeads = async () => {
      try {
        const employees = await getAllEmployees();
        const leads = employees.filter(emp => emp.role === 'teamLead');
        setTeamLeads(leads);
      } catch (error) {
        console.error('Failed to fetch team leads:', error);
      }
    };

    fetchTeamLeads();
  }, []);

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const employeeData: CreateEmployeeData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.role === 'developer' && { teamLeadId: data.teamLeadId }),
      };

      const response = await addEmployee(employeeData);
      setSuccessMessage(`Employee ${response.name} created successfully.`);
      reset({ role: 'developer' });
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'Failed to add employee.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-4 text-xl font-semibold text-indigo-400">Add New Employee</h2>
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
          <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
          <input
            type="text"
            {...register('name')}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
          <select
            {...register('role')}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="developer">Developer</option>
            <option value="teamLead">Team Lead</option>
          </select>
          {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
          />
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {selectedRole === 'developer' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Assign to Team Lead</label>
            <select
              {...register('teamLeadId')}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select a Team Lead...</option>
              {teamLeads.map((lead) => (
                <option key={lead._id} value={lead._id}>
                  {lead.name}
                </option>
              ))}
            </select>
            {errors.teamLeadId && <p className="mt-1 text-xs text-red-400">{errors.teamLeadId.message}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Adding employee...' : 'Add Employee'}
        </button>
      </form>
    </div>
  );
};

export default AddEmployeeForm;
