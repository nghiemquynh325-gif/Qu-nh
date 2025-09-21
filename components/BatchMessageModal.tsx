import React, { useState } from 'react';

interface BatchMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (content: string, viaZalo: boolean) => void;
    householdCount: number;
    zaloOAConnected: boolean;
}

const BatchMessageModal: React.FC<BatchMessageModalProps> = ({ isOpen, onClose, onSend, householdCount, zaloOAConnected }) => {
    const [content, setContent] = useState('');
    const [sendViaZalo, setSendViaZalo] = useState(false);

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSend(content, sendViaZalo);
            setContent('');
            setSendViaZalo(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold">Gửi thông báo hàng loạt</h3>
                        <p className="text-sm text-slate-500 mt-1">Tin nhắn sẽ được gửi đến tất cả thành viên của {householdCount} hộ đã chọn.</p>
                    </div>
                    <div className="p-6">
                        <label htmlFor="batch-message" className="block text-sm font-medium text-slate-700">Nội dung tin nhắn</label>
                        <textarea
                            id="batch-message"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={5}
                            required
                        />
                         <div className="mt-4">
                            <label 
                                className={`flex items-center space-x-2 ${zaloOAConnected ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                title={!zaloOAConnected ? 'Vui lòng kết nối Zalo OA trong phần Cài đặt' : ''}
                            >
                                <input 
                                    type="checkbox"
                                    checked={sendViaZalo}
                                    onChange={(e) => setSendViaZalo(e.target.checked)}
                                    disabled={!zaloOAConnected}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                />
                                <span className={`text-sm ${zaloOAConnected ? 'text-slate-600' : 'text-slate-400'}`}>Gửi qua Zalo</span>
                            </label>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50">Hủy</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Gửi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchMessageModal;