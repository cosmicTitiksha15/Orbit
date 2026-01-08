
import React, { useState } from 'react';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSocialLogin = (provider: User['provider']) => {
    // Simulated Social Login
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      email: `pilot@${provider}.space`,
      name: `Explorer (${provider})`,
      provider,
    });
  };

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin({
        id: 'manual-id',
        email,
        name: email.split('@')[0],
        provider: 'email',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      <div className="glass w-full max-w-md p-8 rounded-[2.5rem] relative z-10 border-white/5 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black font-space tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
            ORBIT
          </h1>
          <p className="text-gray-400 text-xs tracking-widest uppercase">Establish Link to Command Center</p>
        </div>

        <form onSubmit={handleManualAuth} className="space-y-4 mb-8">
          <div>
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-gray-600"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Security Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-gray-600"
            />
          </div>
          <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold font-space text-lg hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
            {isLogin ? 'INITIATE SESSION' : 'REGISTER PILOT'}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0b0f1a] px-2 text-gray-500 font-bold">Federated Identity</span></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
          </button>
          <button onClick={() => handleSocialLogin('microsoft')} className="flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <img src="https://www.svgrepo.com/show/448239/microsoft.svg" className="w-6 h-6" alt="Microsoft" />
          </button>
          <button onClick={() => handleSocialLogin('github')} className="flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-6 h-6 invert" alt="GitHub" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-gray-400 hover:text-purple-400 transition-colors uppercase font-bold tracking-widest"
          >
            {isLogin ? "Need a new clearance? Sign up" : "Already registered? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
