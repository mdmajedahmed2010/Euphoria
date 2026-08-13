"use client";

/**
 * Euphoria — Settings Manager (Advanced 5x)
 * Groups: Store Info, Branding, Shipping, Taxes, Email, Social, SEO
 */

import { useState } from "react";
import { toast } from "sonner";
import { bulkUpdateSettings } from "@/actions/settings.actions";
import { ImageUpload } from "./image-upload";
import {
  Save,
  Store,
  Truck,
  Share2,
  Image as ImageIcon,
  Search,
  CheckCircle2,
  Percent,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { BUSINESS, DELIVERY_CHARGE } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface Setting {
  key: string;
  value: unknown;
  group: string;
  label: string | null;
  type: string;
}

interface SettingsManagerProps {
  initialSettings: Setting[];
  isTwoFactorEnabled: boolean;
}

const TABS = [
  { id: "general", label: "Store Info", icon: Store },
  { id: "branding", label: "Branding", icon: ImageIcon },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "taxes", label: "Taxes", icon: Percent },
  { id: "email", label: "Email Config", icon: Mail },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "seo", label: "SEO", icon: Search },
  { id: "security", label: "Security & 2FA", icon: ShieldCheck },
];

// Default settings with fallbacks
const DEFAULTS: Record<string, { value: unknown; group: string; label: string; type: string }> = {
  // General
  store_name: { value: BUSINESS.NAME, group: "general", label: "Store Name", type: "text" },
  store_email: { value: BUSINESS.EMAIL, group: "general", label: "Contact Email", type: "text" },
  store_phone: { value: BUSINESS.PHONE, group: "general", label: "Contact Phone", type: "text" },
  store_address: {
    value: BUSINESS.ADDRESS,
    group: "general",
    label: "Store Address",
    type: "textarea",
  },
  store_tagline: {
    value: "Premium Women's Fashion",
    group: "general",
    label: "Tagline",
    type: "text",
  },
  currency_symbol: { value: "৳", group: "general", label: "Currency Symbol", type: "text" },
  maintenance_mode: {
    value: false,
    group: "general",
    label: "Enable Maintenance Mode",
    type: "boolean",
  },

  // Branding
  store_logo: { value: "", group: "branding", label: "Store Logo", type: "image" },
  store_favicon: { value: "", group: "branding", label: "Favicon", type: "image" },
  primary_color: {
    value: "#000000",
    group: "branding",
    label: "Primary Brand Color (Hex)",
    type: "text",
  },

  // Shipping
  shipping_dhaka: {
    value: DELIVERY_CHARGE.DHAKA_INSIDE,
    group: "shipping",
    label: "Dhaka Inside (৳)",
    type: "number",
  },
  shipping_outside: {
    value: DELIVERY_CHARGE.OUTSIDE_DHAKA,
    group: "shipping",
    label: "Outside Dhaka (৳)",
    type: "number",
  },
  free_shipping_threshold: {
    value: 0,
    group: "shipping",
    label: "Free Shipping Above (৳, 0 = disabled)",
    type: "number",
  },
  enable_international_shipping: {
    value: false,
    group: "shipping",
    label: "Enable International Shipping",
    type: "boolean",
  },

  // Taxes
  enable_taxes: { value: false, group: "taxes", label: "Enable Tax Calculation", type: "boolean" },
  tax_rate: { value: 0, group: "taxes", label: "Default Tax Rate (%)", type: "number" },
  prices_include_tax: {
    value: true,
    group: "taxes",
    label: "Product Prices Include Tax",
    type: "boolean",
  },

  // Email Config
  smtp_host: { value: "", group: "email", label: "SMTP Host", type: "text" },
  smtp_port: { value: 465, group: "email", label: "SMTP Port", type: "number" },
  smtp_user: { value: "", group: "email", label: "SMTP Username", type: "text" },
  smtp_pass: { value: "", group: "email", label: "SMTP Password", type: "text" },
  email_from_name: { value: BUSINESS.NAME, group: "email", label: "Email From Name", type: "text" },

  // Social
  social_facebook: {
    value: BUSINESS.FACEBOOK,
    group: "social",
    label: "Facebook URL",
    type: "text",
  },
  social_instagram: {
    value: BUSINESS.INSTAGRAM,
    group: "social",
    label: "Instagram URL",
    type: "text",
  },
  social_youtube: { value: "", group: "social", label: "YouTube URL", type: "text" },
  social_tiktok: { value: "", group: "social", label: "TikTok URL", type: "text" },

  // SEO
  seo_title: {
    value: "Euphoria — Exclusive Authentic Pakistani Luxury Suits",
    group: "seo",
    label: "Default SEO Title",
    type: "text",
  },
  seo_description: {
    value: "Discover authentic Pakistani luxury organza suits, embroidered chiffon, lawn 3-piece sets & bridal collections at Euphoria (Euphoria).",
    group: "seo",
    label: "SEO Description",
    type: "textarea",
  },
  seo_keywords: {
    value: "fashion, saree, abaya, three-piece, bangladesh",
    group: "seo",
    label: "SEO Keywords (comma separated)",
    type: "text",
  },
};

export function SettingsManager({ initialSettings, isTwoFactorEnabled }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    // Lazy init from DB or defaults
    const initial: Record<string, unknown> = {};
    for (const [key, def] of Object.entries(DEFAULTS)) {
      const dbSetting = initialSettings.find((s) => s.key === key);
      initial[key] = dbSetting?.value !== undefined ? dbSetting.value : def.value;
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // 2FA management states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(isTwoFactorEnabled);
  const [setupMode, setSetupMode] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [tfaLoading, setTfaLoading] = useState(false);
  const [tfaError, setTfaError] = useState<string | null>(null);

  const handleStartSetup = async () => {
    setTfaLoading(true);
    setTfaError(null);
    try {
      const { generate2FASecretAction } = await import("@/actions/auth.actions");
      const res = await generate2FASecretAction();
      if (res.success && res.secret && res.otpAuthURI) {
        setSecretKey(res.secret);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(res.otpAuthURI)}`;
        setQrCode(qrUrl);
        setSetupMode(true);
      } else {
        setTfaError(res.error || "Failed to start 2FA setup");
      }
    } catch {
      setTfaError("Failed to initialize 2FA setup");
    } finally {
      setTfaLoading(false);
    }
  };

  const handleConfirmEnable = async () => {
    if (verificationCode.length !== 6) {
      setTfaError("Please enter all 6 digits");
      return;
    }
    setTfaLoading(true);
    setTfaError(null);
    try {
      const { enable2FAAction } = await import("@/actions/auth.actions");
      const res = await enable2FAAction(verificationCode);
      if (res.success) {
        setTwoFactorEnabled(true);
        setSetupMode(false);
        setSecretKey("");
        setQrCode("");
        setVerificationCode("");
        toast.success("Two-factor authentication enabled successfully!");
      } else {
        setTfaError(res.error || "Verification failed");
      }
    } catch {
      setTfaError("Failed to enable 2FA");
    } finally {
      setTfaLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (verificationCode.length !== 6) {
      setTfaError("Please enter 6-digit verification code to disable 2FA");
      return;
    }
    setTfaLoading(true);
    setTfaError(null);
    try {
      const { disable2FAAction } = await import("@/actions/auth.actions");
      const res = await disable2FAAction(verificationCode);
      if (res.success) {
        setTwoFactorEnabled(false);
        setVerificationCode("");
        toast.success("Two-factor authentication disabled successfully!");
      } else {
        setTfaError(res.error || "Verification failed");
      }
    } catch {
      setTfaError("Failed to disable 2FA");
    } finally {
      setTfaLoading(false);
    }
  };

  const setValue = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSave() {
    setSaving(true);
    const updates = Object.entries(values).map(([key, value]) => {
      const def = DEFAULTS[key]!;
      return {
        key,
        value,
        group: def.group,
        label: def.label,
        type: def.type,
      };
    });

    const result = await bulkUpdateSettings(updates);
    setSaving(false);

    if (result.success) {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } else {
      toast.error(result.error || "Failed to save");
    }
  }

  const tabSettings = Object.entries(DEFAULTS).filter(([, def]) => def.group === activeTab);

  return (
    <div className="space-y-6">
      {/* Scrollable Tabs */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/20 bg-white/40 p-2 shadow-sm backdrop-blur-md pb-2 custom-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "text-white" : "text-gray-600 hover:bg-white/50"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl bg-gray-900 shadow-sm"
                transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Settings Form Container (Glassmorphism) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl shadow-black/[0.03] backdrop-blur-xl sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === "security" ? (
              <div className="max-w-xl mx-auto space-y-6 py-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Two-Factor Authentication (2FA)
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Protect your administrative account with two-step dynamic validation. Scan the
                    code using Google Authenticator, Microsoft Authenticator, or generic TOTP
                    clients to secure mutations.
                  </p>
                </div>

                {tfaError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-600 font-semibold rounded-xl">
                    {tfaError}
                  </div>
                )}

                {twoFactorEnabled ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-800">
                          2-Factor Authentication is Active
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5 font-medium">
                          Your credentials are protected with dynamic code challenge.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-emerald-100/50 pt-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-700">
                        Disable Two-Factor Authentication
                      </p>
                      <div className="flex gap-3 max-w-sm">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-center font-semibold focus:outline-none focus:border-red-500"
                        />
                        <button
                          onClick={handleDisable2FA}
                          disabled={tfaLoading || verificationCode.length !== 6}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                        >
                          {tfaLoading ? "Disabling..." : "Disable 2FA"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : setupMode ? (
                  <div className="rounded-2xl border border-accent/20 bg-accent-light/5 p-6 space-y-6">
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-900">Step 1: Scan this QR Code</p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Scan the QR code below. If scanner is not supported, manually key in the
                        base32 secret.
                      </p>
                    </div>

                    {qrCode && (
                      <div className="flex justify-center bg-white p-4 border border-gray-100 rounded-xl w-fit mx-auto shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrCode} alt="2FA QR Code" className="h-44 w-44" />
                      </div>
                    )}

                    <div className="space-y-1.5 text-center">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        Manual Entry Secret
                      </p>
                      <p className="text-sm font-mono font-bold text-[#d4af37] select-all bg-white py-2 px-4 border border-gray-100 rounded-lg inline-block">
                        {secretKey}
                      </p>
                    </div>

                    <div className="border-t border-accent/10 pt-4 space-y-3">
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-gray-900">Step 2: Verify Setup</p>
                        <p className="text-xs text-gray-500">
                          Enter the active 6-digit TOTP code from your authenticator app to enable.
                        </p>
                      </div>

                      <div className="flex gap-3 max-w-sm">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-center font-semibold focus:outline-none focus:border-[#d4af37]"
                        />
                        <button
                          onClick={handleConfirmEnable}
                          disabled={tfaLoading || verificationCode.length !== 6}
                          className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                        >
                          {tfaLoading ? "Enabling..." : "Verify & Enable"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col items-center text-center space-y-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900">
                        2-Factor Authentication is Disabled
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                        Enable dynamic secondary authorization to secure mutations, product imports,
                        order status changes, and settings.
                      </p>
                    </div>
                    <button
                      onClick={handleStartSetup}
                      disabled={tfaLoading}
                      className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {tfaLoading ? "Initializing..." : "Set Up 2FA Key"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tabSettings.map(([key, def]) => (
                  <div
                    key={key}
                    className={def.type === "textarea" ? "md:col-span-2 lg:col-span-3" : ""}
                  >
                    <SettingField
                      settingKey={key}
                      def={def}
                      value={values[key]}
                      onChange={(val) => setValue(key, val)}
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Save Bar */}
      {activeTab !== "security" && (
        <div className="sticky bottom-6 z-50 flex items-center justify-end gap-4 rounded-2xl border border-white/50 bg-white/80 p-4 shadow-2xl backdrop-blur-xl">
          <AnimatePresence>
            {savedMsg && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm font-semibold text-emerald-600"
              >
                <CheckCircle2 className="h-5 w-5" />
                Settings saved!
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            disabled={saving}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white"
              />
            ) : (
              <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
            )}
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Setting Field
// ═══════════════════════════════════════════

function SettingField({
  settingKey,
  def,
  value,
  onChange,
}: {
  settingKey: string;
  def: { type: string; label: string };
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  return (
    <div className="group">
      <label
        htmlFor={settingKey}
        className="mb-2 block text-sm font-semibold text-gray-700 transition-colors group-hover:text-gray-900"
      >
        {def.label}
      </label>

      {def.type === "text" && (
        <input
          id={settingKey}
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border-0 bg-white/50 px-4 py-3 text-sm shadow-inner ring-1 ring-inset ring-gray-200/60 transition-all focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500"
        />
      )}

      {def.type === "textarea" && (
        <textarea
          id={settingKey}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-xl border-0 bg-white/50 px-4 py-3 text-sm shadow-inner ring-1 ring-inset ring-gray-200/60 transition-all focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500"
        />
      )}

      {def.type === "number" && (
        <input
          id={settingKey}
          type="number"
          value={(value as number) || 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full rounded-xl border-0 bg-white/50 px-4 py-3 text-sm shadow-inner ring-1 ring-inset ring-gray-200/60 transition-all focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500"
        />
      )}

      {def.type === "image" && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/40 p-2 transition-colors hover:bg-white/60">
          <ImageUpload
            images={value ? [value as string] : []}
            onChange={(imgs) => onChange(imgs[0] || "")}
            single
            folder="branding"
            label=""
            aspectRatio="aspect-square"
          />
        </div>
      )}

      {def.type === "boolean" && (
        <label className="relative inline-flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
          <span className="text-sm font-medium text-gray-700">Enabled</span>
        </label>
      )}
    </div>
  );
}
