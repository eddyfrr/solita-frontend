"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Clock, Calendar, User, CreditCard } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCurrency } from "@/context/CurrencyContext";
import { getServiceBySlug, getStyleBySlug } from "@/data/services";

type Step = "options" | "datetime" | "details" | "payment" | "confirmed";

interface StyleData {
  slug: string;
  name: string;
  description: string;
  price: string;
  priceRaw: string; // for currency conversion (no $ prefix for TZS)
  duration: string;
  imageUrl: string;
  options?: {
    lengths?: string[];
    colors?: string[];
    types?: string[];
  };
}

interface ServiceData {
  slug: string;
  name: string;
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ serviceSlug: string; styleSlug: string }>;
}) {
  const { serviceSlug, styleSlug } = use(params);
  const searchParams = useSearchParams();
  const isVip = searchParams.get("tier") === "vip";
  const { formatPrice, convertTZS, currency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceData | null>(null);
  const [style, setStyle] = useState<StyleData | null>(null);

  const [step, setStep] = useState<Step>("options");

  // Options state
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // DateTime state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availability, setAvailability] = useState<{
    booked: number;
    remaining: number;
    isFull: boolean;
    slotCounts: Record<string, number>;
  } | null>(null);
  const [availLoading, setAvailLoading] = useState(false);

  // Convert "9:00 AM" → "09:00" for the API.
  const to24h = (t: string) => {
    const [time, period] = t.split(" ");
    const [hStr, min] = time.split(":");
    let h = parseInt(hStr);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${min}`;
  };

  // Details state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    // Prefer API data — that's what the public services page renders, and what
    // the admin uploads to. Fall back to the static mock only when the API is
    // unreachable or has no matching style.
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:8000/api`;

    const loadFromStatic = () => {
      const staticService = getServiceBySlug(serviceSlug);
      const staticStyle = staticService ? getStyleBySlug(serviceSlug, styleSlug) : undefined;
      if (staticService && staticStyle) {
        setService({ slug: staticService.slug, name: staticService.name });
        const activePrice = isVip && staticStyle.vipPrice ? staticStyle.vipPrice : staticStyle.price;
        setStyle({
          slug: staticStyle.slug,
          name: staticStyle.name,
          description: staticStyle.description,
          price: activePrice,
          priceRaw: activePrice,
          duration: staticStyle.duration,
          imageUrl: staticStyle.imageUrl,
          options: staticStyle.options,
        });
        return true;
      }
      return false;
    };

    fetch(`${API_BASE}/services/${serviceSlug}/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const apiStyle = data?.styles?.find((s: { slug: string }) => s.slug === styleSlug);
        if (data && apiStyle) {
          setService({ slug: data.slug, name: data.name });
          const priceRaw =
            isVip && apiStyle.vip_price != null
              ? String(apiStyle.vip_price)
              : String(apiStyle.price_from);
          setStyle({
            slug: apiStyle.slug,
            name: apiStyle.name,
            description: apiStyle.description || "",
            price: `TSh${Number(priceRaw).toLocaleString()}`,
            priceRaw,
            duration: apiStyle.duration,
            imageUrl: apiStyle.image_url || "/images/products/french-curls-honey-cocoa.jpg",
            options: {
              lengths: apiStyle.lengths?.length > 0 ? apiStyle.lengths : undefined,
              colors: apiStyle.colors?.length > 0 ? apiStyle.colors : undefined,
              types: apiStyle.types?.length > 0 ? apiStyle.types : undefined,
            },
          });
        } else {
          loadFromStatic();
        }
        setLoading(false);
      })
      .catch(() => {
        loadFromStatic();
        setLoading(false);
      });
  }, [serviceSlug, styleSlug, isVip]);

  // Refresh capacity whenever the date changes.
  useEffect(() => {
    if (!selectedDate) {
      setAvailability(null);
      return;
    }
    setAvailLoading(true);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:8000/api`;
    fetch(`${API_BASE}/bookings/availability/?date=${selectedDate}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.booked === "number") {
          setAvailability({
            booked: data.booked,
            remaining: data.remaining,
            isFull: data.is_full,
            slotCounts: data.slot_counts || {},
          });
          // If the user already picked a time that's now full, clear it.
          if (selectedTime) {
            const k = to24h(selectedTime) + ":00";
            if ((data.slot_counts?.[k] ?? 0) >= data.max_per_day) setSelectedTime("");
          }
        } else {
          setAvailability(null);
        }
      })
      .catch(() => setAvailability(null))
      .finally(() => setAvailLoading(false));
    // selectedTime is intentionally excluded — we only refetch when the date changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  if (loading) {
    return (
      <>
        <Header />
        <main
          className="flex-1 flex items-center justify-center"
          style={{ paddingTop: 120, paddingBottom: 80, minHeight: "60vh", fontFamily: "var(--font-jost), Jost, sans-serif", backgroundColor: "#FDFAF6" }}
        >
          <p style={{ color: "#999" }}>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!service || !style) {
    return (
      <>
        <Header />
        <main
          className="flex-1 flex items-center justify-center"
          style={{ paddingTop: 120, paddingBottom: 80, minHeight: "60vh", fontFamily: "var(--font-jost), Jost, sans-serif", backgroundColor: "#FDFAF6" }}
        >
          <div className="text-center">
            <h1 style={{ fontSize: 24, color: "#282828", marginBottom: 12 }}>Service not found</h1>
            <Link href="/services" className="text-[#8B5E3C] hover:underline">
              Browse all services
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const hasOptions = style.options && (style.options.lengths || style.options.colors || style.options.types);

  const steps: { key: Step; label: string; icon: typeof Check }[] = [
    ...(hasOptions ? [{ key: "options" as Step, label: "Options", icon: Check }] : []),
    { key: "datetime", label: "Date & Time", icon: Calendar },
    { key: "details", label: "Your Details", icon: User },
    { key: "payment", label: "Payment", icon: CreditCard },
  ];

  // If no options, treat current step as datetime
  const activeStep = (!hasOptions && step === "options") ? "datetime" : step;

  const currentStepIndex = steps.findIndex((s) => s.key === activeStep);

  const canProceedFromOptions = () => {
    if (!hasOptions) return true;
    const opts = style.options!;
    if (opts.lengths && !selectedLength) return false;
    if (opts.colors && !selectedColor) return false;
    if (opts.types && !selectedType) return false;
    return true;
  };

  const canProceedFromDatetime = () =>
    selectedDate !== "" && selectedTime !== "" && !availability?.isFull;

  const canProceedFromDetails = () => fullName.trim() !== "" && email.trim() !== "" && phone.trim() !== "";

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex].key);
    }
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    setBookingError("");

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:8000/api`;
    const url = `${API_BASE}/bookings/`;

    const payload = {
      service_slug: serviceSlug,
      style_slug: styleSlug,
      client_name: fullName,
      client_email: email,
      client_phone: phone,
      date: selectedDate,
      time: to24h(selectedTime),
      selected_length: selectedLength || "",
      selected_color: selectedColor || "",
      selected_type: selectedType || "",
      payment_method: paymentMethod,
      checkout_currency: convertTZS(parseFloat(style.priceRaw)).currency,
      notes: notes || "",
    };

    // Debug: show what we're sending
    console.log("[BOOKING] POST", url, JSON.stringify(payload, null, 2));

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[BOOKING] Response status:", res.status);
      const text = await res.text();
      console.log("[BOOKING] Response body:", text);

      let booking;
      try { booking = JSON.parse(text); } catch { booking = {}; }

      if (!res.ok) {
        const errMsg = "Booking failed (" + res.status + "): " + text;
        console.error("[BOOKING]", errMsg);
        setBookingError(errMsg);
        setIsProcessing(false);
        return;
      }

      if (booking.checkout_url) {
        setCheckoutUrl(booking.checkout_url);
        setIsProcessing(false);
        window.location.href = booking.checkout_url;
        return;
      }

      // mpesa/card but no checkout URL — payment gateway failed
      setBookingError(
        "Your booking was saved but we couldn't connect to the payment gateway. " +
        "Please check your phone number includes the country code (e.g. +255745...) and try again."
      );
    } catch (err) {
      const errMsg = "Connection error: " + String(err);
      console.error("[BOOKING]", errMsg);
      setBookingError(errMsg);
    }
    setIsProcessing(false);
  };

  // Solita appointment slots — 4 fixed times per day, capped at 16 clients/day.
  const timeSlots = ["6:30 AM", "8:30 AM", "10:30 AM", "2:00 PM"];

  // Get min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const formattedPrice = formatPrice(style.priceRaw);

  return (
    <>
      <Header />
      <main
        className="flex-1"
        style={{
          paddingTop: 120,
          paddingBottom: 80,
          fontFamily: "var(--font-jost), Jost, sans-serif",
          backgroundColor: "#FAF0E8",
        }}
      >
        <div className="mx-auto max-w-[900px] px-4">
          {/* Back Link */}
          <Link
            href={`/services/${serviceSlug}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-[#8B5E3C]"
            style={{ fontSize: 14, color: "#686868", marginBottom: 24, display: "inline-flex" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {service.name}
          </Link>

          {/* Booking Header */}
          <div
            className="flex flex-col sm:flex-row gap-5 items-start"
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "24px",
              marginBottom: 32,
              border: "1px solid #eee",
            }}
          >
            <div
              className="relative overflow-hidden shrink-0"
              style={{ width: 120, height: 90, borderRadius: 8 }}
            >
              <Image
                src={style.imageUrl}
                alt={style.name}
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
            <div>
              <p style={{ fontSize: 13, color: "#8B5E3C", fontWeight: 500, marginBottom: 4 }}>
                {service.name}
                {isVip && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#fff",
                      backgroundColor: "#8B5E3C",
                      padding: "2px 8px",
                      borderRadius: 999,
                      verticalAlign: "middle",
                    }}
                  >
                    VIP
                  </span>
                )}
              </p>
              <h1 style={{ fontSize: 24, fontWeight: 500, color: "#282828", marginBottom: 6 }}>
                {style.name}
              </h1>
              <div className="flex items-center gap-4" style={{ fontSize: 14, color: "#686868" }}>
                <span style={{ fontWeight: 600, color: "#8B5E3C" }}>From {formattedPrice}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {style.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Redirect */}
          {checkoutUrl && (
            <div
              style={{
                maxWidth: 560,
                margin: "0 auto",
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: "48px 32px",
                border: "1px solid #eee",
                textAlign: "center",
              }}
            >
              <div
                className="mx-auto flex items-center justify-center"
                style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#FDF8F3", marginBottom: 24 }}
              >
                <CreditCard size={28} color="#8B5E3C" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 500, color: "#282828", marginBottom: 12, fontFamily: "var(--font-playfair), Playfair Display, serif" }}>
                Complete Your Payment
              </h2>
              <p style={{ fontSize: 14, color: "#686868", lineHeight: 1.7, marginBottom: 24 }}>
                Your booking has been saved. Click below to pay securely via ClickPesa.
              </p>
              <a
                href={checkoutUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: "#8B5E3C",
                  color: "#fff",
                  padding: "14px 40px",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  marginBottom: 16,
                }}
              >
                Pay Now
              </a>
              <p style={{ fontSize: 12, color: "#999" }}>
                You will be redirected to ClickPesa&apos;s secure checkout.
              </p>
            </div>
          )}

          {/* Confirmed State */}
          {checkoutUrl ? (
            <></>
          ) : activeStep === "confirmed" ? (
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: "48px 32px",
                border: "1px solid #eee",
                textAlign: "center",
              }}
            >
              <div
                className="mx-auto flex items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "#e8f5e9",
                  marginBottom: 24,
                }}
              >
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 500, color: "#282828", marginBottom: 12 }}>
                Booking Confirmed!
              </h2>
              <p style={{ fontSize: 15, color: "#686868", lineHeight: 1.7, maxWidth: 450, margin: "0 auto 8px" }}>
                Your appointment for <strong>{style.name}</strong> on{" "}
                <strong>{new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong>{" "}
                at <strong>{selectedTime}</strong> has been booked.
              </p>
              <p style={{ fontSize: 14, color: "#999", marginBottom: 32 }}>
                A confirmation has been sent to {email}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center uppercase transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "#8B5E3C",
                    color: "#fff",
                    padding: "12px 32px",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                  }}
                >
                  Browse Services
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center uppercase transition-colors hover:text-[#8B5E3C]"
                  style={{
                    border: "1px solid #ddd",
                    color: "#282828",
                    padding: "12px 32px",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                  }}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Step Indicators */}
              <div
                className="flex items-center justify-center gap-2"
                style={{ marginBottom: 32 }}
              >
                {steps.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: i <= currentStepIndex ? "#8B5E3C" : "#eee",
                        color: i <= currentStepIndex ? "#fff" : "#999",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "all 0.3s",
                      }}
                    >
                      {i < currentStepIndex ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className="hidden sm:inline"
                      style={{
                        fontSize: 13,
                        color: i <= currentStepIndex ? "#282828" : "#999",
                        fontWeight: i === currentStepIndex ? 500 : 400,
                      }}
                    >
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <div
                        style={{
                          width: 40,
                          height: 1,
                          backgroundColor: i < currentStepIndex ? "#8B5E3C" : "#ddd",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: "32px",
                  border: "1px solid #eee",
                }}
              >
                {/* Step: Options */}
                {activeStep === "options" && hasOptions && (
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 500, color: "#282828", marginBottom: 8 }}>
                      Choose Your Options
                    </h2>
                    <p style={{ fontSize: 14, color: "#686868", marginBottom: 28 }}>
                      Customize your {style.name} style
                    </p>

                    {style.options!.lengths && (
                      <div style={{ marginBottom: 28 }}>
                        <label
                          className="uppercase"
                          style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "#282828", display: "block", marginBottom: 12 }}
                        >
                          Length
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {style.options!.lengths.map((length) => (
                            <button
                              key={length}
                              onClick={() => setSelectedLength(length)}
                              style={{
                                padding: "10px 20px",
                                fontSize: 14,
                                border: selectedLength === length ? "2px solid #8B5E3C" : "1px solid #ddd",
                                backgroundColor: selectedLength === length ? "#faf8f3" : "#fff",
                                color: selectedLength === length ? "#8B5E3C" : "#282828",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontWeight: selectedLength === length ? 500 : 400,
                                transition: "all 0.2s",
                              }}
                            >
                              {length}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {style.options!.colors && (
                      <div style={{ marginBottom: 28 }}>
                        <label
                          className="uppercase"
                          style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "#282828", display: "block", marginBottom: 12 }}
                        >
                          Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {style.options!.colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              style={{
                                padding: "10px 20px",
                                fontSize: 14,
                                border: selectedColor === color ? "2px solid #8B5E3C" : "1px solid #ddd",
                                backgroundColor: selectedColor === color ? "#faf8f3" : "#fff",
                                color: selectedColor === color ? "#8B5E3C" : "#282828",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontWeight: selectedColor === color ? 500 : 400,
                                transition: "all 0.2s",
                              }}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {style.options!.types && (
                      <div style={{ marginBottom: 28 }}>
                        <label
                          className="uppercase"
                          style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "#282828", display: "block", marginBottom: 12 }}
                        >
                          Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {style.options!.types.map((type) => (
                            <button
                              key={type}
                              onClick={() => setSelectedType(type)}
                              style={{
                                padding: "10px 20px",
                                fontSize: 14,
                                border: selectedType === type ? "2px solid #8B5E3C" : "1px solid #ddd",
                                backgroundColor: selectedType === type ? "#faf8f3" : "#fff",
                                color: selectedType === type ? "#8B5E3C" : "#282828",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontWeight: selectedType === type ? 500 : 400,
                                transition: "all 0.2s",
                              }}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step: Date & Time */}
                {activeStep === "datetime" && (
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 500, color: "#282828", marginBottom: 8 }}>
                      Select Date & Time
                    </h2>
                    <p style={{ fontSize: 14, color: "#686868", marginBottom: 28 }}>
                      Choose your preferred appointment date and time
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {/* Date Picker */}
                      <div>
                        <label
                          className="uppercase"
                          style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "#282828", display: "block", marginBottom: 12 }}
                        >
                          Date
                        </label>
                        <input
                          type="date"
                          min={minDate}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 15,
                            border: "1px solid #ddd",
                            borderRadius: 6,
                            color: "#282828",
                            outline: "none",
                            fontFamily: "inherit",
                          }}
                        />
                      </div>

                      {/* Time Slots */}
                      <div>
                        <label
                          className="uppercase"
                          style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "#282828", display: "block", marginBottom: 12 }}
                        >
                          Time
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {timeSlots.map((time) => {
                            const slotKey = to24h(time) + ":00";
                            const slotCount = availability?.slotCounts?.[slotKey] ?? 0;
                            const dayFull = !!availability?.isFull;
                            const slotFull = dayFull || slotCount >= 16;
                            const isSelected = selectedTime === time;
                            return (
                              <button
                                key={time}
                                disabled={slotFull}
                                onClick={() => !slotFull && setSelectedTime(time)}
                                style={{
                                  padding: "10px 8px",
                                  fontSize: 13,
                                  border: isSelected ? "2px solid #8B5E3C" : "1px solid #ddd",
                                  backgroundColor: slotFull ? "#f6f6f6" : isSelected ? "#faf8f3" : "#fff",
                                  color: slotFull ? "#bbb" : isSelected ? "#8B5E3C" : "#282828",
                                  borderRadius: 6,
                                  cursor: slotFull ? "not-allowed" : "pointer",
                                  fontWeight: isSelected ? 500 : 400,
                                  textDecoration: slotFull ? "line-through" : "none",
                                  transition: "all 0.2s",
                                }}
                                title={slotFull ? "This slot is fully booked" : undefined}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {selectedDate && (
                      <p
                        style={{
                          fontSize: 13,
                          marginTop: 14,
                          color: availability?.isFull ? "#dc2626" : "#686868",
                        }}
                      >
                        {availLoading
                          ? "Checking availability..."
                          : availability
                            ? availability.isFull
                              ? `Sorry — Solita is fully booked on this day (${availability.booked}/16 clients).`
                              : `${availability.remaining} of 16 spots left on this day.`
                            : "Solita books up to 16 clients per day."}
                      </p>
                    )}
                  </div>
                )}

                {/* Step: Details */}
                {activeStep === "details" && (
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 500, color: "#282828", marginBottom: 8 }}>
                      Your Details
                    </h2>
                    <p style={{ fontSize: 14, color: "#686868", marginBottom: 28 }}>
                      Enter your contact information
                    </p>

                    <div className="flex flex-col gap-5">
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 15,
                            border: "1px solid #ddd",
                            borderRadius: 6,
                            color: "#282828",
                            outline: "none",
                            fontFamily: "inherit",
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
                            Email *
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              fontSize: 15,
                              border: "1px solid #ddd",
                              borderRadius: 6,
                              color: "#282828",
                              outline: "none",
                              fontFamily: "inherit",
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+255 7XX XXX XXX"
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              fontSize: 15,
                              border: "1px solid #ddd",
                              borderRadius: 6,
                              color: "#282828",
                              outline: "none",
                              fontFamily: "inherit",
                            }}
                          />
                          <p style={{ fontSize: 12, color: "#B8860B", marginTop: 6 }}>
                            Please enter a valid phone number with country code (e.g. +255 745 636 924) to ensure payment works correctly.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
                          Special Notes (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any specific requests or notes for your stylist..."
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 15,
                            border: "1px solid #ddd",
                            borderRadius: 6,
                            color: "#282828",
                            outline: "none",
                            fontFamily: "inherit",
                            resize: "vertical",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step: Payment */}
                {activeStep === "payment" && (
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 500, color: "#282828", marginBottom: 8 }}>
                      Payment
                    </h2>
                    <p style={{ fontSize: 14, color: "#686868", marginBottom: 28 }}>
                      Choose your payment method
                    </p>

                    {/* Booking Summary */}
                    <div
                      style={{
                        backgroundColor: "#faf8f3",
                        borderRadius: 8,
                        padding: "20px",
                        marginBottom: 28,
                      }}
                    >
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#282828", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Booking Summary
                      </h3>
                      <div className="flex flex-col gap-2" style={{ fontSize: 14 }}>
                        <div className="flex justify-between">
                          <span style={{ color: "#686868" }}>Service</span>
                          <span style={{ color: "#282828" }}>{service.name} — {style.name}</span>
                        </div>
                        {selectedLength && (
                          <div className="flex justify-between">
                            <span style={{ color: "#686868" }}>Length</span>
                            <span style={{ color: "#282828" }}>{selectedLength}</span>
                          </div>
                        )}
                        {selectedColor && (
                          <div className="flex justify-between">
                            <span style={{ color: "#686868" }}>Color</span>
                            <span style={{ color: "#282828" }}>{selectedColor}</span>
                          </div>
                        )}
                        {selectedType && (
                          <div className="flex justify-between">
                            <span style={{ color: "#686868" }}>Type</span>
                            <span style={{ color: "#282828" }}>{selectedType}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span style={{ color: "#686868" }}>Date</span>
                          <span style={{ color: "#282828" }}>
                            {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "#686868" }}>Time</span>
                          <span style={{ color: "#282828" }}>{selectedTime}</span>
                        </div>
                        <div className="flex justify-between" style={{ borderTop: "1px solid #e0dcc8", paddingTop: 10, marginTop: 6 }}>
                          <span style={{ color: "#282828", fontWeight: 600 }}>Estimated Price</span>
                          <span style={{ color: "#8B5E3C", fontWeight: 600 }}>From {formattedPrice}</span>
                        </div>
                        {currency !== "TZS" && (
                          <p style={{ fontSize: 12, color: "#B8860B", marginTop: 8, lineHeight: 1.5 }}>
                            You will be charged in <strong>{currency === "USD" ? "USD" : "USD (converted)"}</strong> via ClickPesa. The {currency} amount shown is an estimate based on current exchange rates.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="flex flex-col gap-3">
                      {[
                        { key: "mpesa" as const, label: "M-Pesa / Mobile Money", desc: "Pay via mobile money" },
                        { key: "card" as const, label: "Card Payment", desc: "Debit or credit card" },
                      ].map((method) => (
                        <button
                          key={method.key}
                          onClick={() => setPaymentMethod(method.key)}
                          className="flex items-center gap-4 text-left"
                          style={{
                            padding: "16px 20px",
                            border: paymentMethod === method.key ? "2px solid #8B5E3C" : "1px solid #ddd",
                            borderRadius: 8,
                            backgroundColor: paymentMethod === method.key ? "#faf8f3" : "#fff",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: paymentMethod === method.key ? "6px solid #8B5E3C" : "2px solid #ccc",
                              transition: "all 0.2s",
                            }}
                          />
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: "#282828" }}>{method.label}</div>
                            <div style={{ fontSize: 13, color: "#999" }}>{method.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div
                  className="flex items-center justify-between"
                  style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #eee" }}
                >
                  {currentStepIndex > 0 ? (
                    <button
                      onClick={handleBack}
                      className="uppercase transition-colors hover:text-[#8B5E3C]"
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        color: "#686868",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "12px 0",
                      }}
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {bookingError && (
                    <p style={{ color: "#dc2626", fontSize: 13, gridColumn: "1 / -1", textAlign: "center", margin: "-8px 0 8px" }}>
                      {bookingError}
                    </p>
                  )}

                  {activeStep === "payment" ? (
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isProcessing}
                      className="uppercase transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: "#8B5E3C",
                        color: "#fff",
                        padding: "14px 40px",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        border: "none",
                        cursor: isProcessing ? "wait" : "pointer",
                        opacity: isProcessing ? 0.7 : 1,
                      }}
                    >
                      {isProcessing ? "Processing..." : "Pay Now"}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={
                        (activeStep === "options" && !canProceedFromOptions()) ||
                        (activeStep === "datetime" && !canProceedFromDatetime()) ||
                        (activeStep === "details" && !canProceedFromDetails())
                      }
                      className="uppercase transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "#8B5E3C",
                        color: "#fff",
                        padding: "14px 40px",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
