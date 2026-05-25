"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  Scissors,
} from "lucide-react";
import { getDashboardStats } from "@/lib/api";

interface Stats {
  todays_bookings: number;
  pending_bookings: number;
  monthly_bookings: number;
  monthly_orders: number;
  monthly_revenue: number;
  total_products: number;
  total_services: number;
  recent_bookings: Array<{
    id: number;
    client_name: string;
    service_name: string;
    style_name: string;
    date: string;
    time: string;
    status: string;
  }>;
  recent_orders: Array<{
    id: number;
    customer_name: string;
    total: string;
    status: string;
    created_at: string;
  }>;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dbeafe", text: "#1e40af" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
  processing: { bg: "#e0e7ff", text: "#3730a3" },
  shipped: { bg: "#dbeafe", text: "#1e40af" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          padding: "40px",
          textAlign: "center",
          color: "#999",
        }}
      >
        <p style={{ marginBottom: 8 }}>Could not load dashboard stats.</p>
        <p style={{ fontSize: 13, color: "#ccc" }}>{error}</p>
        <p style={{ fontSize: 13, color: "#ccc", marginTop: 12 }}>
          Make sure the Django backend is running at localhost:8000
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
        Loading dashboard...
      </div>
    );
  }

  const cards = [
    {
      label: "Today's Bookings",
      value: stats.todays_bookings,
      icon: CalendarCheck,
      color: "#8B5E3C",
    },
    {
      label: "Pending Bookings",
      value: stats.pending_bookings,
      icon: Clock,
      color: "#d97706",
    },
    {
      label: "Monthly Revenue",
      value: `$${stats.monthly_revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "#059669",
    },
    {
      label: "Monthly Orders",
      value: stats.monthly_orders,
      icon: Package,
      color: "#6366f1",
    },
    {
      label: "Active Products",
      value: stats.total_products,
      icon: ShoppingBag,
      color: "#ec4899",
    },
    {
      label: "Active Services",
      value: stats.total_services,
      icon: Scissors,
      color: "#0ea5e9",
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: "20px 16px",
                border: "1px solid #eee",
              }}
            >
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: card.color + "15",
                  }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: card.color }}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#282828", marginBottom: 4 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: "#999" }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            border: "1px solid #eee",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#282828" }}>
              Recent Bookings
            </h2>
            <a href="/admin/bookings" style={{ fontSize: 12, color: "#8B5E3C" }}>
              View all
            </a>
          </div>
          {stats.recent_bookings.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#ccc", fontSize: 13 }}>
              No bookings today
            </div>
          ) : (
            <div>
              {stats.recent_bookings.map((booking) => {
                const sc = statusColors[booking.status] || statusColors.pending;
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between"
                    style={{ padding: "12px 20px", borderBottom: "1px solid #f8f8f8" }}
                  >
                    <div>
                      <div style={{ fontSize: 14, color: "#282828", fontWeight: 500 }}>
                        {booking.client_name}
                      </div>
                      <div style={{ fontSize: 12, color: "#999" }}>
                        {booking.service_name} — {booking.style_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          padding: "3px 8px",
                          borderRadius: 4,
                          backgroundColor: sc.bg,
                          color: sc.text,
                          textTransform: "capitalize",
                        }}
                      >
                        {booking.status}
                      </span>
                      <div style={{ fontSize: 11, color: "#ccc", marginTop: 4 }}>
                        {booking.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            border: "1px solid #eee",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#282828" }}>
              Recent Orders
            </h2>
            <a href="/admin/orders" style={{ fontSize: 12, color: "#8B5E3C" }}>
              View all
            </a>
          </div>
          {stats.recent_orders.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#ccc", fontSize: 13 }}>
              No orders yet
            </div>
          ) : (
            <div>
              {stats.recent_orders.map((order) => {
                const sc = statusColors[order.status] || statusColors.pending;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                    style={{ padding: "12px 20px", borderBottom: "1px solid #f8f8f8" }}
                  >
                    <div>
                      <div style={{ fontSize: 14, color: "#282828", fontWeight: 500 }}>
                        Order #{order.id}
                      </div>
                      <div style={{ fontSize: 12, color: "#999" }}>
                        {order.customer_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#282828" }}>
                        ${order.total}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          padding: "3px 8px",
                          borderRadius: 4,
                          backgroundColor: sc.bg,
                          color: sc.text,
                          textTransform: "capitalize",
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
