import React, { useState, useMemo } from 'react';
import type { Resident, Household, Message, ToastMessage } from '../types';
import HouseholdCard from './HouseholdCard';
import BatchMessageModal from './BatchMessageModal';
import QRCodeModal from './QRCodeModal';

interface HouseholdManagementProps {
    households: Household[];
    residents: Resident[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    zaloOAConnected: boolean;
    addToast: (message: string, type?: ToastMessage['type']) => void;
    onUpdateHousehold: (household: Household) => void;
}

const HouseholdManagement: React.FC<HouseholdManagementProps> = ({ households, residents, setMessages, zaloOAConnected, addToast, onUpdateHousehold }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [houseNumberSearch, setHouseNumberSearch] = useState('');
    const [poorHouseholdFilter, setPoorHouseholdFilter] = useState<boolean>(false);
    const [businessFilter, setBusinessFilter] = useState<'all' | 'business' | 'non-business'>('all');
    const [fireSafetyFilter, setFireSafetyFilter] = useState<'all' | 'in_group' | 'not_in_group'>('all');
    const [selectedHouseholdIds, setSelectedHouseholdIds] = useState<Set<string>>(new Set());
    const [isBatchMessageModalOpen, setIsBatchMessageModalOpen] = useState(false);
    const [qrCodeHousehold, setQrCodeHousehold] = useState<(Household & { members: Resident[] }) | null>(null);


    const householdsWithMembers = useMemo(() => {
        return households.map(h => ({
            ...h,
            members: residents.filter(r => r.householdId === h.id)
        })).filter(h => h.members.length > 0);
    }, [households, residents]);

    const filteredHouseholds = useMemo(() => {
        let results = householdsWithMembers;
        
        if (poorHouseholdFilter) {
            results = results.filter(h => h.isPoorHousehold);
        }

        if (businessFilter === 'business') {
            results = results.filter(h => h.isBusinessHousehold);
        } else if (businessFilter === 'non-business') {
            results = results.filter(h => !h.isBusinessHousehold);
        }

        if (fireSafetyFilter === 'in_group') {
            results = results.filter(h => h.isInFireSafetyGroup);
        } else if (fireSafetyFilter === 'not_in_group') {
            results = results.filter(h => !h.isInFireSafetyGroup);
        }

        if (houseNumberSearch) {
            results = results.filter(h => h.houseNumber.toLowerCase().includes(houseNumberSearch.toLowerCase()));
        }

        if (searchTerm) {
            results = results.filter(h =>
                h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.members.some(m => m.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return results;
    }, [householdsWithMembers, searchTerm, houseNumberSearch, poorHouseholdFilter, businessFilter, fireSafetyFilter]);
    
    const handleToggleSelect = (householdId: string) => {
        setSelectedHouseholdIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(householdId)) {
                newSet.delete(householdId);
            } else {
                newSet.add(householdId);
            }
            return newSet;
        });
    };

    const handleSendBatchMessage = (content: string, viaZalo: boolean) => {
        const newMessages: Message[] = [];
        const timestamp = new Date().toISOString();
        let memberCount = 0;

        selectedHouseholdIds.forEach(householdId => {
            const household = householdsWithMembers.find(h => h.id === householdId);
            if (household) {
                household.members.forEach(member => {
                    newMessages.push({
                        id: `M${Date.now()}-${member.id}`,
                        residentId: member.id,
                        sender: 'admin',
                        content,
                        timestamp,
                    });
                    memberCount++;
                });
            }
        });

        setMessages(prev => [...prev, ...newMessages]);
        setIsBatchMessageModalOpen(false);
        
        const zaloMessage = viaZalo && zaloOAConnected ? ' qua Zalo' : '';
        addToast(`Đã gửi tin nhắn đến ${memberCount} thành viên trong ${selectedHouseholdIds.size} hộ${zaloMessage}.`, 'success');
        
        setSelectedHouseholdIds(new Set());
    };

    const handleGenerateQR = (household: Household & { members: Resident[] }) => {
        setQrCodeHousehold(household);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative w-full max-w-sm">
                            <input
                                type="text"
                                placeholder="Tìm theo địa chỉ, tên chủ hộ, thành viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        <div className="relative w-full max-w-xs">
                            <input
                              type="text"
                              placeholder="Tìm theo số nhà..."
                              value={houseNumberSearch}
                              onChange={(e) => setHouseNumberSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border-l pl-4">
                             <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={poorHouseholdFilter}
                                  onChange={(e) => setPoorHouseholdFilter(e.target.checked)}
                                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Hộ nghèo</span>
                            </label>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="business-filter" className="text-sm font-medium text-slate-600 whitespace-nowrap">Kinh doanh:</label>
                                <select
                                    id="business-filter"
                                    value={businessFilter}
                                    onChange={(e) => setBusinessFilter(e.target.value as 'all' | 'business' | 'non-business')}
                                    className="border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 py-1.5 px-2 text-sm bg-white"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="business">Có</option>
                                    <option value="non-business">Không</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="fire-safety-filter" className="text-sm font-medium text-slate-600 whitespace-nowrap">Tổ PCCC:</label>
                                <select
                                    id="fire-safety-filter"
                                    value={fireSafetyFilter}
                                    onChange={(e) => setFireSafetyFilter(e.target.value as 'all' | 'in_group' | 'not_in_group')}
                                    className="border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 py-1.5 px-2 text-sm bg-white"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="in_group">Thuộc tổ PCCC</option>
                                    <option value="not_in_group">Không thuộc</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsBatchMessageModalOpen(true)}
                        disabled={selectedHouseholdIds.size === 0}
                        className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068M15.75 21H9a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 019 3h6.75A2.25 2.25 0 0118 5.25v8.25" /></svg>
                        <span>Gửi thông báo hàng loạt ({selectedHouseholdIds.size})</span>
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredHouseholds.map(h => (
                    <HouseholdCard 
                        key={h.id}
                        household={h}
                        members={h.members}
                        isSelected={selectedHouseholdIds.has(h.id)}
                        onToggleSelect={() => handleToggleSelect(h.id)}
                        onGenerateQR={() => handleGenerateQR(h)}
                        onUpdateHousehold={onUpdateHousehold}
                    />
                ))}
            </div>

            {isBatchMessageModalOpen && (
                <BatchMessageModal 
                    isOpen={isBatchMessageModalOpen}
                    onClose={() => setIsBatchMessageModalOpen(false)}
                    onSend={handleSendBatchMessage}
                    householdCount={selectedHouseholdIds.size}
                    zaloOAConnected={zaloOAConnected}
                />
            )}

            {qrCodeHousehold && (
                <QRCodeModal
                    household={qrCodeHousehold}
                    onClose={() => setQrCodeHousehold(null)}
                />
            )}
        </div>
    );
};

export default HouseholdManagement;