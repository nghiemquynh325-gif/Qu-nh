import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Resident } from '../../types';

interface ChartProps {
  data: Resident[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

const NationalityDistributionChart: React.FC<ChartProps> = ({ data }) => {
  const foreigners = data.filter(r => r.isForeigner && r.nationality);

  const nationalityCounts = foreigners.reduce((acc, resident) => {
    const nat = resident.nationality!;
    acc[nat] = (acc[nat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(nationalityCounts).map(([name, value]) => ({ name, value }));
  
  if (foreigners.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-slate-500">
            <p>Chưa có dữ liệu người nước ngoài.</p>
        </div>
      )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default NationalityDistributionChart;
