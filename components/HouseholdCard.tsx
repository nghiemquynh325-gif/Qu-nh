import React from 'react';
import type { Household, Resident } from '../types';

interface HouseholdCardProps {
    household: Household;
    members: Resident[];
    isSelected: boolean;
    onToggleSelect: () => void;
    onGenerateQR: () => void;
    onUpdateHousehold: (household: Household) => void;
}

const HouseholdCard: React.FC<HouseholdCardProps> = ({ household, members, isSelected, onToggleSelect, onGenerateQR, onUpdateHousehold }) => {
    const headOfHousehold = members.find(m => m.id === household.headOfHouseholdId);
    const otherMembers = members.filter(m => m.id !== household.headOfHouseholdId);

    const getRelationshipText = (member: Resident) => {
        if (member.id === headOfHousehold?.id) {
            return '(Chủ hộ)';
        }
        return member.relationshipToHead ? `(${member.relationshipToHead})` : '';
    }

    const handleBusinessToggle = () => {
        onUpdateHousehold({ ...household, isBusinessHousehold: !household.isBusinessHousehold });
    };

    const handleFireSafetyToggle = () => {
        onUpdateHousehold({ ...household, isInFireSafetyGroup: !household.isInFireSafetyGroup });
    };

    return (
        <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 flex flex-col ${isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-transparent'}`}>
            <div className="p-4 border-b bg-slate-50 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{household.address}</h3>
                        {household.isPoorHousehold && (
                            <span className="px-2 py-0.5 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full" title="Hộ nghèo/cận nghèo">
                                Hộ nghèo
                            </span>
                        )}
                        {household.isBusinessHousehold && (
                            <span className="px-2 py-0.5 text-xs font-semibold text-sky-800 bg-sky-100 rounded-full" title="Hộ kinh doanh">
                                Hộ kinh doanh
                            </span>
                        )}
                         {household.isInFireSafetyGroup && (
                            <span className="px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full flex items-center gap-1" title="Tổ liên gia PCCC">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                                PCCC
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Số nhà: <span className="font-semibold text-slate-600">{household.houseNumber}</span> • Tổ {household.group} • ID: {household.id}</p>
                </div>
                 <div className="flex items-center space-x-3 flex-shrink-0">
                    <button onClick={onGenerateQR} className="text-sm text-blue-600 hover:text-blue-800 font-medium p-1" title="Tạo mã QR">
                        Tạo QR
                    </button>
                    <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={onToggleSelect}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                </div>
            </div>
            <div className="p-4 flex-grow">
                {headOfHousehold && (
                    <div className="flex items-center mb-3">
                         <img className="h-10 w-10 rounded-full" src={headOfHousehold.avatarUrl} alt={headOfHousehold.fullName} />
                         <div className="ml-3">
                            <p className="text-sm font-medium text-slate-900">{headOfHousehold.fullName} <span className="text-slate-500 font-normal">{getRelationshipText(headOfHousehold)}</span></p>
                            <p className="text-xs text-slate-500">{headOfHousehold.phoneNumber}</p>
                         </div>
                    </div>
                )}
                <div className="border-t border-slate-200 pt-3 mt-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Thành viên khác ({otherMembers.length})</h4>
                    <ul className="space-y-2">
                        {otherMembers.map(member => (
                             <li key={member.id} className="flex items-center">
                                 <img className="h-8 w-8 rounded-full" src={member.avatarUrl} alt={member.fullName} />
                                 <div className="ml-2">
                                    <p className="text-sm text-slate-700">{member.fullName} <span className="text-slate-500">{getRelationshipText(member)}</span></p>
                                 </div>
                            </li>
                        ))}
                        {otherMembers.length === 0 && (
                             <li className="text-sm text-slate-400 italic">Không có thành viên khác.</li>
                        )}
                    </ul>
                </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer w-fit">
                    <input
                        type="checkbox"
                        checked={!!household.isBusinessHousehold}
                        onChange={handleBusinessToggle}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Là hộ kinh doanh</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer w-fit">
                    <input
                        type="checkbox"
                        checked={!!household.isInFireSafetyGroup}
                        onChange={handleFireSafetyToggle}
                        className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Thuộc tổ PCCC</span>
                </label>
            </div>
        </div>
    )
}

export default HouseholdCard;