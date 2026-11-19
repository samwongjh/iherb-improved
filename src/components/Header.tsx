import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  ChevronDown,
  X,
  Globe,
  Check,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Product, SubCategory } from '../types/catalog';
import { SEARCH_SUGGESTIONS } from '../data/collagenProducts';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSubCategory: (cat: SubCategory) => void;
  onSelectProduct: (product: Product) => void;
  allProducts: Product[];
  cartCount: number;
  cartSubtotalSgd: number;
  savedCount: number;
  savedOnlyActive: boolean;
  onToggleSavedOnly: () => void;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  signedInUser: string | null;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSelectSubCategory,
  onSelectProduct,
  allProducts,
  cartCount,
  cartSubtotalSgd,
  savedCount,
  savedOnlyActive,
  onToggleSavedOnly,
  onOpenCart,
  onOpenAccount,
  signedInUser,
  onResetAll,
}) => {
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);
  const [searchFocused, setSearchFocused] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [activeDeptMenu, setActiveDeptMenu] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [copiedCode, setCopiedCode] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(inputValue);
    setSearchFocused(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('SGWELL20').catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const matchingSuggestions = SEARCH_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(inputValue.trim().toLowerCase())
  ).slice(0, 5);

  const previewProducts = allProducts
    .filter((p) => {
      const q = inputValue.trim().toLowerCase();
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.source.toLowerCase().includes(q)
      );
    })
    .slice(0, 4);

  const departments: { label: string; subCategory?: SubCategory; items: { name: string; cat: SubCategory }[] }[] = [
    {
      label: 'Supplements',
      items: [
        { name: 'All Collagen Supplements', cat: 'all' },
        { name: 'Collagen Peptides Powder', cat: 'peptides' },
        { name: 'Marine Fish Collagen', cat: 'marine' },
        { name: 'Tablets & Capsules', cat: 'tablets-capsules' },
      ],
    },
    {
      label: 'Sports',
      items: [
        { name: 'Keto & Athletic Peptides', cat: 'peptides' },
        { name: 'Joint & Recovery Support', cat: 'tablets-capsules' },
      ],
    },
    {
      label: 'Bath & Beauty',
      items: [
        { name: 'Skin, Hair & Nails', cat: 'beauty-skin' },
        { name: 'Liquid & Beauty Gummies', cat: 'liquid-gummies' },
      ],
    },
    {
      label: 'Brands',
      items: [
        { name: 'California Gold Nutrition', cat: 'all' },
        { name: 'Vital Proteins', cat: 'all' },
        { name: 'Sports Research', cat: 'all' },
        { name: 'NeoCell', cat: 'all' },
      ],
    },
    {
      label: 'Best Sellers',
      subCategory: 'all',
      items: [],
    },
    {
      label: 'Specials',
      subCategory: 'all',
      items: [],
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E4E7E9]">
      {/* Slim Singapore Shipping & Promo Strip */}
      {!promoDismissed && (
        <div className="bg-[#2D5900] text-white text-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 truncate">
              <span className="font-medium whitespace-nowrap">
                Free shipping to Singapore on orders over SG$30.00
              </span>
              <span className="hidden md:inline text-white/50" aria-hidden="true">
                |
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="hidden sm:inline-flex items-center gap-1.5 text-white/95 hover:text-white underline-offset-2 hover:underline whitespace-nowrap cursor-pointer"
                title="Click to copy promo code"
              >
                <Tag className="w-3.5 h-3.5 text-[#C3E88D]" />
                <span>
                  20% off SG$60+ with code <strong className="font-bold">SGWELL20</strong>
                </span>
                {copiedCode && (
                  <span className="inline-flex items-center gap-0.5 text-[#C3E88D] font-semibold">
                    <Check className="w-3 h-3" /> Copied
                  </span>
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPromoDismissed(true)}
              aria-label="Dismiss promotional banner"
              className="p-1 text-white/80 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header Row */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 lg:gap-7">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={onResetAll}
          className="flex items-center gap-1.5 shrink-0 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#458500] rounded"
          aria-label="iHerb Singapore Home"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-md bg-[#458500] text-white group-hover:bg-[#366a00] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 4C12.2 4 8.2 7.4 7.3 12.2c-1.5-.9-3.3-1.2-5.1-.7 1.3 3.7 4.7 6.3 8.8 6.5 4.8.2 9-3.4 9.5-8.2.3-2.5-.5-4.7-3-5.8zM11 16.5c-2.2-.1-4.1-1.3-5.1-3.1 1.6-.1 3.1.5 4.1 1.7.3.4.7.9 1 1.4z" />
            </svg>
          </span>
          <span className="font-display text-2xl font-extrabold tracking-tight text-[#458500] whitespace-nowrap">
            iHerb
          </span>
        </button>

        {/* Global Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-2xl">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setInputValue(e.target.value);
                onSearchChange(e.target.value);
              }}
              placeholder="Search all of iHerb Singapore..."
              aria-label="Search products"
              className="w-full h-10 pl-4 pr-20 text-sm bg-[#F5F6F7] border border-[#D4D8DC] rounded-md text-[#1A1D1E] placeholder-[#6B7276] focus:bg-white focus:border-[#458500] focus:outline-none focus:ring-2 focus:ring-[#458500]/20 transition-all"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue('');
                  onSearchChange('');
                }}
                aria-label="Clear search"
                className="absolute right-11 p-1.5 text-[#6B7276] hover:text-[#1A1D1E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-1 top-1 bottom-1 w-9 flex items-center justify-center bg-[#458500] hover:bg-[#366a00] text-white rounded transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Predictive Search Dropdown */}
          {searchFocused && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#DDE1E4] rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#ECEFF1]">
                <div className="md:col-span-5 p-3">
                  <p className="text-[11px] font-semibold text-[#5A6266] px-2 pb-2">
                    Popular Collagen Searches
                  </p>
                  <ul className="space-y-0.5">
                    {(matchingSuggestions.length > 0
                      ? matchingSuggestions
                      : SEARCH_SUGGESTIONS.slice(0, 5)
                    ).map((suggestion) => (
                      <li key={suggestion}>
                        <button
                          type="button"
                          onClick={() => {
                            setInputValue(suggestion);
                            onSearchChange(suggestion);
                            setSearchFocused(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-2 py-2 text-left text-sm text-[#1A1D1E] hover:bg-[#F2F7EC] hover:text-[#366a00] rounded transition-colors cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5 text-[#8A9296] shrink-0" />
                          <span className="truncate">{suggestion}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-7 p-3 bg-[#FAFBFC]">
                  <p className="text-[11px] font-semibold text-[#5A6266] px-2 pb-2">
                    Top Matching Products
                  </p>
                  <div className="space-y-1.5">
                    {previewProducts.map((product) => {
                      const defaultVar =
                        product.variants.find((v) => v.id === product.defaultVariantId) ||
                        product.variants[0];
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            onSelectProduct(product);
                            setSearchFocused(false);
                          }}
                          className="w-full flex items-center gap-3 p-1.5 rounded hover:bg-white border border-transparent hover:border-[#E4E7E9] text-left transition-colors cursor-pointer"
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.shortTitle}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-contain rounded bg-white border border-[#ECEFF1] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#1A1D1E] truncate">
                              {product.brand}
                            </p>
                            <p className="text-xs text-[#5A6266] truncate">{product.shortTitle}</p>
                          </div>
                          <span className="text-xs font-bold text-[#1A1D1E] tabular-nums shrink-0">
                            SG${defaultVar.priceSgd.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Utility & Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto">
          {/* Singapore Region / Currency Selector */}
          <div ref={regionRef} className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setRegionOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 h-10 text-xs font-medium text-[#1A1D1E] hover:bg-[#F5F6F7] rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Globe className="w-4 h-4 text-[#458500]" />
              <span>SG · {selectedLang} · SGD</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5A6266]" />
            </button>
            {regionOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[#DDE1E4] rounded-lg shadow-lg p-3.5 z-50">
                <p className="text-xs font-bold text-[#1A1D1E] mb-2">Shipping & Currency</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#ECEFF1]">
                    <span className="text-[#5A6266]">Destination</span>
                    <span className="font-semibold text-[#1A1D1E]">Singapore</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#ECEFF1]">
                    <span className="text-[#5A6266]">Currency</span>
                    <span className="font-semibold text-[#1A1D1E]">SGD (SG$)</span>
                  </div>
                  <div className="pt-1">
                    <span className="block text-[#5A6266] mb-1.5">Language</span>
                    <div className="grid grid-cols-3 gap-1">
                      {['EN', 'ZH', 'MS'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            setSelectedLang(lang);
                            setRegionOpen(false);
                          }}
                          className={`py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                            selectedLang === lang
                              ? 'bg-[#458500] text-white'
                              : 'bg-[#F5F6F7] text-[#1A1D1E] hover:bg-[#E4E7E9]'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sign In / Account */}
          <button
            type="button"
            onClick={onOpenAccount}
            className="flex items-center gap-2 px-2.5 h-10 text-xs sm:text-sm font-medium text-[#1A1D1E] hover:bg-[#F5F6F7] rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            <User className="w-5 h-5 text-[#3A4044]" />
            <span className="hidden sm:inline">
              {signedInUser ? signedInUser.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Saved List Filter Toggle */}
          <button
            type="button"
            onClick={onToggleSavedOnly}
            aria-pressed={savedOnlyActive}
            title="Filter saved items"
            className={`relative flex items-center gap-1.5 px-2.5 h-10 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              savedOnlyActive
                ? 'bg-[#F2F7EC] text-[#366a00] border border-[#458500]/40'
                : 'text-[#1A1D1E] hover:bg-[#F5F6F7]'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${savedOnlyActive || savedCount > 0 ? 'text-[#C93B2B] fill-[#C93B2B]/15' : 'text-[#3A4044]'}`}
            />
            <span className="hidden md:inline">Saved</span>
            {savedCount > 0 && (
              <span className="text-xs font-bold tabular-nums text-[#5A6266]">({savedCount})</span>
            )}
          </button>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3 h-10 bg-[#F5F6F7] hover:bg-[#E8ECEE] border border-[#DDE1E4] rounded-md transition-colors whitespace-nowrap cursor-pointer"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-[#1A1D1E]" />
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#458500] text-white text-[11px] font-bold tabular-nums">
                {cartCount}
              </span>
            </div>
            <span className="hidden sm:inline text-xs font-bold text-[#1A1D1E] tabular-nums pl-1">
              SG${cartSubtotalSgd.toFixed(2)}
            </span>
          </button>
        </div>
      </div>

      {/* Category Navigation Sub-Bar */}
      <nav className="border-t border-[#ECEFF1] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between h-10 text-[13px]">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {departments.map((dept) => (
              <div
                key={dept.label}
                className="relative shrink-0"
                onMouseEnter={() => dept.items.length > 0 && setActiveDeptMenu(dept.label)}
                onMouseLeave={() => setActiveDeptMenu(null)}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (dept.subCategory) {
                      onSelectSubCategory(dept.subCategory);
                    } else if (dept.items[0]) {
                      onSelectSubCategory(dept.items[0].cat);
                    }
                    setActiveDeptMenu(null);
                  }}
                  className={`flex items-center gap-1 py-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    dept.label === 'Specials'
                      ? 'text-[#C93B2B] hover:text-[#a82d1f]'
                      : 'text-[#2C3135] hover:text-[#458500]'
                  }`}
                >
                  {dept.label === 'Best Sellers' && (
                    <Sparkles className="w-3.5 h-3.5 text-[#E58900]" />
                  )}
                  <span>{dept.label}</span>
                  {dept.items.length > 0 && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                </button>

                {activeDeptMenu === dept.label && dept.items.length > 0 && (
                  <div className="absolute left-0 top-full w-56 bg-white border border-[#DDE1E4] rounded-b-lg shadow-lg py-1.5 z-50">
                    {dept.items.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          onSelectSubCategory(item.cat);
                          setActiveDeptMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-[#1A1D1E] hover:bg-[#F2F7EC] hover:text-[#366a00] transition-colors cursor-pointer"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-[#5A6266] shrink-0">
            <span>Authentic Wellness Direct from iHerb</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[#458500]">SG$30 Free Shipping</span>
          </div>
        </div>
      </nav>
    </header>
  );
};
