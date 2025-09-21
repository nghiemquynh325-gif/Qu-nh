import React, { useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface UserModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (user: User) => void;
}

const ROLES: UserRole[] = ['Quản trị viên', 'Cán bộ', 'Tổ trưởng'];

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        role: 'Tổ trưởng' as UserRole,
        group: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName,
                username: user.username,
                password: '', // Password field is cleared for editing
                role: user.role,
                group: user.group || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would add password validation if needed
        const savedUser: User = {
            id: user ? user.id : `U${Date.now()}`,
            avatarUrl: user ? user.avatarUrl : `https://picsum.photos/seed/U${Date.now()}/40/40`,
            fullName: formData.fullName,
            username: formData.username,
            role: formData.role,
            group: formData.role !== 'Quản trị viên' ? formData.group : undefined,
        };
        // In a real app, you'd handle password hashing and updating separately.
        // For this mock, we'll just log it.
        if (formData.password) {
            console.log(`Password for ${formData.username} would be updated to: ${formData.password}`);
        }
        onSave(savedUser);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold">{user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Họ và Tên</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tên đăng nhập</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" required disabled={!!user} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" placeholder={user ? 'Để trống nếu không muốn đổi' : 'Nhập mật khẩu'} required={!user} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Vai trò</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2">
                                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        {formData.role !== 'Quản trị viên' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Tổ phụ trách</label>
                                <input type="text" name="group" value={formData.group} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" placeholder="VD: Tổ 1" required />
                            </div>
                        )}
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

export default UserModal;
