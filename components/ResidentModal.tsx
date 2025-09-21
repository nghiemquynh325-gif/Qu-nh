import React, { useState, useEffect } from 'react';
import type { Resident, Household } from '../types';
import { ResidenceType, ResidentStatus } from '../types';
import { addressData } from '../data/addressData';

interface ResidentModalProps {
  resident: Resident | null;
  onClose: () => void;
  onSave: (resident: Resident & { houseNumber?: string, province?: string, ward?: string, street?: string }) => void;
  allHouseholds: Household[];
}

const initialFormData = {
    fullName: '',
    dateOfBirth: '',
    gender: 'Nam' as 'Nam' | 'Nữ',
    idNumber: '',
    phoneNumber: '',
    residenceType: ResidenceType.PERMANENT,
    status: ResidentStatus.ACTIVE,
    householdId: '',
    address: '',
    group: '',
    expiryDate: '',
    relationshipToHead: 'Chủ hộ',
    isPartyMember: false,
    isVeteran: false,
    isRevolutionaryContributor: false,
    isExPrisoner: false,
    hasMentalIllness: false,
    isExRehab: false,
    landUseCertificateNumber: '',
    houseOwnershipDetails: '',
    mapSheetNumber: '',
    landPlotNumber: '',
    isForeigner: false,
    nationality: '',
    passportNumber: '',
    visaType: '',
    visaExpiryDate: '',
    ethnicity: '',
    religion: '',
    // Structured Address
    houseNumber: '',
    street: '',
    ward: '',
    province: '',
};

const ResidentModal: React.FC<ResidentModalProps> = ({ resident, onClose, onSave, allHouseholds }) => {
  const [formData, setFormData] = useState<Omit<Resident, 'id' | 'avatarUrl' | 'joinDate'> & { houseNumber?: string, province?: string, ward?: string, street?: string }>(initialFormData);
  const [wards, setWards] = useState<string[]>([]);
  const [isManualAddress, setIsManualAddress] = useState(false);

  const relationshipOptions = ['Chủ hộ', 'Vợ', 'Chồng', 'Con', 'Bố', 'Mẹ', 'Ông', 'Bà', 'Khác'];
  const isHeadOfHousehold = formData.relationshipToHead === 'Chủ hộ';
  const showLandInfo = (formData.residenceType === ResidenceType.PERMANENT || formData.residenceType === ResidenceType.TEMPORARY_WITH_HOUSE) && isHeadOfHousehold;

  useEffect(() => {
    if (resident) {
      const household = resident.householdId ? allHouseholds.find(h => h.id === resident.householdId) : null;
      setFormData({
        ...initialFormData,
        ...resident,
        houseNumber: household?.houseNumber || '',
        province: household?.province || '',
        ward: household?.ward || '',
        street: household?.street || '',
      });
      // Logic to set manual address mode when editing
      if (household && (!household.province || !household.ward)) {
          setIsManualAddress(true);
      } else {
          setIsManualAddress(false);
      }
    } else {
      setFormData(initialFormData);
      setIsManualAddress(false); // Default for new resident
    }
  }, [resident, allHouseholds]);

  // Handle cascading dropdowns
  useEffect(() => {
    if (formData.province) {
        const selectedProvince = addressData.find(p => p.name === formData.province);
        setWards(selectedProvince?.wards || []);
    } else {
        setWards([]);
    }
  }, [formData.province]);


  // Auto-populate address when selecting a household for a member
  useEffect(() => {
    if (!isHeadOfHousehold && formData.householdId) {
        const selectedHousehold = allHouseholds.find(h => h.id === formData.householdId);
        if (selectedHousehold) {
            setFormData(prev => ({
                ...prev,
                address: selectedHousehold.address,
                group: selectedHousehold.group
            }));
        }
    }
  }, [formData.householdId, isHeadOfHousehold, allHouseholds]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    
    setFormData(prev => {
        const newState = { ...prev, [name]: value };
        if (name === 'province') {
            newState.ward = '';
        }
        return newState;
    });
  };

  const formatAddress = (data: typeof formData): string => {
      const parts = [
          data.houseNumber,
          data.street,
          data.ward,
          data.province
      ];
      return parts.filter(Boolean).join(', ');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalAddress = formData.address;
    if (isHeadOfHousehold && !isManualAddress) {
        finalAddress = formatAddress(formData);
    }
    
    const finalFormData = { ...formData, address: finalAddress };

    if(isHeadOfHousehold && isManualAddress) {
        finalFormData.province = '';
        finalFormData.ward = '';
        finalFormData.street = '';
        finalFormData.houseNumber = '';
    }

    const saveData: Resident & { houseNumber?: string, province?: string, ward?: string, street?: string } = resident 
      ? { ...resident, ...finalFormData }
      : { 
          ...finalFormData,
          id: '', 
          avatarUrl: '', // Parent will fill this
          joinDate: '' // Parent will fill this
        };
    onSave(saveData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold">{resident ? 'Chỉnh sửa thông tin' : 'Thêm nhân khẩu mới'}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Form Fields */}
             <div className="md:col-span-3">
                 <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="isForeigner" checked={!!formData.isForeigner} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700">Đây là người nước ngoài</span>
                </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Họ và Tên</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Ngày sinh</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">Giới tính</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2">
                <option>Nam</option>
                <option>Nữ</option>
              </select>
            </div>

            {!formData.isForeigner && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Số CCCD/CMND</label>
                        <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Dân tộc</label>
                      <input type="text" name="ethnicity" value={formData.ethnicity} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-700">Tôn giáo</label>
                      <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                    </div>
                </>
            )}

            {formData.isForeigner && (
                 <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Quốc tịch</label>
                        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Số Passport</label>
                        <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Loại Visa</label>
                        <input type="text" name="visaType" value={formData.visaType} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Ngày hết hạn Visa</label>
                        <input type="date" name="visaExpiryDate" value={formData.visaExpiryDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                    </div>
                </>
            )}

             <div>
              <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
            </div>

            <div className="md:col-span-3"><hr className="my-2" /></div>

             <div>
              <label className="block text-sm font-medium text-slate-700">Quan hệ với chủ hộ</label>
              <select name="relationshipToHead" value={formData.relationshipToHead} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2">
                {relationshipOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Loại cư trú</label>
              <select name="residenceType" value={formData.residenceType} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2">
                {Object.values(ResidenceType).map(rt => <option key={rt} value={rt}>{rt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
              <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2">
                {Object.values(ResidentStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
             {(formData.residenceType === ResidenceType.TEMPORARY || formData.residenceType === ResidenceType.TEMPORARY_WITH_HOUSE) && (
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Ngày hết hạn tạm trú</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                </div>
             )}

            <div className="md:col-span-3"><hr className="my-2" /></div>
            
            <div className="md:col-span-3">
                <h4 className="font-semibold text-slate-800 mb-2">Thông tin Hộ khẩu & Địa chỉ</h4>
            </div>

            {isHeadOfHousehold ? (
                <>
                   <div className="md:col-span-3">
                        <label className="flex items-center space-x-2 cursor-pointer w-fit">
                          <input
                            type="checkbox"
                            checked={isManualAddress}
                            onChange={(e) => setIsManualAddress(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-700">Nhập địa chỉ thủ công</span>
                        </label>
                    </div>
                    {isManualAddress ? (
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-slate-700">Địa chỉ đầy đủ</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2"
                            placeholder="Nhập số nhà, đường, phường/xã, tỉnh/thành phố..."
                            required
                          />
                        </div>
                    ) : (
                        <>
                            <div>
                               <label className="block text-sm font-medium text-slate-700">Tỉnh/Thành phố</label>
                                <select name="province" value={formData.province} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required>
                                    <option value="">-- Chọn Tỉnh/TP --</option>
                                    {addressData.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Phường/Xã</label>
                                <select name="ward" value={formData.ward} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required disabled={!formData.province}>
                                    <option value="">-- Chọn Phường/Xã --</option>
                                    {wards.map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Đường/phố</label>
                                <input type="text" name="street" value={formData.street} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Số nhà</label>
                                <input type="text" name="houseNumber" value={formData.houseNumber} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                            </div>
                        </>
                    )}
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Tổ</label>
                        <input type="text" name="group" value={formData.group} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required />
                    </div>
                </>
            ) : (
                <>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Chọn Hộ khẩu</label>
                        <select name="householdId" value={formData.householdId} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required>
                            <option value="">-- Chọn hộ khẩu có sẵn --</option>
                            {allHouseholds.map(h => (
                                <option key={h.id} value={h.id}>{h.address}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-700">Địa chỉ (tự động điền)</label>
                        <input type="text" name="address" value={formData.address} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-slate-100" readOnly />
                    </div>
                </>
            )}

            {showLandInfo && (
                <>
                   <div className="md:col-span-3"><hr className="my-2" /></div>
                    <div className="md:col-span-3">
                        <h4 className="font-semibold text-slate-800 mb-2">Thông tin sở hữu nhà đất (nếu có)</h4>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Số GCNQSDĐ</label>
                        <input type="text" name="landUseCertificateNumber" value={formData.landUseCertificateNumber} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Số tờ bản đồ</label>
                        <input type="text" name="mapSheetNumber" value={formData.mapSheetNumber} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Số thửa đất</label>
                        <input type="text" name="landPlotNumber" value={formData.landPlotNumber} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-700">Chi tiết sở hữu/giao dịch</label>
                        <textarea name="houseOwnershipDetails" value={formData.houseOwnershipDetails} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" rows={2}></textarea>
                    </div>
                </>
            )}


            <div className="md:col-span-3"><hr className="my-2" /></div>
            <div className="md:col-span-3">
                <h4 className="font-semibold text-slate-800 mb-2">Thông tin khác</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="isPartyMember" checked={!!formData.isPartyMember} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                    <span className="text-sm font-medium text-slate-700">Đảng viên</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="isVeteran" checked={!!formData.isVeteran} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500" />
                    <span className="text-sm font-medium text-slate-700">Quân nhân</span>
                  </label>
                   <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="isRevolutionaryContributor" checked={!!formData.isRevolutionaryContributor} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-yellow-500 focus:ring-yellow-400" />
                    <span className="text-sm font-medium text-slate-700">Người có công</span>
                  </label>
                   <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="isExPrisoner" checked={!!formData.isExPrisoner} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Đã chấp hành án</span>
                  </label>
                   <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="hasMentalIllness" checked={!!formData.hasMentalIllness} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    <span className="text-sm font-medium text-slate-700">Bệnh tâm thần</span>
                  </label>
                   <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="isExRehab" checked={!!formData.isExRehab} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-sm font-medium text-slate-700">Đã cai nghiện</span>
                  </label>
                </div>
            </div>


          </div>
          <div className="p-4 bg-slate-50 flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50">Hủy</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentModal;
