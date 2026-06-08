import React from 'react';
import { useAuth } from '../hooks/useAuth';
import TeamOverview from '../components/TeamOverview';
import EmployeeList from '../components/EmployeeList';
import TaskList from '../components/TaskList';
import AddEmployeeForm from '../components/AddEmployeeForm';

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'admin' || user?.role === 'manager') {
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-white">Manager Dashboard</h1>
          <p className="text-sm text-slate-400">
            Review team performance, assign work, and monitor progress.
          </p>
        </header>

        <section>
          <TeamOverview />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <EmployeeList />
          <AddEmployeeForm />
        </section>

        <section>
          <TaskList />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">My Tasks</h1>
        <p className="text-sm text-slate-400">
          A focused view of your assigned work and next actions.
        </p>
      </header>

      <section>
        <TaskList isMyTasks />
      </section>
    </div>
  );
};

export default Dashboard;