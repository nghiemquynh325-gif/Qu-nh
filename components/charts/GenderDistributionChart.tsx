
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Resident } from '../../types';

interface ChartProps {
  data: Resident[];
}

const COLORS = ['#3b82f6', '#ec4899']; // Blue for Male, Pink for Female

const GenderDistributionChart: React.FC<ChartProps> = ({ data }) => {
  const genderData = [
    { name: 'Nam', value: data.filter(r => r.gender === 'Nam').length },
    { name: 'Nữ', value: data.filter(r => r.gender === 'Nữ').length },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={genderData}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={50}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {genderData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GenderDistributionChart;
