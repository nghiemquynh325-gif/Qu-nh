
import React, { useState } from 'react';
import type { Notification } from '../types';

interface NotificationSenderProps {
    onSend: (content: string, viaZalo: boolean) => void;
    notifications: Notification[];
    zaloOAConnected: boolean;
}

const NotificationSender: React.FC<NotificationSenderProps> = ({ onSend, notifications, zaloOAConnected }) => {
    const [content, setContent] = useState('');
    const [sendViaZalo, setSendViaZalo] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSend(content, sendViaZalo);
            setContent('');
            setSendViaZalo(false);
        }
    };
    
    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Gửi thông báo chung</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung thông báo..."
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    required
                />
                <div className="flex justify-between items-center">
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
                    <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors self-start">
                        Gửi
                    </button>
                </div>
            </form>
            <div className="mt-4 max-h-24 overflow-y-auto">
                <h4 className="text-sm font-semibold text-slate-600 mb-2">Thông báo đã gửi:</h4>
                <ul className="space-y-2 text-sm">
                    {notifications.map(n => (
                        <li key={n.id} className="text-slate-500 p-2 bg-slate-50 rounded-md">
                           <span className="font-medium">[{new Date(n.timestamp).toLocaleString('vi-VN')}]:</span> {n.content}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default NotificationSender;
