import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Minus, Plus, Package, Check, RefreshCw } from 'lucide-react';
import {
  CartItem,
  Product,
  SUBSCRIPTION_OPTIONS,
  SubscriptionFrequency,
  getSubscriptionDiscountPct,
  getSubscriptionPriceSgd,
} from '../types/catalog';
import { StarRating } from './StarRating';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  isSaved: boolean;
  onToggleSave: (productId: string) => void;
  onOpenProduct: (product: Product, variantId: string) => void;
  cartItems: CartItem[];
  onAddToCart: (
    productId: string,
    variantId: string,
    purchaseType?: 'one-time' | 'autoship',
    quantity?: number,
    subscriptionFrequency?: SubscriptionFrequency
  ) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  isSaved,
  onToggleSave,
  onOpenProduct,
  cartItems,
  onAddToCart,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState(product.defaultVariantId);
  const [quantity, setQuantity] = useState(1);
  const [subscriptionFrequency, setSubscriptionFrequency] =
    useState<SubscriptionFrequency>('monthly');
  const [imgError, setImgError] = useState(false);

  const variant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const variantCartQty = cartItems
    .filter((item) => item.productId === product.id && item.variantId === variant.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const discountPct =
    variant.listPriceSgd && variant.listPriceSgd > variant.priceSgd
      ? Math.round(((variant.listPriceSgd - variant.priceSgd) / variant.listPriceSgd) * 100)
      : 0;

  const perServingSgd = variant.priceSgd / Math.max(1, variant.servings);
  const subUnitPriceSgd = getSubscriptionPriceSgd(
    variant.priceSgd,
    product.autoShipDiscountPct,
    subscriptionFrequency
  );
  const oneTimeTotalSgd = Number((variant.priceSgd * quantity).toFixed(2));
  const subTotalSgd = Number((subUnitPriceSgd * quantity).toFixed(2));
  const unitSavingsSgd = Number((variant.priceSgd - subUnitPriceSgd).toFixed(2));
  const subSavingsSgd = Number((oneTimeTotalSgd - subTotalSgd).toFixed(2));

  const kickerLabel =
    product.kicker || (discountPct >= 15 ? `Save ${discountPct}%` : undefined);

  const kickerStyles =
    kickerLabel === 'Super Special' || kickerLabel?.startsWith('Save')
      ? 'bg-[#C93B2B] text-white'
      : kickerLabel === 'iHerb Quality Pick'
        ? 'bg-[#2D5900] text-white'
        : kickerLabel === 'New'
          ? 'bg-[#1D5B79] text-white'
          : 'bg-[#E58900] text-white';

  const renderImage = (boxClass: string) => (
    <div
      onClick={() => onOpenProduct(product, variant.id)}
      className={`relative bg-[#F8F9FA] overflow-hidden cursor-pointer flex items-center justify-center ${boxClass}`}
    >
      {kickerLabel && (
        <span
          className={`absolute top-0 left-0 z-10 px-2.5 py-1 text-[11px] font-bold tracking-tight rounded-br-md ${kickerStyles}`}
        >
          {kickerLabel}
        </span>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave(product.id);
        }}
        aria-label={isSaved ? 'Remove from saved' : 'Save item'}
        className="absolute top-1.5 right-1.5 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#5A6266] hover:text-[#C93B2B] shadow-xs transition-colors cursor-pointer"
      >
        <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C93B2B] text-[#C93B2B]' : ''}`} />
      </button>

      {!imgError ? (
        <img
          src={product.imageUrl}
          alt={`${product.brand} ${product.shortTitle}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-200"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#F2F7EC] to-[#E6ECE2] w-full h-full">
          <Package className="w-10 h-10 text-[#458500] mb-2" />
          <span className="text-xs font-semibold text-[#2D5900] line-clamp-2">
            {product.shortTitle}
          </span>
        </div>
      )}

      {!variant.inStock && (
        <div className="absolute inset-x-0 bottom-0 bg-white/95 border-t border-[#E4E7E9] py-1 text-center">
          <span className="text-xs font-semibold text-[#C93B2B]">Currently Out of Stock</span>
        </div>
      )}
    </div>
  );

  const renderActionControl = () => {
    if (!variant.inStock) {
      return (
        <button
          type="button"
          onClick={() => onOpenProduct(product, variant.id)}
          className="w-full h-10 border border-[#D4D8DC] bg-[#F5F6F7] text-[#5A6266] text-xs font-semibold rounded-md hover:bg-[#ECEFF1] transition-colors cursor-pointer"
        >
          View Details
        </button>
      );
    }

    return (
      <div className="space-y-2.5">
        {variantCartQty > 0 && (
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#2D5900] bg-[#F2F7EC] px-2 py-1 rounded">
            <span className="inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-[#458500]" />
              {variantCartQty} in Cart
            </span>
          </div>
        )}

        {/* Block 1 (Top): Prominent animated Subscribe & Save card + Subscribe button (col-span-8) */}
        <div className="relative overflow-hidden rounded-lg border-2 border-[#458500] bg-gradient-to-br from-[#F2F9E8] via-[#F8FCF2] to-[#EAF5DC] p-2.5 space-y-2 shadow-sm shadow-[#458500]/15 animate-subscribe-ring">
          <div className="flex items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1F4200] tracking-tight">
              <span className="w-5 h-5 rounded-full bg-[#458500] text-white inline-flex items-center justify-center shrink-0 shadow-2xs">
                <RefreshCw className="w-3 h-3 animate-spin [animation-duration:8s]" />
              </span>
              Subscribe &amp; Save
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Subscription frequency"
            className="grid grid-cols-3 gap-1 bg-white/80 p-1 rounded-md border border-[#DCE8CE]"
          >
            {SUBSCRIPTION_OPTIONS.map((opt) => {
              const optPct = getSubscriptionDiscountPct(product.autoShipDiscountPct, opt.id);
              const active = subscriptionFrequency === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSubscriptionFrequency(opt.id)}
                  className={`relative py-1 px-1 rounded text-center transition-colors cursor-pointer ${
                    active ? 'text-white font-bold' : 'text-[#4B5358] hover:text-[#1A1D1E]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={`sub-pill-${product.id}-${viewMode}`}
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded bg-[#458500] shadow-xs"
                    />
                  )}
                  <span className="relative z-10 block text-[10px] leading-tight">
                    {opt.label}
                  </span>
                  <span
                    className={`relative z-10 block text-[10px] leading-tight tabular-nums font-semibold ${
                      active ? 'text-[#E3F6CC]' : 'text-[#458500]'
                    }`}
                  >
                    -{optPct}%
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-12 gap-1.5 items-center">
            <motion.div
              key={`${subscriptionFrequency}-${subTotalSgd}`}
              initial={{ opacity: 0.6, y: -3, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22 }}
              className="col-span-4 min-w-0 leading-tight tabular-nums space-y-0.5"
            >
              <span className="inline-block max-w-full truncate px-1 py-0.5 rounded bg-[#2D5900] text-white text-[9.5px] font-extrabold">
                Save SG${subSavingsSgd.toFixed(2)}
              </span>
              <span className="block text-[13px] font-extrabold text-[#1F4200] truncate">
                SG${subTotalSgd.toFixed(2)}
              </span>
            </motion.div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                onAddToCart(product.id, variant.id, 'autoship', quantity, subscriptionFrequency)
              }
              className="col-span-8 relative overflow-hidden h-10 px-2 bg-gradient-to-r from-[#2D5900] via-[#458500] to-[#569B00] hover:brightness-105 text-white text-xs font-bold rounded-md shadow-sm shadow-[#458500]/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-subscribe-shimmer"
              />
              <RefreshCw className="relative z-10 w-3.5 h-3.5 shrink-0" />
              <span className="relative z-10">Subscribe</span>
            </motion.button>
          </div>
        </div>

        {/* Block 2 (Below Subscription): Per-item purchase price + Quantity stepper + Add to Cart button (col-span-4) */}
        <div className="pt-1.5 border-t border-[#ECEFF1] space-y-1.5">
          <div className="flex items-baseline justify-between gap-1 text-[11px] text-[#5A6266] tabular-nums">
            <span>
              Per item:{' '}
              <span className="font-semibold text-[#2C3135]">
                SG${variant.priceSgd.toFixed(2)}
              </span>
              {variant.listPriceSgd && (
                <span className="ml-1 text-[10px] text-[#8A9296] line-through">
                  SG${variant.listPriceSgd.toFixed(2)}
                </span>
              )}
            </span>
            <span className="text-[10px] text-[#6B7276] shrink-0">
              SG${perServingSgd.toFixed(2)}/srv
            </span>
          </div>

          <div className="grid grid-cols-12 gap-1.5 items-stretch">
            <div className="col-span-8 flex items-center justify-between h-10 border border-[#D4D8DC] rounded-md bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Reduce quantity"
                className="w-7 h-full flex items-center justify-center text-[#1A1D1E] hover:bg-[#F5F6F7] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer border-r border-[#ECEFF1]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 flex items-center justify-center gap-1 px-1 text-xs tabular-nums">
                <span className="text-[11px] font-medium text-[#5A6266]">Qty:</span>
                <span className="font-bold text-[#1A1D1E]">{quantity}</span>
              </div>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
                className="w-7 h-full flex items-center justify-center text-[#1A1D1E] hover:bg-[#F5F6F7] transition-colors cursor-pointer border-l border-[#ECEFF1]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onAddToCart(product.id, variant.id, 'one-time', quantity)}
              className="col-span-4 h-10 px-1.5 border border-[#458500] bg-white hover:bg-[#F2F7EC] active:scale-[0.99] text-[#2D5900] text-[11px] font-bold leading-[1.15] rounded-md transition-all cursor-pointer flex items-center justify-center text-center"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <article className="group bg-white border border-[#E4E7E9] hover:border-[#C5CCD1] rounded-lg overflow-hidden transition-all duration-150 hover:shadow-md flex flex-col sm:flex-row">
        {renderImage('sm:w-52 md:w-56 aspect-square sm:aspect-auto shrink-0 border-b sm:border-b-0 sm:border-r border-[#ECEFF1]')}

        <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#5A6266]">
              <span className="font-semibold text-[#458500]">{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>{product.form}</span>
              <span aria-hidden="true">·</span>
              <span>{product.source}</span>
            </div>

            <h3 className="font-display text-[15px] font-semibold text-[#1A1D1E] leading-snug">
              <button
                type="button"
                onClick={() => onOpenProduct(product, variant.id)}
                className="text-left hover:text-[#458500] hover:underline cursor-pointer"
              >
                {product.title}
              </button>
            </h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} showNumeric />
              <span className="text-xs text-[#5A6266]">{product.soldRecentlyText}</span>
            </div>

            <p className="text-xs text-[#5A6266] line-clamp-2 pt-0.5">{product.description}</p>

            {/* Size Selector */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap ${
                    v.id === variant.id
                      ? 'border-[#458500] bg-[#F2F7EC] text-[#2D5900] font-semibold'
                      : 'border-[#DDE1E4] bg-white text-[#5A6266] hover:border-[#AEB4B9]'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:w-72 shrink-0 flex flex-col justify-between sm:border-l sm:border-[#ECEFF1] sm:pl-5 pt-2 sm:pt-0">
            <div className="space-y-1 pb-2">
              <div className="flex items-center gap-2 flex-wrap tabular-nums">
                <span className="text-lg font-extrabold text-[#1F4200]">
                  SG${subUnitPriceSgd.toFixed(2)}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#458500] text-white text-[11px] font-extrabold">
                  Save SG${unitSavingsSgd.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#2D5900] capitalize">
                {subscriptionFrequency} subscription price
              </p>
            </div>

            <div>{renderActionControl()}</div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white border border-[#E4E7E9] hover:border-[#C5CCD1] rounded-lg overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md flex flex-col">
      {renderImage('aspect-square border-b border-[#ECEFF1]')}

      <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
        {/* Brand & Form metadata line (unboxed) */}
        <div className="flex items-center gap-1.5 text-xs text-[#5A6266] mb-1 truncate">
          <span className="font-semibold text-[#366a00] truncate">{product.brand}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{product.form}</span>
        </div>

        {/* Product Title */}
        <h3 className="font-display text-[14px] font-semibold text-[#1A1D1E] leading-snug mb-2 line-clamp-2 min-h-[40px]">
          <button
            type="button"
            onClick={() => onOpenProduct(product, variant.id)}
            className="text-left hover:text-[#458500] hover:underline cursor-pointer"
          >
            {product.title}
          </button>
        </h3>

        {/* Rating & Popularity */}
        <div className="space-y-0.5 mb-2.5">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          <p className="text-[11px] text-[#6B7276]">{product.soldRecentlyText}</p>
        </div>

        {/* Size Variants */}
        {product.variants.length > 1 ? (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={`px-2 py-0.5 text-[11px] rounded border transition-colors cursor-pointer whitespace-nowrap ${
                  v.id === variant.id
                    ? 'border-[#458500] bg-[#F2F7EC] text-[#2D5900] font-semibold'
                    : 'border-[#DDE1E4] bg-white text-[#5A6266] hover:border-[#AEB4B9]'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-[#5A6266] mb-3">{variant.weightText}</p>
        )}

        {/* Pricing Block anchored at bottom: Subscription price/savings directly above Subscribe */}
        <div className="mt-auto pt-2 border-t border-[#F1F3F5] space-y-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap tabular-nums">
              <span className="text-[18px] font-extrabold text-[#1F4200]">
                SG${subUnitPriceSgd.toFixed(2)}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#458500] text-white text-[11px] font-extrabold">
                Save SG${unitSavingsSgd.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#2D5900] capitalize mt-0.5">
              {subscriptionFrequency} subscription price
            </p>
          </div>

          {renderActionControl()}
        </div>
      </div>
    </article>
  );
};
