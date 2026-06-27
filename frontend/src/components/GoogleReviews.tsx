import { Star } from 'lucide-react';

const reviews = [
  {
    name: "Priya Sharma",
    date: "2 weeks ago",
    content: "Absolutely exquisite designs and exceptional customer service. The staff was very patient and helped me find the perfect bridal set.",
    rating: 5
  },
  {
    name: "Rahul Verma",
    date: "1 month ago",
    content: "Trustworthy and authentic. We have been buying our family jewelry from Siri Samruddhi for years. Highly recommended!",
    rating: 5
  },
  {
    name: "Anjali Gupta",
    date: "3 months ago",
    content: "Beautiful collection of antique jewelry. The craftsmanship is top-notch and the pricing is very transparent.",
    rating: 5
  }
];

export default function GoogleReviews() {
  const googleReviewsUrl = "https://www.google.com/search?sca_esv=ddca233e0edd621a&sxsrf=APpeQnu3Zrl70RvGIAGkFNWbIP162QUNZw:1782452319400&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_18lkGaqKeqi1ZLEm5cJagsC6IV3Sm_A5lR_BGnAZs-iFuM65IIdgYpMfk3gi7MCaRkaBZE6nb1puVsOFakN-LTMP5gYRckVdFVSNWtpiPD2shJqMTlD05vGqULuKXwVlRVxJNk%3D&q=Siri+Samruddhi+Gold+Palace+Pvt+Ltd+Reviews&sa=X&ved=2ahUKEwiHgs6qmKSVAxVhcGwGHVZkDKcQ0bkNegQIRhAH&biw=1920&bih=945&dpr=1";

  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-12 mb-8">
      <div className="bg-[#FFF7F2] rounded-[2rem] p-8 md:p-12 shadow-sm border border-[#801416]/5 relative overflow-hidden">
        {/* Decorative background elements for unique design */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#5F1517]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#5F1517]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-[#5F1517] mb-3 font-bold">What Our Customers Say</h2>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xl font-bold text-gray-800">4.9</span>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600 ml-1">Google Reviews</span>
              </div>
            </div>
            
            <a 
              href={googleReviewsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-white border border-[#5F1517]/20 text-[#5F1517] font-semibold rounded-full hover:bg-[#5F1517] hover:text-white hover:border-[#5F1517] transition-all duration-300 flex items-center gap-3 shadow-sm whitespace-nowrap group"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Write a Review
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white p-7 rounded-[1.5rem] shadow-sm border border-[#5F1517]/10 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5F1517] to-[#8A2427] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-tight text-lg">{review.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">{review.date}</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" className="w-6 h-6 opacity-90" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <div className="flex text-yellow-500 mb-4 gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-[#5F1517]/80 text-[15px] leading-relaxed flex-grow font-medium italic">"{review.content}"</p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <a 
              href={googleReviewsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#5F1517] font-semibold hover:text-[#801416] transition-colors group text-[15px]"
            >
              See all reviews on Google 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
