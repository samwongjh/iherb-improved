import React, { useState } from 'react';
import { X, Trash2, Minus, Plus, Truck, Tag, CheckCircle2, ArrowLeft, ShoppingBag } from 'lucide-react';
import {
  CartItem,
  OrderRecord,
  Product,
  SubscriptionFrequency,
  getSubscriptionDiscountPct,
  getSubscriptionPriceSgd,
} from '../types/catalog';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  products: Product[];
  onUpdateQuantity: (
    productId: string,
    variantId: string,
    purchaseType: 'one-time' | 'autoship',
    delta: number,
    subscriptionFrequency?: SubscriptionFrequency
  ) => void;
  onRemoveItem: (
    productId: string,
    variantId: string,
    purchaseType: 'one-time' | 'autoship',
    subscriptionFrequency?: SubscriptionFrequency
  ) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: OrderRecord) => void;
}

const FREE_SHIPPING_THRESHOLD_SGD = 30.0;
const STANDARD_SG_SHIPPING_SGD = 5.5;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  onClose,
  cartItems,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');

  const [fullName, setFullName] = useState('Sam Wong');
  const [phone, setPhone] = useState('+65 9123 4567');
  const [address, setAddress] = useState('18 Marina Boulevard, #14-08');
  const [postalCode, setPostalCode] = useState('018980');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  if (!open) return null;

  const detailedItems = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
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
      return {
        ...item,
        product,
        variant,
        unitPrice,
        lineTotal: Number((unitPrice * item.quantity).toFixed(2)),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  let discountAmount = 0;
  if (appliedPromo === 'SGWELL20' && subtotal >= 60) {
    discountAmount = Number((subtotal * 0.2).toFixed(2));
  } else if (appliedPromo === 'IHERB15') {
    discountAmount = Number((subtotal * 0.15).toFixed(2));
  }

  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const qualifiesFreeShipping = netSubtotal >= FREE_SHIPPING_THRESHOLD_SGD || netSubtotal === 0;
  const shippingCost = qualifiesFreeShipping ? 0 : STANDARD_SG_SHIPPING_SGD;
  const totalSgd = netSubtotal + shippingCost;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_SGD - netSubtotal);
  const freeShippingProgress = Math.min(100, (netSubtotal / FREE_SHIPPING_THRESHOLD_SGD) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    setPromoError(null);
    if (!code) return;
    if (code === 'SGWELL20') {
      if (subtotal < 60) {
        setPromoError('SGWELL20 requires a minimum subtotal of SG$60.00.');
        return;
      }
      setAppliedPromo('SGWELL20');
      setPromoInput('');
    } else if (code === 'IHERB15') {
      setAppliedPromo('IHERB15');
      setPromoInput('');
    } else {
      setPromoError('Invalid code. Try SGWELL20 or IHERB15.');
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCount = detailedItems.reduce((sum, i) => sum + i.quantity, 0);
    const newOrder: OrderRecord = {
      orderNumber: `SG-${Math.floor(100000 + Math.random() * 900000)}`,
      date: '18 Nov 2026',
      itemsCount: totalCount,
      totalSgd,
      status: 'Confirmed — Preparing Singapore Dispatch',
      recipientName: fullName.trim() || 'Singapore Customer',
      address: `${address.trim()}, Singapore ${postalCode.trim()}`,
    };
    setConfirmedOrder(newOrder);
    onOrderPlaced(newOrder);
    onClearCart();
    setStep('confirmed');
  };

  const handleClose = () => {
    if (step === 'confirmed') {
      setStep('cart');
      setConfirmedOrder(null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/45 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E7E9]">
          <div className="flex items-center gap-2">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="p-1 -ml-1 text-[#5A6266] hover:text-[#1A1D1E] cursor-pointer"
                aria-label="Back to cart"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-display text-base font-bold text-[#1A1D1E]">
              {step === 'cart'
                ? `Shopping Cart (${detailedItems.reduce((s, i) => s + i.quantity, 0)})`
                : step === 'checkout'
                  ? 'Singapore Checkout'
                  : 'Order Confirmation'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close cart"
            className="p-1.5 text-[#5A6266] hover:text-[#1A1D1E] rounded-md hover:bg-[#F5F6F7] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step: Confirmed */}
        {step === 'confirmed' && confirmedOrder && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#F2F7EC] flex items-center justify-center text-[#458500]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#458500]">
                Order #{confirmedOrder.orderNumber} Confirmed
              </p>
              <h3 className="font-display text-xl font-bold text-[#1A1D1E]">
                Preparing Your Singapore Shipment
              </h3>
              <p className="text-sm text-[#5A6266]">
                Estimated delivery in 3–5 business days via NinjaVan / SingPost Tracked Air.
              </p>
            </div>
            <div className="w-full text-left bg-[#F8F9FA] border border-[#E4E7E9] rounded-lg p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5A6266]">Recipient</span>
                <span className="font-semibold text-[#1A1D1E]">{confirmedOrder.recipientName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#5A6266] shrink-0">Delivery Address</span>
                <span className="font-medium text-[#1A1D1E] text-right">
                  {confirmedOrder.address}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E4E7E9]">
                <span className="font-bold text-[#1A1D1E]">Total Paid (SGD)</span>
                <span className="font-bold text-[#1A1D1E] tabular-nums">
                  SG${confirmedOrder.totalSgd.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 bg-[#458500] hover:bg-[#366a00] text-white text-sm font-bold rounded-md transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* Step: Cart */}
        {step === 'cart' && (
          <>
            {/* Free Shipping Progress */}
            {detailedItems.length > 0 && (
              <div className="px-5 py-3 bg-[#F8F9FA] border-b border-[#ECEFF1] space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Truck className="w-4 h-4 text-[#458500] shrink-0" />
                  {qualifiesFreeShipping ? (
                    <span className="font-semibold text-[#2D5900]">
                      Your order qualifies for FREE Shipping to Singapore!
                    </span>
                  ) : (
                    <span className="text-[#2C3135]">
                      Add{' '}
                      <strong className="tabular-nums text-[#1A1D1E]">
                        SG${amountToFreeShipping.toFixed(2)}
                      </strong>{' '}
                      more for FREE Singapore shipping
                    </span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-[#E4E7E9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#458500] transition-all duration-200"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Item List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {detailedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#F5F6F7] flex items-center justify-center text-[#8A9296]">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <p className="font-display text-base font-bold text-[#1A1D1E]">
                    Your iHerb Cart is Empty
                  </p>
                  <p className="text-xs text-[#5A6266] max-w-xs">
                    Browse our collagen peptides, marine collagen, and beauty formulas to add items.
                  </p>
                </div>
              ) : (
                detailedItems.map((item) => {
                  const freq = item.subscriptionFrequency || 'monthly';
                  const freqLabel = freq.charAt(0).toUpperCase() + freq.slice(1);
                  const subDiscountPct = getSubscriptionDiscountPct(
                    item.product.autoShipDiscountPct,
                    freq
                  );
                  return (
                    <div
                      key={`${item.productId}-${item.variantId}-${item.purchaseType}-${freq}`}
                      className="flex gap-3 pb-4 border-b border-[#ECEFF1]"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.shortTitle}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-contain rounded border border-[#ECEFF1] bg-[#F8F9FA] p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-semibold text-[#458500]">
                              {item.product.brand}
                            </p>
                            <p className="text-xs font-semibold text-[#1A1D1E] line-clamp-2 leading-snug">
                              {item.product.shortTitle}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onRemoveItem(
                                item.productId,
                                item.variantId,
                                item.purchaseType,
                                item.subscriptionFrequency
                              )
                            }
                            aria-label="Remove item"
                            className="p-1 text-[#8A9296] hover:text-[#C93B2B] cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[11px] text-[#5A6266]">
                          {item.variant.weightText} ·{' '}
                          {item.purchaseType === 'autoship' ? (
                            <span className="text-[#2D5900] font-semibold">
                              {freqLabel} Subscription (-{subDiscountPct}%)
                            </span>
                          ) : (
                            'One-time'
                          )}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center border border-[#DDE1E4] rounded h-7">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.productId,
                                  item.variantId,
                                  item.purchaseType,
                                  -1,
                                  item.subscriptionFrequency
                                )
                              }
                              aria-label="Decrease quantity"
                              className="w-7 h-full flex items-center justify-center text-[#1A1D1E] hover:bg-[#F5F6F7] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.productId,
                                  item.variantId,
                                  item.purchaseType,
                                  1,
                                  item.subscriptionFrequency
                                )
                              }
                              aria-label="Increase quantity"
                              className="w-7 h-full flex items-center justify-center text-[#1A1D1E] hover:bg-[#F5F6F7] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                        <span className="text-sm font-bold text-[#1A1D1E] tabular-nums">
                          SG${item.lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            {/* Cart Summary Footer */}
            {detailedItems.length > 0 && (
              <div className="border-t border-[#E4E7E9] p-5 bg-[#FAFBFC] space-y-3">
                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-[#8A9296] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code (e.g. IHERB15 or SGWELL20)"
                        className="w-full h-9 pl-8 pr-2.5 text-xs bg-white border border-[#DDE1E4] rounded focus:border-[#458500] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 h-9 bg-[#1A1D1E] hover:bg-[#33383B] text-white text-xs font-bold rounded transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[11px] text-[#C93B2B]">{promoError}</p>}
                  {appliedPromo && (
                    <div className="flex items-center justify-between text-xs text-[#2D5900] font-semibold">
                      <span>Code {appliedPromo} applied</span>
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(null)}
                        className="underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </form>

                {/* Price Breakdown */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between text-[#5A6266]">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-medium text-[#1A1D1E]">
                      SG${subtotal.toFixed(2)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#458500] font-semibold">
                      <span>Promo Discount ({appliedPromo})</span>
                      <span className="tabular-nums">-SG${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#5A6266]">
                    <span>Shipping (Singapore Standard Air)</span>
                    <span className="tabular-nums font-semibold text-[#1A1D1E]">
                      {qualifiesFreeShipping ? 'FREE' : `SG$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#1A1D1E] pt-2 border-t border-[#E4E7E9]">
                    <span>Estimated Total (incl. 9% GST)</span>
                    <span className="tabular-nums text-base">SG${totalSgd.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full h-11 bg-[#458500] hover:bg-[#366a00] text-white text-sm font-bold rounded-md transition-colors cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </>
        )}

        {/* Step: Checkout Form */}
        {step === 'checkout' && (
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-5 space-y-4 flex-1">
              <p className="text-xs text-[#5A6266]">
                Delivering to Singapore via tracked air courier. GST is calculated and included.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1A1D1E] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-[#DDE1E4] rounded-md focus:border-[#458500] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1A1D1E] mb-1">
                    Singapore Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-[#DDE1E4] rounded-md focus:border-[#458500] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1A1D1E] mb-1">
                    Street Address &amp; Unit No.
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-[#DDE1E4] rounded-md focus:border-[#458500] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1A1D1E] mb-1">
                    Singapore Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full h-10 px-3 text-sm tabular-nums border border-[#DDE1E4] rounded-md focus:border-[#458500] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8F9FA] border border-[#E4E7E9] space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-[#1A1D1E]">
                  <span>Order Total ({detailedItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="tabular-nums">SG${totalSgd.toFixed(2)}</span>
                </div>
                <p className="text-[#5A6266]">
                  Payment method: Visa / PayNow SG (Demo Checkout)
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-[#E4E7E9] bg-[#FAFBFC]">
              <button
                type="submit"
                className="w-full h-11 bg-[#458500] hover:bg-[#366a00] text-white text-sm font-bold rounded-md transition-colors cursor-pointer"
              >
                Place Order · SG${totalSgd.toFixed(2)}
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
};
