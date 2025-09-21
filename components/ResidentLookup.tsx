import React, { useState } from 'react';
import type { Resident } from '../types';

interface ResidentLookupProps {
  allResidents: Resident[];
  onSwitchToLogin: () => void;
}

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
  );
};

const ResidentLookup: React.FC<ResidentLookupProps> = ({ allResidents, onSwitchToLogin }) => {
  const [idNumber, setIdNumber] = useState('');
  const [dob, setDob] = useState('');
  const [foundResident, setFoundResident] = useState<Resident | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFoundResident(null);
    setIsLoading(true);

    setTimeout(() => {
        if (!idNumber || !dob) {
            setError('Vui lòng nhập đầy đủ Số CCCD và Ngày sinh.');
            setIsLoading(false);
            return;
        }

        const resident = allResidents.find(r => r.idNumber === idNumber.trim() && r.dateOfBirth === dob);
        
        if (resident) {
            setFoundResident(resident);
        } else {
            setError('Không tìm thấy thông tin. Vui lòng kiểm tra lại Số CCCD và Ngày sinh.');
        }
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
            </svg>
            <h1 className="text-3xl font-bold text-slate-800 ml-3">Tra cứu thông tin</h1>
        </div>
        <p className="text-slate-600">Nhập thông tin để xem chi tiết đăng ký cư trú của bạn.</p>
      </div>
      
      {!foundResident ? (
        <form className="mt-8 space-y-6" onSubmit={handleLookup}>
          <div>
            <label className="text-sm font-bold text-slate-700 tracking-wide">Số CCCD/CMND</label>
            <input
              className="w-full text-base py-2 border-b border-slate-300 focus:outline-none focus:border-blue-500"
              type="text"
              placeholder="Nhập số CCCD của bạn"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
          </div>
          <div className="mt-8">
            <label className="text-sm font-bold text-slate-700 tracking-wide">Ngày sinh</label>
            <input
              className="w-full text-base py-2 border-b border-slate-300 focus:outline-none focus:border-blue-500"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center bg-blue-600 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-200 hover:bg-blue-700 disabled:bg-slate-400"
            >
              {isLoading ? 'Đang tìm kiếm...' : 'Tra cứu'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8">
            <div className="border-t border-slate-200">
                <dl>
                    <InfoRow label="Họ và tên" value={foundResident.fullName} />
                    <InfoRow label="Ngày sinh" value={new Date(foundResident.dateOfBirth).toLocaleDateString('vi-VN')} />
                    <InfoRow label="Giới tính" value={foundResident.gender} />
                    <InfoRow label="Số CCCD" value={foundResident.idNumber} />
                    <InfoRow label="Số điện thoại" value={foundResident.phoneNumber} />
                    <InfoRow label="Địa chỉ" value={foundResident.address} />
                    <InfoRow label="Loại cư trú" value={foundResident.residenceType} />
                    <InfoRow label="Tình trạng" value={foundResident.status} />
                    <InfoRow label="Quan hệ với chủ hộ" value={foundResident.relationshipToHead} />
                    <InfoRow label="Ngày hết hạn tạm trú" value={foundResident.expiryDate ? new Date(foundResident.expiryDate).toLocaleDateString('vi-VN') : null} />
                </dl>
            </div>
             <button
              type="button"
              onClick={() => { setFoundResident(null); setIdNumber(''); setDob(''); }}
              className="w-full mt-6 flex justify-center bg-green-600 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-200 hover:bg-green-700"
            >
              Tra cứu thông tin khác
            </button>
        </div>
      )}

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Đăng nhập dành cho cán bộ
        </button>
      </div>
    </div>
  );
};

export default ResidentLookup;
