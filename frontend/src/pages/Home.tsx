import React from 'react';
import Header from '../components/Header';
import TopBanner from '../components/TopBanner';
import CategoriesRow from '../components/CategoriesRow';
import HeroSlider from '../components/HeroSlider';
import BottomNav from '../components/BottomNav';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import CategoryGrid from '../components/CategoryGrid';
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
import FAQ from '../components/FAQ';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-transparent pb-16 lg:pb-0 overflow-x-hidden">
      <TopBanner />
      <Header />
      <ScrollReveal delay={100}>
        <div className="w-full">
          <HeroSlider />
        </div>
      </ScrollReveal>

      <div className="w-full max-w-7xl mx-auto flex flex-col mt-4">
        {/* Mobile Quick Category Row */}
        <CategoriesRow />

        {/* Section Heading for Categories */}
        <ScrollReveal>
          <div className="text-center mt-12 lg:mt-16 mb-8 px-4">
            <h2 className="text-[32px] lg:text-[42px] font-serif text-[#5F1517] mb-6">Curated Classics</h2>
          </div>
        </ScrollReveal>

        {/* Dynamic Category Grid */}
        <ScrollReveal delay={100}>
          <CategoryGrid />
        </ScrollReveal>

        {/* Promotional Banner */}
        <ScrollReveal delay={150}>
          <PromoBanner />
        </ScrollReveal>

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
