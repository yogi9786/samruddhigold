import React, { useEffect, useState } from 'react';
import logo from '../assets/samruddhi-logo.png';

interface PageLoaderProps {
  onFinished?: () => void;
  duration?: number; // duration in ms
}

const PageLoader: React.FC<PageLoaderProps> = ({ onFinished, duration = 1800 }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimeout = setTimeout(() => {
      setFadeOut(true);
      const finishTimeout = setTimeout(() => {
        setVisible(false);
        if (onFinished) onFinished();
      }, 500); // fade out duration
      return () => clearTimeout(finishTimeout);
    }, duration - 500);

    return () => clearTimeout(fadeTimeout);
  }, [duration, onFinished]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-opacity duration-500 bg-[#FFF7F2] ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle, #FFFDFB 0%, #FFF7F2 100%)'
      }}
    >
      <style>{`
        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(0.95);
            filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.35));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 30px rgba(212, 175, 55, 0.7));
          }
        }
        @keyframes goldSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-pulse-glow {
          animation: pulseGlow 2.5s ease-in-out infinite;
        }
        .animate-gold-spin {
          animation: goldSpin 3s linear infinite;
        }
      `}</style>

      <div className="relative flex items-center justify-center w-40 h-40">
        {/* Elegant outer spinning ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/45 animate-gold-spin" />
        
        {/* Glowing border ring */}
        <div className="absolute w-[130px] h-[130px] rounded-full border-2 border-transparent border-t-[#D4AF37] border-b-[#D4AF37]/35 animate-gold-spin" 
             style={{ animationDuration: '1.5s' }} />

        {/* Inner pulsing logo */}
        <div className="relative w-24 h-24 animate-pulse-glow flex items-center justify-center">
          <img src={logo} alt="Siri Samruddhi Gold" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
