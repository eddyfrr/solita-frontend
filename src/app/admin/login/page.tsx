"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#f8f7f4]"
      style={{ fontFamily: "var(--font-jost), Jost, sans-serif" }}
    >
      <div
        className="w-full max-w-[400px]"
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: "48px 36px",
          boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          className="text-center"
          style={{ fontSize: 28, fontWeight: 500, color: "#282828", marginBottom: 8 }}
        >
          Admin Dashboard
        </h1>
        <p
          className="text-center"
          style={{ fontSize: 14, color: "#999", marginBottom: 32 }}
        >
          Sign in to manage your business
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              fontSize: 13,
              padding: "10px 14px",
              borderRadius: 6,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                fontSize: 15,
                border: "1px solid #ddd",
                borderRadius: 6,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label
              style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                fontSize: 15,
                border: "1px solid #ddd",
                borderRadius: 6,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "#8B5E3C",
              color: "#fff",
              padding: "13px 20px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
