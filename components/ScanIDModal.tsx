
import React, { useState } from 'react';
import type { Resident } from '../types';

interface ScanIDModalProps {
  onClose: () => void;
  onScanComplete: (scannedData: Partial<Resident>) => void;
}

const mockScannedData: Partial<Resident> = {
  fullName: 'Trần Văn Quét',
  dateOfBirth: '1995-08-20',
  gender: 'Nam',
  idNumber: '098765432109',
  address: '10 Đường Công Nghệ, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội',
};

const ScanIDModal: React.FC<ScanIDModalProps> = ({ onClose, onScanComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleScan = () => {
    if (!selectedFile) {
      setError('Vui lòng chọn một ảnh CCCD để quét.');
      return;
    }

    setIsScanning(true);
    setError('');

    // Simulate OCR processing
    setTimeout(() => {
      onScanComplete(mockScannedData);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Thêm cư dân bằng cách quét CCCD</h3>
           <button onClick={onClose} className="text-2xl font-semibold text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <div className="p-6">
          <p className="text-slate-600 mb-4 text-center">Tải lên ảnh mặt trước của Căn cước công dân. Hệ thống sẽ tự động trích xuất thông tin.</p>
          
          <label htmlFor="id-upload" className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-slate-50 hover:border-blue-500 transition-colors">
            {selectedFile ? (
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="mt-2 text-sm font-medium text-slate-700">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
               <div className="text-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="mt-2 text-sm">Nhấn để tải ảnh lên</p>
               </div>
            )}
          </label>
          <input id="id-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>
        <div className="p-4 bg-slate-50 flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50">Hủy</button>
            <button 
              type="button" 
              onClick={handleScan}
              disabled={isScanning || !selectedFile}
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center"
            >
              {isScanning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Đang quét...</span>
                </>
              ) : (
                'Quét thông tin'
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ScanIDModal;
