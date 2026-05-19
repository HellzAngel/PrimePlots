import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const hashPassword = async (pwd) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const TARGET_HASH = '2f38557624d0c0d0b98dca2b607aeb5b2ae2a3b18646f2478a8fcb85bc2fb474';
    const inputHash = await hashPassword(password);
    if (username === 'primeplots@admin' && inputHash === TARGET_HASH) {
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-emerald-600 dark:text-emerald-400" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Login</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to manage properties</p>
        </div>

        {error && (
          <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 p-3 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="form-label">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="form-control pl-10"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type="password"
                className="form-control pl-10"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full shadow-lg py-4 text-base">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
