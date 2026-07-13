import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';

import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import api from '../api';
import loaderVideo from '../assets/loader landscape.mp4';
import { Video, Calendar, Clock, MapPin, Globe, Sparkles, Home, Users, CheckCircle2 } from 'lucide-react';

const VirtualShopping: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const [preSelectedCategory, setPreSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city_or_country: '',
    category: '',
    language: '',
    requirement_details: '',
    booking_date: '',
    booking_time: ''
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill category from URL query param (?category=Rings)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setPreSelectedCategory(cat);
      setFormData(prev => ({ ...prev, category: cat }));
      // Scroll to booking form after a short delay for render
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }, [searchParams]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const response = await api.post('/virtual-shopping', formData);
      if (response.status === 200 || response.status === 201) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          city_or_country: '',
          category: '',
          language: '',
          requirement_details: '',
          booking_date: '',
          booking_time: ''
        });
      }
    } catch (error: any) {
      console.error('Booking submission error:', error);
      setErrorMessage(error.response?.data?.detail || 'Failed to submit booking. Please check your network connection.');
      setStatus('error');
    }
  };

  // Generate hourly time slots between 06:00 and 23:59
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      slots.push(`${formattedHour}:00`);
      if (hour !== 23) {
        slots.push(`${formattedHour}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#FFF7F2] pb-16 lg:pb-0 overflow-x-hidden font-sans">
      <Header />

      {/* Hero Section */}
      <div className="w-full bg-[#5F1517] text-white py-12 md:py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        
        <h1 className="text-3xl md:text-5xl font-serif mb-3 tracking-wide" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Virtual Video Shopping
        </h1>
        <p className="text-sm md:text-base text-[#FFF7F2]/80 max-w-2xl mx-auto uppercase tracking-[0.2em] font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Browse & Shop jewellery live from the comfort of your home
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Video & How it Works */}
          <div className="space-y-10 w-full">
            {/* Video Player */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#D4AF37]/20 group">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-video object-cover"
                src={loaderVideo}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs uppercase tracking-widest font-semibold drop-shadow-md">Samruddhi Live Experience</span>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-[#FFF7F2] border border-[#D4AF37]/15 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-2xl font-serif text-[#5F1517] text-center mb-6" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Here's how it works
              </h3>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center flex-1 z-10">
                  <div className="w-10 h-10 rounded-full bg-[#5F1517] text-[#D4AF37] flex items-center justify-center font-bold shadow-md mb-3">
                    1
                  </div>
                  <p className="text-xs font-semibold text-[#5F1517] uppercase tracking-wider mb-1">Book Appointment</p>
                  <p className="text-[11px] text-gray-500 max-w-[150px]">Fill out the online form with your details & timing</p>
                </div>
                
                {/* Divider Line (Desktop) */}
                <div className="hidden md:block absolute top-5 left-[25%] right-[25%] h-[1px] bg-gradient-to-r from-[#D4AF37]/40 via-[#D4AF37]/60 to-[#D4AF37]/40 z-0" />

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center flex-1 z-10">
                  <div className="w-10 h-10 rounded-full bg-[#5F1517] text-[#D4AF37] flex items-center justify-center font-bold shadow-md mb-3">
                    2
                  </div>
                  <p className="text-xs font-semibold text-[#5F1517] uppercase tracking-wider mb-1">Verification</p>
                  <p className="text-[11px] text-gray-500 max-w-[150px]">Our executive will call to confirm the session details</p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center flex-1 z-10">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#5F1517] flex items-center justify-center font-bold shadow-md mb-3">
                    3
                  </div>
                  <p className="text-xs font-semibold text-[#5F1517] uppercase tracking-wider mb-1">Browse Live</p>
                  <p className="text-[11px] text-gray-500 max-w-[150px]">Connect via live video chat and shop your favorites</p>
                </div>
              </div>
            </div>

            {/* Features Info Badges */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <Globe className="text-[#A56B25] mb-2 shrink-0" size={24} />
                <span className="text-[11px] md:text-xs font-bold text-[#5F1517] uppercase tracking-wider">Shop Anywhere</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <Home className="text-[#A56B25] mb-2 shrink-0" size={24} />
                <span className="text-[11px] md:text-xs font-bold text-[#5F1517] uppercase tracking-wider">Comfort of Home</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <Users className="text-[#A56B25] mb-2 shrink-0" size={24} />
                <span className="text-[11px] md:text-xs font-bold text-[#5F1517] uppercase tracking-wider">Live Executive</span>
              </div>
            </div>
          </div>

          {/* Right Column: Appointment Form */}
          <div ref={formRef} className="w-full bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-[#D4AF37]/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5F1517] via-[#D4AF37] to-[#801416]" />
            
            <h3 className="text-2xl font-serif text-[#5F1517] mb-2 flex items-center gap-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              <Sparkles className="text-[#D4AF37]" size={22} />
              Book An Appointment
            </h3>

            {/* Pre-selected category banner */}
            {preSelectedCategory && status !== 'success' && (
              <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-[#5F1517]/5 border border-[#D4AF37]/30 rounded-xl">
                <svg className="w-4 h-4 text-[#D4AF37] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-[#5F1517] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Category pre-selected: <span className="text-[#801416] font-bold uppercase tracking-wide">{preSelectedCategory}</span>
                </span>
              </div>
            )}

            {status === 'success' && (
              <div className="mb-6 p-5 bg-[#FFF7F2] border border-[#D4AF37] text-[#5F1517] rounded-xl flex items-start gap-3 animate-fade-in shadow-sm">
                <CheckCircle2 className="text-[#D4AF37] shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wide mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Booking Successful!</h4>
                  <p className="text-xs text-[#5F1517]/80">
                    Thank you for booking! Our live shopping team will review your request and reach out to you shortly to confirm your video session.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Enter a Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition bg-[#FFF7F2]/30 placeholder-gray-400"
                  placeholder="Your Name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Enter an Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition bg-[#FFF7F2]/30 placeholder-gray-400"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Enter Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition bg-[#FFF7F2]/30 placeholder-gray-400"
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city_or_country" className="block text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Enter City or Country *
                </label>
                <input
                  type="text"
                  id="city_or_country"
                  name="city_or_country"
                  required
                  value={formData.city_or_country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition bg-[#FFF7F2]/30 placeholder-gray-400"
                  placeholder="Bangalore, India"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="category" className="block text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Category to Shop *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition bg-[#FFF7F2]/30 text-gray-700"
                  >
                    <option value="">--Select Category--</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Pendants">Pendants</option>
                    <option value="Rings">Rings</option>
                    <option value="Diamond Jewellery">Diamond Jewellery</option>
                    <option value="Bangles">Bangles</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Gold Coins">Gold Coins</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Preferred Language *
                  </label>
                  <select
                    id="language"
                    name="language"
                    required
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition bg-[#FFF7F2]/30 text-gray-700"
                  >
                    <option value="">--Select Language--</option>
                    <option value="English">English</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="requirement_details" className="block text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  When do you want us to reach you? (Requirements / Notes)
                </label>
                <textarea
                  id="requirement_details"
                  name="requirement_details"
                  rows={3}
                  value={formData.requirement_details}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition bg-[#FFF7F2]/30 placeholder-gray-400 resize-none"
                  placeholder="Specify any preferences or special requirement details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="booking_date" className="block text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="booking_date"
                      name="booking_date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.booking_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition bg-[#FFF7F2]/30 text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="booking_time" className="block text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Time (IST - 06:00 to 23:59) *
                  </label>
                  <select
                    id="booking_time"
                    name="booking_time"
                    required
                    value={formData.booking_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition bg-[#FFF7F2]/30 text-gray-700"
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] font-bold rounded-xl text-xs uppercase tracking-widest hover:brightness-110 transition shadow-md disabled:opacity-75 disabled:cursor-not-allowed mt-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {status === 'submitting' ? 'Booking...' : 'Book An Appointment'}
              </button>
            </form>
          </div>

        </div>
      </div>

      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
};

export default VirtualShopping;
