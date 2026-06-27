import React, { useState } from 'react';
import { X, Lock, Mail, User } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (token: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        // Sign In
        const response = await fetch('http://127.0.0.1:8000/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            username: username,
            password: password,
          }),
        });

        if (!response.ok) {
          throw new Error('Invalid username or password');
        }

        const data = await response.json();
        const token = data.access_token;
        
        localStorage.setItem('access_token', token);
        
        setSuccessMsg('Login Successful!');
        setSuccess(true);
        if (onLoginSuccess) {
          onLoginSuccess(token);
        }
        
        setTimeout(() => resetAndClose(), 1500);

      } else {
        // Sign Up
        const response = await fetch('http://127.0.0.1:8000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password,
            email: email || undefined,
            full_name: fullName || undefined,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Registration failed');
        }

        setSuccessMsg('Account Created Successfully! Please Sign In.');
        setSuccess(true);
        
        // After 2 seconds, switch to login mode automatically
        setTimeout(() => {
          setSuccess(false);
          setIsLoginMode(true);
          setPassword(''); // clear password, keep username for easy login
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    onClose();
    // Wait for fade out animation if any, then reset state
    setTimeout(() => {
      setSuccess(false);
      setUsername('');
      setPassword('');
      setEmail('');
      setFullName('');
      setIsLoginMode(true);
      setError('');
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FFF7F2] rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-[#5F1517]/10">
        <button 
          onClick={resetAndClose}
          className="absolute top-5 right-5 text-[#5F1517]/50 hover:text-[#5F1517] transition z-10 bg-white/50 hover:bg-white rounded-full p-1.5 shadow-sm"
        >
          <X size={20} />
        </button>

        <div className="px-8 pt-10 pb-6 text-center relative">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5F1517] mb-2 leading-tight">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[14px] text-[#5F1517]/70 font-medium">
            {isLoginMode ? 'Sign in to your Samruddhi account' : 'Join Samruddhi Gold Palace today'}
          </p>
        </div>

        <div className="px-8 pb-10">
          {success ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-[#5F1517]/10 text-[#5F1517] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#5F1517]/20">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#5F1517]">{successMsg}</h3>
              {isLoginMode && <p className="text-[#5F1517]/70 mt-2 font-medium">Welcome to Samruddhi Gold Palace.</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#5F1517]">Username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F1517]/40">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              {!isLoginMode && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#5F1517]">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F1517]/40">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#5F1517]">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F1517]/40">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#5F1517]">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F1517]/40">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isLoginMode && (
                <div className="flex items-center justify-between text-sm pt-2">
                  <label className="flex items-center space-x-2 text-[#5F1517]/70 cursor-pointer hover:text-[#5F1517] transition-colors">
                    <input type="checkbox" className="rounded text-[#5F1517] focus:ring-[#5F1517] border-gray-300 w-4 h-4 cursor-pointer" />
                    <span className="font-medium">Remember me</span>
                  </label>
                  <a href="#" className="text-[#5F1517]/70 hover:text-[#5F1517] font-semibold transition hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5F1517] text-white font-semibold tracking-wide py-3.5 px-4 rounded-full shadow-md hover:bg-[#801416] hover:shadow-lg focus:ring-4 focus:ring-[#5F1517]/20 transition-all disabled:opacity-70 flex justify-center items-center mt-6 text-[15px] border border-[#5F1517]"
              >
                {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 text-center text-[14px] text-[#5F1517]/80 border-t border-[#E5D3B3]/50 pt-6 font-medium">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError('');
                  setPassword('');
                }} 
                className="text-[#5F1517] font-bold transition hover:underline ml-1"
              >
                {isLoginMode ? 'Sign Up Now' : 'Sign In'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
