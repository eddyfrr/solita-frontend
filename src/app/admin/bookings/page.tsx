"use client";

import { useEffect, useState } from "react";
import { Check, X, Clock, CheckCircle } from "lucide-react";
import { getBookings, confirmBooking, cancelBooking, completeBooking, markBookingPaid } from "@/lib/api";

interface Booking {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  notes: string;
  service_name: string;
  style_name: string;
  selected_length: string;
  selected_color: string;
  selected_type: string;
  date: string;
  time: string;
  price: string;
  status: string;
  payment_method: string;
  is_paid: boolean;
  created_at: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dbeafe", text: "#1e40af" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const params: Record<string, string> = {};
      if (filter !== "all") params.status = filter;
      const data = await getBookings(params);
      setBookings(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const handleAction = async (id: number, action: "confirm" | "cancel" | "complete" | "paid") => {
    try {
      if (action === "confirm") await confirmBooking(id);
      if (action === "cancel") await cancelBooking(id);
      if (action === "complete") await completeBooking(id);
      if (action === "paid") await markBookingPaid(id);
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const filters = ["all", "pending", "confirmed", "completed", "cancelled"];

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Filters */}
      <div className="flex flex-wrap gap-2" style={{ marginBottom: 20 }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 16px",
              fontSize: 13,
              borderRadius: 6,
              border: filter === f ? "1px solid #8B5E3C" : "1px solid #ddd",
              backgroundColor: filter === f ? "#8B5E3C" : "#fff",
              color: filter === f ? "#fff" : "#686868",
              cursor: "pointer",
              textTransform: "capitalize",
              fontWeight: filter === f ? 500 : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          border: "1px solid #eee",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Loading...</div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#ccc", fontSize: 14 }}>
            No bookings found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee", backgroundColor: "#fafafa" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Client</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Service</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Date & Time</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Options</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Price</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Paid</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 500, color: "#686868", fontSize: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const sc = statusColors[b.status] || statusColors.pending;
                  const options = [b.selected_length, b.selected_color, b.selected_type].filter(Boolean).join(", ");
                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 500, color: "#282828" }}>{b.client_name}</div>
                        <div style={{ fontSize: 12, color: "#999" }}>{b.client_phone}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#282828" }}>
                        <div>{b.service_name}</div>
                        <div style={{ fontSize: 12, color: "#999" }}>{b.style_name}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#282828" }}>
                        <div>{b.date}</div>
                        <div style={{ fontSize: 12, color: "#999" }}>{b.time}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#686868", fontSize: 13 }}>
                        {options || "—"}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: "#8B5E3C" }}>
                        ${b.price}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            padding: "3px 10px",
                            borderRadius: 4,
                            backgroundColor: sc.bg,
                            color: sc.text,
                            textTransform: "capitalize",
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {b.is_paid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-400" />
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="flex items-center justify-end gap-1">
                          {b.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(b.id, "confirm")}
                                title="Confirm"
                                className="hover:bg-green-50 transition-colors"
                                style={{ padding: 6, borderRadius: 4, border: "none", cursor: "pointer", background: "none" }}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => handleAction(b.id, "cancel")}
                                title="Cancel"
                                className="hover:bg-red-50 transition-colors"
                                style={{ padding: 6, borderRadius: 4, border: "none", cursor: "pointer", background: "none" }}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </button>
                            </>
                          )}
                          {b.status === "confirmed" && (
                            <button
                              onClick={() => handleAction(b.id, "complete")}
                              title="Mark Complete"
                              className="hover:bg-green-50 transition-colors"
                              style={{ padding: 6, borderRadius: 4, border: "none", cursor: "pointer", background: "none" }}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </button>
                          )}
                          {!b.is_paid && b.status !== "cancelled" && (
                            <button
                              onClick={() => handleAction(b.id, "paid")}
                              title="Mark Paid"
                              style={{
                                padding: "4px 8px",
                                fontSize: 11,
                                borderRadius: 4,
                                border: "1px solid #ddd",
                                cursor: "pointer",
                                background: "#fff",
                                color: "#059669",
                                fontWeight: 500,
                              }}
                            >
                              $
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
