import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Heart, ShieldCheck, Truck, Minus, Plus, Package, RefreshCw } from 'lucide-react';
import {
  Product,
  SUBSCRIPTION_OPTIONS,
  SubscriptionFrequency,
  getSubscriptionDiscountPct,
  getSubscriptionPriceSgd,
} from '../types/catalog';
import { StarRating } from './StarRating';

interface ProductModalProps {
  product: Product | null;
  initialVariantId?: string;
  isSaved: boolean;
  onToggleSave: (productId: string) => void;
  onClose: () => void;
  onAddToCart: (
    productId: string,
    variantId: string,
    purchaseType: 'one-time' | 'autoship',
    quantity: number,
    subscriptionFrequency?: SubscriptionFrequency
  ) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  initialVariantId,
  isSaved,
  onToggleSave,
  onClose,
  onAddToCart,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialVariantId || product?.defaultVariantId || ''
  );
  const [subscriptionFrequency, setSubscriptionFrequency] =
    useState<SubscriptionFrequency>('monthly');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'facts' | 'reviews'>('overview');
  const [addedFeedback, setAddedFeedback] = useState<'one-time' | 'autoship' | null>(null);
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    if (product) {
      setSelectedVariantId(initialVariantId || product.defaultVariantId);
      setSubscriptionFrequency('monthly');
      setQuantity(1);
      setActiveTab('overview');
      setAddedFeedback(null);
      setImgError(false);
    }
  }, [product, initialVariantId]);

  if (!product) return null;

  const variant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const oneTimePrice = variant.priceSgd;
  const subDiscountPct = getSubscriptionDiscountPct(
    product.autoShipDiscountPct,
    subscriptionFrequency
  );
  const autoShipPrice = getSubscriptionPriceSgd(
    variant.priceSgd,
    product.autoShipDiscountPct,
    subscriptionFrequency
  );
  const oneTimeTotal = Number((oneTimePrice * quantity).toFixed(2));
  const autoShipTotal = Number((autoShipPrice * quantity).toFixed(2));

  const handleAddOneTime = () => {
    onAddToCart(product.id, variant.id, 'one-time', quantity);
    setAddedFeedback('one-time');
    setTimeout(() => setAddedFeedback(null), 1800);
  };

  const handleAddSubscription = () => {
    onAddToCart(product.id, variant.id, 'autoship', quantity, subscriptionFrequency);
    setAddedFeedback('autoship');
    setTimeout(() => setAddedFeedback(null), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E4E7E9] bg-[#FAFBFC]">
          <div className="flex items-center gap-2 text-xs text-[#5A6266]">
            <span className="font-semibold text-[#458500]">{product.brand}</span>
            <span aria-hidden="true">/</span>
            <span>SKU: {product.sku}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="p-1.5 text-[#5A6266] hover:text-[#1A1D1E] rounded-md hover:bg-[#ECEFF1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image Box */}
            <div className="md:col-span-5 bg-[#F8F9FA] border border-[#ECEFF1] rounded-lg aspect-square flex items-center justify-center relative overflow-hidden">
              {!imgError ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain p-6"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Package className="w-12 h-12 text-[#458500] mb-2" />
                  <span className="text-sm font-semibold text-[#2D5900]">
                    {product.shortTitle}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onToggleSave(product.id)}
                className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E4E7E9] text-[#5A6266] hover:text-[#C93B2B] shadow-xs cursor-pointer"
                aria-label={isSaved ? 'Remove from saved' : 'Save item'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C93B2B] text-[#C93B2B]' : ''}`} />
              </button>
            </div>

            {/* Purchase Module */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <p className="text-xs font-bold text-[#458500] mb-1">{product.brand}</p>
                <h2 className="font-display text-xl font-bold text-[#1A1D1E] leading-snug">
                  {product.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" showNumeric />
                  <span className="text-xs text-[#5A6266]">{product.soldRecentlyText}</span>
                </div>
              </div>

              {/* Clean metadata line */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5A6266]">
                <span>{product.source}</span>
                <span aria-hidden="true">·</span>
                <span>{product.form}</span>
                {product.certifications.slice(0, 3).map((cert) => (
                  <React.Fragment key={cert}>
                    <span aria-hidden="true">·</span>
                    <span>{cert}</span>
                  </React.Fragment>
                ))}
              </div>

              {/* Variant Selector */}
              <div>
                <p className="text-xs font-bold text-[#1A1D1E] mb-2">
                  Package Size: <span className="font-normal text-[#5A6266]">{variant.weightText}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-2 text-xs rounded-md border transition-colors cursor-pointer ${
                        v.id === variant.id
                          ? 'border-[#458500] bg-[#F2F7EC] text-[#2D5900] font-bold'
                          : 'border-[#DDE1E4] bg-white text-[#1A1D1E] hover:border-[#AEB4B9]'
                      }`}
                    >
                      <span>{v.label}</span>
                      <span className="ml-1.5 tabular-nums text-[#5A6266]">
                        SG${v.priceSgd.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* One-Time Quantity Stepper + Add to Cart (4 cols) & Subscription Option Below (8 cols) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-[#1A1D1E]">One-time Purchase</span>
                  <div className="text-right tabular-nums">
                    <span className="text-base font-extrabold text-[#1A1D1E]">
                      SG${oneTimeTotal.toFixed(2)}
                    </span>
                    {variant.listPriceSgd && (
                      <span className="ml-1.5 text-xs text-[#7B8287] line-through">
                        SG${(variant.listPriceSgd * quantity).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 1: Quantity Stepper (8 cols) + Add to Cart Button (4 cols) */}
                <div className="grid grid-cols-12 gap-2.5 items-stretch">
                  <div className="col-span-8 flex items-center justify-between border border-[#D4D8DC] rounded-md h-11 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="w-11 h-full flex items-center justify-center text-[#1A1D1E] hover:bg-[#F5F6F7] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer border-r border-[#ECEFF1]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 text-center text-sm font-bold tabular-nums">
                      Qty: {quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      aria-label="Increase quantity"
                      className="w-11 h-full flex items-center justify-center text-[#1A1D1E] hover:bg-[#F5F6F7] cursor-pointer border-l border-[#ECEFF1]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!variant.inStock}
                    onClick={handleAddOneTime}
                    className={`col-span-4 h-11 px-2 rounded-md text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      !variant.inStock
                        ? 'bg-[#E4E7E9] text-[#6B7276] cursor-not-allowed'
                        : addedFeedback === 'one-time'
                          ? 'bg-[#2D5900] text-white'
                          : 'border border-[#458500] bg-white hover:bg-[#F2F7EC] text-[#2D5900]'
                    }`}
                  >
                    {!variant.inStock ? (
                      'Out of Stock'
                    ) : addedFeedback === 'one-time' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Added
                      </>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>

                {/* Row 2 (below Add to Cart): Prominent animated Subscription Options (Monthly / Quarterly / Annually) + 8-col Subscribe Button */}
                <div className="relative overflow-hidden border-2 border-[#458500] bg-gradient-to-br from-[#F2F9E8] via-[#F8FCF2] to-[#EAF5DC] rounded-lg p-3.5 space-y-3 shadow-sm shadow-[#458500]/15 animate-subscribe-ring">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-extrabold text-[#1F4200]">
                      <span className="w-6 h-6 rounded-full bg-[#458500] text-white inline-flex items-center justify-center shrink-0 shadow-2xs">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin [animation-duration:8s]" />
                      </span>
                      Subscribe &amp; Save
                    </span>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Subscription frequency"
                    className="grid grid-cols-3 gap-2 bg-white/80 p-1 rounded-md border border-[#DCE8CE]"
                  >
                    {SUBSCRIPTION_OPTIONS.map((opt) => {
                      const optPct = getSubscriptionDiscountPct(
                        product.autoShipDiscountPct,
                        opt.id
                      );
                      const optPrice = getSubscriptionPriceSgd(
                        variant.priceSgd,
                        product.autoShipDiscountPct,
                        opt.id
                      );
                      const active = subscriptionFrequency === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSubscriptionFrequency(opt.id)}
                          className={`relative p-2 rounded text-left transition-colors cursor-pointer ${
                            active ? 'text-white' : 'text-[#1A1D1E] hover:bg-white'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId={`modal-sub-pill-${product.id}`}
                              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                              className="absolute inset-0 rounded bg-[#458500] shadow-xs"
                            />
                          )}
                          <div className="relative z-10 flex items-center justify-between gap-1">
                            <span className="text-xs font-bold">{opt.label}</span>
                            <span
                              className={`text-[11px] font-bold tabular-nums ${
                                active ? 'text-[#E3F6CC]' : 'text-[#458500]'
                              }`}
                            >
                              -{optPct}%
                            </span>
                          </div>
                          <p
                            className={`relative z-10 text-[11px] font-bold tabular-nums mt-0.5 ${
                              active ? 'text-white' : 'text-[#1A1D1E]'
                            }`}
                          >
                            SG${optPrice.toFixed(2)}/ea
                          </p>
                          <p
                            className={`relative z-10 text-[10px] ${
                              active ? 'text-white/85' : 'text-[#5A6266]'
                            }`}
                          >
                            {opt.intervalText}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-12 gap-2.5 items-center">
                    <motion.div
                      key={`${subscriptionFrequency}-${autoShipTotal}`}
                      initial={{ opacity: 0.6, y: -3, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.22 }}
                      className="col-span-4 leading-tight tabular-nums"
                    >
                      <span className="block text-base font-extrabold text-[#1F4200]">
                        SG${autoShipTotal.toFixed(2)}
                      </span>
                      <span className="block text-[11px] text-[#6B7276] line-through">
                        SG${oneTimeTotal.toFixed(2)}
                      </span>
                    </motion.div>

                    <motion.button
                      type="button"
                      disabled={!variant.inStock}
                      whileHover={variant.inStock ? { scale: 1.015 } : undefined}
                      whileTap={variant.inStock ? { scale: 0.985 } : undefined}
                      onClick={handleAddSubscription}
                      className={`col-span-8 relative overflow-hidden h-11 px-3 rounded-md text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        !variant.inStock
                          ? 'bg-[#E4E7E9] text-[#6B7276] cursor-not-allowed'
                          : addedFeedback === 'autoship'
                            ? 'bg-[#2D5900] text-white'
                            : 'bg-gradient-to-r from-[#2D5900] via-[#458500] to-[#569B00] hover:brightness-105 text-white shadow-sm shadow-[#458500]/30'
                      }`}
                    >
                      {variant.inStock && addedFeedback !== 'autoship' && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-subscribe-shimmer"
                        />
                      )}
                      {!variant.inStock ? (
                        'Currently Out of Stock'
                      ) : addedFeedback === 'autoship' ? (
                        <>
                          <Check className="relative z-10 w-4 h-4" />
                          <span className="relative z-10">Subscription Added</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="relative z-10 w-4 h-4 shrink-0" />
                          <span className="relative z-10">
                            Subscribe ({subscriptionFrequency}) · SG${autoShipTotal.toFixed(2)}
                          </span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Singapore Shipping & Authenticity Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-[#5A6266]">
                <div className="flex items-center gap-2 p-2.5 rounded bg-[#F8F9FA] border border-[#ECEFF1]">
                  <Truck className="w-4 h-4 text-[#458500] shrink-0" />
                  <span>Ships to Singapore in 3–5 business days</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded bg-[#F8F9FA] border border-[#ECEFF1]">
                  <ShieldCheck className="w-4 h-4 text-[#458500] shrink-0" />
                  <span>100% Authentic · Climate-controlled storage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Tabs */}
          <div className="border-t border-[#E4E7E9] pt-5">
            <div className="flex items-center gap-6 border-b border-[#E4E7E9] mb-4">
              {[
                { key: 'overview', label: 'Overview & Suggested Use' },
                { key: 'facts', label: 'Supplement Facts' },
                { key: 'reviews', label: `Verified Reviews (${product.reviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab.key
                      ? 'border-[#458500] text-[#2D5900]'
                      : 'border-transparent text-[#5A6266] hover:text-[#1A1D1E]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#2C3135]">
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-[#1A1D1E]">Description</h4>
                  <p className="leading-relaxed">{product.description}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-[#1A1D1E]">Suggested Use</h4>
                  <p className="leading-relaxed">{product.suggestedUse}</p>
                  <p className="text-xs text-[#5A6266] pt-1">
                    <strong>Other Ingredients:</strong> {product.otherIngredients}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'facts' && (
              <div className="border border-[#1A1D1E] rounded-md overflow-hidden max-w-xl">
                <div className="bg-[#1A1D1E] text-white px-4 py-2.5">
                  <h4 className="font-display text-base font-bold">Supplement Facts</h4>
                  <p className="text-xs text-white/80">
                    Serving Size: {product.servingSize} · Servings Per Container: {variant.servings}
                  </p>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#1A1D1E] bg-[#F8F9FA]">
                      <th className="text-left px-4 py-2 font-bold">Ingredient</th>
                      <th className="text-right px-4 py-2 font-bold">Amount Per Serving</th>
                      <th className="text-right px-4 py-2 font-bold">% Daily Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7E9]">
                    {product.supplementFacts.map((row) => (
                      <tr key={row.nutrient}>
                        <td className="px-4 py-2 font-medium text-[#1A1D1E]">{row.nutrient}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-[#2C3135]">
                          {row.amount}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums text-[#5A6266]">
                          {row.dailyValue || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-lg border border-[#E4E7E9] bg-[#FAFBFC] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StarRating rating={rev.rating} />
                      <span className="text-xs text-[#6B7276]">{rev.date}</span>
                    </div>
                    <h5 className="font-display text-sm font-bold text-[#1A1D1E]">{rev.title}</h5>
                    <p className="text-sm text-[#2C3135] leading-relaxed">{rev.comment}</p>
                    <div className="flex items-center gap-2 text-xs text-[#5A6266] pt-1">
                      <span className="font-semibold text-[#1A1D1E]">{rev.author}</span>
                      <span aria-hidden="true">·</span>
                      <span>{rev.location}</span>
                      {rev.verifiedPurchase && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#458500] font-medium">Verified Purchase</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
