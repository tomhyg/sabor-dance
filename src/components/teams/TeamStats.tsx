// src/components/teams/TeamStats.tsx
import React from 'react';
import { Users, CheckCircle, Target, BarChart3 } from 'lucide-react';

interface TeamStatsProps {
  stats: {
    total: number;
    approved: number;
    submitted: number;
    draft: number;
    rejected: number;
    completed: number; // ← Nouveau
  };
  translate: (key: string) => string;
}

export const TeamStats: React.FC<TeamStatsProps> = ({ stats, translate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      {/* Total Teams */}
      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-md border border-blue-500/20 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-8 h-8 text-blue-400" />
          <div className="text-3xl font-black text-blue-400">{stats.total}</div>
        </div>
        <p className="text-gray-300 font-medium">
          {translate('total')} {translate('teams')}
        </p>
      </div>

      {/* Completed Teams */}
      <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-8 h-8 text-purple-400" />
          <div className="text-3xl font-black text-purple-400">{stats.completed}</div>
        </div>
        <p className="text-gray-300 font-medium">{translate('completed')}</p>
      </div>

      {/* Approved Teams */}
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <div className="text-3xl font-black text-green-400">{stats.approved}</div>
        </div>
        <p className="text-gray-300 font-medium">{translate('approved')}</p>
      </div>

      {/* Submitted Teams (Pending) */}
      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/20 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-8 h-8 text-yellow-400" />
          <div className="text-3xl font-black text-yellow-400">{stats.submitted}</div>
        </div>
        <p className="text-gray-300 font-medium">{translate('pending')}</p>
      </div>

      {/* Draft Teams */}
      <div className="bg-gradient-to-br from-gray-500/10 to-slate-500/10 backdrop-blur-md border border-gray-500/20 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className="w-8 h-8 text-gray-400" />
          <div className="text-3xl font-black text-gray-400">{stats.draft}</div>
        </div>
        <p className="text-gray-300 font-medium">{translate('draft')}</p>
      </div>
    </div>
  );
};