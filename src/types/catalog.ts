export type SupplementForm = 'Powder' | 'Tablets' | 'Capsules' | 'Liquid' | 'Gummies';

export type CollagenSource =
  | 'Marine (Fish)'
  | 'Grass-Fed Bovine'
  | 'Multi-Collagen (I, II, III, V, X)'
  | 'Vegan Collagen Builder';

export type SubCategory =
  | 'all'
  | 'peptides'
  | 'marine'
  | 'tablets-capsules'
  | 'liquid-gummies'
  | 'beauty-skin';

export type SortOption =
  | 'best-match'
  | 'best-selling'
  | 'highest-rated'
  | 'price-asc'
  | 'price-desc'
  | 'newest';

export interface ProductVariant {
  id: string;
  label: string;
  weightText: string;
  servings: number;
  priceSgd: number;
  listPriceSgd?: number;
  inStock: boolean;
}

export interface SupplementFactRow {
  nutrient: string;
  amount: string;
  dailyValue: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  date: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

export interface Product {
  id: string;
  sku: string;
  brand: string;
  title: string;
  shortTitle: string;
  imageUrl: string;
  kicker?: 'Best Seller' | 'iHerb Quality Pick' | 'Super Special' | 'Top Rated' | 'New';
  rating: number;
  reviewCount: number;
  soldRecentlyText: string;
  bestSellingRank: number;
  releasedOrder: number;
  form: SupplementForm;
  source: CollagenSource;
  subCategories: SubCategory[];
  certifications: string[];
  healthTopics: string[];
  variants: ProductVariant[];
  defaultVariantId: string;
  autoShipDiscountPct: number;
  promoText?: string;
  description: string;
  suggestedUse: string;
  servingSize: string;
  supplementFacts: SupplementFactRow[];
  otherIngredients: string;
  reviews: CustomerReview[];
}

export interface FilterState {
  searchQuery: string;
  subCategory: SubCategory;
  inStockOnly: boolean;
  brands: string[];
  sources: CollagenSource[];
  forms: SupplementForm[];
  minRating: number | null;
  certifications: string[];
  minPrice: string;
  maxPrice: string;
  savedOnly: boolean;
}

export type SubscriptionFrequency = 'monthly' | 'quarterly' | 'annually';

export interface SubscriptionOptionConfig {
  id: SubscriptionFrequency;
  label: string;
  intervalText: string;
  bonusDiscountPct: number;
}

export const SUBSCRIPTION_OPTIONS: SubscriptionOptionConfig[] = [
  { id: 'monthly', label: 'Monthly', intervalText: 'Every month', bonusDiscountPct: 0 },
  { id: 'quarterly', label: 'Quarterly', intervalText: 'Every 3 months', bonusDiscountPct: 5 },
  { id: 'annually', label: 'Annually', intervalText: 'Every 12 months', bonusDiscountPct: 10 },
];

export function getSubscriptionDiscountPct(
  baseAutoShipPct: number,
  frequency: SubscriptionFrequency = 'monthly'
): number {
  const option =
    SUBSCRIPTION_OPTIONS.find((item) => item.id === frequency) || SUBSCRIPTION_OPTIONS[0];
  return Math.min(50, baseAutoShipPct + option.bonusDiscountPct);
}

export function getSubscriptionPriceSgd(
  basePriceSgd: number,
  baseAutoShipPct: number,
  frequency: SubscriptionFrequency = 'monthly'
): number {
  const discountPct = getSubscriptionDiscountPct(baseAutoShipPct, frequency);
  return Number((basePriceSgd * (1 - discountPct / 100)).toFixed(2));
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  purchaseType: 'one-time' | 'autoship';
  subscriptionFrequency?: SubscriptionFrequency;
}

export interface OrderRecord {
  orderNumber: string;
  date: string;
  itemsCount: number;
  totalSgd: number;
  status: string;
  recipientName: string;
  address: string;
}
