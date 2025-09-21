import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ResidentManagement from './components/ResidentManagement';
import Communication from './components/Communication';
import HouseholdManagement from './components/HouseholdManagement';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import ResidentLookup from './components/ResidentLookup';
import type { View, Message, ToastMessage, User, Resident, Household } from './types';
import { mockMessages, mockResidents as initialResidents, mockHouseholds as initialHouseholds } from './data/mockData';
import { mockUsers, mockPasswords } from './data/mockData';

export interface ZaloOAConfig {
    connected: boolean;
    oaId: string;
    apiKey: string;
    oaName: string;
}

// Toast Component defined inside App.tsx to avoid creating new files
interface ToastProps extends ToastMessage {
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = 'relative w-full max-w-sm p-4 pr-10 rounded-lg shadow-lg text-white flex items-center';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };
  const icon = {
      success: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      error: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      info: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {icon[type]}
      <span className="flex-grow text-sm font-medium">{message}</span>
      <button onClick={onClose} className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xl font-semibold leading-none opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [publicView, setPublicView] = useState<'login' | 'lookup'>('login');
  const [activeView, setActiveView] = useState<View>('dashboard');

  const [residents, setResidents] = useState<Resident[]>(initialResidents);
  const [households, setHouseholds] = useState<Household[]>(initialHouseholds);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [users, setUsers] = useState<User[]>(mockUsers);
  
  const [zaloOAConfig, setZaloOAConfig] = useState<ZaloOAConfig>({
      connected: false,
      oaId: '',
      apiKey: '',
      oaName: ''
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Memoized data filtering based on user role
  const visibleResidents = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Quản trị viên') {
      return residents;
    }
    return residents.filter(r => r.group === currentUser.group);
  }, [currentUser, residents]);

  const visibleHouseholds = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Quản trị viên') {
      return households;
    }
    return households.filter(h => h.group === currentUser.group);
  }, [currentUser, households]);

  const handleLogin = async (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.username === username);
        if (user && mockPasswords[username] === password) {
          setCurrentUser(user);
          setActiveView('dashboard');
          resolve();
        } else {
          reject(new Error('Tên đăng nhập hoặc mật khẩu không chính xác.'));
        }
      }, 1000);
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPublicView('login');
  };

  const handleUpdateHousehold = (householdToUpdate: Household) => {
    setHouseholds(currentHouseholds => 
        currentHouseholds.map(h => h.id === householdToUpdate.id ? householdToUpdate : h)
    );
    addToast(`Cập nhật thành công cho hộ ${householdToUpdate.address}`, 'success');
  };


  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteResident = (residentId: string) => {
    const residentToDelete = residents.find(r => r.id === residentId);
    if (residentToDelete) {
      setResidents(prev => prev.filter(r => r.id !== residentId));
      addToast(`Đã xóa thành công nhân khẩu: ${residentToDelete.fullName}`, 'success');
    }
  };

  const handleSaveUser = (user: User) => {
      if (users.some(u => u.id === user.id)) {
          setUsers(users.map(u => u.id === user.id ? user : u));
          addToast(`Đã cập nhật thông tin người dùng ${user.fullName}.`, 'success');
      } else {
          setUsers([...users, user]);
          addToast(`Đã thêm người dùng mới: ${user.fullName}.`, 'success');
      }
  };

  const handleDeleteUser = (userId: string) => {
      const userToDelete = users.find(u => u.id === userId);
      if (userToDelete) {
        setUsers(users.filter(u => u.id !== userId));
        addToast(`Đã xóa người dùng: ${userToDelete.fullName}.`, 'success');
      }
  };


  const renderView = () => {
    if (!currentUser) return null; // Should not happen if currentUser check is done before
    switch (activeView) {
      case 'dashboard':
        return <Dashboard residents={visibleResidents} />;
      case 'residents':
        return <ResidentManagement residents={visibleResidents} setResidents={setResidents} allResidents={residents} allHouseholds={households} setHouseholds={setHouseholds} messages={messages} addToast={addToast} onDeleteResident={handleDeleteResident} />;
      case 'households':
        return <HouseholdManagement households={visibleHouseholds} residents={visibleResidents} setMessages={setMessages} zaloOAConnected={zaloOAConfig.connected} addToast={addToast} onUpdateHousehold={handleUpdateHousehold} />;
      case 'communication':
        return <Communication residents={visibleResidents} messages={messages} setMessages={setMessages} zaloOAConnected={zaloOAConfig.connected} addToast={addToast} />;
      case 'reports':
        // Only admin can access this view, but check role for safety
        return currentUser.role === 'Quản trị viên' ? <Reports residents={visibleResidents} households={visibleHouseholds} zaloOAConnected={zaloOAConfig.connected} addToast={addToast} /> : <Dashboard residents={visibleResidents}/>;
      case 'settings':
        return currentUser.role === 'Quản trị viên' ? <Settings config={zaloOAConfig} setConfig={setZaloOAConfig} addToast={addToast} /> : <Dashboard residents={visibleResidents} />;
      case 'chatbot':
        return <Chatbot allResidents={residents} />;
      case 'users':
        return currentUser.role === 'Quản trị viên' ? <UserManagement users={users} onSaveUser={handleSaveUser} onDeleteUser={handleDeleteUser} /> : <Dashboard residents={visibleResidents}/>;
      default:
        return <Dashboard residents={visibleResidents} />;
    }
  };
  
  if (!currentUser) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            {publicView === 'login' ? (
                <Login onLogin={handleLogin} onSwitchToLookup={() => setPublicView('lookup')} />
            ) : (
                <ResidentLookup allResidents={residents} onSwitchToLogin={() => setPublicView('login')} />
            )}
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeView={activeView} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
          {renderView()}
        </main>
      </div>

      {/* Toast Container */}
      <div className="absolute top-6 right-6 z-[100] space-y-3 w-full max-w-sm">
          {toasts.map((toast) => (
              <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
          ))}
      </div>
    </div>
  );
};

export default App;