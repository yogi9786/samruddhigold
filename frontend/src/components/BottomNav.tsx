import React, { useEffect, useState } from 'react';
import { User, ShoppingBag, Video, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    };
    checkLogin();
    window.addEventListener('loginSuccess', checkLogin);
    window.addEventListener('logout', checkLogin);
    return () => {
      window.removeEventListener('loginSuccess', checkLogin);
      window.removeEventListener('logout', checkLogin);
    };
  }, []);

  const handleAccountClick = () => {
    if (isLoggedIn) {
      navigate('/account');
    } else {
      window.dispatchEvent(new Event('openLoginModal'));
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#FFF7F2] border-t border-[#5F1517]/10 z-50 px-2 py-2.5 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
      <button onClick={handleAccountClick} className="flex flex-col items-center gap-1 text-[#5F1517] bg-transparent border-0 cursor-pointer">
        <User size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Account</span>
      </button>
      <button onClick={() => navigate('/shop')} className="flex flex-col items-center gap-1 text-[#801416] hover:text-[#5F1517] transition bg-transparent border-0 cursor-pointer">
        <ShoppingBag size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Shop</span>
      </button>
      <button onClick={() => navigate('/virtual-shopping')} className="flex flex-col items-center gap-1 text-[#801416] hover:text-[#5F1517] transition bg-transparent border-0 cursor-pointer">
        <Video size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Virtual Shopping</span>
      </button>
      <button onClick={() => navigate('/contact')} className="flex flex-col items-center gap-1 text-[#801416] hover:text-[#5F1517] transition bg-transparent border-0 cursor-pointer">
        <Phone size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Contact Us</span>
      </button>
    </div>
  );
};

export default BottomNav;
