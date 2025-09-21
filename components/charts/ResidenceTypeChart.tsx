
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Resident } from '../../types';
import { ResidenceType } from '../../types';

interface ChartProps {
  data: Resident[];
}

const COLORS = ['#10b981', '#f59e0b', '#8b5cf6']; // Green for Permanent, Amber for Temporary, Violet for Temp w/ House

const ResidenceTypeChart: React.FC<ChartProps> = ({ data }) => {
  const residenceData = [
    { name: ResidenceType.PERMANENT, value: data.filter(r => r.residenceType === ResidenceType.PERMANENT).length },
    { name: ResidenceType.TEMPORARY, value: data.filter(r => r.residenceType === ResidenceType.TEMPORARY).length },
    { name: ResidenceType.TEMPORARY_WITH_HOUSE, value: data.filter(r => r.residenceType === ResidenceType.TEMPORARY_WITH_HOUSE).length },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={residenceData.filter(d => d.value > 0)}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={50}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {residenceData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ResidenceTypeChart;