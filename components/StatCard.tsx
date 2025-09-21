
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: 'users' | 'check' | 'home' | 'pending' | 'globe';
    color: 'blue' | 'green' | 'indigo' | 'amber' | 'purple';
}

const Icons: Record<StatCardProps['icon'], JSX.Element> = {
    users: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-3 5.197z" /></svg>,
    check: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    home: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    pending: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    globe: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293a1 1 0 010 1.414L4 10.414V14a2 2 0 002 2h12a2 2 0 002-2v-3.586l-3.707-3.707a1 1 0 01-1.414 0z" /></svg>,
};

const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    const { bg, text } = colorClasses[color];

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
            <div className={`p-4 rounded-full ${bg} ${text}`}>
                {Icons[icon]}
            </div>
            <div className="ml-4">
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;