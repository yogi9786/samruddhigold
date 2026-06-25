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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={resetAndClose}
          className="absolute top-4 right-4 text-white hover:text-sam-gold transition z-10"
        >
          <X size={24} />
        </button>

        <div className="bg-sam-maroon px-8 py-6 text-center text-white relative">
          <h2 className="text-2xl font-bold text-sam-gold">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm opacity-80 mt-1">
            {isLoginMode ? 'Sign in to your Samruddhi account' : 'Join Samruddhi Gold Palace today'}
          </p>
        </div>

        <div className="px-8 py-8">
          {success ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{successMsg}</h3>
              {isLoginMode && <p className="text-gray-500 mt-2">Welcome to Samruddhi Gold Palace.</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sam-gold/50 focus:border-sam-gold outline-none transition"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              {!isLoginMode && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sam-gold/50 focus:border-sam-gold outline-none transition"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sam-gold/50 focus:border-sam-gold outline-none transition"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sam-gold/50 focus:border-sam-gold outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isLoginMode && (
                <div className="flex items-center justify-between text-sm pt-2">
                  <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded text-sam-maroon focus:ring-sam-gold border-gray-300 w-4 h-4 cursor-pointer" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-sam-maroon hover:text-sam-gold font-semibold transition">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sam-maroon text-sam-gold font-bold tracking-wider py-3.5 px-4 rounded-lg shadow-md hover:bg-red-900 hover:shadow-lg focus:ring-4 focus:ring-red-100 transition-all disabled:opacity-70 flex justify-center items-center mt-6 uppercase text-[13px]"
              >
                {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 text-center text-[13.5px] text-gray-600 border-t border-gray-100 pt-6">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError('');
                  setPassword('');
                }} 
                className="text-sam-maroon hover:text-sam-gold font-bold transition px-2 py-1 rounded hover:bg-red-50"
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
