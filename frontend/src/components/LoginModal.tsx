import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, AlertCircle, Phone } from 'lucide-react';
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
  
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Lock background body scrolling when modal is open & load cached remember me data
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const cachedIdentifier = localStorage.getItem('remembered_login_identifier');
      if (cachedIdentifier) {
        setLoginIdentifier(cachedIdentifier);
        setRememberMe(true);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        // Sign In using Email or Phone Number
        const response = await api.post('/auth/token', 
          new URLSearchParams({
            username: loginIdentifier,
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

        // Handle Remember Me caching
        if (rememberMe) {
          localStorage.setItem('remembered_login_identifier', loginIdentifier);
        } else {
          localStorage.removeItem('remembered_login_identifier');
        }
        
        setSuccessMsg('Login Successful!');
        setSuccess(true);
        if (onLoginSuccess) {
          onLoginSuccess(token);
        }
        
        setTimeout(() => resetAndClose(), 1500);

      } else {
        // Sign Up with Email, Phone Number, Full Name, Password, Confirm Password
        if (!phone.trim()) {
          setError('Phone Number is required for account creation');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match. Please verify your password.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        await api.post('/users', {
          email: email,
          phone: phone,
          full_name: fullName,
          password: password,
        });

        setSuccessMsg('Account Created Successfully! Please Sign In.');
        setSuccess(true);
        
        // After 2 seconds, switch to login mode automatically
        setTimeout(() => {
          setSuccess(false);
          setIsLoginMode(true);
          setLoginIdentifier(email || phone);
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      }

    } catch (err: any) {
      if (err.response?.status === 401 && isLoginMode) {
         setError('Invalid Email/Phone or Password');
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
      
      setTimeout(() => {
        resetAndClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    document.body.style.overflow = 'unset';
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setIsLoginMode(true);
      setIsForgotMode(false);
      setPassword('');
      setConfirmPassword('');
      setEmail('');
      setPhone('');
      setFullName('');
      setError('');
    }, 200);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          resetAndClose();
        }
      }}
    >
      <div className="bg-[#FFF7F2] rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col relative border border-[#5F1517]/10 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            resetAndClose();
          }}
          className="absolute top-3.5 right-3.5 text-[#5F1517]/70 hover:text-[#5F1517] transition z-50 bg-white/90 hover:bg-white rounded-full p-2 shadow-md cursor-pointer border border-[#5F1517]/10 active:scale-95"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-6 pt-5 pb-3 text-center relative shrink-0 border-b border-[#5F1517]/5">
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#5F1517]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-[#E5D3B3]/40 rounded-full blur-2xl pointer-events-none"></div>
            
          <h2 className="text-2xl font-extrabold text-[#5F1517] tracking-tight relative z-10">
            {isForgotMode ? 'Reset Password' : (isLoginMode ? 'Welcome Back' : 'Create Account')}
          </h2>
          <p className="text-xs text-[#5F1517]/80 mt-1 font-medium relative z-10">
            {isForgotMode ? 'Enter your email to receive a reset link' : (isLoginMode ? 'Sign in with your Email or Phone Number' : 'Join Samruddhi Gold Palace today')}
          </p>
        </div>

        {/* Form Body - Scrollable content inside modal only */}
        <div className="px-6 py-4 overflow-y-auto flex-1 custom-scrollbar">
          {success ? (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="w-14 h-14 bg-[#5F1517]/10 text-[#5F1517] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#5F1517]/20">
                <Lock size={26} />
              </div>
              <h3 className="text-lg font-bold text-[#5F1517]">{successMsg}</h3>
              {isLoginMode && !isForgotMode && <p className="text-[#5F1517]/70 mt-1 text-xs font-medium">Welcome to Samruddhi Gold Palace.</p>}
            </div>
          ) : (
            <form onSubmit={isForgotMode ? handleForgotSubmit : handleSubmit} className="space-y-2.5 animate-in fade-in duration-300">
              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50/50 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {isForgotMode ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#5F1517]">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F1517]/40">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm text-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              ) : isLoginMode ? (
                /* Sign In Form */
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5F1517]">
                      Email or Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F1517]/40">
                        <Mail size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className={`w-full pl-9 pr-3.5 py-2.5 bg-white border ${error ? 'border-red-400 focus:ring-red-400' : 'border-[#E5D3B3] focus:ring-[#5F1517]/20 focus:border-[#5F1517]'} rounded-xl focus:bg-white focus:ring-2 outline-none transition text-[#5F1517] shadow-sm text-sm font-medium placeholder:text-gray-400 placeholder:font-normal`}
                        placeholder="john@example.com or 9876543210"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5F1517]">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F1517]/40">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-9 pr-10 py-2.5 bg-white border ${error ? 'border-red-400 focus:ring-red-400' : 'border-[#E5D3B3] focus:ring-[#5F1517]/20 focus:border-[#5F1517]'} rounded-xl focus:bg-white focus:ring-2 outline-none transition text-[#5F1517] shadow-sm text-sm font-medium placeholder:text-gray-400 placeholder:font-normal`}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5F1517]/40 hover:text-[#5F1517]/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-1.5 text-[#5F1517]/70 cursor-pointer hover:text-[#5F1517] transition-colors">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-[#5F1517] focus:ring-[#5F1517] border-gray-300 w-3.5 h-3.5 cursor-pointer" 
                      />
                      <span className="font-medium">Remember me</span>
                    </label>
                    <button type="button" onClick={() => { setIsForgotMode(true); setError(''); }} className="text-[#5F1517]/70 hover:text-[#5F1517] font-semibold transition hover:underline">
                      Forgot password?
                    </button>
                  </div>
                </>
              ) : (
                /* Sign Up Form */
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5F1517]">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F1517]/40">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm text-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5F1517]">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F1517]/40">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm text-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5F1517]">Phone Number (WhatsApp) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F1517]/40">
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm text-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5F1517]">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F1517]/40">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm text-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5F1517]/40 hover:text-[#5F1517]/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5F1517]">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F1517]/40">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-9 pr-10 py-2 bg-white border ${confirmPassword && password !== confirmPassword ? 'border-red-400 focus:ring-red-400 text-red-600' : 'border-[#E5D3B3] focus:ring-[#5F1517]/20 focus:border-[#5F1517]'} rounded-xl focus:bg-white focus:ring-2 outline-none transition text-[#5F1517] shadow-sm text-sm font-medium placeholder:text-gray-400 placeholder:font-normal`}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5F1517]/40 hover:text-[#5F1517]/70 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-[11px] text-red-500 mt-0.5 font-semibold">Passwords do not match</p>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5F1517] text-white font-semibold tracking-wide py-2.5 px-4 rounded-full shadow-md hover:bg-[#801416] hover:shadow-lg focus:ring-4 focus:ring-[#5F1517]/20 transition-all disabled:opacity-70 flex justify-center items-center mt-3 text-sm border border-[#5F1517]"
              >
                {loading ? 'Processing...' : (isForgotMode ? 'Send Reset Link' : (isLoginMode ? 'Sign In' : 'Create Account'))}
              </button>

              <div className="flex items-center my-2.5">
                <div className="flex-grow h-px bg-[#E5D3B3]/50"></div>
                <span className="px-3 text-[11px] text-[#5F1517]/60 font-semibold uppercase tracking-wider">or</span>
                <div className="flex-grow h-px bg-[#E5D3B3]/50"></div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-In was unsuccessful')}
                  useOneTap
                  theme="outline"
                  size="medium"
                  shape="pill"
                  width="100%"
                />
              </div>

            </form>
          )}

          {!success && (
            <div className="mt-3 text-center text-xs text-[#5F1517]/80 border-t border-[#E5D3B3]/40 pt-2.5 font-medium">
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
                      setConfirmPassword('');
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
