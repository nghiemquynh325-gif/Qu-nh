
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Resident } from '../../types';

interface ChartProps {
  data: Resident[];
}

const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const AgeDistributionChart: React.FC<ChartProps> = ({ data }) => {
  const ageGroups = {
    '0-17': 0,
    '18-30': 0,
    '31-45': 0,
    '46-60': 0,
    '61+': 0,
  };

  data.forEach(resident => {
    const age = calculateAge(resident.dateOfBirth);
    if (age <= 17) ageGroups['0-17']++;
    else if (age <= 30) ageGroups['18-30']++;
    else if (age <= 45) ageGroups['31-45']++;
    else if (age <= 60) ageGroups['46-60']++;
    else ageGroups['61+']++;
  });

  const chartData = Object.entries(ageGroups).map(([name, value]) => ({ name, 'Số lượng': value }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
        <Tooltip cursor={{fill: 'rgba(241, 245, 249, 0.5)'}} />
        <Legend />
        <Bar dataKey="Số lượng" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AgeDistributionChart;
