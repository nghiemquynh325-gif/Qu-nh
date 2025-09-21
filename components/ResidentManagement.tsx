import React, { useState, useMemo, useRef, useEffect } from 'react';
import ResidentTable from './ResidentTable';
import ResidentModal from './ResidentModal';
import ScanIDModal from './ScanIDModal';
import type { Resident, Message, ToastMessage, Household } from '../types';
import { ResidentStatus, ResidenceType } from '../types';

// XLSX is globally available from the script tag in index.html
declare var XLSX: any;

interface ResidentManagementProps {
  residents: Resident[];
  setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
  allResidents: Resident[];
  allHouseholds: Household[];
  setHouseholds: React.Dispatch<React.SetStateAction<Household[]>>;
  messages: Message[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  onDeleteResident: (residentId: string) => void;
}

const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

interface AgeGenderFilter {
  active: boolean;
  gender: 'all' | 'Nam' | 'Nữ';
  from: string;
  to: string;
}

const ResidentManagement: React.FC<ResidentManagementProps> = ({ residents, setResidents, allResidents, allHouseholds, setHouseholds, messages, addToast, onDeleteResident }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [foreignerFilter, setForeignerFilter] = useState<'all' | 'foreign' | 'local'>('all');
  const [partyMemberFilter, setPartyMemberFilter] = useState<boolean>(false);
  const [veteranFilter, setVeteranFilter] = useState<boolean>(false);
  const [revolutionaryContributorFilter, setRevolutionaryContributorFilter] = useState<boolean>(false);
  const [exPrisonerFilter, setExPrisonerFilter] = useState<boolean>(false);
  const [mentalIllnessFilter, setMentalIllnessFilter] = useState<boolean>(false);
  const [exRehabFilter, setExRehabFilter] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ageGenderFilter, setAgeGenderFilter] = useState<AgeGenderFilter>({
    active: false,
    gender: 'all',
    from: '',
    to: '',
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]);
  
  const activeFilterCount = useMemo(() => {
      let count = 0;
      if (partyMemberFilter) count++;
      if (veteranFilter) count++;
      if (revolutionaryContributorFilter) count++;
      if (exPrisonerFilter) count++;
      if (mentalIllnessFilter) count++;
      if (exRehabFilter) count++;
      if (ageGenderFilter.active) count++;
      return count;
  }, [partyMemberFilter, veteranFilter, revolutionaryContributorFilter, exPrisonerFilter, mentalIllnessFilter, exRehabFilter, ageGenderFilter.active]);


  const handleAddResident = () => {
    setSelectedResident(null);
    setIsModalOpen(true);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const parseExcelRowToResident = (row: any, index: number): Resident | null => {
            const findValue = (keys: string[]): any => {
                for (const key of keys) {
                    const rowKey = Object.keys(row).find(rk => rk.trim().toLowerCase() === key.toLowerCase());
                    if (rowKey && row[rowKey] !== null && row[rowKey] !== undefined) return row[rowKey];
                }
                return undefined;
            };

            const fullName = findValue(['họ và tên', 'fullname']);
            if (!fullName) return null;

            const dobValue = findValue(['ngày sinh', 'dateofbirth']);
            let dateOfBirth = '';
            if (dobValue instanceof Date) {
                dateOfBirth = dobValue.toISOString().split('T')[0];
            } else if (dobValue) {
                const parsedDate = new Date(dobValue);
                if (!isNaN(parsedDate.getTime())) {
                    dateOfBirth = parsedDate.toISOString().split('T')[0];
                }
            }
             if (!dateOfBirth) return null;


            const getBoolean = (keys: string[]) => {
                const value = findValue(keys);
                if (typeof value === 'boolean') return value;
                if (typeof value === 'string') {
                    const V = value.trim().toLowerCase();
                    return V === 'true' || V === 'có' || V === 'x' || V === 'yes';
                }
                return !!value;
            };
            
            const residenceTypeStr = findValue(['loại cư trú', 'residencetype']) || '';
            let residenceType: ResidenceType = ResidenceType.PERMANENT;
            if (residenceTypeStr.toLowerCase().includes('tạm trú')) residenceType = ResidenceType.TEMPORARY;
            if (residenceTypeStr.toLowerCase().includes('có nhà')) residenceType = ResidenceType.TEMPORARY_WITH_HOUSE;
            
            const statusStr = findValue(['trạng thái', 'status']) || 'Đang cư trú';
            let status: ResidentStatus = ResidentStatus.ACTIVE;
            if (statusStr.toLowerCase().includes('vắng')) status = ResidentStatus.ABSENT;
            else if (statusStr.toLowerCase().includes('mất tích')) status = ResidentStatus.MISSING;
            else if (statusStr.toLowerCase().includes('qua đời')) status = ResidentStatus.DECEASED;
            else if (statusStr.toLowerCase().includes('chờ duyệt')) status = ResidentStatus.PENDING;

            return {
                id: `R${Date.now()}${index}`,
                avatarUrl: `https://picsum.photos/seed/${Date.now()}${index}/100/100`,
                joinDate: new Date().toISOString(),
                fullName: fullName,
                dateOfBirth: dateOfBirth,
                gender: (findValue(['giới tính', 'gender']) || 'Nam') === 'Nữ' ? 'Nữ' : 'Nam',
                idNumber: String(findValue(['cccd/cmnd', 'idnumber']) || ''),
                phoneNumber: String(findValue(['số điện thoại', 'phonenumber']) || ''),
                address: findValue(['địa chỉ', 'address']) || '',
                group: String(findValue(['tổ', 'group']) || ''),
                householdId: String(findValue(['mã hộ khẩu', 'householdid']) || ''),
                relationshipToHead: findValue(['quan hệ với chủ hộ', 'relationshiptohead']) || 'Thành viên',
                residenceType,
                status,
                ethnicity: findValue(['dân tộc', 'ethnicity']) || 'Kinh',
                religion: findValue(['tôn giáo', 'religion']) || 'Không',
                isPartyMember: getBoolean(['đảng viên', 'ispartymember']),
                isVeteran: getBoolean(['quân nhân', 'isveteran']),
                isRevolutionaryContributor: getBoolean(['người có công', 'isrevolutionarycontributor']),
                isExPrisoner: getBoolean(['đã chấp hành án', 'isexprisoner']),
                hasMentalIllness: getBoolean(['bệnh tâm thần', 'hasmentalillness']),
                isExRehab: getBoolean(['đã cai nghiện', 'isexrehab']),
            };
        };

        const newResidents = json.map(parseExcelRowToResident).filter((r): r is Resident => r !== null);

        if (newResidents.length > 0) {
          setResidents(prev => [...newResidents, ...prev]);
          addToast(`Đã nhập thành công ${newResidents.length} nhân khẩu.`, 'success');
        } else {
          addToast('Không tìm thấy dữ liệu hợp lệ trong file. Vui lòng kiểm tra tên cột (Họ và Tên, Ngày Sinh) và định dạng.', 'error');
        }
      } catch (error) {
        console.error("Lỗi khi xử lý file Excel:", error);
        addToast('Có lỗi xảy ra khi đọc file. File có thể bị hỏng hoặc không đúng định dạng.', 'error');
      } finally {
        if (e.target) e.target.value = ''; // Reset file input
      }
    };
    reader.readAsBinaryString(file);
  };


  const handleAddResidentFromScan = () => {
    setIsScanModalOpen(true);
  };

  const handleEditResident = (resident: Resident) => {
    setSelectedResident(resident);
    setIsModalOpen(true);
  };
  
  const handleSaveResident = (residentData: Resident & { houseNumber?: string, province?: string, ward?: string, street?: string }) => {
    // Case 1: Editing an existing resident
    if (residentData.id && allResidents.some(r => r.id === residentData.id)) {
        setResidents(prev => prev.map(r => (r.id === residentData.id ? { ...r, ...residentData } : r)));
        addToast(`Cập nhật thành công cho ${residentData.fullName}`, 'success');
    } 
    // Case 2: Adding a new resident
    else {
        const newResidentWithId: Resident = {
            ...(residentData as Omit<Resident, 'id' | 'avatarUrl' | 'joinDate'>), // Cast to ensure base properties
            id: `R${Date.now()}`,
            joinDate: new Date().toISOString(),
            avatarUrl: `https://picsum.photos/seed/${Date.now()}/100/100`,
        };

        // Case 2a: New resident is a new Head of Household -> Create a new Household too
        if (residentData.relationshipToHead === 'Chủ hộ') {
            const newHouseholdId = `H${Date.now()}`;
            newResidentWithId.householdId = newHouseholdId; // Link resident to new household

            const newHousehold: Household = {
                id: newHouseholdId,
                houseNumber: residentData.houseNumber || '',
                address: residentData.address,
                group: residentData.group,
                province: residentData.province,
                ward: residentData.ward,
                street: residentData.street,
                headOfHouseholdId: newResidentWithId.id, // Link household to new resident
                isPoorHousehold: false,
                isBusinessHousehold: false,
                isInFireSafetyGroup: false,
            };
            setHouseholds(prev => [newHousehold, ...prev]);
            addToast(`Đã tạo hộ khẩu mới cho chủ hộ ${newResidentWithId.fullName}`, 'success');
        }

        setResidents(prev => [newResidentWithId, ...prev]);
        addToast(`Đã thêm nhân khẩu mới: ${newResidentWithId.fullName}`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleScanComplete = (scannedData: Partial<Resident>) => {
    setIsScanModalOpen(false);
    
    const newResidentFromScan: Resident = {
      id: '', // ID will be generated on save
      fullName: scannedData.fullName || '',
      dateOfBirth: scannedData.dateOfBirth || '',
      gender: scannedData.gender || 'Nam',
      idNumber: scannedData.idNumber || '',
      phoneNumber: '', // User needs to fill this
      residenceType: ResidenceType.PERMANENT,
      status: ResidentStatus.PENDING, // Default to pending approval
      householdId: '', // User needs to fill this
      address: scannedData.address || '',
      group: '', // User needs to fill this
      joinDate: new Date().toISOString(),
      avatarUrl: `https://picsum.photos/seed/${Date.now()}/100/100`,
      ethnicity: '',
      religion: '',
      isPartyMember: false,
      isVeteran: false,
      isRevolutionaryContributor: false,
      isExPrisoner: false,
      hasMentalIllness: false,
      isExRehab: false,
      relationshipToHead: 'Chủ hộ',
    };

    setSelectedResident(newResidentFromScan);
    setIsModalOpen(true);
  };

  const handleAgeGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setAgeGenderFilter(prev => ({ ...prev, [name]: value }));
  };
  
  const filteredResidents = useMemo(() => {
    let results = residents;

    if (foreignerFilter === 'foreign') {
        results = results.filter(r => r.isForeigner);
    } else if (foreignerFilter === 'local') {
        results = results.filter(r => !r.isForeigner);
    }

    if (partyMemberFilter) results = results.filter(r => r.isPartyMember);
    if (veteranFilter) results = results.filter(r => r.isVeteran);
    if (revolutionaryContributorFilter) results = results.filter(r => r.isRevolutionaryContributor);
    if (exPrisonerFilter) results = results.filter(r => r.isExPrisoner);
    if (mentalIllnessFilter) results = results.filter(r => r.hasMentalIllness);
    if (exRehabFilter) results = results.filter(r => r.isExRehab);

    if (ageGenderFilter.active) {
        const fromAge = ageGenderFilter.from ? parseInt(ageGenderFilter.from, 10) : 0;
        const toAge = ageGenderFilter.to ? parseInt(ageGenderFilter.to, 10) : Infinity;

        results = results.filter(r => {
            if (ageGenderFilter.gender !== 'all' && r.gender !== ageGenderFilter.gender) {
                return false;
            }
            const age = calculateAge(r.dateOfBirth);
            return age >= fromAge && age <= toAge;
        });
    }

    if (searchTerm) {
      results = results.filter(r =>
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.idNumber.includes(searchTerm) ||
        (r.passportNumber && r.passportNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.phoneNumber.includes(searchTerm)
      );
    }
    
    return results;
  }, [residents, searchTerm, foreignerFilter, partyMemberFilter, veteranFilter, ageGenderFilter, revolutionaryContributorFilter, exPrisonerFilter, mentalIllnessFilter, exRehabFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-grow flex-wrap">
                 <div className="relative w-full max-w-sm">
                    <input
                      type="text"
                      placeholder="Tìm theo tên, CCCD, Passport, SĐT..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                
                 <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
                     <div className="flex items-center space-x-2">
                        <label htmlFor="foreigner-filter" className="text-sm font-medium text-slate-600 whitespace-nowrap">Quốc tịch:</label>
                        <select
                            id="foreigner-filter"
                            value={foreignerFilter}
                            onChange={(e) => setForeignerFilter(e.target.value as 'all' | 'foreign' | 'local')}
                            className="border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 py-1.5 px-2 text-sm bg-white"
                        >
                            <option value="all">Tất cả</option>
                            <option value="local">Công dân VN</option>
                            <option value="foreign">Người nước ngoài</option>
                        </select>
                    </div>
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(prev => !prev)}
                            className={`relative flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${activeFilterCount > 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span className="font-semibold">Lọc đặc điểm</span>
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-full mt-2 w-screen max-w-md -right-0 z-10">
                                <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 space-y-4">
                                   <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={partyMemberFilter} onChange={(e) => setPartyMemberFilter(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm font-medium text-slate-600">Đảng viên</span>
                                      </label>
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={veteranFilter} onChange={(e) => setVeteranFilter(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500" />
                                        <span className="text-sm font-medium text-slate-600">Quân nhân</span>
                                      </label>
                                       <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={revolutionaryContributorFilter} onChange={(e) => setRevolutionaryContributorFilter(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-yellow-500 focus:ring-yellow-400" />
                                        <span className="text-sm font-medium text-slate-600">Người có công</span>
                                      </label>
                                       <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={exPrisonerFilter} onChange={(e) => setExPrisonerFilter(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500" />
                                        <span className="text-sm font-medium text-slate-600">Đã chấp hành án</span>
                                      </label>
                                       <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={mentalIllnessFilter} onChange={(e) => setMentalIllnessFilter(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                                        <span className="text-sm font-medium text-slate-600">Bệnh tâm thần</span>
                                      </label>
                                       <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={exRehabFilter} onChange={(e) => setExRehabFilter(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                                        <span className="text-sm font-medium text-slate-600">Đã cai nghiện</span>
                                      </label>
                                  </div>
                                  <div className="border-t pt-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            id="age-gender-toggle"
                                            checked={ageGenderFilter.active}
                                            onChange={(e) => setAgeGenderFilter(prev => ({...prev, active: e.target.checked}))}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                          />
                                          <span className="text-sm font-medium text-slate-700">Lọc theo tuổi & giới tính</span>
                                    </label>
                                    {ageGenderFilter.active && (
                                        <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-3">
                                            <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm font-medium text-slate-600">Từ:</label>
                                                    <input type="number" name="from" value={ageGenderFilter.from} onChange={handleAgeGenderChange} className="w-20 p-1 border border-slate-300 rounded-md shadow-sm" placeholder="17"/>
                                                </div>
                                                 <div className="flex items-center gap-2">
                                                    <label className="text-sm font-medium text-slate-600">Đến:</label>
                                                    <input type="number" name="to" value={ageGenderFilter.to} onChange={handleAgeGenderChange} className="w-20 p-1 border border-slate-300 rounded-md shadow-sm" placeholder="27"/>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="text-sm font-medium text-slate-600">Giới tính:</label>
                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="gender" value="all" checked={ageGenderFilter.gender === 'all'} onChange={handleAgeGenderChange} className="h-4 w-4 text-blue-600"/>Tất cả</label>
                                                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="gender" value="Nam" checked={ageGenderFilter.gender === 'Nam'} onChange={handleAgeGenderChange} className="h-4 w-4 text-blue-600"/>Nam</label>
                                                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="gender" value="Nữ" checked={ageGenderFilter.gender === 'Nữ'} onChange={handleAgeGenderChange} className="h-4 w-4 text-blue-600"/>Nữ</label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                  </div>
                                </div>
                            </div>
                        )}
                    </div>
                 </div>

            </div>

          <div className="flex items-center space-x-2">
            <button
                onClick={handleImportClick}
                className="bg-white text-green-600 border border-green-600 font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Nhập từ Excel</span>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
            />
            <button
            onClick={handleAddResidentFromScan}
            className="bg-white text-blue-600 border border-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Thêm bằng CCCD</span>
            </button>
            <button
            onClick={handleAddResident}
            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            <span>Thêm thủ công</span>
            </button>
          </div>
        </div>
      </div>

      <ResidentTable residents={filteredResidents} onEdit={handleEditResident} onDelete={onDeleteResident} messages={messages} />

      {isModalOpen && (
        <ResidentModal
          resident={selectedResident}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveResident}
          allHouseholds={allHouseholds}
        />
      )}

      {isScanModalOpen && (
        <ScanIDModal 
          onClose={() => setIsScanModalOpen(false)}
          onScanComplete={handleScanComplete}
        />
      )}
    </div>
  );
};

export default ResidentManagement;