import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import TeamOverview from '../components/TeamOverview';
import EmployeeList from '../components/EmployeeList';
import TaskList from '../components/TaskList';
import AddEmployeeForm from '../components/AddEmployeeForm';
import AddTaskForm from '../components/AddTaskForm';

const Dashboard = () => {
  const { user } = useAuth();
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  // Manager dashboard - see everything
  if (user?.role === 'manager') {
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-white">Manager Dashboard</h1>
          <p className="text-sm text-slate-400">
            Full system overview - manage teams, employees, and all tasks.
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
          <AddTaskForm onTaskCreated={() => setTaskRefreshKey((prev) => prev + 1)} />
        </section>

        <section>
          <TaskList refreshKey={taskRefreshKey} />
        </section>
      </div>
    );
  }

  // Team Lead dashboard - see their team and tasks
  if (user?.role === 'teamLead') {
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-white">Team Lead Dashboard</h1>
          <p className="text-sm text-slate-400">
            Manage your team members and assign work.
          </p>
        </header>

        <section>
          <EmployeeList />
        </section>

        <section>
          <AddTaskForm onTaskCreated={() => setTaskRefreshKey((prev) => prev + 1)} />
        </section>

        <section>
          <TaskList refreshKey={taskRefreshKey} />
        </section>
      </div>
    );
  }

  // Developer dashboard - see only their tasks
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