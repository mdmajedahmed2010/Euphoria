"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { ShieldCheck, Loader2, LogOut } from "lucide-react";
import { verifyAdmin2FATokenAction } from "@/actions/auth.actions";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export function Admin2FAVerify() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input box on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const triggerVerify = async (fullCode: string) => {
    setError(null);
    startTransition(async () => {
      const res = await verifyAdmin2FATokenAction(fullCode);
      if (res.success) {
        toast.success("2-Step Verification Authorized");
        window.location.reload();
      } else {
        setError(res.error || "Invalid code. Please try again.");
        setCode(Array(6).fill(""));
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }
    });
  };

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow numbers only

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-verify if code is fully entered
    if (newCode.every((digit) => digit !== "")) {
      triggerVerify(newCode.join(""));
      return;
    }

    // Auto-focus next input
    if (value !== "" && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return; // Only paste 6-digit codes

    const digits = pastedData.split("");
    setCode(digits);
    triggerVerify(pastedData);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    triggerVerify(fullCode);
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-accent/20 dark:border-accent/10 shadow-[0_8px_30px_rgb(201,169,110,0.06)] p-8 md:p-10 flex flex-col items-center">
        {/* Luxury Gold Icon */}
        <div className="h-16 w-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="h-8 w-8 text-[#d4af37]" />
        </div>

        {/* Brand Heading */}
        <h1 className="font-serif text-2xl tracking-[0.2em] text-[#111] dark:text-white uppercase mb-2 text-center">
          Euphoria
        </h1>
        <h2 className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37] uppercase mb-6 text-center">
          2-Step Verification
        </h2>

        <p className="text-xs text-center text-muted-foreground/80 leading-relaxed max-w-sm mb-8">
          This account requires two-factor authentication. Please enter the 6-digit code from your
          authenticator app to authorize access.
        </p>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="w-full space-y-6">
          {/* OTP Code Inputs */}
          <div className="flex justify-between gap-2 max-w-xs mx-auto">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                disabled={isPending}
                className="w-11 h-12 text-center text-lg font-bold border border-border/70 dark:border-neutral-800 bg-transparent text-[#111] dark:text-white transition-all focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] disabled:opacity-50"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-center text-sale font-semibold uppercase tracking-wider">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isPending || code.some((d) => d === "")}
              className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-[0.2em] hover:bg-foreground/90 transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Verifying..." : "Verify Access"}
            </button>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full h-11 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
