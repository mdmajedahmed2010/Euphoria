/**
 * Euphoria — Login Form Component
 * Email + Password with validation
 * SOP §৪A — Authentication
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallback && rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/account";

  const errorParam = searchParams.get("error");
  useEffect(() => {
    if (errorParam === "OAuthAccountNotLinked") {
      setTimeout(() => setError("This email is already linked with another login method."), 0);
    } else if (errorParam) {
      setTimeout(() => setError("Authentication failed. Please try again."), 0);
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
      } else if (res?.ok) {
        // Successful login — force full page reload to pick up session
        window.location.replace(callbackUrl);
      } else {
        setError("Login failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="p-3.5 bg-sale/5 border border-sale/25 text-xs text-sale font-bold uppercase tracking-wider">
          {error}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-[10px] uppercase tracking-wider text-foreground font-semibold"
        >
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 px-4 border border-border/60 bg-transparent text-sm transition-all focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground bg-[#f8f5f0]/10 hover:bg-[#f8f5f0]/30 rounded-none placeholder:text-muted-foreground/30 text-foreground font-medium"
          placeholder="your@email.com"
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-[10px] uppercase tracking-wider text-foreground font-semibold"
          >
            Password *
          </label>
          <Link
            href="/forgot-password"
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors font-bold"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 pr-11 border border-border/60 bg-transparent text-sm transition-all focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground bg-[#f8f5f0]/10 hover:bg-[#f8f5f0]/30 rounded-none placeholder:text-muted-foreground/30 text-foreground font-medium"
            placeholder="Enter your password"
            autoComplete="current-password"
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
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2">
        <input
          id="remember"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 border-border rounded-none text-foreground focus:ring-foreground accent-foreground cursor-pointer"
        />
        <label
          htmlFor="remember"
          className="text-xs uppercase tracking-widest text-muted-foreground font-bold cursor-pointer select-none"
        >
          Remember me
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-[0.2em] hover:bg-foreground/90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 rounded-none cursor-pointer"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Signing in..." : "Sign In"}
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
