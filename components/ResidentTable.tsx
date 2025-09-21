import React, { useState } from 'react';
import type { Resident, Message } from '../types';
import { ResidentStatus } from '../types';

interface ResidentTableProps {
  residents: Resident[];
  onEdit: (resident: Resident) => void;
  onDelete: (residentId: string) => void;
  messages: Message[];
}

const getStatusBadge = (status: ResidentStatus) => {
    switch(status) {
        case ResidentStatus.ACTIVE:
            return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Đang cư trú</span>;
        case ResidentStatus.ABSENT:
            return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Tạm vắng</span>;
        case ResidentStatus.PENDING:
            return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Chờ duyệt</span>;
        case ResidentStatus.DECEASED:
            return <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-200 rounded-full">Đã qua đời</span>;
        case ResidentStatus.MISSING:
            return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Mất tích</span>;
        default:
            return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">Không rõ</span>;
    }
}

const ResidentTable: React.FC<ResidentTableProps> = ({ residents, onEdit, onDelete, messages }) => {
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);

  const handleOpenConfirmModal = (resident: Resident) => {
    setResidentToDelete(resident);
  };
  
  const handleCloseConfirmModal = () => {
    setResidentToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (residentToDelete) {
      onDelete(residentToDelete.id);
      setResidentToDelete(null);
    }
  };

  const getLatestMessageTime = (residentId: string): string => {
    const residentMessages = messages
      .filter(m => m.residentId === residentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (residentMessages.length > 0) {
      return new Date(residentMessages[0].timestamp).toLocaleString('vi-VN');
    }
    
    return 'Chưa có tin nhắn';
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Họ và Tên</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày Sinh</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CCCD / Passport</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Loại Cư Trú</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tin nhắn cuối</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng Thái</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mã Hộ khẩu</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {residents.map((resident) => (
                <tr key={resident.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={resident.avatarUrl} alt={resident.fullName} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 flex items-center">
                          {resident.fullName}
                          {resident.isForeigner && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                              <title>Người nước ngoài</title>
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.72 7 7.92 7 9c0 1.08.488 2.28 1.256 2.682A6.978 6.978 0 0110 16a6.978 6.978 0 01-1.256-4.318C8.488 11.28 9 10.08 9 9c0-1.08-.488-2.28-1.256-2.682a6.012 6.012 0 01-3.412 1.709z" clipRule="evenodd" />
                            </svg>
                           )}
                          {resident.isPartyMember && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                              <title>Đảng viên</title>
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                          {resident.isVeteran && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                              <title>Quân nhân xuất ngũ</title>
                              <path fillRule="evenodd" d="M2.5 3.5A1.5 1.5 0 014 2h12a1.5 1.5 0 011.5 1.5v5.385a3.5 3.5 0 01-1.35 2.704l-5.5 4.596a1.5 1.5 0 01-1.798 0l-5.5-4.596A3.5 3.5 0 012.5 8.885V3.5zm1.5.5v5.385c0 .5.176.994.51 1.382l5.5 4.596 5.5-4.596c.334-.388.51-.882.51-1.382V4H4z" clipRule="evenodd" />
                            </svg>
                          )}
                          {resident.isRevolutionaryContributor && (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                              <title>Người có công với cách mạng</title>
                              <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.323 4.413a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.06L5.323 5.474a.75.75 0 010-1.06zm9.354 0a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                              <path d="M10 11a1 1 0 100-2 1 1 0 000 2z" />
                            </svg>
                          )}
                          {resident.isExPrisoner && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                                <title>Đã chấp hành án tù</title>
                                <path fillRule="evenodd" d="M11.622 3.192a.75.75 0 01.53 1.298l-3.055 3.056a.75.75 0 11-1.06-1.06l3.055-3.056a.75.75 0 01.53-.238z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10.372 10.613a.75.75 0 01.53 1.298l-6.11 6.11a.75.75 0 11-1.06-1.06l6.11-6.11a.75.75 0 01.53-.238z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M13.432 7.022a.75.75 0 011.06 0l2.805 2.805a.75.75 0 11-1.06 1.06l-2.805-2.805a.75.75 0 010-1.06z" clipRule="evenodd" />
                                <path d="M1.5 10.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5H2.25a.75.75 0 01-.75-.75z" />
                                <path d="M4.136 4.136a.75.75 0 011.06 0l2.805 2.805a.75.75 0 01-1.06 1.06L4.136 5.196a.75.75 0 010-1.06z" />
                              </svg>
                          )}
                           {resident.hasMentalIllness && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                                <title>Bệnh tâm thần</title>
                                <path d="M7 6a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 017 6z" />
                                <path fillRule="evenodd" d="M4.5 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zM6.31 9.44a.75.75 0 01.98-.16l.07.05 3.3 2.2a.75.75 0 01-.84 1.22l-3.3-2.2a.75.75 0 01-.21-.91v-.2z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000 16zM3.5 10a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" clipRule="evenodd" />
                              </svg>
                          )}
                           {resident.isExRehab && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                                <title>Đã cai nghiện</title>
                                <path d="M10 3.162l-4.015 6.527a2.5 2.5 0 00-.022 2.653l4.015 6.15A1 1 0 0010.8 19h.01a1 1 0 00.812-.508l4.015-6.15a2.5 2.5 0 00-.022-2.653L10.8 3.162a1 1 0 00-1.6 0z" />
                                <path fillRule="evenodd" d="M10 12.5a.5.5 0 01-.5-.5v-2h-2a.5.5 0 010-1h2v-2a.5.5 0 011 0v2h2a.5.5 0 010 1h-2v2a.5.5 0 01-.5.5z" clipRule="evenodd" />
                              </svg>
                          )}
                        </div>
                        <div className="text-sm text-slate-500">{resident.phoneNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(resident.dateOfBirth).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{resident.passportNumber || resident.idNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{resident.residenceType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getLatestMessageTime(resident.id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(resident.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{resident.householdId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => onEdit(resident)} className="text-indigo-600 hover:text-indigo-900 font-medium">Sửa</button>
                    <button onClick={() => handleOpenConfirmModal(resident)} className="text-red-600 hover:text-red-900 font-medium">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {residentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-800">Xác nhận xóa</h3>
            <p className="mt-2 text-slate-600">
              Bạn có chắc chắn muốn xóa nhân khẩu <span className="font-bold">{residentToDelete.fullName}</span>? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseConfirmModal}
                className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResidentTable;