"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { isAuthenticated, getUser } from "@/lib/api";

const noSubscribe = () => () => {};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Tokens live in localStorage: false on the server and during hydration,
  // the real answer right after.
  const ready = useSyncExternalStore(noSubscribe, isAuthenticated, () => false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check storage directly: `ready` is still false during the hydration pass.
    if (!isAuthenticated()) router.push("/admin/login");
  }, [router]);

  if (!ready) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#f5f5f0]"
        style={{ fontFamily: "var(--font-jost), Jost, sans-serif" }}
      >
        <p style={{ color: "#999", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  const user = getUser();

  // Get page title from pathname
  const getTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    const segment = pathname.split("/admin/")[1]?.split("/")[0];
    if (!segment) return "Dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <div
      className="flex min-h-screen bg-[#f5f5f0]"
      style={{ fontFamily: "var(--font-jost), Jost, sans-serif" }}
    >
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="flex-1 lg:ml-[250px]">
        {/* Top bar */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between bg-white px-5"
          style={{
            height: 60,
            borderBottom: "1px solid #eee",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="text-[#282828] lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 500, color: "#282828" }}>
              {getTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#8B5E3C",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {(user?.username || "A").charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline" style={{ fontSize: 13, color: "#686868" }}>
              {user?.username || "Admin"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: "24px 20px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
