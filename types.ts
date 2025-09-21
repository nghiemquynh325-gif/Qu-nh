export enum ResidenceType {
  PERMANENT = 'Thường trú',
  TEMPORARY = 'Tạm trú',
  // FIX: Corrected typo in enum member from TEMPORary_WITH_HOUSE to TEMPORARY_WITH_HOUSE.
  TEMPORARY_WITH_HOUSE = 'Tạm trú có nhà',
}

export enum ResidentStatus {
  ACTIVE = 'Đang cư trú',
  ABSENT = 'Tạm vắng',
  MISSING = 'Mất tích',
  DECEASED = 'Đã qua đời',
  PENDING = 'Chờ duyệt',
}

export interface Resident {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ';
  idNumber: string;
  phoneNumber: string;
  residenceType: ResidenceType;
  status: ResidentStatus;
  householdId: string;
  address: string;
  group: string; // Tổ
  joinDate: string;
  avatarUrl: string;
  expiryDate?: string;
  relationshipToHead?: string; // e.g., 'Chủ hộ', 'Vợ', 'Con'
  isPartyMember?: boolean;
  isVeteran?: boolean;
  isExPrisoner?: boolean;
  isRevolutionaryContributor?: boolean;
  hasMentalIllness?: boolean;
  isExRehab?: boolean;
  // New fields for house ownership
  landUseCertificateNumber?: string; // Số GCNQSDĐ
  houseOwnershipDetails?: string; // Chi tiết sở hữu, lịch sử giao dịch
  mapSheetNumber?: string; // Số tờ bản đồ
  landPlotNumber?: string; // Số thửa đất
  zaloId?: string; // For chatbot integration
  // New fields for foreigners
  isForeigner?: boolean;
  nationality?: string;
  passportNumber?: string;
  visaType?: string;
  visaExpiryDate?: string;
  ethnicity?: string; // dân tộc
  religion?: string; // tôn giáo
}

export interface Household {
  id: string;
  houseNumber: string;
  province?: string;
  ward?: string;
  street?: string;
  address: string;
  group: string; // Tổ
  headOfHouseholdId: string;
  isPoorHousehold?: boolean;
  isBusinessHousehold?: boolean;
  isInFireSafetyGroup?: boolean;
}

export interface Attachment {
  name: string;
  type: string; // MIME type
  url: string;  // dataURL for simplicity
}

export interface Message {
  id: string;
  sender: 'admin' | 'resident';
  residentId: string;
  content: string;
  timestamp: string;
  attachment?: Attachment;
}

export interface Notification {
  id:string;
  content: string;
  timestamp: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ChatbotMessage {
  id: string;
  sender: 'resident' | 'bot' | 'admin';
  content: string;
  timestamp: string;
}

export interface ChatbotConversation {
  id: string;
  residentId: string;
  messages: ChatbotMessage[];
}

export type UserRole = 'Quản trị viên' | 'Cán bộ' | 'Tổ trưởng';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  group?: string; // Tổ trưởng quản lý tổ nào
  avatarUrl: string;
}


export type View = 'dashboard' | 'residents' | 'households' | 'reports' | 'settings' | 'communication' | 'chatbot' | 'users';