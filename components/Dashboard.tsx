
import React from 'react';
import StatCard from './StatCard';
import AgeDistributionChart from './charts/AgeDistributionChart';
import GenderDistributionChart from './charts/GenderDistributionChart';
import ResidenceTypeChart from './charts/ResidenceTypeChart';
import NationalityDistributionChart from './charts/NationalityDistributionChart';
import EthnicityDistributionChart from './charts/EthnicityDistributionChart';
import ReligionDistributionChart from './charts/ReligionDistributionChart';
import type { Resident } from '../types';
import { ResidentStatus } from '../types';

interface DashboardProps {
    residents: Resident[];
}

const Dashboard: React.FC<DashboardProps> = ({ residents }) => {
    const totalResidents = residents.length;
    const activeResidents = residents.filter(r => r.status === ResidentStatus.ACTIVE).length;
    const households = new Set(residents.map(r => r.householdId)).size;
    const pendingApprovals = residents.filter(r => r.status === ResidentStatus.PENDING).length;
    const foreignResidents = residents.filter(r => r.isForeigner).length;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Tổng số nhân khẩu" value={totalResidents.toString()} icon="users" color="blue" />
                <StatCard title="Đang cư trú" value={activeResidents.toString()} icon="check" color="green" />
                <StatCard title="Tổng số hộ" value={households.toString()} icon="home" color="indigo" />
                <StatCard title="Người nước ngoài" value={foreignResidents.toString()} icon="globe" color="purple" />
                <StatCard title="Chờ duyệt" value={pendingApprovals.toString()} icon="pending" color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Phân bố độ tuổi</h3>
                    <div style={{ height: '300px' }}>
                        <AgeDistributionChart data={residents} />
                    </div>
                </div>
                 <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4">Phân bố quốc tịch (Người nước ngoài)</h3>
                     <div style={{ height: '300px' }}>
                        <NationalityDistributionChart data={residents} />
                    </div>
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                 <div className="bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4">Tỷ lệ giới tính</h3>
                     <div style={{ height: '200px' }}>
                        <GenderDistributionChart data={residents} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Loại cư trú</h3>
                    <div style={{ height: '200px' }}>
                        <ResidenceTypeChart data={residents} />
                    </div>
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                 <div className="bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4">Phân bố Dân tộc</h3>
                     <div style={{ height: '200px' }}>
                        <EthnicityDistributionChart data={residents} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Phân bố Tôn giáo</h3>
                    <div style={{ height: '200px' }}>
                        <ReligionDistributionChart data={residents} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;