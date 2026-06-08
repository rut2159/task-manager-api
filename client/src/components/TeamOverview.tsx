import React from 'react';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TeamOverview = () => {
  const stats = [
    { label: 'Total Team Members', value: '24', icon: Users, color: 'indigo' },
    { label: 'Completed Tasks', value: '128', icon: CheckCircle, color: 'emerald' },
    { label: 'In Progress', value: '43', icon: Clock, color: 'amber' },
    { label: 'Pending Review', value: '12', icon: AlertCircle, color: 'orange' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colorMap = {
          indigo: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20',
          emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
          amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
          orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20',
        };

        return (
          <div
            key={stat.label}
            className={`rounded-2xl border bg-gradient-to-br ${colorMap[stat.color as keyof typeof colorMap]} p-6 shadow-lg hover:shadow-xl transition`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                <Icon size={24} className={`text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeamOverview;
