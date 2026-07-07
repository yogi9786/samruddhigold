import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Where are your branches located?",
    answer: "We are proud to serve you from multiple locations! Our branches are located in Yelahanka, Kolar, and Udupi. Visit your nearest Siri Samruddhi Gold Palace store to experience our exquisite collections in person."
  },
  {
    question: "What types of jewelry collections do you offer?",
    answer: "At Siri Samruddhi Gold Palace, we have all types of collections to suit every occasion. Our range includes antique jewelry, temple jewelry, exclusive bridal sets, everyday wear, and contemporary designs in gold, diamonds, and precious gemstones."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Currently, we offer shipping within India. For international inquiries, please contact our customer support team."
  },
  {
    question: "What is your return/exchange policy?",
    answer: "We offer a 14-day exchange policy for all our jewelry. Items must be returned in their original condition with all tags and certificates intact."
  },
  {
    question: "Can I customize a piece of jewelry?",
    answer: "Absolutely! Our expert artisans can help you design and craft a bespoke piece. Book an appointment or visit our store to discuss your ideas."
  },
  {
    question: "Do you offer jewelry repair services?",
    answer: "Yes, we provide professional jewelry repair, polishing, and resizing services at all our store locations."
  },
  {
    question: "How can I verify the purity of the gold?",
    answer: "All our gold jewelry is 100% BIS Hallmarked, ensuring the highest standards of purity and authenticity. You can check the hallmark symbol on each piece."
  },
  {
    question: "Do you have a gold exchange or upgrade policy?",
    answer: "Yes, we offer competitive exchange rates for your old gold jewelry when you upgrade to new pieces from our collection. Please visit our store for a valuation."
  },
  {
    question: "Is it safe to buy jewelry online from your store?",
    answer: "Absolutely. Our website uses secure payment gateways, and all our shipments are fully insured until they safely reach your doorstep."
  },
  {
    question: "How do I track my online order?",
    answer: "Once your order is dispatched, you will receive a tracking link via email and SMS to monitor its delivery status in real-time."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif text-[#5F1517] mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600">Find answers to common questions about our products and services.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border border-[#E5D3B3] rounded-lg overflow-hidden bg-[#FAF6F0] transition-all duration-300"
          >
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none cursor-pointer hover:bg-[#F5EAD5] transition-colors"
              onClick={() => toggleFAQ(index)}
            >
              <span className="font-medium text-[#5F1517] pr-4">{faq.question}</span>
              <div className="flex-shrink-0">
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#5F1517]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#5F1517]" />
                )}
              </div>
            </button>
            
            <div 
              className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? "max-h-48 py-4 border-t border-[#E5D3B3]/50" : "max-h-0"
              }`}
            >
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
