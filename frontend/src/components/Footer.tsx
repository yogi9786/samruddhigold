import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa';
import logo from '../assets/samruddhi-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#5F1517] text-[#FFF7F2] font-sans pt-16 pb-8 border-t-4 border-[#A56B25]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#FFF7F2] p-4 rounded-xl inline-block w-max mb-2">
              <img src={logo} alt="Samruddhi Gold Palace Logo" className="h-16 object-contain" />
            </div>
            <p className="text-[#FFF7F2]/80 text-sm leading-relaxed mb-4">
              Your trusted destination for exquisite gold and diamond jewellery. Crafting memories and celebrating traditions with purity and perfection.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61576994063051" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#FFF7F2]/10 flex items-center justify-center hover:bg-[#A56B25] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a 
                href="https://www.instagram.com/sirisamruddhigoldpalace/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#FFF7F2]/10 flex items-center justify-center hover:bg-[#A56B25] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a 
                href="https://www.youtube.com/@SiriSamruddhiGold" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#FFF7F2]/10 flex items-center justify-center hover:bg-[#A56B25] hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-serif font-medium mb-6 text-[#A56B25]">Quick Links</h3>
            <ul className="flex flex-col gap-3 text-[#FFF7F2]/80 text-sm">
              <li><a href="#gold" className="hover:text-[#A56B25] transition-colors">Gold Jewellery</a></li>
              <li><a href="#diamond" className="hover:text-[#A56B25] transition-colors">Diamond Collection</a></li>
              <li><a href="#look-book" className="hover:text-[#A56B25] transition-colors">Wedding Look Book</a></li>
              <li><a href="https://wa.me/919900000000" className="hover:text-[#A56B25] transition-colors">Jewellery Purchase Plan</a></li>
              <li><a href="#" className="hover:text-[#A56B25] transition-colors">Today's Gold Rate</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-serif font-medium mb-6 text-[#A56B25]">Customer Service</h3>
            <ul className="flex flex-col gap-3 text-[#FFF7F2]/80 text-sm">
              <li><a href="/about" className="hover:text-[#A56B25] transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-[#A56B25] transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-[#A56B25] transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-[#A56B25] transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-[#A56B25] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-serif font-medium mb-6 text-[#A56B25]">Reach Us</h3>
            <ul className="flex flex-col gap-4 text-[#FFF7F2]/80 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#A56B25] shrink-0 mt-0.5" />
                <span>Our Branches: Yelahanka, Udupi, Kolar</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#A56B25] shrink-0" />
                <a href="tel:+919035085755" className="hover:text-white transition-colors">+91 90350 85755</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#A56B25] shrink-0" />
                <a href="mailto:sirisamruddhigoldpalace@gmail.com" className="hover:text-white transition-colors">sirisamruddhigoldpalace@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#FFF7F2]/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#FFF7F2]/60">
          <div className="flex flex-col md:items-start gap-1">
            <p>&copy; {new Date().getFullYear()} Siri Samruddhi Gold Palace. All Rights Reserved.</p>
            <p>
              Digital Marketing & Developed by{' '}
              <a href="https://tekhportal.com/" target="_blank" rel="noopener noreferrer" className="text-[#A56B25] hover:text-white transition-colors">
                Tekhportal
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span>Crafted with purity</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#A56B25]"></span>
            <span>Secured Shopping</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
