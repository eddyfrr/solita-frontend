"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { getServices, deleteService, deleteServiceStyle } from "@/lib/api";

interface StyleImage {
  id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

interface Style {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_from: string;
  vip_price: string | null;
  duration: string;
  image_url: string | null;
  images?: StyleImage[];
  lengths: string[];
  colors: string[];
  types: string[];
  is_active: boolean;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  styles: Style[];
  style_count: number;
  is_active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDeleteService = async (slug: string, name: string) => {
    if (!confirm(`Delete service "${name}" and all its styles?`)) return;
    try {
      await deleteService(slug);
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStyle = async (serviceSlug: string, styleSlug: string, name: string) => {
    if (!confirm(`Delete style "${name}"?`)) return;
    try {
      await deleteServiceStyle(serviceSlug, styleSlug);
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: "#999" }}>
          {services.length} service{services.length !== 1 ? "s" : ""}
        </p>
        <a
          href="/admin/services/new"
          className="flex items-center gap-2 uppercase transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#8B5E3C",
            color: "#fff",
            padding: "9px 20px",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            borderRadius: 6,
          }}
        >
          <Plus className="h-4 w-4" />
          Add Service
        </a>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Loading...</div>
      ) : services.length === 0 ? (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            border: "1px solid #eee",
            padding: 40,
            textAlign: "center",
            color: "#ccc",
            fontSize: 14,
          }}
        >
          No services yet. Add your first service!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((service) => {
            const isExpanded = expanded === service.slug;
            return (
              <div
                key={service.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  border: "1px solid #eee",
                  overflow: "hidden",
                }}
              >
                {/* Service header */}
                <div
                  className="flex items-center justify-between"
                  style={{ padding: "14px 20px" }}
                >
                  <div className="flex items-center gap-4">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.name}
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                      />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "#f0f0f0" }} />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 16, fontWeight: 500, color: "#282828" }}>
                          {service.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            padding: "2px 8px",
                            borderRadius: 4,
                            backgroundColor: service.is_active ? "#d1fae5" : "#fee2e2",
                            color: service.is_active ? "#065f46" : "#991b1b",
                          }}
                        >
                          {service.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <span style={{ fontSize: 13, color: "#999" }}>
                        {service.style_count} style{service.style_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/admin/services/${service.slug}`}
                      style={{ padding: 6, display: "inline-flex" }}
                    >
                      <Pencil className="h-4 w-4 text-gray-400" />
                    </a>
                    <button
                      onClick={() => handleDeleteService(service.slug, service.name)}
                      style={{ padding: 6, border: "none", cursor: "pointer", background: "none" }}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : service.slug)}
                      style={{ padding: 6, border: "none", cursor: "pointer", background: "none" }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Styles list */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #f0f0f0" }}>
                    {service.styles.length === 0 ? (
                      <div style={{ padding: "20px", textAlign: "center", color: "#ccc", fontSize: 13 }}>
                        No styles yet
                      </div>
                    ) : (
                      service.styles.map((style) => (
                        <div
                          key={style.id}
                          className="flex items-center justify-between"
                          style={{
                            padding: "10px 20px 10px 36px",
                            borderBottom: "1px solid #f8f8f8",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {style.image_url ? (
                              <img
                                src={style.image_url}
                                alt={style.name}
                                style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }}
                              />
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: "#f5f5f5" }} />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span style={{ fontSize: 14, fontWeight: 500, color: "#282828" }}>{style.name}</span>
                                {style.vip_price && (
                                  <span
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      letterSpacing: "0.15em",
                                      padding: "2px 7px",
                                      borderRadius: 999,
                                      backgroundColor: "#8B5E3C",
                                      color: "#fff",
                                    }}
                                  >
                                    VIP
                                  </span>
                                )}
                                {style.images && style.images.length > 0 && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 600,
                                      padding: "2px 7px",
                                      borderRadius: 4,
                                      backgroundColor: "#FDF5ED",
                                      border: "1px solid #E8D5C4",
                                      color: "#5C3D28",
                                    }}
                                    title={`${style.images.length + 1} images including the cover`}
                                  >
                                    +{style.images.length} pics
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: "#999" }}>
                                From ${style.price_from}
                                {style.vip_price && (
                                  <>
                                    {" · VIP "}
                                    <span style={{ color: "#8B5E3C", fontWeight: 500 }}>${style.vip_price}</span>
                                  </>
                                )}
                                {" · "}{style.duration}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <a
                              href={`/admin/services/${service.slug}/styles/${style.slug}`}
                              style={{ padding: 6, display: "inline-flex" }}
                              title="Edit style"
                            >
                              <Pencil className="h-3.5 w-3.5 text-gray-400" />
                            </a>
                            <button
                              onClick={() => handleDeleteStyle(service.slug, style.slug, style.name)}
                              style={{ padding: 6, border: "none", cursor: "pointer", background: "none" }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    <div style={{ padding: "10px 20px 10px 36px" }}>
                      <a
                        href={`/admin/services/${service.slug}/add-style`}
                        className="flex items-center gap-1.5 text-[#8B5E3C] hover:underline"
                        style={{ fontSize: 13 }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Style
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
