import React from 'react';
import Header from '../components/Header';
import CategoriesRow from '../components/CategoriesRow';
import HeroSlider from '../components/HeroSlider';
import BottomNav from '../components/BottomNav';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import CategoryGrid from '../components/CategoryGrid';
import BestSellersBanner from '../components/BestSellersBanner';
import PromoBanner from '../components/PromoBanner';
import GenderCategories from '../components/GenderCategories';
import CollectionShowcase from '../components/CollectionShowcase';
import WeddingLookBook from '../components/WeddingLookBook';
import ScrollReveal from '../components/ScrollReveal';
import HoverGallery from '../components/HoverGallery';
import TrustMarkers from '../components/TrustMarkers';
import InstagramFeed from '../components/InstagramFeed';
import Footer from '../components/Footer';
import GoogleReviews from '../components/GoogleReviews';
import FeaturedProducts from '../components/FeaturedProducts';
import SignatureJewellery from '../components/SignatureJewellery';
import FAQ from '../components/FAQ';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-transparent pb-16 lg:pb-0 overflow-x-hidden">
      <Header />
      <ScrollReveal delay={100}>
        <div className="w-full">
          <HeroSlider />
        </div>
      </ScrollReveal>

     

      <div className="w-full max-w-7xl mx-auto flex flex-col mt-2 md:mt-4">
        {/* Mobile Quick Category Row (Very small) */}
        <CategoriesRow />


        {/* Promotional Banner */}
        <ScrollReveal delay={150}>
          <PromoBanner />
        </ScrollReveal>

        {/* Featured Products Showcase */}
      <FeaturedProducts />

       <ScrollReveal delay={150}>
        <BestSellersBanner />
      </ScrollReveal>

      {/* Decorative Divider */}
      <div className="w-full flex justify-center items-center py-3 md:py-8">
        <div className="w-16 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60"></div>
        <div className="w-2 h-2 rounded-full bg-[#D4AF37] mx-3 shadow-[0_0_8px_rgba(212,175,55,0.6)]"></div>
        <div className="w-16 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60"></div>
      </div>

        {/* Gender/Age Categories */}
        <ScrollReveal>
          <GenderCategories />
        </ScrollReveal>
      </div>

      {/* Collection Showcase Section */}
      <ScrollReveal>
        <CollectionShowcase />
      </ScrollReveal>

      {/* Bridal Collection (Wedding Look Book) */}
      <ScrollReveal>
        <WeddingLookBook />
      </ScrollReveal>

            {/* 3D Hover Gallery (Hidden on mobile) */}
      <HoverGallery />




      {/* Curated Classics — Premium Section Header */}
      <ScrollReveal>
        <div className="text-center mt-4 lg:mt-10 mb-4 md:mb-6 px-4">
          {/* Ornamental eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-3 md:mb-5">
            <span className="block w-8 md:w-16 h-[1px] bg-[#D4AF37]" />
            <span className="font-sans text-[9px] md:text-[11px] text-[#D4AF37] tracking-[3px] md:tracking-[4px] uppercase font-semibold">
              Explore Our World
            </span>
            <span className="block w-8 md:w-16 h-[1px] bg-[#D4AF37]" />
          </div>
          {/* Main headline */}
          <h2 className="font-serif text-[24px] md:text-[40px] lg:text-[56px] text-[#5F1517] leading-[1.1] tracking-tight mb-3 md:mb-5">
            Curated Classics
          </h2>
          {/* Subtext */}
          <p className="font-sans text-[11px] md:text-[15px] text-[#5F1517]/60 max-w-xl mx-auto leading-relaxed font-light">
            A handpicked selection of our finest gold, diamond &amp; heritage jewellery —
            crafted for those who appreciate the extraordinary.
          </p>
        </div>
      </ScrollReveal>

      {/* Dynamic Category Grid */}
      <ScrollReveal delay={100}>
        <CategoryGrid />
      </ScrollReveal>

      {/* Signature Jewellery Grid */}
      <SignatureJewellery />

      {/* Featured Products Showcase */}
      <FeaturedProducts />

      <ScrollReveal>
        <TrustMarkers />
      </ScrollReveal>
      
      <ScrollReveal>
        <InstagramFeed />
      </ScrollReveal>

      <ScrollReveal>
        <GoogleReviews />
      </ScrollReveal>

      <ScrollReveal>
        <FAQ />
      </ScrollReveal>

      <Footer />

      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
};

export default Home;
