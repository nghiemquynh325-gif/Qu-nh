import React, { useState } from 'react';
import type { User, UserRole } from '../types';
import UserModal from './UserModal';

interface UserManagementProps {
    users: User[];
    onSaveUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
}

const getRoleBadge = (role: UserRole) => {
    const roleClasses = {
        'Quản trị viên': 'bg-red-100 text-red-800',
        'Cán bộ': 'bg-blue-100 text-blue-800',
        'Tổ trưởng': 'bg-green-100 text-green-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleClasses[role]}`}>
            {role}
        </span>
    );
};

const UserManagement: React.FC<UserManagementProps> = ({ users, onSaveUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };
    
    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleSave = (user: User) => {
        onSaveUser(user);
        setIsModalOpen(false);
    };
    
    const handleDeleteConfirm = (user: User) => {
        setUserToDelete(user);
    };
    
    const executeDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.id);
            setUserToDelete(null);
        }
    };


    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-md flex justify-end">
                <button
                    onClick={handleAddUser}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>Thêm người dùng</span>
                </button>
            </div>

            <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Họ và Tên</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên đăng nhập</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vai trò</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phụ trách Tổ</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.fullName} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">{user.fullName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.group || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEditUser(user)} className="text-indigo-600 hover:text-indigo-900 font-medium">Sửa</button>
                                        <button onClick={() => handleDeleteConfirm(user)} className="text-red-600 hover:text-red-900 font-medium">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
            
            {userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-slate-800">Xác nhận xóa người dùng</h3>
                        <p className="mt-2 text-slate-600">
                            Bạn có chắc chắn muốn xóa người dùng <span className="font-bold">{userToDelete.fullName}</span>?
                        </p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setUserToDelete(null)}
                                className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={executeDelete}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Xác nhận Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
