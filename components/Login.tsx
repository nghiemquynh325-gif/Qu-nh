import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onSwitchToLookup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToLookup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLogin(username, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-3xl font-bold text-slate-800 ml-3">QL Cư Dân</h1>
        </div>
        <h2 className="text-xl text-slate-600">Đăng nhập vào hệ thống</h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="relative">
          <label className="text-sm font-bold text-slate-700 tracking-wide">Tên đăng nhập</label>
          <input
            className=" w-full text-base py-2 border-b border-slate-300 focus:outline-none focus:border-blue-500"
            type="text"
            placeholder="admin / totruong1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mt-8 content-center">
          <label className="text-sm font-bold text-slate-700 tracking-wide">Mật khẩu</label>
          <input
            className="w-full content-center text-base py-2 border-b border-slate-300 focus:outline-none focus:border-blue-500"
            type="password"
            placeholder="admin123 / leader123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center bg-blue-600 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-200 hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </div>
        <div className="text-center pt-2">
            <button
                type="button"
                onClick={onSwitchToLookup}
                className="text-sm font-medium text-blue-600 hover:underline"
            >
                Dành cho người dân: Tra cứu thông tin cá nhân
            </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
