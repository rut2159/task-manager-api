import React from 'react';
import { User } from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: 'manager' | 'teamLead' | 'developer';
}

interface EmployeeListProps {
  employees?: Employee[];
}

const EmployeeList = ({ employees = [] }: EmployeeListProps) => {
  const mockEmployees: Employee[] = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'developer' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'manager' },
    { _id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'developer' },
  ];

  const displayEmployees = employees.length > 0 ? employees : mockEmployees;

  const roleColors = {
    manager: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    teamLead: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    developer: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
      <div className="space-y-3">
        {displayEmployees.map((employee) => (
          <div
            key={employee._id}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                <User size={20} />
              </div>
              <div>
                <p className="font-medium text-white">{employee.name}</p>
                <p className="text-sm text-slate-400">{employee.email}</p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${roleColors[employee.role]}`}>
              {employee.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeList;
