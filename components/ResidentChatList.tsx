import React, { useState, useMemo } from 'react';
import type { Resident } from '../types';

interface ResidentChatListProps {
    residents: Resident[];
    onSelectResident: (id: string) => void;
    selectedResidentId: string | null;
}

const ResidentChatList: React.FC<ResidentChatListProps> = ({ residents, onSelectResident, selectedResidentId }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredResidents = useMemo(() => {
        if (!searchTerm) return residents;
        return residents.filter(r =>
            r.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [residents, searchTerm]);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-slate-800">Danh sách Cư dân</h3>
                <div className="relative mt-2">
                    <input
                        type="text"
                        placeholder="Tìm kiếm cư dân..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </div>
            <ul className="flex-1 overflow-y-auto">
                {filteredResidents.map(resident => (
                    <li
                        key={resident.id}
                        onClick={() => onSelectResident(resident.id)}
                        className={`flex items-center p-3 cursor-pointer transition-colors duration-150 border-l-4 ${
                            selectedResidentId === resident.id 
                                ? 'bg-blue-50 border-blue-500' 
                                : 'border-transparent hover:bg-slate-50'
                        }`}
                    >
                        <img className="h-10 w-10 rounded-full" src={resident.avatarUrl} alt={resident.fullName} />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-800">{resident.fullName}</p>
                            <p className="text-xs text-slate-500">{resident.group} - {resident.address}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ResidentChatList;