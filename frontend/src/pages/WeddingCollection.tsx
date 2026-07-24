import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import ScrollReveal from '../components/ScrollReveal';
import WeddingLookBook from '../components/WeddingLookBook';
import FeaturedProducts from '../components/FeaturedProducts';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, ChevronRight, CheckCircle2, ChevronDown, ShieldCheck, UserCheck, Gem, PhoneCall, Calendar } from 'lucide-react';
import api from '../api';

// Images
import imgHeroBg from '../assets/gen/hero_slider_1_1782215599212.png';
import imgCatSet from '../assets/gen/cat_jewellery_sets_1782214836263.png';
import imgCatNecklace from '../assets/gen/signature_gold_necklace.png';
import imgCatEarrings from '../assets/gen/cat_earrings_1782214875918.png';
import imgCatBangles from '../assets/gen/cat_bangles_1782214893370.png';
import imgCatRings from '../assets/gen/cat_rings_1782214860176.png';

import imgUdupi from '../assets/udupi-branch-siri-samruddhi.jpg.webp';
import imgYelahanka from '../assets/yelahanka-branch-siri-samruddhi-1024x1024.jpg.webp';
import imgKolar from '../assets/kolar-branch-siri-samruddhi.jpg.webp';

const WeddingCollection: React.FC = () => {
  // Hero appointment form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    branch: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ open/close accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [submittingLead, setSubmittingLead] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please enter your name and phone number');
      return;
    }
    setSubmittingLead(true);
    try {
      await api.post('/contact', {
        name: formData.fullName,
        phone: formData.phone,
        email: null,
        subject: `Wedding Collection Lead — ${formData.branch || 'General Inquiry'}`,
        message: `Bridal Consultation requested for ${formData.branch || 'General'}. Customer Name: ${formData.fullName}, Phone: ${formData.phone}`,
        source: 'wedding_collection'
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit wedding lead:', err);
      setIsSubmitted(true);
    } finally {
      setSubmittingLead(false);
    }
  };

  const categoriesData = [
    {
      id: 'set',
      title: '1. Wedding Jewellery Set',
      description:
        'When you can have a colour-coordinated ensemble on your wedding day, it is almost like a dream-come-true moment. That is why a wedding jewellery set is a great choice. It brings all the pieces together in a perfect, balanced look. A wedding set typically includes a necklace, earrings, and bangles, among other items.',
      image: imgCatSet,
      tag: 'Complete Bridal Sets',
      link: '/shop?search=Set',
    },
    {
      id: 'necklace',
      title: '2. Wedding Necklace',
      description:
        'A wedding necklace is the piece that stands out, the one everyone notices first. It is special because it frames your face and completes your bridal outfit. Hence, choosing the right neckpiece means finding something that makes you feel like royalty on your big day.',
      image: imgCatNecklace,
      tag: 'Regal Neckpieces',
      link: '/shop?search=Necklace',
    },
    {
      id: 'earrings',
      title: '3. Wedding Earrings',
      description:
        "Wedding earrings add that perfect finishing touch to your bridal ensemble. They bring that final touch of sparkle without stealing the show. Whether you are after delicate studs or statement dangler earrings, Siri Samruddhi has it all. Plus, these earrings aren't just for the wedding day—wear them long after and keep the memories alive.",
      image: imgCatEarrings,
      tag: 'Sparkling Earrings',
      link: '/shop?search=Earring',
    },
    {
      id: 'bangles',
      title: '4. Wedding Bangles',
      description:
        'Nothing says celebration quite like the gentle chime of wedding bangles. These pieces bring colour, elegance, and a bit of magic to your wrists. They blend tradition and style perfectly, enhancing every moment with a hint of joy. Choose from a wide range of gold, polki and diamond bangle designs.',
      image: imgCatBangles,
      tag: 'Traditional Bangles',
      link: '/shop?search=Bangle',
    },
    {
      id: 'rings',
      title: '5. Wedding Rings',
      description:
        'Wedding rings are an eternal symbol of the love and unity between two people. From classic gold wedding bands to diamond solitaire rings, our rings are crafted to capture the essence of your love story.',
      image: imgCatRings,
      tag: 'Eternal Bands & Solitaires',
      link: '/shop?search=Ring',
    },
  ];

  const whyVisitData = [
    {
      icon: <Gem className="w-8 h-8 text-[#D4AF37]" />,
      title: '1. Experience Exclusive Designs',
      description:
        'Discover Indian wedding jewellery designs that are exclusive to our store, each crafted with unique artistry and detail. Seeing these pieces up close helps you truly appreciate the craftsmanship and beauty. Our offline store offers a range that captures the essence of your big day.',
    },
    {
      icon: <UserCheck className="w-8 h-8 text-[#D4AF37]" />,
      title: '2. Personalised Consultation',
      description:
        'Siri Samruddhi understands that choosing jewellery for a wedding is personal. Therefore, we are here to guide you through it. Our expert jewellery consultants are available for one-on-one consultations to help you find the pieces that match your vision.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />,
      title: '3. Assurance of Quality',
      description:
        'Not confident of buying gold wedding jewellery online? At our store, you can explore our jewellery firsthand. This will give you complete confidence in its quality and craftsmanship. We stand by the authenticity and durability of each piece, ensuring it meets our highest standards.',
    },
  ];

  const faqItems = [
    {
      q: '1. What types of wedding jewellery are available?',
      a: "Our collection includes a wide range of wedding jewellery from gold wedding bracelets, rings, bangles, mangalsutras, earrings, and necklaces. We also provide specialised women's wedding jewellery for events such as Sangeet, Engagement, Mehendi, and Reception.",
    },
    {
      q: '2. Can I customise or personalise my wedding jewellery?',
      a: 'Yes, you can customise your wedding jewellery with us. All you need to do is reach out to us, and we will help you bring your vision to life.',
    },
    {
      q: '3. Can I insure my wedding jewellery against loss or damage?',
      a: 'Siri Samruddhi provides a one-year warranty, insurance, and lifetime after-sales care for your jewellery, offering lasting protection for your purchase.',
    },
    {
      q: '4. What are the services offered at store?',
      a: 'Our store offers personalised styling, a dedicated Bridal Studio for brides-to-be, and a 15-day return policy with lifetime exchange and buyback options.',
    },
    {
      q: '5. How can I visit your store to buy wedding jewellery?',
      a: 'To visit our store and explore our wedding jewellery collection, please use our Store Locator to find the nearest Siri Samruddhi store.',
    },
  ];

  const branches = [
    {
      name: 'Udupi Branch',
      location: 'Udupi, Karnataka',
      image: imgUdupi,
      phone: '+91 9035085397',
      address: 'Main Road, Near Court Circle, Udupi',
    },
    {
      name: 'Yelahanka Branch',
      location: 'Bengaluru, Karnataka',
      image: imgYelahanka,
      phone: '+91 9035085397',
      address: 'Major Unnikrishnan Road, Sector 4, Yelahanka New Town, Bengaluru',
    },
    {
      name: 'Kolar Branch',
      location: 'Kolar, Karnataka',
      image: imgKolar,
      phone: '+91 9035085397',
      address: 'MB Road, Opposite District Hospital, Kolar',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#FFF7F2] font-sans pb-16 lg:pb-0 overflow-x-hidden">
      <Header />

      {/* ── HERO SECTION WITH GLASSY EFFECT ── */}
      <section className="relative w-full min-h-[90vh] md:min-h-[85vh] flex items-center justify-center py-10 md:py-16 px-4 md:px-8 overflow-hidden">
        {/* Background Image backdrop with luxury overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
          style={{ backgroundImage: `url(${imgHeroBg})` }}
        />
        {/* Deep luxury maroon overlay with subtle blur */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A0507]/95 via-[#4A0A0C]/85 to-[#2A0507]/90 backdrop-blur-[2px]" />

        {/* Outer Glass Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto backdrop-blur-2xl bg-black/40 border border-white/20 rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Subtle glowing ambient highlight */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#801416]/40 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col items-start text-left text-white">
              {/* Gold Eyebrow */}
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-sans text-[11px] md:text-[13px] text-[#D4AF37] font-bold tracking-[0.25em] uppercase">
                  SIRI SAMRUDDHI GOLD PALACE
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-[34px] sm:text-[48px] md:text-[60px] lg:text-[66px] leading-[1.08] font-normal tracking-tight mb-6 text-white text-shadow-sm">
                Wedding Bridal <br className="hidden sm:inline" />
                <span className="italic font-light text-[#FFD700]">Collections</span>
              </h1>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mb-8">
                <a
                  href="#types-of-jewellery"
                  className="bg-white text-[#5F1517] hover:bg-[#FFD700] hover:text-[#5F1517] transition-all duration-300 px-7 py-3.5 rounded-full font-bold text-sm md:text-base tracking-wide shadow-lg no-underline inline-flex items-center gap-2"
                >
                  Let's Get Started
                </a>
                <a
                  href="#types-of-jewellery"
                  className="w-12 h-12 rounded-full bg-white/10 border border-white/30 text-white flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                  aria-label="Scroll to collection"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </a>
              </div>

              {/* Tagline Paragraph */}
              <p className="font-sans text-[#FFF7F2]/90 text-sm md:text-base max-w-xl leading-relaxed font-light">
                Discover our meticulously handcrafted masterpieces designed to elevate your bridal journey. Timeless elegance and modern luxury combined to make your special day truly unforgettable.
              </p>
            </div>

            {/* Right Column: Appointment Form Card inside Glass Hero */}
            <div className="lg:col-span-5 w-full">
              <div className="backdrop-blur-xl bg-black/50 border border-white/20 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="text-center mb-6">
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1">
                    Contact Us
                  </h3>
                  <p className="font-sans text-xs md:text-sm text-[#FFD700]/90 font-medium">
                    Book an appointment with our experts
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="bg-white/10 border border-[#D4AF37]/40 rounded-2xl p-6 text-center text-white space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-bounce" />
                    <h4 className="font-serif text-xl font-bold text-white">Appointment Requested!</h4>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Thank you <span className="font-semibold text-[#FFD700]">{formData.fullName}</span>! Our bridal consultation manager will contact you shortly to confirm your booking.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mt-2 text-xs text-[#FFD700] underline font-semibold cursor-pointer"
                    >
                      Book another appointment
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[#FFD700] focus:bg-white/20 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[#FFD700] focus:bg-white/20 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <select
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        required
                        className="w-full bg-[#3B090B] border border-white/20 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FFD700] transition-all cursor-pointer font-medium"
                      >
                        <option value="">Select Branch</option>
                        <option value="Udupi Branch">Udupi Branch</option>
                        <option value="Yelahanka Branch">Yelahanka Branch</option>
                        <option value="Kolar Branch">Kolar Branch</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingLead}
                      className="mt-2 w-full bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] hover:opacity-95 disabled:opacity-50 text-white font-bold tracking-widest text-xs md:text-sm py-3.5 rounded-xl uppercase transition-all duration-300 shadow-lg cursor-pointer"
                    >
                      {submittingLead ? 'Submitting...' : 'SUBMIT REQUEST'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: INTRO EDITORIAL ── */}
      <ScrollReveal>
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="font-sans text-xs text-[#801416] tracking-[0.2em] uppercase font-bold">
              Heritage Bridal Collection
            </span>
            <span className="w-12 h-[1px] bg-[#D4AF37]" />
          </div>

          <h2 className="font-serif text-[26px] sm:text-[36px] md:text-[44px] text-[#5F1517] leading-tight font-bold mb-6">
            Wedding Jewellery Collection By Siri Samruddhi: <br className="hidden md:inline" />
            <span className="italic text-[#801416] font-light">Elevate Your Special Day</span>
          </h2>

          <p className="font-sans text-[#5F1517]/80 text-sm sm:text-base md:text-lg leading-relaxed font-normal max-w-3xl mx-auto">
            Indian weddings are all about those heartfelt details, planned and perfected over months. Every outfit and each piece of jewellery reflects the joy and tradition woven into these moments. Siri Samruddhi brings a collection of wedding jewellery specially crafted to celebrate this journey. So, join us to find those perfect treasures to make your big day shine even brighter.
          </p>
        </section>
      </ScrollReveal>

      {/* ── SECTION 2: HOME PAGE WEDDING LOOK BOOK CAROUSEL ── */}
      <ScrollReveal>
        <WeddingLookBook />
      </ScrollReveal>

      {/* ── SECTION 3: TYPES OF WEDDING JEWELLERY ── */}
      <section id="types-of-jewellery" className="py-12 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-[#801416] font-bold text-xs uppercase tracking-[0.25em] block mb-2">
              Curated Masterpieces
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#5F1517]">
              Types of <span className="italic text-[#801416] font-light">Wedding Jewellery</span>
            </h2>
            <div className="w-20 h-[2px] bg-[#D4AF37] mx-auto mt-4" />
          </div>
        </ScrollReveal>

        <div className="space-y-12 md:space-y-16">
          {categoriesData.map((cat, index) => (
            <ScrollReveal key={cat.id} delay={index * 50}>
              <div
                className={`flex flex-col ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                } bg-white rounded-3xl overflow-hidden border border-[#5F1517]/10 shadow-sm hover:shadow-xl transition-all duration-500 items-center`}
              >
                {/* Category Image */}
                <div className="w-full lg:w-1/2 relative aspect-square sm:aspect-[4/3] lg:aspect-square overflow-hidden bg-[#FFF7F2]">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 bg-[#5F1517] text-[#FFD700] text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-md">
                    {cat.tag}
                  </span>
                </div>

                {/* Category Description */}
                <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center text-left">
                  <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#5F1517] mb-4 leading-tight">
                    {cat.title}
                  </h3>
                  <p className="font-sans text-sm sm:text-base text-[#5F1517]/80 leading-relaxed font-normal mb-6">
                    {cat.description}
                  </p>
                  <div>
                    <Link
                      to={cat.link}
                      className="inline-flex items-center gap-2 bg-[#801416] hover:bg-[#5F1517] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 no-underline shadow-md"
                    >
                      <span>Explore Collection</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Featured Products Component Integration */}
      <FeaturedProducts />

      {/* ── SECTION 4: WHY VISIT OUR OFFLINE STORE ── */}
      <section className="bg-[#5F1517] text-white py-14 md:py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Ornamental Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#801416] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12 md:mb-16">
              <span className="text-[#FFD700] font-bold text-xs uppercase tracking-[0.25em] block mb-2">
                Personalized Touch
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight">
                Why Visit Our Offline Store to <br className="hidden sm:inline" />
                <span className="italic text-[#FFD700] font-light">Explore Wedding Jewellery</span>
              </h2>
              <div className="w-20 h-[2px] bg-[#FFD700] mx-auto mt-4" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyVisitData.map((item, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="bg-white/5 backdrop-blur-md border border-white/15 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 h-full flex flex-col text-left">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                    {item.icon}
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: FAQs ── */}
      <section className="py-14 md:py-24 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-[#801416] font-bold text-xs uppercase tracking-[0.25em] block mb-2">
              Have Questions?
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#5F1517]">
              Frequently Asked <span className="italic text-[#801416] font-light">Questions</span>
            </h2>
            <div className="w-20 h-[2px] bg-[#D4AF37] mx-auto mt-4" />
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <ScrollReveal key={idx} delay={idx * 40}>
                <div className="bg-white rounded-2xl border border-[#5F1517]/10 shadow-sm overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FFF7F2]/50 transition-colors"
                  >
                    <span className="font-serif text-base sm:text-lg font-bold text-[#5F1517]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#801416] flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-[#5F1517]/5 text-sm sm:text-base text-[#5F1517]/80 leading-relaxed font-sans">
                      {item.a}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 6: STORE SHOWROOMS & LOCATIONS ── */}
      <section className="bg-[#FFF7F2] py-14 md:py-24 px-4 sm:px-6 border-t border-[#5F1517]/10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-[#801416] font-bold text-xs uppercase tracking-[0.25em] block mb-2">
                Our Flagship Showrooms
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#5F1517] mb-4">
                Siri Samruddhi Gold Palace
              </h2>
              <p className="font-sans text-xs sm:text-sm md:text-base text-[#5F1517]/80 leading-relaxed font-normal">
                Your wedding day jewellery should be as timeless as the love it represents. Let us be part of your special day with pieces that reflect your style, your traditions, and the magic of your journey. We invite you to experience our heritage craftsmanship in person at our exclusive showrooms.
              </p>
            </div>
          </ScrollReveal>

          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {branches.map((branch, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="bg-white rounded-3xl overflow-hidden border border-[#5F1517]/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={branch.image}
                      alt={branch.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-4 left-4 text-white font-serif font-bold text-xl drop-shadow-md">
                      {branch.name}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-grow text-left justify-between">
                    <div>
                      <p className="text-xs text-[#801416] font-bold tracking-wider uppercase mb-2 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        {branch.location}
                      </p>
                      <p className="text-xs sm:text-sm text-[#5F1517]/80 leading-relaxed font-medium mb-4">
                        {branch.address}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#5F1517]/10 flex items-center justify-between">
                      <a
                        href={`tel:${branch.phone}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#801416] hover:text-[#5F1517] no-underline"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-[#D4AF37]" />
                        Call Store
                      </a>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-1 bg-[#5F1517] hover:bg-[#801416] text-white px-4 py-2 rounded-full text-xs font-bold tracking-wide no-underline transition-colors"
                      >
                        <Calendar className="w-3 h-3 text-[#FFD700]" />
                        Visit Us
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
};

export default WeddingCollection;
