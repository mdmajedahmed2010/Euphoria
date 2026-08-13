/**
 * Euphoria — Register Form Component
 * Name, Email, Phone, Password, Confirm Password with luxury visual guidelines.
 * SOP §৪A — Authentication + client validation
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { registerUserAction } from "@/actions/auth.actions";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterForm() {
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallback && rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/account";

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const errorParam = searchParams.get("error");
  useEffect(() => {
    if (errorParam === "OAuthAccountNotLinked") {
      setTimeout(() => setServerError("This email is already linked with another login method."), 0);
    } else if (errorParam) {
      setTimeout(() => setServerError("Authentication failed. Please try again."), 0);
    }
  }, [errorParam]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      newErrors.email = "Enter a valid email address";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^(\+880|0)1[3-9]\d{8}$/.test(formData.phone.trim()))
      newErrors.phone = "Enter a valid Bangladesh phone number";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await registerUserAction({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (!res.success) {
        setServerError(res.error || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      // Automatically sign in the user
      const loginRes = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (loginRes?.error) {
        setServerError("Account created, but automatic sign-in failed. Please login manually.");
        setIsLoading(false);
        return;
      }

      // Successful auto login, redirect to callbackUrl
      window.location.href = callbackUrl;
    } catch (err: unknown) {
      console.error(err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Server Error */}
      {serverError && (
        <div className="p-3.5 bg-sale/5 border border-sale/25 text-xs text-sale font-bold uppercase tracking-wider">
          {serverError}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="text-[10px] uppercase tracking-wider text-foreground font-semibold"
        >
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="w-full h-11 px-4 border border-border/60 bg-transparent text-sm transition-all focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground bg-[#f8f5f0]/10 hover:bg-[#f8f5f0]/30 rounded-none placeholder:text-muted-foreground/30 text-foreground font-medium"
          placeholder="First & Last Name"
          autoComplete="name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="reg-email"
          className="text-[10px] uppercase tracking-wider text-foreground font-semibold"
        >
          Email Address *
        </label>
        <input
          id="reg-email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="w-full h-11 px-4 border border-border/60 bg-transparent text-sm transition-all focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground bg-[#f8f5f0]/10 hover:bg-[#f8f5f0]/30 rounded-none placeholder:text-muted-foreground/30 text-foreground font-medium"
          placeholder="your@email.com"
          autoComplete="email"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1">
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label
          htmlFor="phone"
          className="text-[10px] uppercase tracking-wider text-foreground font-semibold"
        >
          Phone Number *
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className="w-full h-11 px-4 border border-border/60 bg-transparent text-sm transition-all focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground bg-[#f8f5f0]/10 hover:bg-[#f8f5f0]/30 rounded-none placeholder:text-muted-foreground/30 text-foreground font-medium"
          placeholder="01XXXXXXXXX"
          autoComplete="tel"
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1">
            {errors.phone}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="reg-password"
          className="text-[10px] uppercase tracking-wider text-foreground font-semibold"
        >
          Password *
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            className="w-full h-11 px-4 pr-11 border border-border/60 bg-transparent text-sm transition-all focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground bg-[#f8f5f0]/10 hover:bg-[#f8f5f0]/30 rounded-none placeholder:text-muted-foreground/30 text-foreground font-medium"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1">
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="confirm-password"
          className="text-[10px] uppercase tracking-wider text-foreground font-semibold"
        >
          Confirm Password *
        </label>
        <input
          id="confirm-password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          className="w-full h-11 px-4 border border-border/60 bg-transparent text-sm transition-all focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground bg-[#f8f5f0]/10 hover:bg-[#f8f5f0]/30 rounded-none placeholder:text-muted-foreground/30 text-foreground font-medium"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-[10px] text-sale font-bold uppercase tracking-wider mt-1">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Terms Agreement */}
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-relaxed">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground font-bold">
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link href="/refund-policy" className="underline hover:text-foreground font-bold">
          Refund Policy
        </Link>
        .
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-[0.2em] hover:bg-foreground/90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 rounded-none cursor-pointer"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Creating account..." : "Create Account"}
      </button>

      {/* Divider */}
      <div className="relative my-6 py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="bg-background px-3 text-muted-foreground">Or Connect With</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <button
        type="button"
        onClick={() => {
          setIsLoading(true);
          signIn("google", { callbackUrl });
        }}
        disabled={isLoading}
        className="w-full h-11 border border-border/60 text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center justify-center gap-2.5 rounded-none cursor-pointer hover:bg-neutral-50 transition-colors disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google Account
      </button>

      {/* Guest Notice */}
      <p className="text-center text-[10px] uppercase tracking-wider text-muted-foreground pt-2">
        Alternatively, you can{" "}
        <Link
          href="/collections/new-arrivals"
          className="underline hover:text-foreground font-bold"
        >
          Shop As Guest
        </Link>
      </p>
    </form>
  );
}
