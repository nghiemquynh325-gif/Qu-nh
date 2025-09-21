import React from 'react';
import type { View } from '../types';

interface HeaderProps {
  activeView: View;
}

const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const viewTitles: Record<View, string> = {
    dashboard: 'Bảng điều khiển',
    residents: 'Quản lý Cư dân',
    households: 'Quản lý Hộ khẩu',
    reports: 'Báo cáo & Thống kê',
    settings: 'Cài đặt & Tích hợp',
    communication: 'Thông báo & Trao đổi',
    chatbot: 'Chatbot AI',
    users: 'Phân quyền & Quản lý người dùng',
  };

  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-6">
      <h2 className="text-2xl font-bold text-slate-800">{viewTitles[activeView]}</h2>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;