import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/samruddhi-logo.png';
import { getImageUrl } from '../api';

// ─── LOCAL FALLBACK ASSETS ──────────────────────────────────────────────────
import imgGoldBride from '../assets/gen/gold_bride_1782213365863.png';
import imgGoldSet from '../assets/gen/gold_set_1782213378462.png';
import imgSangeet from '../assets/gen/sangeet_bride_1782213396287.png';
import imgPolki from '../assets/gen/polki_set_1782213407545.png';
import imgMehendi from '../assets/gen/mehendi_bride_1782213420944.png';
import imgMeenakari from '../assets/gen/meenakari_set_1782213433201.png';
import imgHaldiBride from '../assets/gen/haldi_bride_1782213760602.png';
import imgHaldiSet from '../assets/gen/haldi_set_1782213772944.png';
import imgReceptionBride from '../assets/gen/reception_bride_1782213788636.png';
import imgReceptionSet from '../assets/gen/reception_set_1782213798792.png';
import imgCatBangles from '../assets/gen/cat_bangles_1782214893370.png';
import imgCatEarrings from '../assets/gen/cat_earrings_1782214875918.png';
import imgCatSets from '../assets/gen/cat_jewellery_sets_1782214836263.png';
import imgCatMangalsutra from '../assets/gen/cat_mangalsutra_1782214906170.png';
import imgCatPendants from '../assets/gen/cat_pendants_1782214847919.png';
import imgCatRings from '../assets/gen/cat_rings_1782214860176.png';
import imgHeroSlider from '../assets/gen/hero_slider_1_1782215599212.png';
import imgIndianModel from '../assets/gen/indian_model_ship_1783420166146.png';
import imgMangalsutraPrem from '../assets/gen/mangalsutra_premium.png';
import imgSignatureBridal from '../assets/gen/signature_bridal_set.png';
import imgSignatureNecklace from '../assets/gen/signature_gold_necklace.png';
import imgFeaturedBridal from '../assets/gen/featured_bridal_ring.png';
import imgGenRing from '../assets/gen/gen_ring_1_1784184765263.png';
import imgGenNecklace from '../assets/gen/gen_necklace_1_1784184778092.png';
import imgGenBangles from '../assets/gen/gen_bangles_1_1784184790868.png';
import imgGenEarrings from '../assets/gen/gen_earrings_1_1784184802864.png';
import imgGenModel from '../assets/gen/gen_model_1_1784184814361.png';
import imgGenChoker from '../assets/gen/gen_choker_1_1784185355465.png';
import imgGenBracelet from '../assets/gen/gen_bracelet_1_1784185369639.png';
import imgGenDiamondNecklace from '../assets/gen/gen_diamond_necklace_1_1784185671024.png';

const LOCAL_IMAGES: string[] = [
  imgGoldBride, imgGoldSet, imgSangeet, imgPolki, imgMehendi, imgMeenakari,
  imgHaldiBride, imgHaldiSet, imgReceptionBride, imgReceptionSet,
  imgCatBangles, imgCatEarrings, imgCatSets, imgCatMangalsutra,
  imgCatPendants, imgCatRings, imgHeroSlider, imgIndianModel,
  imgMangalsutraPrem, imgGenDiamondNecklace, imgSignatureBridal, imgSignatureNecklace,
  imgFeaturedBridal, imgGenRing, imgGenNecklace, imgGenBangles,
  imgGenEarrings, imgGenModel, imgGenChoker, imgGenBracelet
];

const TOTAL_CELLS = 40;

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image_url?: string;
  status?: string;
}

interface NewArrivalsHeroProps {
  products?: Product[];
}

const GridCell = ({ src, index, productId, productName }: { src: string; index: number; productId?: string; productName?: string }) => {
  // If there is absolutely no src, render empty black box
  if (!src) {
    return <div className="w-full h-full bg-black"></div>;
  }

  const content = (
    <>
      <img
        src={src}
        alt={productName || "Jewelry"}
        className="w-full h-full object-cover transition-all duration-[800ms] grayscale hover:grayscale-0 hover:scale-110"
        onError={(e) => {
          (e.target as HTMLImageElement).src = LOCAL_IMAGES[index % LOCAL_IMAGES.length];
        }}
      />
      {productId && (
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2 text-center pointer-events-none">
          <span className="text-white font-serif text-sm md:text-base tracking-wider shadow-lg border border-white/40 px-3 py-1 bg-black/30 backdrop-blur-sm rounded">
            View Product
          </span>
        </div>
      )}
    </>
  );

  const containerClass = `
    relative w-full h-full overflow-hidden 
    transition-all duration-300 ease-in-out group
    ${productId ? 'cursor-pointer hover:z-50 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]' : ''}
  `;

  if (productId) {
    return (
      <Link to={`/product/${productId}`} className={containerClass}>
        {content}
      </Link>
    );
  }

  // Render fake product without link
  return <div className={containerClass}>{content}</div>;
};

const NewArrivalsHero: React.FC<NewArrivalsHeroProps> = ({ products = [] }) => {

  // Create 40 grid cells. Use actual products first, then fill remainder with local fake images.
  const gridCells = Array.from({ length: TOTAL_CELLS }).map((_, i) => {
    if (products && i < products.length) {
      const product = products[i];
      return {
        id: i,
        src: getImageUrl(product.image_url),
        productId: product.id,
        productName: product.name
      };
    } else {
      // Fake products to fill the grid
      return {
        id: i,
        src: LOCAL_IMAGES[i % LOCAL_IMAGES.length],
        productId: undefined,
        productName: undefined
      };
    }
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">

      {/* IMAGE GRID */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-8 md:grid-cols-8 md:grid-rows-5 h-full w-full">
        {gridCells.map((cell) => (
          <GridCell
            key={cell.id}
            src={cell.src}
            index={cell.id}
            productId={cell.productId}
            productName={cell.productName}
          />
        ))}
      </div>

      {/* VIGNETTE & DARKENING LAYER (Ensures center text is legible) */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* CENTERED LOGO & HERO TEXT */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center pointer-events-none">

        {/* Logo Group */}
        <div
          className="absolute flex flex-col items-center justify-center pb-4 drop-shadow-2xl"
          style={{ transform: 'translateY(-90%)' }}
        >
          <img
            src={logo}
            alt="Samruddhi Gold Palace"
            className="drop-shadow-2xl select-none"
            style={{
              width: 'clamp(80px, 14vw, 130px)',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* MAIN TITLE */}
        <h1
          className="absolute font-serif font-bold leading-none tracking-wide text-white select-none drop-shadow-2xl"
          style={{
            fontSize: 'clamp(2.2rem, 9vw, 7rem)',
            letterSpacing: '0.07em',
            textShadow: '0 2px 30px rgba(0,0,0,0.9), 0 0 80px rgba(0,0,0,0.5)',
          }}
        >
          NEW ARRIVALS
        </h1>

      </div>

    </div>
  );
};

export default NewArrivalsHero;
