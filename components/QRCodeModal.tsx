import React from 'react';
import type { Household, Resident } from '../types';

interface QRCodeModalProps {
    household: Household & { members: Resident[] };
    onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ household, onClose }) => {
    const qrData = JSON.stringify({
        householdId: household.id,
        houseNumber: household.houseNumber,
        address: household.address,
        group: household.group,
        headOfHouseholdId: household.headOfHouseholdId,
    });

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center non-printable">
             <style>
                {`
                  @media print {
                    .non-printable {
                      display: none !important;
                    }
                    body * {
                      visibility: hidden;
                    }
                    #printable-qr-area, #printable-qr-area * {
                      visibility: visible;
                    }
                    #printable-qr-area {
                      position: fixed;
                      left: 50%;
                      top: 50%;
                      transform: translate(-50%, -50%);
                      padding: 2rem;
                      background-color: white;
                      border-radius: 8px;
                    }
                  }
                `}
            </style>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm relative">
                <div id="printable-qr-area" className="p-8 text-center">
                    <h3 className="text-xl font-semibold text-slate-800">Mã QR Hộ gia đình</h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">Số nhà: {household.houseNumber}, {household.address}</p>
                    <div className="flex justify-center">
                        <img src={qrCodeUrl} alt={`QR Code for ${household.address}`} width="250" height="250" />
                    </div>
                    <p className="text-xs text-slate-400 mt-4">Quét mã để xem thông tin chi tiết hộ khẩu.</p>
                </div>
                
                <div className="p-4 bg-slate-50 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50">Đóng</button>
                    <button type="button" onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">In mã QR</button>
                </div>

                <button onClick={onClose} className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export default QRCodeModal;