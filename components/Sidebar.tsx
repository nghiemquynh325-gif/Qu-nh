import React from 'react';
import type { View, User } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  currentUser: User;
  onLogout: () => void;
}

const NavItem: React.FC<{
  viewName: View;
  icon: JSX.Element;
  label: string;
  activeView: View;
  onClick: (view: View) => void;
}> = ({ viewName, icon, label, activeView, onClick }) => {
  const isActive = activeView === viewName;
  return (
    <li
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-200 hover:bg-slate-700 hover:text-white'
      }`}
      onClick={() => onClick(viewName)}
    >
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
      <span className="ml-4 font-medium">{label}</span>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, currentUser, onLogout }) => {
  const getRoleDisplay = (user: User) => {
    if (user.role === 'Quản trị viên') {
      return user.role;
    }
    return `${user.role} ${user.group}`;
  };

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-slate-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h1 className="text-xl font-bold ml-2">QL Cư Dân</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          <NavItem
            viewName="dashboard"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>}
            label="Bảng điều khiển"
            activeView={activeView}
            onClick={setActiveView}
          />
          <NavItem
            viewName="residents"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.598m-1.5-6.375a3.375 3.375 0 00-3-3.375m-7.5 0c-1.657 0-3 1.657-3 3.375v.003c0 .178.012.355.035.53-.114-.15-.23-.296-.353-.441a3.375 3.375 0 012.986-5.45z" /></svg>}
            label="Quản lý Cư dân"
            activeView={activeView}
            onClick={setActiveView}
          />
          <NavItem
            viewName="households"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h4.5m-4.5 0V3.545M2.25 10.75h7.5V21" /></svg>}
            label="Quản lý Hộ khẩu"
            activeView={activeView}
            onClick={setActiveView}
          />
          <NavItem
            viewName="communication"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.455.09-.934.09-1.425v-2.125c0-4.556 4.03-8.25 9-8.25 4.97 0 9 3.694 9 8.25z" /></svg>}
            label="Thông báo & Trao đổi"
            activeView={activeView}
            onClick={setActiveView}
          />
           <NavItem
            viewName="chatbot"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m2.25 2.25H12M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>}
            label="Chatbot AI"
            activeView={activeView}
            onClick={setActiveView}
          />
          {currentUser.role === 'Quản trị viên' && (
            <>
              <NavItem
                viewName="reports"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5h.008v.008H12v-.008z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.016V15" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 19.5L21 21m-1.5-1.5l-1.5 1.5m-1.5-1.5l1.5 1.5" /></svg>}
                label="Báo cáo & Thống kê"
                activeView={activeView}
                onClick={setActiveView}
              />
               <NavItem
                viewName="users"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM10.5 18.75a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>}
                label="Phân quyền người dùng"
                activeView={activeView}
                onClick={setActiveView}
              />
              <NavItem
                viewName="settings"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.053-.022c.557-.236 1.25-.236 1.807 0l.053.022c.55.219 1.02.684 1.11 1.226l.041.261c.42.269.835.596 1.226.983l.217.217c.427.427.712.964.843 1.545l.023.107c.118.558.118 1.185 0 1.743l-.023.107c-.13.58-.416 1.117-.843 1.545l-.217.217a6.963 6.963 0 01-1.226.983l-.261.041c-.09.542-.56 1.007-1.11 1.226l-.053.022c-.557-.236-1.25-.236-1.807 0l-.053-.022a2.222 2.222 0 01-1.11-1.226l-.041-.261a6.963 6.963 0 01-1.226-.983l-.217-.217a2.222 2.222 0 01-.843-1.545l-.023-.107c-.118-.558-.118-1.185 0-1.743l.023.107c.13-.58.416-1.117.843-1.545l.217.217c.39-.386.805-.714 1.226-.983l.261-.041zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>}
                label="Cài đặt"
                activeView={activeView}
                onClick={setActiveView}
              />
            </>
          )}
           <li className="flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 text-slate-200 hover:bg-slate-700 hover:text-white">
            <a href="https://dichvucong.gov.vn/" target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0V6.375c0-.621.504-1.125 1.125-1.125h2.25M15 3.75l2.25 2.25" />
              </svg>
              <span className="ml-4 font-medium">Cổng Dịch vụ công</span>
            </a>
          </li>
        </ul>
      </nav>
      <div className="p-4 mt-auto border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-10 h-10 rounded-full"/>
            <div className="ml-3">
              <p className="font-semibold text-sm">{currentUser.fullName}</p>
              <p className="text-xs text-slate-400">{getRoleDisplay(currentUser)}</p>
            </div>
          </div>
           <button onClick={onLogout} title="Đăng xuất" className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;