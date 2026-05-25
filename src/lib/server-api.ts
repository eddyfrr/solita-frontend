const API_BASE =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

async function fetchAPI<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 10 }, // revalidate every 10s — admin changes appear quickly
    });
    if (!res.ok) return null;
    const data = await res.json();
    // DRF pagination wraps results
    return data.results !== undefined ? data.results : data;
  } catch {
    return null;
  }
}

// ── Products ──

export interface APIProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_at_price: string | null;
  category: { id: number; name: string; slug: string } | null;
  image_url: string | null;
  images: { id: number; image_url: string; alt_text: string; is_primary: boolean }[];
  is_active: boolean;
  is_featured: boolean;
  in_stock: boolean;
  stock_quantity: number;
}

export async function getAPIProducts(params?: Record<string, string>): Promise<APIProduct[]> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return (await fetchAPI<APIProduct[]>(`/products/${query}`)) || [];
}

export async function getAPIProduct(slug: string): Promise<APIProduct | null> {
  return fetchAPI<APIProduct>(`/products/${slug}/`);
}

export async function getAPIFeaturedProducts(): Promise<APIProduct[]> {
  return getAPIProducts({ featured: "true" });
}

// ── Categories ──

export interface APICategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_count: number;
}

export async function getAPICategories(): Promise<APICategory[]> {
  return (await fetchAPI<APICategory[]>("/categories/")) || [];
}

// ── Services ──

export interface APIServiceStyleImage {
  id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface APIServiceStyle {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_from: string;
  vip_price: string | null;
  duration: string;
  image_url: string | null;
  images: APIServiceStyleImage[];
  lengths: string[];
  colors: string[];
  types: string[];
  is_active: boolean;
}

export interface APIService {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  styles: APIServiceStyle[];
  style_count: number;
  is_active: boolean;
}

export async function getAPIServices(): Promise<APIService[]> {
  return (await fetchAPI<APIService[]>("/services/")) || [];
}

export async function getAPIService(slug: string): Promise<APIService | null> {
  return fetchAPI<APIService>(`/services/${slug}/`);
}

// ── Gallery ──

export interface APIGalleryPhoto {
  id: number;
  image_url: string;
  caption: string;
  is_active: boolean;
}

export async function getAPIGalleryPhotos(): Promise<APIGalleryPhoto[]> {
  return (await fetchAPI<APIGalleryPhoto[]>("/gallery/")) || [];
}
