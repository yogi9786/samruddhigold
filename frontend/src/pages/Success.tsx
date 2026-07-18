import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const Success: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-screen bg-[#FFF7F2] flex items-center justify-center p-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="bg-white p-10 md:p-14 rounded-3xl shadow-xl max-w-lg w-full text-center border border-[#D4AF37]/20">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-24 h-24 text-green-600 drop-shadow-md" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#5F1517] mb-4 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Payment Successful!
        </h1>
        
        <p className="text-[#5F1517]/80 text-lg mb-8 leading-relaxed">
          Thank you for your purchase. Your order has been placed successfully. 
          We have sent a confirmation message to your registered email and phone number.
        </p>

        {orderId && (
          <div className="bg-[#FFF7F2] p-4 rounded-xl border border-[#D4AF37]/30 mb-8 inline-block">
            <p className="text-[#5F1517]/60 text-sm font-semibold uppercase tracking-widest mb-1">Order Reference</p>
            <p className="text-xl text-[#5F1517] font-bold tracking-wider">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Link 
            to="/shop" 
            className="w-full py-4 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] font-bold rounded-xl uppercase tracking-[0.2em] text-sm hover:from-[#801416] hover:to-[#a01a1c] transition-all shadow-lg"
          >
            Continue Shopping
          </Link>
          <Link 
            to="/account" 
            className="w-full py-4 bg-transparent border-2 border-[#5F1517] text-[#5F1517] font-bold rounded-xl uppercase tracking-[0.2em] text-sm hover:bg-[#5F1517] hover:text-[#D4AF37] transition-all"
          >
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
