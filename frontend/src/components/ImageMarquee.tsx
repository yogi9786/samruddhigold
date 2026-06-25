import React from 'react';

const ImageMarquee: React.FC = () => {
  const images = [
    { src: '/images/gallery/gold_earrings_model.png', alt: 'Gold Earrings Model' },
    { src: '/images/gallery/gold_bracelet_hand.png', alt: 'Gold Bracelet' },
    { src: '/images/gallery/chunky_gold_chain.png', alt: 'Chunky Gold Chain' },
    { src: '/images/gallery/gold_rings_coral.png', alt: 'Gold Rings on Coral' },
    { src: '/images/gallery/gold_bracelets_dark.png', alt: 'Stacked Gold Bracelets' },
  ];

  // Duplicate the array to create a seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <div className="w-full bg-[#f8f5f0] py-16 overflow-hidden flex flex-col">
      <div className="text-center mb-10 px-4">
        <h2 className="text-[32px] lg:text-[42px] font-serif text-[#5F1517] mb-4">
          Explore the Collection
        </h2>
        <p className="text-gray-600 font-sans max-w-2xl mx-auto text-sm lg:text-base">
          Discover our exclusive range of meticulously crafted jewelry pieces. From elegant rings to statement necklaces, find the perfect piece that resonates with your unique style.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 animate-marquee whitespace-nowrap w-[max-content]">
          {duplicatedImages.map((img, idx) => (
            <li key={idx} className="relative overflow-hidden rounded-xl shadow-lg flex-shrink-0 w-[280px] h-[350px] sm:w-[320px] sm:h-[400px]">
              <img
                src={img.src}
                alt={img.alt}
                className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ImageMarquee;
