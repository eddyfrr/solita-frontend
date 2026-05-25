"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "@/lib/api";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  status: string;
  subtotal: string;
  shipping_cost: string;
  total: string;
  is_paid: boolean;
  items: OrderItem[];
  created_at: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  processing: { bg: "#e0e7ff", text: "#3730a3" },
  shipped: { bg: "#dbeafe", text: "#1e40af" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
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
        ) : orders.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#ccc", fontSize: 14 }}>
            No orders yet
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee", backgroundColor: "#fafafa" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Order</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Customer</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Items</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Total</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const sc = statusColors[order.status] || statusColors.pending;
                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: "#282828" }}>
                        #{order.id}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ color: "#282828" }}>{order.customer_name}</div>
                        <div style={{ fontSize: 12, color: "#999" }}>{order.customer_phone}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#686868", fontSize: 13 }}>
                        {order.items.map((item) => (
                          <div key={item.id}>
                            {item.product_name} x{item.quantity}
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: "#8B5E3C" }}>
                        ${order.total}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            padding: "4px 8px",
                            borderRadius: 4,
                            backgroundColor: sc.bg,
                            color: sc.text,
                            border: "none",
                            cursor: "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#999", fontSize: 13 }}>
                        {new Date(order.created_at).toLocaleDateString()}
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
