/**
 * Sitara — Login Page
 * SOP §২ — Frontend Plan PAGE 6
 *
 * Route: /login
 * Features: Email + Password, Remember me, Forgot Password link
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Euphoria account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block text-2xl font-extrabold tracking-wide uppercase text-[#0a0a0a] font-heading">
            Euphoria
          </Link>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <Suspense
          fallback={
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-muted/30" />
              <div className="h-10 bg-muted/30" />
              <div className="h-12 bg-muted/40" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
