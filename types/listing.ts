export type DealType = 'sale' | 'rent';
// 'dacha' is the summer house sellers in Kyrgyzstan call дача (Turkish: yazlık ev, kır evi, bağ evi).
export type PropertyType = 'apartment' | 'house' | 'dacha' | 'land' | 'commercial';
// The 15 cities the feed covers, ordered roughly by market size (see constants/cities.ts).
export type City =
  | 'Bişkek'
  | 'Oş'
  | 'Celalabad'
  | 'Karakol'
  | 'Tokmok'
  | 'Narın'
  | 'Talas'
  | 'Batken'
  | 'Kara-Balta'
  | 'Kant'
  | 'Çolpon-Ata'
  | 'Uzgen'
  | 'Bazar-Korgon'
  | 'Sülüktü'
  | 'Kızıl-Kiya';
// Renovation state. 'pso' = "под самоотделку": bare shell, the buyer finishes it.
export type Condition = 'euro' | 'good' | 'cosmetic' | 'pso';
// Title papers. 'redBook' = "красная книга" (registered title deed), 'ddu' = pre-sale
// contract with a developer, 'none' = nothing registered yet.
export type Documents = 'redBook' | 'ddu' | 'none';
// Bishkek buildings are known by their series; houses are usually individual projects.
export type Series = '104' | '105' | '106' | 'elite' | 'khrushchevka' | 'stalinka' | 'individual';
export type SellerType = 'owner' | 'agent';

export interface VideoSource {
  uri: string;
  mime: string; // e.g. 'video/webm', 'video/mp4', 'video/quicktime'
}

// One page of a listing's gallery: a photo, or a short (<= 40 s) video.
// For videos, `uri` is the poster frame shown while loading.
export interface Photo {
  uri: string;
  video?: VideoSource[];
  // Portrait (9:16) media fills the whole screen like a reel instead of being letterboxed.
  fullBleed?: boolean;
  // Credit fields are only needed for licensed stock photos (demo data).
  author?: string;
  license?: string;
  source?: string;
}

// Field names map 1:1 to the planned Supabase `listings` table (snake_case there).
export interface Listing {
  id: string;
  dealType: DealType;
  type: PropertyType;
  rooms: number; // 0 for land and studios
  areaM2: number; // living area; for land it is the plot in m²
  landSotka?: number; // plot size in "сотки" (100 m²) for houses, dachas and land
  floor?: number; // apartments and commercial
  totalFloors?: number;
  yearBuilt?: number;
  series?: Series;
  condition: Condition;
  documents: Documents;
  furnished: boolean;
  priceUsd: number; // per month for rentals
  oldPriceUsd?: number; // set when the seller lowered the price
  city: City;
  district: string; // kept in Russian, the language street names are known by
  views: number;
  likes: number;
  photos: Photo[];
  sellerName: string;
  sellerType: SellerType;
  sellerPhone: string; // E.164, e.g. +996555123456
  whatsappPhone: string;
  createdAt: string;
  // Admin panel fields (undefined on demo rows = active + paid).
  status?: ListingStatus;
  paid?: boolean;
  paymentCode?: string;
  paidAt?: string;
}

// Admin-controlled publication state. Legacy/demo rows leave the optional fields
// undefined and are treated as active + paid (see utils/listingStatus.ts).
export type ListingStatus = 'active' | 'inactive';

export type PriceRangeId = 'all' | 'low' | 'mid' | 'high';
export type RoomsFilter = 'all' | '1' | '2' | '3' | '4+';

export interface ListingFilters {
  dealType: DealType;
  type: PropertyType | null;
  city: City | null; // null = all of Kyrgyzstan
  rooms: RoomsFilter;
  priceRange: PriceRangeId;
  onlyNew: boolean; // listed in the last 24 h, or price lowered
}
