import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Resident } from '../../types';

interface ChartProps {
  data: Resident[];
}

const COLORS = ['#64748b', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

const ReligionDistributionChart: React.FC<ChartProps> = ({ data }) => {
  const vnResidents = data.filter(r => !r.isForeigner);

  const religionCounts = vnResidents.reduce((acc, resident) => {
    const religion = resident.religion || 'Không';
    acc[religion] = (acc[religion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(religionCounts)
    .map(([name, value]) => ({ name, value }))
    // Sort to have 'Không' appear first
    .sort((a, b) => {
        if (a.name === 'Không') return -1;
        if (b.name === 'Không') return 1;
        return b.value - a.value;
    });
  
  if (vnResidents.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-slate-500">
            <p>Chưa có dữ liệu công dân.</p>
        </div>
      )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData.filter(d => d.value > 0)}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={50}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ReligionDistributionChart;
