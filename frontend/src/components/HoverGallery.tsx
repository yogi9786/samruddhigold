const galleryItems = [
  {
    id: 1,
    title: 'THE MANGO MALA',
    imgSrc: '/images/gallery/south_indian_mango_mala.png',
    baseClasses: 'rotate-[-8deg] -translate-y-4 md:rotate-[-12deg] md:-translate-y-8 z-10',
    tag: ''
  },
  {
    id: 2,
    title: 'THE KUNDAN VANKI',
    imgSrc: '/images/gallery/south_indian_kundan_vanki.png',
    baseClasses: 'rotate-[-4deg] -translate-y-2 md:rotate-[-6deg] md:-translate-y-4 z-20',
    tag: ''
  },
  {
    id: 3,
    title: 'ANTIQUE LAKSHMI HAAR',
    imgSrc: '/images/gallery/south_indian_lakshmi_haar.png',
    baseClasses: 'rotate-0 z-30 scale-110 shadow-2xl',
    tag: 'Necklaces'
  },
  {
    id: 4,
    title: 'THE TRADITIONAL JHUMKA',
    imgSrc: '/images/gallery/traditional_jhumka.png',
    baseClasses: 'rotate-[4deg] -translate-y-2 md:rotate-[6deg] md:-translate-y-4 z-20',
    tag: ''
  },
  {
    id: 5,
    title: 'THE TEMPLE BANGLE',
    imgSrc: '/images/gallery/indian_gold_bangle.png',
    baseClasses: 'rotate-[8deg] -translate-y-4 md:rotate-[12deg] md:-translate-y-8 z-10',
    tag: ''
  }
];

const HoverGallery = () => {
  return (
    <section className="hidden md:flex flex-col items-center justify-center w-full bg-[#110A08] py-12 md:py-16 px-4 overflow-hidden perspective-1000">
      
      {/* Header */}
      <div className="text-center mb-16 relative z-40">
        <p className="text-[#D4AF37] text-[12px] font-bold tracking-[0.4em] uppercase mb-4 drop-shadow-sm">
          Timeless Elegance
        </p>
        <h2 className="text-[42px] md:text-[56px] font-serif font-bold text-[#FFF7F2] leading-tight drop-shadow-md">
          Bridal Collection 2026
        </h2>
      </div>

      {/* 3D Gallery Container */}
      <div className="relative flex justify-center items-center gap-2 lg:gap-4 max-w-[1400px] mx-auto h-[500px]">
        {galleryItems.map((item, index) => {
          // Creating the 3D perspective effect based on position
          let transformPerspective = '';
          if (index === 0) transformPerspective = 'perspective(1000px) rotateY(30deg) rotateZ(-4deg)';
          if (index === 1) transformPerspective = 'perspective(1000px) rotateY(15deg) rotateZ(-2deg)';
          if (index === 2) transformPerspective = 'perspective(1000px) rotateY(0deg) scale(1.1)';
          if (index === 3) transformPerspective = 'perspective(1000px) rotateY(-15deg) rotateZ(2deg)';
          if (index === 4) transformPerspective = 'perspective(1000px) rotateY(-30deg) rotateZ(4deg)';

          return (
            <div
              key={item.id}
              className={`group relative w-[180px] lg:w-[220px] h-[350px] lg:h-[420px] rounded-[24px] overflow-hidden cursor-pointer transition-all duration-500 ease-out z-[${30 - Math.abs(index - 2) * 10}]`}
              style={{
                transform: transformPerspective,
                transformOrigin: 'center center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateZ(0deg) scale(1.15)';
                e.currentTarget.style.zIndex = '50';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = transformPerspective;
                e.currentTarget.style.zIndex = `${30 - Math.abs(index - 2) * 10}`;
              }}
            >
              {/* Image */}
              <img
                src={item.imgSrc}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Tag (if exists) */}
              {item.tag && (
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full">
                  <span className="text-white text-[12px] font-medium tracking-wide">{item.tag}</span>
                </div>
              )}

              {/* Title */}
              <div className="absolute bottom-6 left-0 w-full px-4 text-center">
                <p className="text-white font-sans text-[12px] lg:text-[14px] uppercase tracking-[0.15em] font-medium opacity-90">
                  {item.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};

export default HoverGallery;
