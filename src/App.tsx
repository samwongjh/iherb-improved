import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  ArrowUpDown,
  SearchX,
  CheckCircle2,
} from 'lucide-react';
import {
  COLLAGEN_PRODUCTS,
} from './data/collagenProducts';
import {
  CartItem,
  FilterState,
  OrderRecord,
  Product,
  SortOption,
  SubCategory,
  SubscriptionFrequency,
  getSubscriptionPriceSgd,
} from './types/catalog';
import { Header } from './components/Header';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { AccountModal } from './components/AccountModal';
import { Footer } from './components/Footer';

const INITIAL_FILTERS: FilterState = {
  searchQuery: 'collagen',
  subCategory: 'all',
  inStockOnly: false,
  brands: [],
  sources: [],
  forms: [],
  minRating: null,
  certifications: [],
  minPrice: '',
  maxPrice: '',
  savedOnly: false,
};

const SUB_CATEGORY_TABS: { id: SubCategory; label: string }[] = [
  { id: 'all', label: 'All Collagen' },
  { id: 'peptides', label: 'Collagen Peptides' },
  { id: 'marine', label: 'Marine Collagen' },
  { id: 'tablets-capsules', label: 'Tablets & Capsules' },
  { id: 'liquid-gummies', label: 'Liquid & Gummies' },
  { id: 'beauty-skin', label: 'Beauty & Skin' },
];

export default function App() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('best-match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(['cgn-collagenup-marine']);

  const [modalProduct, setModalProduct] = useState<{
    product: Product;
    variantId: string;
  } | null>(null);

  const [accountOpen, setAccountOpen] = useState(false);
  const [signedInUser, setSignedInUser] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const updateFilters = (next: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  const resetAllFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSortBy('best-match');
  };

  const getDefaultVariant = (product: Product) =>
    product.variants.find((v) => v.id === product.defaultVariantId) || product.variants[0];

  const filteredAndSortedProducts = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase();
    const minP = filters.minPrice !== '' ? parseFloat(filters.minPrice) : null;
    const maxP = filters.maxPrice !== '' ? parseFloat(filters.maxPrice) : null;

    const filtered = COLLAGEN_PRODUCTS.filter((product) => {
      const defVar = getDefaultVariant(product);
      const anyInStock = product.variants.some((v) => v.inStock);

      if (filters.inStockOnly && !anyInStock) return false;
      if (filters.savedOnly && !savedIds.includes(product.id)) return false;

      if (
        filters.subCategory !== 'all' &&
        !product.subCategories.includes(filters.subCategory)
      ) {
        return false;
      }

      if (query) {
        const haystack = [
          product.brand,
          product.title,
          product.source,
          product.form,
          product.description,
          ...product.certifications,
          ...product.healthTopics,
        ]
          .join(' ')
          .toLowerCase();
        const tokens = query.split(/\s+/).filter(Boolean);
        if (!tokens.every((t) => haystack.includes(t))) return false;
      }

      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }

      if (filters.sources.length > 0 && !filters.sources.includes(product.source)) {
        return false;
      }

      if (filters.forms.length > 0 && !filters.forms.includes(product.form)) {
        return false;
      }

      if (filters.minRating !== null && product.rating < filters.minRating) {
        return false;
      }

      if (
        filters.certifications.length > 0 &&
        !filters.certifications.every((cert) => product.certifications.includes(cert))
      ) {
        return false;
      }

      if (minP !== null && !Number.isNaN(minP) && defVar.priceSgd < minP) {
        return false;
      }

      if (maxP !== null && !Number.isNaN(maxP) && defVar.priceSgd > maxP) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const priceA = getDefaultVariant(a).priceSgd;
      const priceB = getDefaultVariant(b).priceSgd;
      switch (sortBy) {
        case 'best-selling':
          return a.bestSellingRank - b.bestSellingRank;
        case 'highest-rated':
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviewCount - a.reviewCount;
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'newest':
          return b.releasedOrder - a.releasedOrder;
        case 'best-match':
        default:
          return a.bestSellingRank - b.bestSellingRank;
      }
    });

    return sorted;
  }, [filters, sortBy, savedIds]);

  const activeFilterCount =
    (filters.inStockOnly ? 1 : 0) +
    (filters.savedOnly ? 1 : 0) +
    filters.brands.length +
    filters.sources.length +
    filters.forms.length +
    (filters.minRating !== null ? 1 : 0) +
    filters.certifications.length +
    (filters.minPrice !== '' || filters.maxPrice !== '' ? 1 : 0);

  const handleAddToCart = (
    productId: string,
    variantId: string,
    purchaseType: 'one-time' | 'autoship' = 'one-time',
    quantity = 1,
    subscriptionFrequency?: SubscriptionFrequency
  ) => {
    const normalizedFreq =
      purchaseType === 'autoship' ? subscriptionFrequency || 'monthly' : undefined;

    setCartItems((prev) => {
      const idx = prev.findIndex(
        (i) =>
          i.productId === productId &&
          i.variantId === variantId &&
          i.purchaseType === purchaseType &&
          i.subscriptionFrequency === normalizedFreq
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [
        ...prev,
        {
          productId,
          variantId,
          quantity,
          purchaseType,
          subscriptionFrequency: normalizedFreq,
        },
      ];
    });
    const prod = COLLAGEN_PRODUCTS.find((p) => p.id === productId);
    if (prod) {
      const freqLabel = normalizedFreq
        ? ` (${normalizedFreq.charAt(0).toUpperCase() + normalizedFreq.slice(1)} Subscription)`
        : '';
      showToast(`Added ${quantity} × ${prod.brand}${freqLabel} to cart`);
    }
  };

  const handleUpdateCartQuantity = (
    productId: string,
    variantId: string,
    purchaseType: 'one-time' | 'autoship',
    delta: number,
    subscriptionFrequency?: SubscriptionFrequency
  ) => {
    const normalizedFreq =
      purchaseType === 'autoship' ? subscriptionFrequency || 'monthly' : undefined;
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (
            item.productId === productId &&
            item.variantId === variantId &&
            item.purchaseType === purchaseType &&
            item.subscriptionFrequency === normalizedFreq
          ) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (
    productId: string,
    variantId: string,
    purchaseType: 'one-time' | 'autoship',
    subscriptionFrequency?: SubscriptionFrequency
  ) => {
    const normalizedFreq =
      purchaseType === 'autoship' ? subscriptionFrequency || 'monthly' : undefined;
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.variantId === variantId &&
            item.purchaseType === purchaseType &&
            item.subscriptionFrequency === normalizedFreq
          )
      )
    );
  };

  const handleToggleSave = (productId: string) => {
    setSavedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const cartTotalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalSgd = cartItems.reduce((sum, item) => {
    const product = COLLAGEN_PRODUCTS.find((p) => p.id === item.productId);
    if (!product) return sum;
    const variant =
      product.variants.find((v) => v.id === item.variantId) || product.variants[0];
    const unitPrice =
      item.purchaseType === 'autoship'
        ? getSubscriptionPriceSgd(
            variant.priceSgd,
            product.autoShipDiscountPct,
            item.subscriptionFrequency || 'monthly'
          )
        : variant.priceSgd;
    return sum + unitPrice * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A1D1E]">
      <Header
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => updateFilters({ searchQuery: q })}
        onSelectSubCategory={(cat) => {
          updateFilters({ subCategory: cat });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectProduct={(product) =>
          setModalProduct({ product, variantId: product.defaultVariantId })
        }
        allProducts={COLLAGEN_PRODUCTS}
        cartCount={cartTotalCount}
        cartSubtotalSgd={cartSubtotalSgd}
        savedCount={savedIds.length}
        savedOnlyActive={filters.savedOnly}
        onToggleSavedOnly={() => updateFilters({ savedOnly: !filters.savedOnly })}
        onOpenCart={() => setCartOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        signedInUser={signedInUser}
        onResetAll={resetAllFilters}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-5 pb-10">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#5A6266] mb-3">
          <button
            type="button"
            onClick={resetAllFilters}
            className="hover:text-[#458500] hover:underline cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#8A9296]" />
          <button
            type="button"
            onClick={() => updateFilters({ subCategory: 'all' })}
            className="hover:text-[#458500] hover:underline cursor-pointer"
          >
            Supplements
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#8A9296]" />
          <span className="font-semibold text-[#1A1D1E]">
            Search{filters.searchQuery ? `: "${filters.searchQuery}"` : ''}
          </span>
        </nav>

        {/* Search Results Header & Sub-category Filter Tabs */}
        <div className="pb-5 mb-6 border-b border-[#E4E7E9] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A1D1E]">
              {filters.savedOnly
                ? 'Saved Collagen Favorites'
                : filters.searchQuery.trim()
                  ? `Results for "${filters.searchQuery.trim()}"`
                  : 'All Collagen Supplements'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6266] tabular-nums">
              Showing <strong className="text-[#1A1D1E]">{filteredAndSortedProducts.length}</strong>{' '}
              of {COLLAGEN_PRODUCTS.length} Singapore-eligible items
            </p>
          </div>

          {/* Interactive Sub-Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {SUB_CATEGORY_TABS.map((tab) => {
              const active = filters.subCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => updateFilters({ subCategory: tab.id })}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#458500] text-white'
                      : 'bg-[#F5F6F7] text-[#2C3135] hover:bg-[#E8ECEE] hover:text-[#1A1D1E]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 2-Column Catalog Layout (Left Facets + Right Product Grid) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <FilterSidebar
            filters={filters}
            onUpdateFilters={updateFilters}
            onClearAll={resetAllFilters}
            allProducts={COLLAGEN_PRODUCTS}
            mobileOpen={mobileFiltersOpen}
            onCloseMobile={() => setMobileFiltersOpen(false)}
            activeFilterCount={activeFilterCount}
          />

          <section className="flex-1 min-w-0 w-full space-y-4">
            {/* Results Control Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8F9FA] border border-[#E4E7E9] rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D4D8DC] rounded text-xs font-bold text-[#1A1D1E] cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#458500]" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>

                <span className="text-xs text-[#5A6266] hidden sm:inline">
                  <strong className="text-[#1A1D1E] tabular-nums">
                    {filteredAndSortedProducts.length}
                  </strong>{' '}
                  products matched
                </span>

                {/* Active Interactive Filter Removers */}
                {filters.inStockOnly && (
                  <button
                    type="button"
                    onClick={() => updateFilters({ inStockOnly: false })}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D4D8DC] rounded text-xs font-medium text-[#1A1D1E] hover:border-[#458500] cursor-pointer"
                  >
                    In Stock <X className="w-3 h-3 text-[#6B7276]" />
                  </button>
                )}
                {filters.brands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() =>
                      updateFilters({ brands: filters.brands.filter((x) => x !== b) })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D4D8DC] rounded text-xs font-medium text-[#1A1D1E] hover:border-[#458500] cursor-pointer"
                  >
                    {b} <X className="w-3 h-3 text-[#6B7276]" />
                  </button>
                ))}
                {filters.forms.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() =>
                      updateFilters({ forms: filters.forms.filter((x) => x !== f) })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D4D8DC] rounded text-xs font-medium text-[#1A1D1E] hover:border-[#458500] cursor-pointer"
                  >
                    {f} <X className="w-3 h-3 text-[#6B7276]" />
                  </button>
                ))}
                {filters.sources.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      updateFilters({ sources: filters.sources.filter((x) => x !== s) })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D4D8DC] rounded text-xs font-medium text-[#1A1D1E] hover:border-[#458500] cursor-pointer"
                  >
                    {s} <X className="w-3 h-3 text-[#6B7276]" />
                  </button>
                ))}
                {filters.savedOnly && (
                  <button
                    type="button"
                    onClick={() => updateFilters({ savedOnly: false })}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D4D8DC] rounded text-xs font-medium text-[#1A1D1E] hover:border-[#458500] cursor-pointer"
                  >
                    Saved Items <X className="w-3 h-3 text-[#6B7276]" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="sort-select"
                    className="text-xs font-semibold text-[#5A6266] hidden sm:inline-flex items-center gap-1"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-8 px-2.5 text-xs font-semibold bg-white border border-[#D4D8DC] rounded text-[#1A1D1E] focus:border-[#458500] focus:outline-none cursor-pointer"
                  >
                    <option value="best-match">Best Match</option>
                    <option value="best-selling">Best Selling</option>
                    <option value="highest-rated">Highest Rated</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* Grid / List View Switcher */}
                <div className="hidden sm:flex items-center bg-white border border-[#D4D8DC] rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[#458500] text-white'
                        : 'text-[#5A6266] hover:text-[#1A1D1E]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-[#458500] text-white'
                        : 'text-[#5A6266] hover:text-[#1A1D1E]'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid or Empty State */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="border border-[#E4E7E9] rounded-lg p-12 text-center bg-[#FAFBFC] space-y-3">
                <div className="w-12 h-12 rounded-full bg-white border border-[#E4E7E9] flex items-center justify-center mx-auto text-[#8A9296]">
                  <SearchX className="w-6 h-6" />
                </div>
                <h2 className="font-display text-lg font-bold text-[#1A1D1E]">
                  No matching collagen products found
                </h2>
                <p className="text-sm text-[#5A6266] max-w-md mx-auto">
                  Try clearing one or more filters, expanding your SGD price range, or resetting to
                  all collagen results.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center px-5 py-2.5 bg-[#458500] hover:bg-[#366a00] text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-4'
                }
              >
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    isSaved={savedIds.includes(product.id)}
                    onToggleSave={handleToggleSave}
                    onOpenProduct={(p, vId) => setModalProduct({ product: p, variantId: vId })}
                    cartItems={cartItems}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer
        onSelectSubCategory={(cat) => {
          updateFilters({ subCategory: cat });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals & Drawers */}
      <ProductModal
        product={modalProduct?.product || null}
        initialVariantId={modalProduct?.variantId}
        isSaved={modalProduct ? savedIds.includes(modalProduct.product.id) : false}
        onToggleSave={handleToggleSave}
        onClose={() => setModalProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        products={COLLAGEN_PRODUCTS}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onOrderPlaced={(ord) => setOrders((prev) => [ord, ...prev])}
      />

      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        signedInUser={signedInUser}
        onSignIn={(name) => setSignedInUser(name)}
        onSignOut={() => setSignedInUser(null)}
        orders={orders}
      />

      {/* Subtle Add-to-Cart Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#1A1D1E] text-white px-4 py-3 rounded-lg shadow-xl text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#8CD147] shrink-0" />
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => {
              setToastMsg(null);
              setCartOpen(true);
            }}
            className="text-[#8CD147] hover:underline font-bold ml-1 cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}
    </div>
  );
}
