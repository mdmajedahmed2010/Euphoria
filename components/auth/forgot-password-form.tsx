/**
 * Euphoria — Forgot Password Form
 * Email input → sends reset link
 * SOP §৪A — Password Reset (expires 1 hour)
 */

"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { forgotPasswordAction } from "@/actions/auth.actions";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await forgotPasswordAction(email.trim());
      if (!res.success) {
        setError(res.error || "Failed to send reset link");
        return;
      }
      setIsSubmitted(true);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="h-12 w-12 mx-auto rounded-full bg-success/10 flex items-center justify-center">
          <Mail className="h-6 w-6 text-success" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          The link will expire in 1 hour. If you don&apos;t see the email, check your spam folder.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setEmail("");
          }}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="reset-email" className="text-sm font-medium">
          Email address
        </label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 rounded-lg bg-foreground text-background font-medium text-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}
