
import React, { useState, useMemo } from 'react';
// FIX: Separated enum imports from type imports to allow enums to be used as values at runtime.
import type { Resident, ToastMessage, Household } from '../types';
import { ResidenceType, ResidentStatus } from '../types';

// XLSX is globally available from the script tag in index.html
declare var XLSX: any;

interface ReportsProps {
    residents: Resident[];
    households: Household[];
    zaloOAConnected: boolean;
    addToast: (message: string, type?: ToastMessage['type']) => void;
}

const Reports: React.FC<ReportsProps> = ({ residents, households, zaloOAConnected, addToast }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ResidentStatus | 'all'>('all');
    const [selectedTemplate, setSelectedTemplate] = useState('CT01');


    const expiringResidents = useMemo(() => {
        const today = new Date();
        const next90days = new Date();
        next90days.setDate(today.getDate() + 90);
        return residents.filter(r => {
            if (r.isForeigner || !r.expiryDate) return false;
            const expiry = new Date(r.expiryDate);
            return (r.residenceType === ResidenceType.TEMPORARY || r.residenceType === ResidenceType.TEMPORARY_WITH_HOUSE) &&
                   expiry >= today && expiry <= next90days;
        }).sort((a,b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
    }, [residents]);

    const expiringVisas = useMemo(() => {
        const today = new Date();
        const next90days = new Date();
        next90days.setDate(today.getDate() + 90);
        return residents.filter(r => {
            if (!r.isForeigner || !r.visaExpiryDate) return false;
            const expiry = new Date(r.visaExpiryDate);
            return expiry >= today && expiry <= next90days;
        }).sort((a,b) => new Date(a.visaExpiryDate!).getTime() - new Date(b.visaExpiryDate!).getTime());
    }, [residents]);

    const filteredResidents = useMemo(() => {
        return residents.filter(r => {
            const matchesSearch = searchTerm === '' ||
                r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.idNumber.includes(searchTerm) ||
                r.address.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [residents, searchTerm, statusFilter]);

    const handleSendReminder = (resident: Resident, type: 'tạm trú' | 'visa') => {
        const expiryDate = type === 'tạm trú' ? resident.expiryDate : resident.visaExpiryDate;
        const message = `Xin chào ${resident.fullName}, giấy ${type} của bạn sẽ hết hạn vào ngày ${new Date(expiryDate!).toLocaleDateString('vi-VN')}. Vui lòng làm thủ tục gia hạn.`;
        console.log(`Sending Zalo message to ${resident.phoneNumber}: ${message}`);
        addToast(`Đã gửi nhắc nhở gia hạn ${type} qua Zalo cho ${resident.fullName}.`, 'success');
    };

    const handleExport = () => {
        const dataToExport = filteredResidents.map(r => ({
            'ID': r.id,
            'Họ và Tên': r.fullName,
            'Ngày Sinh': new Date(r.dateOfBirth).toLocaleDateString('vi-VN'),
            'Giới tính': r.gender,
            'Dân tộc': r.ethnicity || '',
            'Tôn giáo': r.religion || '',
            'CCCD/CMND': r.idNumber,
            'Số Passport': r.passportNumber || '',
            'Quốc tịch': r.nationality || '',
            'Số điện thoại': r.phoneNumber,
            'Địa chỉ': r.address,
            'Tổ': r.group,
            'Loại cư trú': r.residenceType,
            'Trạng thái': r.status,
            'Ngày hết hạn tạm trú': r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('vi-VN') : '',
            'Loại Visa': r.visaType || '',
            'Ngày hết hạn Visa': r.visaExpiryDate ? new Date(r.visaExpiryDate).toLocaleDateString('vi-VN') : '',
            'Quan hệ với chủ hộ': r.relationshipToHead,
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách cư dân');
        XLSX.writeFile(workbook, `BaoCaoCuDan_${new Date().toISOString().split('T')[0]}.xlsx`);
    };
    
    // --- Official Report Generation ---
    
    const generateCT01 = () => {
        const data = residents
            .filter(r => !r.isForeigner && (r.status === ResidentStatus.DECEASED || r.status === ResidentStatus.PENDING))
            .map((r, index) => ({
                'STT': index + 1,
                'Họ và tên': r.fullName,
                'Năm sinh': new Date(r.dateOfBirth).getFullYear(),
                'Giới tính': r.gender,
                'Nơi thường trú': r.address,
                'Ghi chú': r.status === ResidentStatus.DECEASED ? 'Đã qua đời' : 'Chờ duyệt/Mới chuyển đến',
            }));

        if (data.length === 0) {
            addToast('Không có dữ liệu biến động (công dân VN) để xuất báo cáo CT01.', 'info');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'CT01');
        XLSX.writeFile(workbook, `CT01_BienDongNhanKhau_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const generateCT02 = () => {
        const data = residents.filter(r => !r.isForeigner).map((r, index) => ({
            'STT': index + 1,
            'Họ và tên': r.fullName,
            'Ngày sinh': new Date(r.dateOfBirth).toLocaleDateString('vi-VN'),
            'Giới tính': r.gender,
            'Dân tộc': r.ethnicity || 'Kinh',
            'Tôn giáo': r.religion || 'Không',
            'Số CCCD': r.idNumber,
            'Nơi thường trú/tạm trú': r.address,
            'Quan hệ với chủ hộ': r.relationshipToHead,
            'Ghi chú': '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'CT02');
        XLSX.writeFile(workbook, `CT02_DanhSachNhanKhau_${new Date().toISOString().split('T')[0]}.xlsx`);
    };
    
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

    const generateCT07 = () => {
        const vnResidents = residents.filter(r => !r.isForeigner);
        const total = vnResidents.length;
        const male = vnResidents.filter(r => r.gender === 'Nam').length;
        const female = total - male;
        const ageGroups = {
            '0-17': vnResidents.filter(r => calculateAge(r.dateOfBirth) <= 17).length,
            '18-60': vnResidents.filter(r => {
                const age = calculateAge(r.dateOfBirth);
                return age >= 18 && age <= 60;
            }).length,
            '61+': vnResidents.filter(r => calculateAge(r.dateOfBirth) > 60).length,
        };
        const permanent = vnResidents.filter(r => r.residenceType === ResidenceType.PERMANENT).length;
        const temporary = vnResidents.filter(r => r.residenceType === ResidenceType.TEMPORARY || r.residenceType === ResidenceType.TEMPORARY_WITH_HOUSE).length;
        
        const ethnicityCounts = vnResidents.reduce((acc, r) => {
            const key = r.ethnicity || 'Không rõ';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const religionCounts = vnResidents.reduce((acc, r) => {
            const key = r.religion || 'Không';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        let data = [
            {'Chỉ tiêu': 'TỔNG SỐ NHÂN KHẨU (CÔNG DÂN VN)', 'Đơn vị tính': 'Người', 'Số lượng': total},
            {'Chỉ tiêu': '1. Phân theo giới tính', 'Đơn vị tính': '', 'Số lượng': ''},
            {'Chỉ tiêu': '   - Nam', 'Đơn vị tính': 'Người', 'Số lượng': male},
            {'Chỉ tiêu': '   - Nữ', 'Đơn vị tính': 'Người', 'Số lượng': female},
            {'Chỉ tiêu': '2. Phân theo độ tuổi', 'Đơn vị tính': '', 'Số lượng': ''},
            {'Chỉ tiêu': '   - Từ 0 đến 17 tuổi', 'Đơn vị tính': 'Người', 'Số lượng': ageGroups['0-17']},
            {'Chỉ tiêu': '   - Từ 18 đến 60 tuổi', 'Đơn vị tính': 'Người', 'Số lượng': ageGroups['18-60']},
            {'Chỉ tiêu': '   - Trên 60 tuổi', 'Đơn vị tính': 'Người', 'Số lượng': ageGroups['61+']},
            {'Chỉ tiêu': '3. Phân theo loại cư trú', 'Đơn vị tính': '', 'Số lượng': ''},
            {'Chỉ tiêu': '   - Thường trú', 'Đơn vị tính': 'Người', 'Số lượng': permanent},
            {'Chỉ tiêu': '   - Tạm trú', 'Đơn vị tính': 'Người', 'Số lượng': temporary},
            {'Chỉ tiêu': '4. Phân theo Dân tộc', 'Đơn vị tính': '', 'Số lượng': ''},
        ];
        
        Object.entries(ethnicityCounts).forEach(([key, value]) => {
            data.push({'Chỉ tiêu': `   - ${key}`, 'Đơn vị tính': 'Người', 'Số lượng': value});
        });
        
        data.push({'Chỉ tiêu': '5. Phân theo Tôn giáo', 'Đơn vị tính': '', 'Số lượng': ''});
        
        Object.entries(religionCounts).forEach(([key, value]) => {
            data.push({'Chỉ tiêu': `   - ${key}`, 'Đơn vị tính': 'Người', 'Số lượng': value});
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'CT07');
        XLSX.writeFile(workbook, `CT07_ThongKeNhanKhau_${new Date().toISOString().split('T')[0]}.xlsx`);
    };
    
    const generateKV01 = () => {
        const data = households.map((h, index) => {
            const head = residents.find(r => r.id === h.headOfHouseholdId);
            const members = residents.filter(r => r.householdId === h.id && !r.isForeigner);
            return {
                'STT': index + 1,
                'Số nhà': h.houseNumber,
                'Chủ hộ': head ? head.fullName : 'N/A',
                'Địa chỉ': h.address,
                'Số thành viên (Công dân VN)': members.length,
                'Ghi chú': '',
            };
        }).filter(h => h['Số thành viên (Công dân VN)'] > 0);

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'KV01');
        XLSX.writeFile(workbook, `KV01_DanhSachHoKhau_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const generateKV07 = () => {
        const pcccHouseholds = households.filter(h => h.isInFireSafetyGroup);
        
        if (pcccHouseholds.length === 0) {
            addToast('Không có hộ nào thuộc tổ liên gia PCCC để xuất báo cáo KV07.', 'info');
            return;
        }

        const data = pcccHouseholds.map((h, index) => {
            const head = residents.find(r => r.id === h.headOfHouseholdId);
            const membersCount = residents.filter(r => r.householdId === h.id).length;
            return {
                'STT': index + 1,
                'Số nhà': h.houseNumber,
                'Địa chỉ hộ': h.address,
                'Tên chủ hộ': head ? head.fullName : 'N/A',
                'Số thành viên': membersCount,
                'Là hộ kinh doanh': h.isBusinessHousehold ? 'Có' : 'Không',
                'Ghi chú': '',
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'KV07');
        XLSX.writeFile(workbook, `KV07_BaoCaoPCCC_${new Date().toISOString().split('T')[0]}.xlsx`);
    };
    
    const generateKV08 = () => {
        const totalHouseholds = households.length;
        const pcccHouseholdsCount = households.filter(h => h.isInFireSafetyGroup).length;
        const businessHouseholdsCount = households.filter(h => h.isBusinessHousehold).length;
        const businessInPcccCount = households.filter(h => h.isBusinessHousehold && h.isInFireSafetyGroup).length;

        const data = [
            { 'Chỉ tiêu thống kê PCCC': 'Tổng số hộ', 'Số lượng': totalHouseholds },
            { 'Chỉ tiêu thống kê PCCC': 'Số hộ thuộc tổ liên gia PCCC', 'Số lượng': pcccHouseholdsCount },
            { 'Chỉ tiêu thống kê PCCC': 'Tỷ lệ tham gia tổ PCCC (%)', 'Số lượng': totalHouseholds > 0 ? ((pcccHouseholdsCount / totalHouseholds) * 100).toFixed(2) : 0 },
            { 'Chỉ tiêu thống kê PCCC': 'Tổng số hộ kinh doanh', 'Số lượng': businessHouseholdsCount },
            { 'Chỉ tiêu thống kê PCCC': 'Số hộ kinh doanh thuộc tổ PCCC', 'Số lượng': businessInPcccCount },
        ];
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'KV08');
        XLSX.writeFile(workbook, `KV08_ThongKePCCC_${new Date().toISOString().split('T')[0]}.xlsx`);
    };


    const handleGenerateOfficialReport = () => {
        switch (selectedTemplate) {
            case 'CT01':
                generateCT01();
                break;
            case 'CT02':
                generateCT02();
                break;
            case 'CT07':
                generateCT07();
                break;
            case 'KV01':
                generateKV01();
                break;
            case 'KV07':
                generateKV07();
                break;
            case 'KV08':
                generateKV08();
                break;
            default:
                addToast(`Mẫu báo cáo ${selectedTemplate} chưa được hỗ trợ.`, 'info');
        }
    };


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Nhân khẩu VN sắp hết hạn tạm trú (90 ngày)</h3>
                    <div className="overflow-x-auto max-h-64">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Họ và Tên</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Ngày hết hạn</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Còn lại</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {expiringResidents.length > 0 ? expiringResidents.map(r => {
                                    const daysLeft = Math.ceil((new Date(r.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <tr key={r.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">{r.fullName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{new Date(r.expiryDate!).toLocaleDateString('vi-VN')}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${daysLeft < 30 ? 'text-red-600' : 'text-amber-600'}`}>{daysLeft} ngày</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                <button onClick={() => handleSendReminder(r, 'tạm trú')} disabled={!zaloOAConnected} className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-md text-xs hover:bg-blue-200 transition-colors disabled:bg-slate-100 disabled:text-slate-400">Zalo</button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-sm text-slate-500">Không có ai sắp hết hạn tạm trú.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Visa người nước ngoài sắp hết hạn (90 ngày)</h3>
                    <div className="overflow-x-auto max-h-64">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Họ và Tên</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Ngày hết hạn</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Còn lại</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-slate-200">
                                {expiringVisas.length > 0 ? expiringVisas.map(r => {
                                    const daysLeft = Math.ceil((new Date(r.visaExpiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <tr key={r.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">{r.fullName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{new Date(r.visaExpiryDate!).toLocaleDateString('vi-VN')}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${daysLeft < 30 ? 'text-red-600' : 'text-amber-600'}`}>{daysLeft} ngày</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                <button onClick={() => handleSendReminder(r, 'visa')} disabled={!zaloOAConnected} className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-md text-xs hover:bg-blue-200 transition-colors disabled:bg-slate-100 disabled:text-slate-400">Zalo</button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-sm text-slate-500">Không có visa nào sắp hết hạn.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Báo cáo theo mẫu Bộ Công an</h3>
                <p className="text-sm text-slate-500 mb-4">Chọn mẫu báo cáo và nhấn nút để tạo và tải về file Excel. Dữ liệu chỉ bao gồm công dân Việt Nam.</p>
                <div className="flex items-center gap-4">
                    <select
                        id="report-template"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 px-3 bg-white w-full max-w-sm"
                    >
                        <option value="CT01">CT01 - Biến động nhân, hộ khẩu</option>
                        <option value="CT02">CT02 - Danh sách chi tiết nhân khẩu</option>
                        <option value="CT03" disabled>CT03 - (Chưa hỗ trợ)</option>
                        <option value="CT04" disabled>CT04 - (Chưa hỗ trợ)</option>
                        <option value="CT05" disabled>CT05 - (Chưa hỗ trợ)</option>
                        <option value="CT06" disabled>CT06 - (Chưa hỗ trợ)</option>
                        <option value="CT07">CT07 - Thống kê đặc điểm nhân khẩu</option>
                        <option value="CT08" disabled>CT08 - (Chưa hỗ trợ)</option>
                        <option value="CT09" disabled>CT09 - (Chưa hỗ trợ)</option>
                        <option value="CT10" disabled>CT10 - (Chưa hỗ trợ)</option>
                        <option value="CT11" disabled>CT11 - (Chưa hỗ trợ)</option>
                        <option value="CT12" disabled>CT12 - (Chưa hỗ trợ)</option>
                        <option value="KV01">KV01 - Danh sách hộ khẩu</option>
                        <option value="KV07">KV07 - Báo cáo công tác PCCC</option>
                        <option value="KV08">KV08 - Thống kê về PCCC</option>
                    </select>
                    <button
                        onClick={handleGenerateOfficialReport}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.993.883L4 8v10a2 2 0 002 2h8a2 2 0 002-2V8a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" clipRule="evenodd" />
                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM2 12a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>Tạo & Tải về</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                 <h3 className="text-lg font-semibold text-slate-800 mb-4">Báo cáo chi tiết</h3>
                <div className="flex justify-between items-center mb-4 gap-4">
                     <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-xs pl-4 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ResidentStatus | 'all')}
                            className="border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 py-2"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            {Object.values(ResidentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        <span>Xuất Excel</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                             <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Họ và Tên</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">CCCD/Passport</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Địa chỉ</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Tổ</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Loại Cư Trú</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Trạng Thái</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-slate-200">
                             {filteredResidents.map(r => (
                                 <tr key={r.id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-800">{r.fullName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{r.passportNumber || r.idNumber}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 truncate max-w-xs">{r.address}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{r.group}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{r.residenceType}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{r.status}</td>
                                 </tr>
                             ))}
                         </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;