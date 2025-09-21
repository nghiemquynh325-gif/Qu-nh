import React, { useState, useEffect } from 'react';
import type { ZaloOAConfig } from '../App';
import type { ToastMessage } from '../types';


interface SettingsProps {
    config: ZaloOAConfig;
    setConfig: React.Dispatch<React.SetStateAction<ZaloOAConfig>>;
    addToast: (message: string, type?: ToastMessage['type']) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, setConfig, addToast }) => {
    const [formData, setFormData] = useState({
        oaId: '',
        apiKey: '',
        oaName: 'Tổ dân phố ABC' // Default example name
    });
    const [isConnecting, setIsConnecting] = useState(false);
    const [facebookUrl, setFacebookUrl] = useState('');
    
    useEffect(() => {
        // Pre-fill form if already connected
        if(config.connected) {
            setFormData({
                oaId: config.oaId,
                apiKey: config.apiKey,
                oaName: config.oaName
            })
        }
    }, [config]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConnecting(true);
        // Simulate API call to verify credentials
        setTimeout(() => {
            setConfig({
                ...formData,
                connected: true,
            });
            setIsConnecting(false);
            addToast(`Đã kết nối thành công với Zalo OA: ${formData.oaName}`, 'success');
        }, 1500);
    };
    
    const handleFacebookSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically save the URL to a backend
        console.log('Facebook URL saved:', facebookUrl);
        addToast('Đã lưu liên kết Facebook thành công.', 'success');
    };

    const handleDisconnect = () => {
        // A proper implementation would have a custom modal component
        if(window.confirm('Bạn có chắc chắn muốn ngắt kết nối Zalo OA không?')) {
            setConfig({
                connected: false,
                oaId: '',
                apiKey: '',
                oaName: '',
            });
            setFormData({
                oaId: '',
                apiKey: '',
                oaName: 'Tổ dân phố ABC'
            });
            addToast('Đã ngắt kết nối Zalo OA.', 'info');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-slate-800 mb-1">Tích hợp Zalo Official Account (OA)</h3>
                <p className="text-sm text-slate-500 mb-6">Kết nối Zalo OA để gửi thông báo trực tiếp đến cư dân.</p>
                
                {config.connected ? (
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-green-700">Đã kết nối</p>
                                <p className="text-sm text-slate-600">Official Account: <span className="font-medium">{config.oaName}</span> (ID: {config.oaId})</p>
                            </div>
                            <button
                                onClick={handleDisconnect}
                                className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                                Ngắt kết nối
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleConnect} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tên Zalo OA</label>
                            <input 
                                type="text" 
                                name="oaName"
                                value={formData.oaName} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" 
                                placeholder="VD: Tổ dân phố ABC"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">OA ID</label>
                            <input 
                                type="text" 
                                name="oaId"
                                value={formData.oaId} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">API Key</label>
                            <input 
                                type="password" 
                                name="apiKey"
                                value={formData.apiKey} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" 
                                required 
                            />
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isConnecting}
                                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-wait flex items-center"
                            >
                                {isConnecting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {isConnecting ? 'Đang kết nối...' : 'Kết nối'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-slate-800 mb-1">Tích hợp Trang Facebook</h3>
                <p className="text-sm text-slate-500 mb-6">Liên kết đến trang Facebook chính thức để cư dân dễ dàng theo dõi thông tin.</p>
                <form onSubmit={handleFacebookSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="facebookUrl" className="block text-sm font-medium text-slate-700">URL Trang Facebook</label>
                        <input 
                            type="url" 
                            id="facebookUrl"
                            name="facebookUrl"
                            value={facebookUrl} 
                            onChange={(e) => setFacebookUrl(e.target.value)} 
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" 
                            placeholder="https://www.facebook.com/tendangnhaptrang"
                            required 
                        />
                    </div>
                     <div className="flex justify-end">
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Lưu liên kết
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
