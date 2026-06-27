import React, { useState } from 'react';
import Header from '../components/Header';
import TopBanner from '../components/TopBanner';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch (error) {
      console.error('Contact submission error:', error);
      setErrorMessage('Failed to connect to the server. Please try again later.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#FFF7F2] pb-16 lg:pb-0 overflow-x-hidden font-sans">
      <TopBanner />
      <Header />
      
      {/* Hero Section */}
      <div className="w-full bg-[#5F1517] text-white py-16 md:py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Contact Us</h1>
        <p className="text-lg md:text-xl text-[#FFF7F2]/80 max-w-3xl mx-auto">
          We would love to hear from you. Reach out for any inquiries, assistance, or feedback.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-16 w-full">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Contact Details */}
          <div className="w-full lg:w-1/3">
            <h2 className="text-3xl font-serif text-[#5F1517] mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Whether you are looking for a bespoke piece of jewellery or need assistance with your purchase, our team is here to help.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#5F1517] text-white rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-serif text-[#5F1517] mb-1">Our Branches</h4>
                  <p className="text-gray-600">Yelahanka, Udupi, Kolar</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#5F1517] text-white rounded-full flex items-center justify-center shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-serif text-[#5F1517] mb-1">Call Us</h4>
                  <a href="tel:+919035085755" className="text-gray-600 hover:text-[#A56B25]">+91 90350 85755</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#5F1517] text-white rounded-full flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-serif text-[#5F1517] mb-1">Email Us</h4>
                  <a href="mailto:sirisamruddhigoldpalace@gmail.com" className="text-gray-600 hover:text-[#A56B25] break-all">sirisamruddhigoldpalace@gmail.com</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#5F1517] text-white rounded-full flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-serif text-[#5F1517] mb-1">Business Hours</h4>
                  <p className="text-gray-600">Mon - Sun: 10:30 AM - 8:30 PM</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="w-full lg:w-2/3 bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-serif text-[#5F1517] mb-6">Send us a Message</h3>
            
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                Thank you for reaching out! We have received your message and will get back to you soon.
              </div>
            )}
            
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required 
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A56B25] focus:border-transparent transition-shadow"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A56B25] focus:border-transparent transition-shadow"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A56B25] focus:border-transparent transition-shadow"
                    placeholder="+91 90000 00000"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    required 
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A56B25] focus:border-transparent transition-shadow"
                    placeholder="How can we help?"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message *</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={5} 
                  required 
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A56B25] focus:border-transparent transition-shadow resize-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full md:w-auto px-8 py-3 bg-[#801416] text-white font-medium rounded-lg hover:bg-[#5F1517] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
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

export default ContactUs;
