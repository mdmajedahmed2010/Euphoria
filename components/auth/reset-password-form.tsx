"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { resetPasswordAction } from "@/actions/auth.actions";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordAction(token, password);
      if (!res.success) {
        setError(res.error || "Failed to reset password.");
        return;
      }
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Password Reset Successful</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been updated. Redirecting you to sign in...
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-foreground underline underline-offset-4"
        >
          Go to login now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="reset-password" className="text-sm font-medium">
          New Password
        </label>
        <div className="relative">
          <input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 pr-10 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Min. 8 characters"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reset-confirm-password" className="text-sm font-medium">
          Confirm New Password
        </label>
        <input
          id="reset-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Repeat new password"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 rounded-lg bg-foreground text-background font-medium text-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
