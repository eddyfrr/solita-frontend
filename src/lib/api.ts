const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000/api`
    : "http://localhost:8000/api");

// ── Token management ──

function getTokens() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("admin-tokens");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { access: string; refresh: string };
  } catch {
    return null;
  }
}

function saveTokens(tokens: { access: string; refresh: string }) {
  localStorage.setItem("admin-tokens", JSON.stringify(tokens));
}

function clearTokens() {
  localStorage.removeItem("admin-tokens");
  localStorage.removeItem("admin-user");
}

// ── Fetch wrapper ──

async function apiFetch(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> {
  const tokens = getTokens();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (tokens?.access) {
    headers["Authorization"] = `Bearer ${tokens.access}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // If 401 and we have a refresh token, try to refresh
  if (res.status === 401 && tokens?.refresh && retry) {
    const refreshRes = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      saveTokens({ access: data.access, refresh: tokens.refresh });
      return apiFetch(path, options, false);
    } else {
      clearTokens();
      window.location.href = "/admin/login";
      return res;
    }
  }

  return res;
}

// ── Auth ──

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Login failed");
  }
  const data = await res.json();
  saveTokens(data.tokens);
  localStorage.setItem("admin-user", JSON.stringify(data.user));
  return data;
}

export function logout() {
  clearTokens();
  window.location.href = "/admin/login";
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("admin-user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getTokens()?.access;
}

// ── Dashboard ──

export async function getDashboardStats() {
  const res = await apiFetch("/dashboard/stats/");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

// ── Products ──

export async function getProducts(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await apiFetch(`/products/${query}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProduct(slug: string) {
  const res = await apiFetch(`/products/${slug}/`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export async function createProduct(data: FormData | Record<string, unknown>) {
  const isForm = data instanceof FormData;
  const res = await apiFetch("/products/", {
    method: "POST",
    body: isForm ? data : JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(slug: string, data: FormData | Record<string, unknown>) {
  const isForm = data instanceof FormData;
  const res = await apiFetch(`/products/${slug}/`, {
    method: "PATCH",
    body: isForm ? data : JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(slug: string) {
  const res = await apiFetch(`/products/${slug}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
}

// ── Categories ──

export async function getCategories() {
  const res = await apiFetch("/categories/");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function createCategory(data: Record<string, unknown>) {
  const res = await apiFetch("/categories/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

// ── Services ──

export async function getServices() {
  const res = await apiFetch("/services/");
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

export async function getService(slug: string) {
  const res = await apiFetch(`/services/${slug}/`);
  if (!res.ok) throw new Error("Service not found");
  return res.json();
}

export async function createService(data: FormData | Record<string, unknown>) {
  const isForm = data instanceof FormData;
  const res = await apiFetch("/services/", {
    method: "POST",
    body: isForm ? data : JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create service");
  return res.json();
}

export async function updateService(slug: string, data: FormData | Record<string, unknown>) {
  const isForm = data instanceof FormData;
  const res = await apiFetch(`/services/${slug}/`, {
    method: "PATCH",
    body: isForm ? data : JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update service");
  return res.json();
}

export async function deleteService(slug: string) {
  const res = await apiFetch(`/services/${slug}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete service");
}

// ── Service Styles ──

export async function getServiceStyle(serviceSlug: string, styleSlug: string) {
  const res = await apiFetch(`/services/${serviceSlug}/styles/${styleSlug}/`);
  if (!res.ok) throw new Error("Style not found");
  return res.json();
}

export async function createServiceStyle(serviceSlug: string, data: FormData | Record<string, unknown>) {
  const isForm = data instanceof FormData;
  const res = await apiFetch(`/services/${serviceSlug}/styles/`, {
    method: "POST",
    body: isForm ? data : JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = typeof err === "object" ? Object.values(err).flat().join(", ") : "Failed to create style";
    throw new Error(detail || "Failed to create style");
  }
  return res.json();
}

export async function updateServiceStyle(serviceSlug: string, styleSlug: string, data: FormData | Record<string, unknown>) {
  const isForm = data instanceof FormData;
  const res = await apiFetch(`/services/${serviceSlug}/styles/${styleSlug}/`, {
    method: "PATCH",
    body: isForm ? data : JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update style");
  return res.json();
}

export async function deleteServiceStyle(serviceSlug: string, styleSlug: string) {
  const res = await apiFetch(`/services/${serviceSlug}/styles/${styleSlug}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete style");
}

// ── Service Style Images (multi-image carousel) ──

export async function uploadServiceStyleImage(
  serviceSlug: string,
  styleSlug: string,
  data: FormData,
) {
  const res = await apiFetch(`/services/${serviceSlug}/styles/${styleSlug}/images/`, {
    method: "POST",
    body: data,
  });
  if (!res.ok) throw new Error("Failed to upload style image");
  return res.json();
}

export async function deleteServiceStyleImage(
  serviceSlug: string,
  styleSlug: string,
  imageId: number,
) {
  const res = await apiFetch(
    `/services/${serviceSlug}/styles/${styleSlug}/images/${imageId}/`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error("Failed to delete style image");
}

// ── Product Images (multi-image carousel) ──

export async function uploadProductImage(productSlug: string, data: FormData) {
  const res = await apiFetch(`/products/${productSlug}/images/`, {
    method: "POST",
    body: data,
  });
  if (!res.ok) throw new Error("Failed to upload product image");
  return res.json();
}

export async function deleteProductImage(productSlug: string, imageId: number) {
  const res = await apiFetch(`/products/${productSlug}/images/${imageId}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product image");
}

// ── Bookings ──

export async function getBookings(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await apiFetch(`/bookings/${query}`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export interface DayAvailability {
  date: string;
  max_per_day: number;
  booked: number;
  remaining: number;
  is_full: boolean;
  slot_labels: Record<string, string>;
  slot_counts: Record<string, number>;
}

export async function getAvailability(date: string): Promise<DayAvailability> {
  const res = await fetch(`${API_BASE}/bookings/availability/?date=${encodeURIComponent(date)}`);
  if (!res.ok) throw new Error("Failed to fetch availability");
  return res.json();
}

export async function createBooking(data: Record<string, unknown>) {
  const res = await apiFetch("/bookings/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}

export async function confirmBooking(id: number) {
  const res = await apiFetch(`/bookings/${id}/confirm/`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to confirm booking");
  return res.json();
}

export async function cancelBooking(id: number) {
  const res = await apiFetch(`/bookings/${id}/cancel/`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to cancel booking");
  return res.json();
}

export async function completeBooking(id: number) {
  const res = await apiFetch(`/bookings/${id}/complete/`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to complete booking");
  return res.json();
}

export async function markBookingPaid(id: number) {
  const res = await apiFetch(`/bookings/${id}/mark_paid/`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to mark as paid");
  return res.json();
}

// ── Orders ──

export async function getOrders() {
  const res = await apiFetch("/orders/");
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function updateOrderStatus(id: number, status: string) {
  const res = await apiFetch(`/orders/${id}/update_status/`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}
