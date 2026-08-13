/**
 * Sitara — Change Password Page
 * Current + New + Confirm password
 * SOP §২ — Frontend Plan F5.10
 */

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { changePassword } from "@/actions/account.actions";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(res.error || "Failed to update password.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Change Password</h2>
      <Separator />

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
            Password changed successfully.
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="current-pw" className="text-sm font-medium">
            Current Password
          </label>
          <input
            id="current-pw"
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-pw" className="text-sm font-medium">
            New Password
          </label>
          <input
            id="new-pw"
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Min 8 characters"
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-new-pw" className="text-sm font-medium">
            Confirm New Password
          </label>
          <input
            id="confirm-new-pw"
            type={showPasswords ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-muted-foreground">Show passwords</span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="h-10 px-6 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
}
