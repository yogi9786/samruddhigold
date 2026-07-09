import React from 'react';
import ScrollReveal from './ScrollReveal';

import polkiSet from '../assets/gen/polki_set_1782213407545.png';
import meenakariSet from '../assets/gen/meenakari_set_1782213433201.png';
import receptionBride from '../assets/gen/reception_bride_1782213788636.png';
import signatureBridal from '../assets/gen/signature_bridal_set.png';
import signatureNecklace from '../assets/gen/signature_gold_necklace.png';

const WHATSAPP = "919035085397";

// Hero + 4 cards — structured 3-column layout
const hero = {
  title: "Royal Bridal Choker Set",
  badge: "Exclusive",
  badgeColor: "#5F1517",
  image: signatureBridal,
  wa: "Royal Bridal Choker Set",
};

const cards = [
  { title: "Temple Gold Necklace",      badge: "Bestseller",  badgeColor: "#D4AF37", image: signatureNecklace, wa: "Temple Gold Necklace" },
  { title: "Heritage Polki Collection", badge: "New Arrival", badgeColor: "#5F1517", image: polkiSet,          wa: "Heritage Polki Collection" },
  { title: "Meenakari Kundan Set",      badge: "Limited",     badgeColor: "#801416", image: meenakariSet,      wa: "Meenakari Kundan Set" },
  { title: "Bridal Reception Look",     badge: "Trending",    badgeColor: "#D4AF37", image: receptionBride,    wa: "Bridal Reception Look" },
];

const SignatureJewellery: React.FC = () => {
  return (
    <section className="w-full bg-[#0D0704] py-14 md:py-20 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="block w-10 md:w-16 h-[1px] bg-[#D4AF37]/50" />
              <span className="font-sans text-[10px] text-[#D4AF37] tracking-[4px] uppercase font-semibold">
                Masterpieces
              </span>
              <span className="block w-10 md:w-16 h-[1px] bg-[#D4AF37]/50" />
            </div>
            <h2 className="font-serif text-[32px] md:text-[48px] lg:text-[54px] text-white leading-[1.1] tracking-tight mb-4">
              Signature <span className="italic text-[#D4AF37]">Jewellery</span>
            </h2>
            <p className="font-sans text-[13px] md:text-[15px] text-white/50 max-w-xl mx-auto leading-relaxed font-light">
              Curated masterpieces, hand-crafted to reflect the timeless heritage of royal Indian craftsmanship.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Structured Grid: [Hero | 2×2 grid] ── */}
        {/* Mobile: stacked. Desktop: hero left (col-span-1 tall) + 2×2 grid right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">

          {/* ── HERO (left, reel size 9:16) ── */}
          <ScrollReveal delay={50} className="lg:col-span-1 lg:row-span-2 flex justify-center">
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20am%20interested%20in%20the%20${encodeURIComponent(hero.wa)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex rounded-2xl overflow-hidden no-underline w-full max-w-sm lg:max-w-none aspect-[9/16]"
            >
              <img
                src={hero.image}
                alt={hero.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0704]/95 via-[#0D0704]/25 to-transparent" />

              {/* Badge */}
              <span
                className="absolute top-4 left-4 text-white text-[10px] font-bold uppercase tracking-[2px] px-3 py-1.5 rounded-full"
                style={{ background: hero.badgeColor }}
              >
                {hero.badge}
              </span>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                <h3 className="font-serif text-white text-[22px] md:text-[28px] leading-tight mb-4">
                  {hero.title}
                </h3>
                <div className="inline-flex items-center gap-2 border border-[#D4AF37]/60 text-[#D4AF37] text-[10px] md:text-[11px] tracking-[2px] uppercase font-semibold px-4 py-2 group-hover:bg-[#D4AF37] group-hover:text-[#0D0704] transition-all duration-300">
                  <span>Enquire Now</span>
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </ScrollReveal>

          {/* ── RIGHT: 2×2 card grid (1:1 images, smaller) ── */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 lg:gap-6 place-content-center">
            {cards.map((card, i) => (
              <ScrollReveal key={card.title} delay={(i + 1) * 70} className="flex justify-center">
                <a
                  href={`https://wa.me/${WHATSAPP}?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20am%20interested%20in%20the%20${encodeURIComponent(card.wa)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex rounded-xl overflow-hidden no-underline w-full aspect-square max-w-[300px]"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0704]/90 via-[#0D0704]/10 to-transparent" />

                  {/* Badge */}
                  <span
                    className="absolute top-3 right-3 text-white text-[9px] font-bold uppercase tracking-[1.5px] px-2.5 py-1 rounded-full"
                    style={{ background: card.badgeColor }}
                  >
                    {card.badge}
                  </span>

                  {/* Title only — no "Tap to enquire" text */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h3 className="font-serif text-white text-[13px] md:text-[16px] leading-snug group-hover:text-[#D4AF37] transition-colors duration-300">
                      {card.title}
                    </h3>
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>

        </div>

        {/* Bottom CTA */}
        <ScrollReveal delay={200}>
          <div className="flex justify-center mt-10 md:mt-14">
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20would%20like%20to%20explore%20your%20Signature%20Jewellery%20collection.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#D4AF37] text-[#0D0704] font-sans font-bold text-[11px] md:text-[12px] tracking-[2.5px] uppercase px-10 py-3.5 no-underline hover:bg-[#c9a32e] transition-all duration-300"
            >
              View All Signature Pieces
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default SignatureJewellery;
