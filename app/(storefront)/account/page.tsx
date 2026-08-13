/**
 * Sitara — Account Profile Page
 * View + edit personal info
 * SOP §২ — Frontend Plan F5.5
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getProfile, updateProfile } from "@/actions/account.actions";

export default function AccountProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const res = await getProfile();
      if (res.success && res.user) {
        setProfile({
          name: res.user.name || "",
          email: res.user.email || "",
          phone: res.user.phone || "",
        });
      } else {
        setError(res.error || "Failed to load profile.");
      }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const res = await updateProfile({
      name: profile.name,
      phone: profile.phone || undefined,
    });

    if (res.success) {
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } else {
      setError(res.error || "Failed to update profile.");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>

      <Separator />

      {error && (
        <div className="p-3 text-xs bg-sale/5 border border-sale/20 text-sale font-semibold uppercase tracking-wider">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-xs bg-success/5 border border-success/20 text-success font-semibold uppercase tracking-wider">
          {success}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label htmlFor="profile-name" className="text-sm font-medium">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5 opacity-60">
            <label htmlFor="profile-email" className="text-sm font-medium">
              Email Address (Cannot be changed)
            </label>
            <input
              id="profile-email"
              type="email"
              value={profile.email}
              disabled
              className="w-full h-10 px-3 rounded-md border border-border bg-muted text-sm cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-phone" className="text-sm font-medium">
              Phone
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 px-6 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setError(null);
                setSuccess(null);
              }}
              className="h-10 px-6 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{profile.name || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="text-sm font-medium">{profile.phone || "Not set"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
