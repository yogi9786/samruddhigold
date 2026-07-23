import React, { useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (token: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        // Sign In
        const response = await api.post('/auth/token', 
          new URLSearchParams({
            username: username,
            password: password,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            }
          }
        );

        const token = response.data.access_token;
        
        localStorage.setItem('access_token', token);
        
        setSuccessMsg('Login Successful!');
        setSuccess(true);
        if (onLoginSuccess) {
          onLoginSuccess(token);
        }
        
        setTimeout(() => resetAndClose(), 1500);

      } else {
        // Sign Up
        await api.post('/users', {
          username: username,
          password: password,
          email: email || undefined,
          full_name: fullName || undefined,
        });

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
      if (err.response?.status === 401 && isLoginMode) {
         setError('Invalid username or password');
      } else {
         setError(err.response?.data?.detail || err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccessMsg('If that email exists, a reset link has been sent.');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsForgotMode(false);
        setIsLoginMode(true);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/google', {
        credential: credentialResponse.credential
      });
      const token = res.data.access_token;
      localStorage.setItem('access_token', token);
      
      setSuccessMsg('Google Login Successful!');
      setSuccess(true);
      if (onLoginSuccess) {
        onLoginSuccess(token);
      }
      setTimeout(() => resetAndClose(), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setIsLoginMode(true);
      setIsForgotMode(false);
      setUsername('');
      setPassword('');
      setEmail('');
      setFullName('');
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
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#5F1517]/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#E5D3B3]/40 rounded-full blur-2xl"></div>
            
          <h2 className="text-3xl font-extrabold text-[#5F1517] tracking-tight relative z-10">
            {isForgotMode ? 'Reset Password' : (isLoginMode ? 'Welcome Back' : 'Create Account')}
          </h2>
          <p className="text-[#5F1517]/80 mt-2 font-medium relative z-10">
            {isForgotMode ? 'Enter your email to receive a reset link' : (isLoginMode ? 'Sign in to your Samruddhi account' : 'Join Samruddhi Gold Palace today')}
          </p>
        </div>

        <div className="px-8 pb-10">
          {success ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-[#5F1517]/10 text-[#5F1517] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#5F1517]/20">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#5F1517]">{successMsg}</h3>
              {isLoginMode && !isForgotMode && <p className="text-[#5F1517]/70 mt-2 font-medium">Welcome to Samruddhi Gold Palace.</p>}
            </div>
          ) : (
            <form onSubmit={isForgotMode ? handleForgotSubmit : handleSubmit} className="space-y-4 animate-in fade-in duration-300">
              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50/50 px-3 py-2 rounded-lg text-sm font-medium">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {isForgotMode ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#5F1517]">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F1517]/40">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#5F1517]">
                      {isLoginMode ? "Email, Phone or Username" : "Username"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F1517]/40">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-white border ${error && !isForgotMode ? 'border-red-400 focus:ring-red-400' : 'border-[#E5D3B3] focus:ring-[#5F1517]/20 focus:border-[#5F1517]'} rounded-xl focus:bg-white focus:ring-2 outline-none transition text-[#5F1517] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal`}
                        placeholder={isLoginMode ? "Email, Phone or Username" : "johndoe"}
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
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 bg-white border ${error && !isForgotMode ? 'border-red-400 focus:ring-red-400' : 'border-[#E5D3B3] focus:ring-[#5F1517]/20 focus:border-[#5F1517]'} rounded-xl focus:bg-white focus:ring-2 outline-none transition text-[#5F1517] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal`}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5F1517]/40 hover:text-[#5F1517]/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {isLoginMode && (
                    <div className="flex items-center justify-between text-sm pt-2">
                      <label className="flex items-center space-x-2 text-[#5F1517]/70 cursor-pointer hover:text-[#5F1517] transition-colors">
                        <input type="checkbox" className="rounded text-[#5F1517] focus:ring-[#5F1517] border-gray-300 w-4 h-4 cursor-pointer" />
                        <span className="font-medium">Remember me</span>
                      </label>
                      <button type="button" onClick={() => { setIsForgotMode(true); setError(''); }} className="text-[#5F1517]/70 hover:text-[#5F1517] font-semibold transition hover:underline">
                        Forgot password?
                      </button>
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5F1517] text-white font-semibold tracking-wide py-3.5 px-4 rounded-full shadow-md hover:bg-[#801416] hover:shadow-lg focus:ring-4 focus:ring-[#5F1517]/20 transition-all disabled:opacity-70 flex justify-center items-center mt-6 text-[15px] border border-[#5F1517]"
              >
                {loading ? 'Processing...' : (isForgotMode ? 'Send Reset Link' : (isLoginMode ? 'Sign In' : 'Create Account'))}
              </button>

              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-[#E5D3B3]/50"></div>
                <span className="px-4 text-[12px] text-[#5F1517]/60 font-semibold uppercase tracking-wider">or</span>
                <div className="flex-grow h-px bg-[#E5D3B3]/50"></div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-In was unsuccessful')}
                  useOneTap
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="100%"
                />
              </div>

            </form>
          )}

          {!success && (
            <div className="mt-8 text-center text-[14px] text-[#5F1517]/80 border-t border-[#E5D3B3]/50 pt-6 font-medium">
              {isForgotMode ? (
                <>
                  Remember your password? 
                  <button 
                    type="button"
                    onClick={() => {
                      setIsForgotMode(false);
                      setIsLoginMode(true);
                      setError('');
                    }} 
                    className="text-[#5F1517] font-bold transition hover:underline ml-1"
                  >
                    Back to Sign In
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
