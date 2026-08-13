"use client";

/* eslint-disable */
/**
 * Euphoria — Checkout Form Component (Premium v3.0)
 * Ultra-Premium, Interactive Single-Page 2-Column Checkout Dashboard.
 * Specialized for the Bangladeshi Market:
 * - Inside/Outside Dhaka selection dropdown
 * - Phone number validation helper with Bengali trust text
 * - Beautiful custom payment method selector cards with bKash/Nagad visuals
 * - Dynamic coupon recommendation click-to-apply buttons
 * - High-trust security badges and micro-interactions
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, calculateDeliveryCharge } from "@/lib/utils";
import confetti from "canvas-confetti";
import { Separator } from "@/components/ui/separator";

import {
  ShoppingBag,
  Tag,
  CheckCircle2,
  XCircle,
  X,
  Ticket,
  Truck,
  ShieldCheck,
  CreditCard,
  Lock,
  PhoneCall,
  MapPin,
  HelpCircle,
} from "lucide-react";
import { createOrder } from "@/actions/order.actions";
import { validateCartItems } from "@/actions/validate-cart.actions";
import { validateCoupon } from "@/actions/coupon.actions";

interface AddressData {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  area: string;
  postalCode: string;
}

interface AppliedCoupon {
  code: string;
  type: string;
  value: number;
  label: string;
  discount: number;
}

export function CheckoutForm({ settings = {} }: { settings?: Record<string, any> }) {
  const { items, getSubtotal, clearCart } = useCartStore();
  const [address, setAddress] = useState<AddressData>({
    name: "",
    phone: "",
    email: "",
    street: "",
    city: "Dhaka", // Default to Dhaka for standard pricing
    area: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paymentSenderNumber, setPaymentSenderNumber] = useState("");
  const [paymentTrxId, setPaymentTrxId] = useState("");
  const [note, setNote] = useState("");
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState("ORD-2026-00001");
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      setCurrentStep(2);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Sync with localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("Euphoria_applied_coupon") || localStorage.getItem("Euphoria_applied_coupon");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setAppliedCoupon(parsed);
        }, 0);
      } catch {
        console.error("Error loading coupon from storage");
      }
    }
    
    // Load pending custom notes
    const customNote = localStorage.getItem("Euphoria_pending_custom_note") || localStorage.getItem("Euphoria_pending_custom_note");
    if (customNote) {
      setTimeout(() => {
        setNote(customNote);
      }, 0);
    }
  }, []);

  const subtotal = getSubtotal();
  const shippingDhaka = Number(settings.shipping_dhaka ?? 80);
  const shippingOutside = Number(settings.shipping_outside ?? 150);
  const freeShippingThreshold = Number(settings.free_shipping_threshold ?? 0);

  const isInsideDhaka = address.city.toLowerCase().includes("dhaka");
  let shippingCharge = isInsideDhaka ? shippingDhaka : shippingOutside;

  if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
    shippingCharge = 0;
  }

  // Calculate discount dynamically based on the current subtotal to prevent sync issues when quantities change
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === "FIXED") {
      discountAmount = appliedCoupon.value;
    } else if (appliedCoupon.type === "FREE_SHIPPING") {
      discountAmount = shippingCharge;
    }
    discountAmount = Math.min(
      discountAmount,
      subtotal + (appliedCoupon.type === "FREE_SHIPPING" ? shippingCharge : 0)
    );
  }

  const total = Math.max(0, subtotal + shippingCharge - discountAmount);

  // Apply Coupon Handler
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError("");
    setCouponSuccess("");

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);
    const res = await validateCoupon(code, subtotal);

    if (!res.success || !res.coupon) {
      setCouponError(res.error || "Invalid coupon code. Please try again.");
      setIsApplyingCoupon(false);
      return;
    }

    const couponData = {
      code,
      type: res.coupon.type,
      value: res.coupon.value,
      label: res.coupon.freeShipping ? "Free Shipping" : "Discount Applied",
      discount: res.coupon.discount,
    };

    setAppliedCoupon(couponData);
    localStorage.setItem("Euphoria_applied_coupon", JSON.stringify(couponData));
    setCouponSuccess(`"${code}" applied successfully!`);
    setCouponInput("");
    setIsApplyingCoupon(false);
  };

  // Remove Coupon Handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("Euphoria_applied_coupon");
    localStorage.removeItem("Euphoria_applied_coupon");
    setCouponError("");
    setCouponSuccess("");
    setCouponInput("");
  };

  const [paymentError, setPaymentError] = useState("");

  // Validate fields
  const validateAddress = (): boolean => {
    const newErrors: Partial<Record<keyof AddressData, string>> = {};
    setPaymentError("");

    if (!address.name.trim()) newErrors.name = "Full name is required";
    if (!address.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+880|0)1[3-9]\d{8}$/.test(address.phone.trim())) {
      newErrors.phone = "Enter a valid Bangladesh phone number (e.g. 017XXXXXXXX)";
    }
    if (!address.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }
    if (!address.street.trim()) newErrors.street = "Street address / Delivery point is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.area.trim()) newErrors.area = "Area / Police Station is required";

    if (paymentMethod !== "COD") {
      if (!paymentSenderNumber.trim() || !paymentTrxId.trim()) {
        setPaymentError("Please provide your bKash/Nagad Sender Number and Transaction ID.");
        setErrors(newErrors);
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddress()) {
      setCurrentStep(1);
      return;
    }
    setIsSubmitting(true);

    let finalNote = note.trim();
    if (paymentMethod !== "COD") {
      finalNote = `[Manual Payment] Method: ${paymentMethod}, Sender: ${paymentSenderNumber}, TrxID: ${paymentTrxId}\n\n${finalNote}`.trim();
    }

    const orderData = {
      address,
      paymentMethod,
      items,
      subtotal,
      shippingCharge,
      discount: discountAmount,
      total,
      couponCode: appliedCoupon?.code,
      note: finalNote || undefined,
    };

    const res = await createOrder(orderData);

    if (res.success && res.orderNumber) {
      if (res.paymentURL) {
        // Redirect to payment gateway
        window.location.href = res.paymentURL;
        return;
      }

      setPlacedOrderNumber(res.orderNumber);
      setConfirmedTotal(total); // Capture the exact finalized total BEFORE cart is cleared!
      setOrderPlaced(true);
      clearCart();
      localStorage.removeItem("Euphoria_applied_coupon");
      localStorage.removeItem("Euphoria_applied_coupon");
      localStorage.removeItem("Euphoria_pending_custom_note");
      localStorage.removeItem("Euphoria_pending_custom_note");

      // Fire confetti!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#d4af37", "#e8d5a3", "#111111"],
        disableForReducedMotion: true,
      });
    } else {
      alert(res.error || "Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  };

  // Empty cart state
  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center max-w-md mx-auto animate-scale-in">
        <div className="relative p-6 rounded-full bg-[#f8f5f0] text-muted-foreground/60 shadow-sm animate-float">
          <ShoppingBag className="h-12 w-12 text-accent" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Your bag is empty</h2>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">
            Please add luxury items to your shopping bag before attempting to checkout.
          </p>
        </div>
        <Link
          href="/collections/new-arrivals"
          className="inline-flex items-center justify-center h-12 px-8 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#d4af37] text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm active:scale-95 shadow-md"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  // Order Success Screen (Premium invoice-like card layout)
  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-6 space-y-7 border border-[#d4af37]/30 bg-[#fdfaf5] shadow-[0_12px_40px_rgba(0,0,0,0.03)] rounded-lg animate-scale-in">
        <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-inner">
          <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#1a0008]">
            Order Confirmed!
          </h2>
          <p className="text-xs text-[#0a0a0a] uppercase tracking-widest max-w-md mx-auto leading-relaxed font-bold">
            Thank you for choosing Euphoria. Our customer support team will call you shortly to confirm
            your delivery.
          </p>
        </div>

        <div className="p-5 bg-white border border-[#e8e0d0] rounded-lg max-w-md mx-auto space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#8b1a2a] uppercase tracking-wider font-bold">
              Order Identifier:
            </span>
            <span className="font-mono font-bold text-[#1a0008] bg-[#f7eded] border border-[#e8e0d0] px-3 py-1 shadow-sm rounded-sm">
              {placedOrderNumber}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#8b1a2a] uppercase tracking-wider font-bold">
              Payment Option:
            </span>
            <span className="font-bold text-[#1a0008] uppercase tracking-wider">
              {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#8b1a2a] uppercase tracking-wider font-bold">
              Total Amount:
            </span>
            <span className="font-bold text-[#0a0a0a] text-sm">{formatPrice(confirmedTotal)}</span>
          </div>
        </div>

        <div className="pt-4 max-w-md mx-auto space-y-3">
          <Link
            href="/track-order"
            className="flex items-center justify-center w-full h-12 bg-[#0a0a0a] text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#1a1a1a] transition-all duration-300 rounded-sm active:scale-95 shadow-md"
          >
            Track Order Status
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center w-full h-11 border border-[#0a0a0a]/30 bg-white text-[#0a0a0a] hover:bg-[#0a0a0a]/5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handlePlaceOrder}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto items-start animate-scale-in"
    >
      {/* ── Left Column: Form Details (7 cols) ── */}
      <div className="lg:col-span-7 space-y-6">
        {/* Step Navigation Bar */}
        <div className="flex items-center gap-2 md:gap-3 bg-[#fdfaf5] p-2 border border-[#d4af37]/30 rounded-lg mb-6 shadow-2xs">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex-1 py-3 px-3 md:px-4 rounded-md text-[11px] md:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentStep === 1
                ? "bg-[#0a0a0a] text-[#d4af37] shadow-sm"
                : "bg-white/60 text-muted-foreground hover:text-foreground border border-border/20"
            }`}
          >
            <span
              className={`size-5 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${
                currentStep === 1 ? "bg-[#d4af37] text-[#0a0a0a]" : "bg-neutral-200 text-neutral-700"
              }`}
            >
              1
            </span>
            <span>Step 1: Delivery Details</span>
          </button>

          <div className="h-4 w-px bg-border/40" />

          <button
            type="button"
            onClick={(e) => {
              if (validateAddress()) {
                setCurrentStep(2);
              }
            }}
            className={`flex-1 py-3 px-3 md:px-4 rounded-md text-[11px] md:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentStep === 2
                ? "bg-[#0a0a0a] text-[#d4af37] shadow-sm"
                : "bg-white/60 text-muted-foreground hover:text-foreground border border-border/20"
            }`}
          >
            <span
              className={`size-5 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${
                currentStep === 2 ? "bg-[#d4af37] text-[#0a0a0a]" : "bg-neutral-200 text-neutral-700"
              }`}
            >
              2
            </span>
            <span>Step 2: Payment & Review</span>
          </button>
        </div>

        {/* ── STEP 1: Delivery Information ── */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-border/30 pb-3">
              <span className="flex items-center justify-center size-7 rounded-full bg-foreground text-background text-xs font-bold font-mono shadow-sm">
                1
              </span>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                Delivery Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-[10px] uppercase tracking-wider text-foreground font-semibold flex items-center gap-1"
                >
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  className="w-full h-11 px-4 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm placeholder:text-muted-foreground/30 font-medium text-foreground hover:border-accent/40"
                  placeholder="Receiver's Full Name"
                />
                {errors.name && (
                  <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="text-[10px] uppercase tracking-wider text-foreground font-semibold flex items-center gap-1"
                >
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full h-11 px-4 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm placeholder:text-muted-foreground/30 font-medium text-foreground hover:border-accent/40"
                  placeholder="01XXXXXXXXX"
                />
                {errors.phone ? (
                  <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {errors.phone}
                  </p>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1 text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 p-2 rounded-sm">
                    <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                    <p className="text-[9px] font-semibold uppercase tracking-wider leading-relaxed">
                      অর্ডার কনফার্ম করতে এই নাম্বারে ফোন করা হবে।
                    </p>
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div className="md:col-span-2 space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[10px] uppercase tracking-wider text-foreground font-semibold"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={address.email}
                  onChange={(e) => setAddress({ ...address, email: e.target.value })}
                  className="w-full h-11 px-4 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm placeholder:text-muted-foreground/30 font-medium text-foreground hover:border-accent/40"
                  placeholder="customer@email.com"
                />
                {errors.email && (
                  <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label
                  htmlFor="city"
                  className="text-[10px] uppercase tracking-wider text-foreground font-semibold flex items-center gap-1"
                >
                  City / Region *
                </label>
                <select
                  id="city"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full h-11 px-4 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm font-semibold text-foreground hover:border-accent/40 cursor-pointer"
                >
                  <option value="Dhaka">Dhaka Division (Inside Dhaka) — ৳{shippingDhaka}</option>
                  <option value="Chattogram">Chattogram Division — ৳{shippingOutside}</option>
                  <option value="Sylhet">Sylhet Division — ৳{shippingOutside}</option>
                  <option value="Rajshahi">Rajshahi Division — ৳{shippingOutside}</option>
                  <option value="Khulna">Khulna Division — ৳{shippingOutside}</option>
                  <option value="Barishal">Barishal Division — ৳{shippingOutside}</option>
                  <option value="Rangpur">Rangpur Division — ৳{shippingOutside}</option>
                  <option value="Mymensingh">Mymensingh Division — ৳{shippingOutside}</option>
                </select>
                {errors.city && (
                  <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {errors.city}
                  </p>
                )}
              </div>

              {/* Area */}
              <div className="space-y-1.5">
                <label
                  htmlFor="area"
                  className="text-[10px] uppercase tracking-wider text-foreground font-semibold flex items-center gap-1"
                >
                  Area / Police Station *
                </label>
                <input
                  id="area"
                  type="text"
                  value={address.area}
                  onChange={(e) => setAddress({ ...address, area: e.target.value })}
                  className="w-full h-11 px-4 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm placeholder:text-muted-foreground/30 font-medium text-foreground hover:border-accent/40"
                  placeholder="e.g. Gulshan, Mirpur, Savar, etc."
                />
                {errors.area && (
                  <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {errors.area}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div className="md:col-span-2 space-y-1.5">
                <label
                  htmlFor="street"
                  className="text-[10px] uppercase tracking-wider text-foreground font-semibold flex items-center gap-1"
                >
                  Full Address (Road, House, Block/Village) *
                </label>
                <textarea
                  id="street"
                  rows={2}
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full p-4 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm placeholder:text-muted-foreground/30 font-medium text-foreground hover:border-accent/40 resize-none"
                  placeholder="House #12, Road #4, Sector #3, Uttara"
                />
                {errors.street && (
                  <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {errors.street}
                  </p>
                )}
              </div>

              {/* Order Note */}
              <div className="md:col-span-2 space-y-1.5">
                <label
                  htmlFor="note"
                  className="text-[10px] uppercase tracking-wider text-foreground font-semibold flex items-center gap-1"
                >
                  Order Notes / Customization Details (Optional)
                </label>
                <textarea
                  id="note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-4 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm placeholder:text-muted-foreground/30 font-medium text-foreground hover:border-accent/40 resize-none"
                  placeholder="E.g., Please make the length 54 inches. Or any special delivery instructions."
                />
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center justify-center w-full h-13 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#d4af37] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-md rounded-sm cursor-pointer active:scale-98"
              >
                Proceed to Step 2: Payment & Review →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Payment & Review ── */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Address Summary Badge */}
            <div className="bg-[#fcf9f2] border border-[#d4af37]/40 rounded-lg p-5 flex items-center justify-between shadow-2xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0a0a0a] uppercase tracking-wider">
                    {address.name || "Receiver Name"}
                  </span>
                  <span className="text-xs font-mono font-medium text-foreground">
                    ({address.phone})
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {address.street ? `${address.street}, ` : ""}{address.area ? `${address.area}, ` : ""}{address.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a] hover:underline cursor-pointer bg-white px-3 py-1.5 border border-[#0a0a0a]/20 rounded-xs shadow-3xs"
              >
                Edit Address
              </button>
            </div>

            {/* Section 2: Payment Method */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border/30 pb-3">
                <span className="flex items-center justify-center size-7 rounded-full bg-foreground text-background text-xs font-bold font-mono shadow-sm">
                  2
                </span>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                  Select Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex flex-col p-5 border transition-all cursor-pointer rounded-lg relative overflow-hidden select-none ${
                    paymentMethod === "COD"
                      ? "border-accent bg-[#fcf9f2] ring-1 ring-accent"
                      : "border-border/60 hover:bg-[#fcfcfc] hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Truck className="h-4.5 w-4.5" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Cash on Delivery
                      </span>
                    </div>
                    <div
                      className={`size-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === "COD"
                          ? "border-accent bg-accent"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {paymentMethod === "COD" && <div className="size-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Pay in cash when our delivery professional reaches your address. Note: Advance is required to confirm the order.
                  </p>
                </div>

                {/* bKash Wallet */}
                <div
                  onClick={() => setPaymentMethod("BKASH")}
                  className={`flex flex-col transition-all cursor-pointer rounded-lg relative overflow-hidden select-none ${
                    paymentMethod === "BKASH"
                      ? "border border-accent bg-[#fcf9f2] ring-1 ring-accent"
                      : "border border-border/60 p-5 hover:bg-[#fcfcfc] hover:border-accent/40"
                  }`}
                >
                  <div className={paymentMethod === "BKASH" ? "p-5 border-b border-accent/20" : ""}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
                          <CreditCard className="h-4.5 w-4.5" strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          bKash
                        </span>
                      </div>
                      <div
                        className={`size-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "BKASH"
                            ? "border-accent bg-accent"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        {paymentMethod === "BKASH" && <div className="size-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                      Pay advance securely via bKash Personal.
                    </p>
                  </div>

                  {/* bKash Manual Fields */}
                  {paymentMethod === "BKASH" && (
                    <div className="p-5 space-y-4 bg-white/50">
                      <div className="flex items-center gap-1.5 p-2.5 bg-pink-50 text-pink-700 rounded-sm border border-pink-100">
                        <PhoneCall className="h-4 w-4 shrink-0" />
                        <p className="text-[10px] uppercase tracking-wider font-bold">
                          Send Money to: 01765-301286 (Personal)
                        </p>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-foreground font-semibold">
                          bKash Sender Number *
                        </label>
                        <input
                          type="tel"
                          value={paymentSenderNumber}
                          onChange={(e) => setPaymentSenderNumber(e.target.value)}
                          className="w-full h-10 px-3 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm placeholder:text-muted-foreground/30 font-medium"
                          placeholder="e.g. 017XXXXXXXX"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-foreground font-semibold">
                          Transaction ID (TrxID) *
                        </label>
                        <input
                          type="text"
                          value={paymentTrxId}
                          onChange={(e) => setPaymentTrxId(e.target.value)}
                          className="w-full h-10 px-3 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm placeholder:text-muted-foreground/30 font-medium"
                          placeholder="e.g. 8A7B6C5D4E"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Nagad Wallet */}
                <div
                  onClick={() => setPaymentMethod("NAGAD")}
                  className={`flex flex-col transition-all cursor-pointer rounded-lg relative overflow-hidden select-none ${
                    paymentMethod === "NAGAD"
                      ? "border border-accent bg-[#fcf9f2] ring-1 ring-accent"
                      : "border border-border/60 p-5 hover:bg-[#fcfcfc] hover:border-accent/40"
                  }`}
                >
                  <div className={paymentMethod === "NAGAD" ? "p-5 border-b border-accent/20" : ""}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                          <CreditCard className="h-4.5 w-4.5" strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Nagad
                        </span>
                      </div>
                      <div
                        className={`size-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "NAGAD"
                            ? "border-accent bg-accent"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        {paymentMethod === "NAGAD" && <div className="size-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                      Pay advance securely via Nagad Personal.
                    </p>
                  </div>

                  {paymentMethod === "NAGAD" && (
                    <div className="p-5 space-y-4 bg-white/50">
                      <div className="flex items-center gap-1.5 p-2.5 bg-orange-50 text-orange-700 rounded-sm border border-orange-100">
                        <PhoneCall className="h-4 w-4 shrink-0" />
                        <p className="text-[10px] uppercase tracking-wider font-bold">
                          Send Money to: 01765-301286 (Personal)
                        </p>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-foreground font-semibold">
                          Nagad Sender Number *
                        </label>
                        <input
                          type="tel"
                          value={paymentSenderNumber}
                          onChange={(e) => setPaymentSenderNumber(e.target.value)}
                          className="w-full h-10 px-3 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm placeholder:text-muted-foreground/30 font-medium"
                          placeholder="e.g. 017XXXXXXXX"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-foreground font-semibold">
                          Transaction ID (TrxID) *
                        </label>
                        <input
                          type="text"
                          value={paymentTrxId}
                          onChange={(e) => setPaymentTrxId(e.target.value)}
                          className="w-full h-10 px-3 border border-border/60 bg-white text-sm transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-sm placeholder:text-muted-foreground/30 font-medium"
                          placeholder="e.g. 8A7B6C5D4E"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {paymentError && (
                <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> {paymentError}
                </p>
              )}
            </div>

            {/* Step 2 Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 h-12 border border-[#0a0a0a]/30 bg-white text-[#0a0a0a] hover:bg-[#0a0a0a]/5 font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 rounded-sm cursor-pointer"
              >
                ← Back to Step 1
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-2 h-12 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#d4af37] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-40 cursor-pointer shadow-md rounded-sm active:scale-98 animate-pulse-glow"
              >
                {isSubmitting ? "Processing Order..." : "Confirm & Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Column: Sticky Order Summary (5 cols) ── */}
      <div className="lg:col-span-5">
        <div className="sticky top-28 bg-[#fdfaf5] border border-[#d4af37]/30 p-6 md:p-8 rounded-lg shadow-md space-y-6">
          <div className="flex items-baseline justify-between border-b border-border/30 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Order Summary
            </h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold bg-white px-2.5 py-1 border border-border/20 rounded-full shadow-2xs">
              {items.length} {items.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          {/* Items Listing Compact */}
          <div className="divide-y divide-border/20 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                <div className="relative h-14 w-11 shrink-0 bg-white border border-border/40 overflow-hidden rounded-xs shadow-3xs">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.productName || "Product"}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span className="text-xs font-heading font-semibold text-foreground line-clamp-1 leading-tight">
                    {item.productName}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] uppercase tracking-wider bg-white text-muted-foreground px-1.5 py-0.5 border border-border/20 font-semibold rounded-xs shadow-3xs">
                      Size {item.size}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                      × {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-bold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Separator className="opacity-50" />

          {/* Coupon Code Section */}
          <div className="space-y-3 py-1">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
                Apply Promo / Coupon Code
              </span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-3 p-3 bg-accent/5 border border-accent/25 rounded-md animate-scale-in">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-accent animate-pulse" />
                  <div>
                    <p className="text-[11px] font-bold text-accent uppercase tracking-wider font-mono">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
                      {appliedCoupon.label}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground hover:text-sale transition-colors font-bold cursor-pointer bg-white px-2 py-1 border border-border/30 shadow-3xs hover:border-sale/30 rounded-xs"
                >
                  <X className="h-3 w-3 text-sale" />
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError("");
                        setCouponSuccess("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="w-full h-10 pl-9 pr-3 border border-border/50 bg-white text-[11px] transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-muted-foreground/30 font-mono font-bold uppercase tracking-widest text-foreground rounded-sm"
                      placeholder="ENTER PROMO CODE"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    disabled={isApplyingCoupon}
                    className="h-10 px-4 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#d4af37] text-[10px] font-bold uppercase tracking-[0.15em] transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap rounded-sm shadow-sm"
                  >
                    {isApplyingCoupon ? "..." : "Apply"}
                  </button>
                </div>

                {/* Recommend Click-to-Apply Coupons for high conversion */}
                <div className="space-y-1.5">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-semibold">
                    Available Offers (Tap to apply):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon("Euphoria10")}
                      className="text-[9px] font-mono font-bold px-2.5 py-1 bg-white border border-dashed border-[#d4af37] text-[#0a0a0a] hover:bg-[#0a0a0a]/5 rounded-xs transition-all shadow-3xs cursor-pointer active:scale-95"
                    >
                      Euphoria10 (10% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon("EID2026")}
                      className="text-[9px] font-mono font-bold px-2.5 py-1 bg-white border border-dashed border-[#d4af37] text-[#0a0a0a] hover:bg-[#0a0a0a]/5 rounded-xs transition-all shadow-3xs cursor-pointer active:scale-95"
                    >
                      EID2026 (Flat ৳200)
                    </button>
                  </div>
                </div>

                {couponError && (
                  <div className="flex items-center gap-1.5 text-sale animate-[fadeIn_0.2s_ease-out]">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    <p className="text-[9px] font-bold uppercase tracking-wider">{couponError}</p>
                  </div>
                )}

                {couponSuccess && (
                  <div className="flex items-center gap-1.5 text-accent animate-[fadeIn_0.2s_ease-out]">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <p className="text-[9px] font-bold uppercase tracking-wider">{couponSuccess}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator className="opacity-50" />

          {/* Money Totals */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span className="uppercase tracking-wider">Subtotal</span>
              <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="uppercase tracking-wider">Delivery Charge</span>
              <span className="font-semibold text-foreground">{formatPrice(shippingCharge)}</span>
            </div>

            {appliedCoupon && discountAmount > 0 && (
              <div className="flex justify-between text-accent animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center gap-1.5">
                  <Ticket className="h-3 w-3" />
                  <span className="uppercase tracking-wider font-bold">
                    Discount ({appliedCoupon.code})
                  </span>
                </div>
                <span className="font-bold">-{formatPrice(discountAmount)}</span>
              </div>
            )}
          </div>

          <Separator className="opacity-50" />

          {/* Grand Total */}
          <div className="flex justify-between text-foreground">
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Grand Total</span>
            <div className="text-right">
              <span className="text-lg font-bold tracking-tight text-foreground">
                {formatPrice(total)}
              </span>
              {appliedCoupon && discountAmount > 0 && (
                <p className="text-[9px] text-accent uppercase tracking-wider font-bold mt-0.5">
                  You save {formatPrice(discountAmount)}!
                </p>
              )}
            </div>
          </div>

          {/* Confirm Checkout / Next Step Action Button */}
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center justify-center w-full h-13 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#d4af37] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-md rounded-sm cursor-pointer active:scale-98"
            >
              Continue to Step 2: Payment →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center w-full h-13 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#d4af37] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-40 cursor-pointer shadow-md rounded-sm active:scale-98 animate-pulse-glow"
            >
              {isSubmitting ? "Processing Luxury Order..." : "Confirm & Place Order"}
            </button>
          )}

          {/* Trust assurances for Bangladeshi consumers */}
          <div className="pt-2 grid grid-cols-2 gap-3 border-t border-border/20">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-semibold leading-normal">
                100% Genuine Fabrics
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-accent shrink-0" />
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-semibold leading-normal">
                Advance Required
              </span>
            </div>
          </div>

          <p className="text-[8px] text-muted-foreground text-center uppercase tracking-widest leading-relaxed mt-2.5">
            By confirming you agree to our terms & refund policies. Safe guest checkout.
          </p>
        </div>
      </div>
    </form>
  );
}
