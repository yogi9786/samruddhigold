import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { resetPassword } from '../api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
        setTimeout(() => window.dispatchEvent(new Event('openLoginModal')), 500);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link might have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden border border-[#E5D3B3]">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#5F1517]/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#E5D3B3]/40 rounded-full blur-2xl"></div>
          
          <div className="text-center relative z-10 mb-8">
            <h2 className="text-3xl font-extrabold text-[#5F1517] tracking-tight">
              Set New Password
            </h2>
            <p className="text-[#5F1517]/80 mt-2 font-medium">
              Please enter your new password below.
            </p>
          </div>

          {success ? (
            <div className="text-center relative z-10 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#5F1517]">Password Reset Successful!</h3>
              <p className="text-[#5F1517]/70 font-medium">You will be redirected to the home page shortly.</p>
              <Link to="/" className="inline-block mt-4 text-[#5F1517] font-bold hover:underline">
                Go to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm text-center font-medium">
                  {error}
                </div>
              )}
              
              {!token && (
                <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 px-4 py-3 rounded-xl text-sm text-center font-medium">
                  Missing token. Please use the link sent to your email.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#5F1517]">New Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F1517]/40">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5F1517]/40 hover:text-[#5F1517]/70 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#5F1517]">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F1517]/40">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-[#E5D3B3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5F1517]/20 focus:border-[#5F1517] outline-none transition text-[#5F1517] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5F1517]/40 hover:text-[#5F1517]/70 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-[#5F1517] text-white font-semibold tracking-wide py-3.5 px-4 rounded-full shadow-md hover:bg-[#801416] hover:shadow-lg focus:ring-4 focus:ring-[#5F1517]/20 transition-all disabled:opacity-70 flex justify-center items-center mt-6 text-[15px] border border-[#5F1517]"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
