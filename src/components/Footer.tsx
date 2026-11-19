import React from 'react';
import { ShieldCheck, ThermometerSnowflake, RotateCcw } from 'lucide-react';
import { SubCategory } from '../types/catalog';

interface FooterProps {
  onSelectSubCategory: (cat: SubCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectSubCategory }) => {
  return (
    <footer className="mt-14 border-t border-[#E4E7E9] bg-[#F8F9FA]">
      {/* Trust Commitment Strip */}
      <div className="border-b border-[#E4E7E9] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#458500] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-sm font-bold text-[#1A1D1E]">
                100% Authentic Products
              </h3>
              <p className="text-xs text-[#5A6266] mt-0.5 leading-relaxed">
                Sourced directly from authorized brands and never sold via third-party resellers.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ThermometerSnowflake className="w-6 h-6 text-[#458500] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-sm font-bold text-[#1A1D1E]">
                Climate-Controlled Warehouses
              </h3>
              <p className="text-xs text-[#5A6266] mt-0.5 leading-relaxed">
                GMP-certified fulfillment centers keep collagen peptides and vitamins fresh before
                arriving in Singapore.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw className="w-6 h-6 text-[#458500] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-sm font-bold text-[#1A1D1E]">
                Free Singapore Shipping Over SG$30
              </h3>
              <p className="text-xs text-[#5A6266] mt-0.5 leading-relaxed">
                Fast tracked air delivery across Singapore with transparent SGD pricing and 9% GST
                clarity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        <div className="space-y-2.5">
          <h4 className="font-display text-sm font-bold text-[#1A1D1E]">Collagen Categories</h4>
          <ul className="space-y-2 text-[#5A6266]">
            <li>
              <button
                type="button"
                onClick={() => onSelectSubCategory('peptides')}
                className="hover:text-[#458500] hover:underline cursor-pointer"
              >
                Hydrolyzed Collagen Peptides
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectSubCategory('marine')}
                className="hover:text-[#458500] hover:underline cursor-pointer"
              >
                Wild-Caught Marine Collagen
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectSubCategory('tablets-capsules')}
                className="hover:text-[#458500] hover:underline cursor-pointer"
              >
                Collagen Tablets &amp; Capsules
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectSubCategory('liquid-gummies')}
                className="hover:text-[#458500] hover:underline cursor-pointer"
              >
                Liquid &amp; Beauty Gummies
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="font-display text-sm font-bold text-[#1A1D1E]">Singapore Delivery</h4>
          <ul className="space-y-2 text-[#5A6266]">
            <li>Free Shipping over SG$30.00</li>
            <li>Tracked Express Air (3–5 Days)</li>
            <li>Auto-Ship &amp; Save 10%</li>
            <li>90-Day Return Guarantee</li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="font-display text-sm font-bold text-[#1A1D1E]">Quality &amp; Testing</h4>
          <ul className="space-y-2 text-[#5A6266]">
            <li>iTested Independent Lab Verification</li>
            <li>Verified Customer Reviews</li>
            <li>cGMP Facility Standards</li>
            <li>Expiration Dates Listed on Every Item</li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="font-display text-sm font-bold text-[#1A1D1E]">About iHerb SG</h4>
          <p className="text-[#5A6266] leading-relaxed">
            Serving wellness shoppers in Singapore with curated nutritional supplements, beauty
            formulas, and natural groceries in Singapore Dollars (SGD).
          </p>
        </div>
      </div>

      <div className="border-t border-[#E4E7E9] py-4 px-4 sm:px-6 text-center text-xs text-[#6B7276]">
        © 2026 iHerb Singapore Catalog Experience · Prices displayed in SGD (SG$)
      </div>
    </footer>
  );
};
