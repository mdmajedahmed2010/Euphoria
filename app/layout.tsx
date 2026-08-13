import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CartSyncManager } from "@/components/cart/cart-sync-manager";
import { unstable_cache } from "next/cache";
import { ServiceWorkerRegistry } from "@/components/pwa/service-worker-registry";
import { PostHogProvider } from "@/components/analytics/posthog-provider";

// Body font — clean, modern, highly readable
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Heading font — elegant, premium feel for fashion brand
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

// Global metadata — Euphoria
export const metadata: Metadata = {
  title: {
    default: "Euphoria — Premium Authentic Kundan, Polki & Pearl Jewellery",
    template: "%s — Euphoria",
  },
  description:
    "Euphoria — Dressing well is a form of good manners. We provide authentic, premium quality traditional jewelry, including Kundan, Polki, Pearl, and Choker sets in Mirpur, Dhaka.",
  keywords: [
    "Euphoria",
    "Euphoria Jewellery",
    "Kundan Sets BD",
    "Polki Necklaces",
    "Authentic Pearls Dhaka",
    "Bridal Jewellery BD",
    "Traditional Wear BD",
    "Mirpur Boutique",
  ],
  authors: [{ name: "Euphoria" }],
  creator: "Euphoria",
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "Euphoria",
    title: "Euphoria — Premium Authentic Jewellery",
    description:
      "Premium quality traditional jewelry in stock. Cash on Delivery available across Bangladesh.",
    images: ["/euphoria/banner.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Euphoria",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userId = session?.user?.id;

  const getFavicon = unstable_cache(
    async () => {
      try {
        const setting = await prisma.siteSetting.findUnique({
          where: { key: "store_favicon" },
        });
        if (setting && setting.value) {
          return String(setting.value).replace(/['"]/g, "");
        }
      } catch {
        console.error("Failed to load favicon setting");
      }
      return "/favicon.ico";
    },
    ["favicon_setting"],
    { revalidate: 3600, tags: ["site_settings"] }
  );

  const faviconUrl = await getFavicon();

  return (
    <html
      lang="en"
      className={cn("h-full", inter.variable, playfair.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href={faviconUrl} />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground">
        <CartSyncManager userId={userId} />
        {/* Skip to main content — Accessibility (WCAG AA) */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <NextTopLoader
          color="#06b6d4"
          height={2}
          showSpinner={false}
          shadow="0 0 10px #06b6d4,0 0 5px #000000"
        />
        {/* Structured Data — SEO (SOP §৭) */}
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        {children}
        <Toaster position="top-right" richColors closeButton />
        <PostHogProvider />
        <ServiceWorkerRegistry />
      </body>
    </html>
  );
}
