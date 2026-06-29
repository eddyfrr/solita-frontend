"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Scissors,
  CalendarCheck,
  Package,
  Image as ImageIcon,
  Home,
  LogOut,
  X,
} from "lucide-react";
import { logout } from "@/lib/api";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Homepage", href: "/admin/homepage", icon: Home },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Services", href: "/admin/services", icon: Scissors },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { name: "Orders", href: "/admin/orders", icon: Package },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
];

export function AdminSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const sidebar = (
    <div
      className="flex h-full flex-col"
      style={{
        width: 250,
        backgroundColor: "#1a1a1a",
        fontFamily: "var(--font-jost), Jost, sans-serif",
      }}
    >
      {/* Logo area */}
      <div
        className="flex items-center justify-between px-5"
        style={{ height: 70, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Link href="/admin" onClick={onClose}>
          <span style={{ fontSize: 18, fontWeight: 500, color: "#c9b96c" }}>
            Solita Admin
          </span>
        </Link>
        <button className="text-white/50 lg:hidden" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 transition-colors"
              style={{
                padding: "11px 20px",
                fontSize: 14,
                color: active ? "#c9b96c" : "rgba(255,255,255,0.6)",
                backgroundColor: active ? "rgba(201,185,108,0.1)" : "transparent",
                borderLeft: active ? "3px solid #c9b96c" : "3px solid transparent",
              }}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 20px" }}>
        <Link
          href="/"
          className="block text-white/40 hover:text-white/60 transition-colors"
          style={{ fontSize: 12, marginBottom: 10 }}
        >
          View Website
        </Link>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors"
          style={{ fontSize: 13, background: "none", border: "none", cursor: "pointer" }}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen fixed left-0 top-0 z-50">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full">{sidebar}</div>
        </div>
      )}
    </>
  );
}
