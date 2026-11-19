import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, X, SlidersHorizontal } from 'lucide-react';
import { CollagenSource, FilterState, Product, SupplementForm } from '../types/catalog';
import { ALL_BRANDS, ALL_CERTIFICATIONS } from '../data/collagenProducts';
import { StarRating } from './StarRating';

interface FilterSidebarProps {
  filters: FilterState;
  onUpdateFilters: (next: Partial<FilterState>) => void;
  onClearAll: () => void;
  allProducts: Product[];
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeFilterCount: number;
}

const SOURCES: CollagenSource[] = [
  'Marine (Fish)',
  'Grass-Fed Bovine',
  'Multi-Collagen (I, II, III, V, X)',
  'Vegan Collagen Builder',
];

const FORMS: SupplementForm[] = ['Powder', 'Tablets', 'Capsules', 'Liquid', 'Gummies'];

const PRICE_BUCKETS = [
  { label: 'Under SG$25', min: '', max: '25' },
  { label: 'SG$25 to SG$50', min: '25', max: '50' },
  { label: 'SG$50 to SG$80', min: '50', max: '80' },
  { label: 'Over SG$80', min: '80', max: '' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onUpdateFilters,
  onClearAll,
  allProducts,
  mobileOpen,
  onCloseMobile,
  activeFilterCount,
}) => {
  const [brandSearch, setBrandSearch] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    brands: true,
    source: true,
    form: true,
    rating: true,
    price: true,
    certs: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleArrayItem = <T extends string>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const brandCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const filteredBrands = ALL_BRANDS.filter((b) =>
    b.toLowerCase().includes(brandSearch.trim().toLowerCase())
  );
  const displayedBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 6);

  const sidebarContent = (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E9]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#458500]" />
          <h2 className="font-display text-sm font-bold text-[#1A1D1E]">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="text-xs font-semibold text-[#458500] tabular-nums">
              ({activeFilterCount})
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-[#458500] hover:text-[#366a00] hover:underline cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Availability */}
      <div className="pb-4 border-b border-[#ECEFF1]">
        <label className="flex items-center justify-between gap-3 cursor-pointer select-none py-1">
          <span className="text-[13px] font-semibold text-[#1A1D1E]">In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onUpdateFilters({ inStockOnly: e.target.checked })}
            className="w-4 h-4 accent-[#458500] rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Brands */}
      <div className="pb-4 border-b border-[#ECEFF1]">
        <button
          type="button"
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[13px] font-bold text-[#1A1D1E]">Brands</span>
          {openSections.brands ? (
            <ChevronUp className="w-4 h-4 text-[#5A6266]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#5A6266]" />
          )}
        </button>

        {openSections.brands && (
          <div className="mt-2.5 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8A9296] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full h-8 pl-8 pr-2.5 text-xs bg-[#F5F6F7] border border-[#DDE1E4] rounded focus:bg-white focus:border-[#458500] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto filter-scroll pr-1">
              {displayedBrands.map((brand) => {
                const checked = filters.brands.includes(brand);
                return (
                  <label
                    key={brand}
                    className="flex items-center justify-between gap-2 py-1 text-[13px] text-[#2C3135] hover:text-[#1A1D1E] cursor-pointer"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          onUpdateFilters({ brands: toggleArrayItem(filters.brands, brand) })
                        }
                        className="w-4 h-4 accent-[#458500] rounded shrink-0 cursor-pointer"
                      />
                      <span className="truncate">{brand}</span>
                    </span>
                    <span className="text-xs text-[#6B7276] tabular-nums shrink-0">
                      {brandCounts[brand] || 0}
                    </span>
                  </label>
                );
              })}
              {filteredBrands.length === 0 && (
                <p className="text-xs text-[#6B7276] py-1">No matching brands</p>
              )}
            </div>

            {filteredBrands.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllBrands((prev) => !prev)}
                className="text-xs font-semibold text-[#458500] hover:underline cursor-pointer"
              >
                {showAllBrands ? 'Show fewer brands' : `Show all ${filteredBrands.length} brands`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Collagen Source */}
      <div className="pb-4 border-b border-[#ECEFF1]">
        <button
          type="button"
          onClick={() => toggleSection('source')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[13px] font-bold text-[#1A1D1E]">Collagen Source</span>
          {openSections.source ? (
            <ChevronUp className="w-4 h-4 text-[#5A6266]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#5A6266]" />
          )}
        </button>
        {openSections.source && (
          <div className="mt-2 space-y-1.5">
            {SOURCES.map((src) => {
              const checked = filters.sources.includes(src);
              return (
                <label
                  key={src}
                  className="flex items-center gap-2 py-1 text-[13px] text-[#2C3135] hover:text-[#1A1D1E] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onUpdateFilters({ sources: toggleArrayItem(filters.sources, src) })
                    }
                    className="w-4 h-4 accent-[#458500] rounded shrink-0 cursor-pointer"
                  />
                  <span>{src}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Supplement Form */}
      <div className="pb-4 border-b border-[#ECEFF1]">
        <button
          type="button"
          onClick={() => toggleSection('form')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[13px] font-bold text-[#1A1D1E]">Product Form</span>
          {openSections.form ? (
            <ChevronUp className="w-4 h-4 text-[#5A6266]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#5A6266]" />
          )}
        </button>
        {openSections.form && (
          <div className="mt-2 space-y-1.5">
            {FORMS.map((form) => {
              const checked = filters.forms.includes(form);
              return (
                <label
                  key={form}
                  className="flex items-center gap-2 py-1 text-[13px] text-[#2C3135] hover:text-[#1A1D1E] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onUpdateFilters({ forms: toggleArrayItem(filters.forms, form) })
                    }
                    className="w-4 h-4 accent-[#458500] rounded shrink-0 cursor-pointer"
                  />
                  <span>{form}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer Ratings */}
      <div className="pb-4 border-b border-[#ECEFF1]">
        <button
          type="button"
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[13px] font-bold text-[#1A1D1E]">Ratings</span>
          {openSections.rating ? (
            <ChevronUp className="w-4 h-4 text-[#5A6266]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#5A6266]" />
          )}
        </button>
        {openSections.rating && (
          <div className="mt-2 space-y-1.5">
            {[4.7, 4.0].map((threshold) => {
              const active = filters.minRating === threshold;
              return (
                <button
                  key={threshold}
                  type="button"
                  onClick={() =>
                    onUpdateFilters({ minRating: active ? null : threshold })
                  }
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-[13px] transition-colors cursor-pointer ${
                    active ? 'bg-[#F2F7EC] text-[#2D5900] font-semibold' : 'hover:bg-[#F5F6F7]'
                  }`}
                >
                  <StarRating rating={threshold} />
                  <span>{threshold.toFixed(1)} &amp; Up</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range (SG$) */}
      <div className="pb-4 border-b border-[#ECEFF1]">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[13px] font-bold text-[#1A1D1E]">Price (SG$)</span>
          {openSections.price ? (
            <ChevronUp className="w-4 h-4 text-[#5A6266]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#5A6266]" />
          )}
        </button>
        {openSections.price && (
          <div className="mt-2 space-y-2.5">
            <div className="space-y-1">
              {PRICE_BUCKETS.map((bucket) => {
                const active =
                  filters.minPrice === bucket.min && filters.maxPrice === bucket.max;
                return (
                  <button
                    key={bucket.label}
                    type="button"
                    onClick={() =>
                      onUpdateFilters(
                        active
                          ? { minPrice: '', maxPrice: '' }
                          : { minPrice: bucket.min, maxPrice: bucket.max }
                      )
                    }
                    className={`w-full text-left px-2 py-1.5 rounded text-[13px] transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#F2F7EC] text-[#2D5900] font-semibold'
                        : 'text-[#2C3135] hover:bg-[#F5F6F7]'
                    }`}
                  >
                    {bucket.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7276]">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  value={filters.minPrice}
                  onChange={(e) => onUpdateFilters({ minPrice: e.target.value })}
                  placeholder="Min"
                  aria-label="Minimum price SGD"
                  className="w-full h-8 pl-5 pr-2 text-xs tabular-nums bg-[#F5F6F7] border border-[#DDE1E4] rounded focus:bg-white focus:border-[#458500] focus:outline-none"
                />
              </div>
              <span className="text-xs text-[#8A9296]">–</span>
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7276]">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  value={filters.maxPrice}
                  onChange={(e) => onUpdateFilters({ maxPrice: e.target.value })}
                  placeholder="Max"
                  aria-label="Maximum price SGD"
                  className="w-full h-8 pl-5 pr-2 text-xs tabular-nums bg-[#F5F6F7] border border-[#DDE1E4] rounded focus:bg-white focus:border-[#458500] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dietary & Certifications */}
      <div className="pb-2">
        <button
          type="button"
          onClick={() => toggleSection('certs')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[13px] font-bold text-[#1A1D1E]">Dietary &amp; Quality</span>
          {openSections.certs ? (
            <ChevronUp className="w-4 h-4 text-[#5A6266]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#5A6266]" />
          )}
        </button>
        {openSections.certs && (
          <div className="mt-2 space-y-1.5">
            {ALL_CERTIFICATIONS.map((cert) => {
              const checked = filters.certifications.includes(cert);
              return (
                <label
                  key={cert}
                  className="flex items-center gap-2 py-1 text-[13px] text-[#2C3135] hover:text-[#1A1D1E] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onUpdateFilters({
                        certifications: toggleArrayItem(filters.certifications, cert),
                      })
                    }
                    className="w-4 h-4 accent-[#458500] rounded shrink-0 cursor-pointer"
                  />
                  <span>{cert}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:block w-[256px] shrink-0">
        <div className="sticky top-[132px] bg-white border border-[#E4E7E9] rounded-lg p-4">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Slide-Over Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/45 transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-[320px] bg-white h-full overflow-y-auto p-5 shadow-2xl z-10 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4E7E9]">
              <span className="font-display text-base font-bold text-[#1A1D1E]">Filter Results</span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close filters"
                className="p-2 text-[#5A6266] hover:text-[#1A1D1E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">{sidebarContent}</div>
            <div className="pt-4 mt-4 border-t border-[#E4E7E9]">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-2.5 bg-[#458500] hover:bg-[#366a00] text-white text-sm font-bold rounded-md transition-colors cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
