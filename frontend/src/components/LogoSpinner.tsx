import React from 'react';
import logo from '../assets/samruddhi-logo.png';

interface LogoSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LogoSpinner: React.FC<LogoSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: { container: 'w-16 h-16', border: 'w-12 h-12', logo: 'w-8 h-8' },
    md: { container: 'w-24 h-24', border: 'w-20 h-20', logo: 'w-12 h-12' },
    lg: { container: 'w-36 h-36', border: 'w-30 h-30', logo: 'w-20 h-20' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <style>{`
        @keyframes spinnerRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseLogo {
          0%, 100% { transform: scale(0.96); opacity: 0.9; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        .animate-spinner-rotate {
          animation: spinnerRotate 1.8s linear infinite;
        }
        .animate-pulse-logo {
          animation: pulseLogo 2s ease-in-out infinite;
        }
      `}</style>
      
      <div className={`relative flex items-center justify-center ${currentSize.container}`}>
        {/* Spinning Golden Accent Ring */}
        <div className={`absolute rounded-full border-2 border-transparent border-t-[#D4AF37] border-r-[#D4AF37]/30 border-b-[#D4AF37]/10 animate-spinner-rotate ${currentSize.border}`} />
        
        {/* Dotted static track */}
        <div className={`absolute rounded-full border border-dotted border-gray-200 ${currentSize.border}`} />

        {/* Brand Logo in the Center */}
        <div className={`flex items-center justify-center animate-pulse-logo ${currentSize.logo}`}>
          <img src={logo} alt="Loading..." className="w-full h-full object-contain" />
        </div>
      </div>
      
      {text && (
        <p className="mt-4 text-xs font-bold text-[#5F1517] uppercase tracking-[0.2em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LogoSpinner;
