import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Euphoria",
  description:
    "Euphoria — Dressing well is a form of good manners. Premium jewelry boutique in Mirpur, Dhaka.",
  openGraph: {
    title: "About Us — Euphoria",
    description:
      "A haven for traditional jewelry lovers. Premium Kundan, Polki, and Pearl sets available in stock.",
    images: ["/euphoria/logo.jpg"],
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[45vh] md:h-[55vh] overflow-hidden bg-primary">
        <Image
          src="/euphoria/banner.jpg"
          alt="Euphoria — Premium Boutique"
          fill
          className="object-cover opacity-45"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/90" />
        <div className="absolute inset-0 flex items-center justify-center flex-col text-center px-6">
          <span className="inline-block px-4 py-1.5 border border-accent/50 bg-accent/10 text-accent-light text-[10px] uppercase tracking-[0.28em] font-bold rounded-full mb-4">
            আমাদের পরিচিতি • ABOUT US
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground tracking-tight leading-tight mb-3 font-heading">
            Euphoria
          </h1>
          <p className="text-accent text-base md:text-lg font-medium tracking-wide">
            Authentic Premium Jewellery
          </p>
        </div>
      </section>

      {/* Tagline Banner */}
      <section className="bg-primary py-6 px-6 text-center border-t border-accent/30">
        <p className="text-primary-foreground text-sm md:text-base font-semibold tracking-wide max-w-3xl mx-auto">
          ✦ &quot;Dressing well is a form of good manners. Premium traditional jewelry available in stock.&quot; ✦
        </p>
      </section>

      {/* Brand Story */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-lg border border-accent/30">
              <Image
                src="/euphoria/logo.jpg"
                alt="Euphoria showcase"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-sm border border-accent/40 px-4 py-2.5 rounded-sm">
                <p className="text-accent text-[9px] uppercase tracking-widest font-bold">
                  Official Store
                </p>
                <p className="text-primary-foreground text-xs font-medium mt-0.5">Mirpur, Dhaka</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold mb-3">
                  আমাদের গল্প
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4 font-heading">
                  Bangladesh&apos;s Preferred Destination for
                  <br />
                  <span className="italic font-normal text-primary">Traditional Jewellery</span>
                </h2>
              </div>

              <div className="border-l-4 border-accent pl-5 py-2 bg-muted rounded-r-sm">
                <p className="text-primary italic text-sm leading-relaxed font-medium">
                  ★ Euphoria ★ — Dressing well is a form of good manners.
                </p>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  All kind of traditional and bridal jewelry available in stock. We specialize in Kundan, Polki, Pearl, and heavy Choker sets for your special occasions.
                </p>
                <p>
                  100% Authentic products directly sourced. We pride ourselves on offering premium quality accessories for all your festive and daily wear needs in Bangladesh.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-5 border-t border-b border-accent/30">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">Premium</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mt-1">
                    Quality
                  </p>
                </div>
                <div className="text-center border-x border-accent/30">
                  <p className="text-2xl font-bold text-primary">100%</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mt-1">
                    Recommend
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">100%</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mt-1">
                    Authentic
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Collections */}
      <section className="py-16 bg-muted px-6 border-t border-accent/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold mb-3">
              আমাদের মূল কালেকশন
            </p>
            <h2 className="text-3xl font-bold text-foreground font-heading">Our Signature Collections</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                name: "Kundan Bridal Sets",
                desc: "Opulent bridal jewelry featuring authentic Kundan craftsmanship and heavy detailing.",
                img: "/euphoria/762867867_1027766650023554_4511890854211205012_n.jpg",
                href: "/collections/kundan-bridal-sets",
              },
              {
                name: "Polki Necklaces",
                desc: "Uncut diamond polki sets for a royal and traditional look.",
                img: "/euphoria/766953023_2186460245228415_4551314285155222007_n.jpg",
                href: "/collections/polki-necklaces",
              },
              {
                name: "Pearl Jewellery",
                desc: "Elegant and timeless pearl necklaces and drops.",
                img: "/euphoria/769222217_1365468228389531_1251425921139694609_n.jpg",
                href: "/collections/pearl-jewellery",
              },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative rounded-sm overflow-hidden bg-background shadow-sm hover:shadow-md transition-all duration-300 border border-accent/30 hover:border-accent"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4 font-heading">আমাদের সাথে যোগাযোগ করুন</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-sm">
            অর্ডার করতে বা যেকোনো প্রশ্নের জন্য সরাসরি আমাদের Facebook Inbox এ মেসেজ দিন।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted rounded-sm p-6 border border-accent/30">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-foreground text-sm mb-2">ঠিকানা</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mirpur, Dhaka,<br />
                Bangladesh
              </p>
            </div>

            <div className="bg-muted rounded-sm p-6 border border-accent/30">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-bold text-foreground text-sm mb-2">ফোন</h3>
              <a
                href="tel:+8801903888804"
                className="text-xs text-primary font-bold hover:underline"
              >
                Call Us
              </a>
            </div>

            <div className="bg-muted rounded-sm p-6 border border-accent/30">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <h3 className="font-bold text-foreground text-sm mb-2">Facebook Page</h3>
              <a
                href="https://www.facebook.com/Euphoria2222"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-bold hover:underline"
              >
                Inbox on Facebook
              </a>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-10 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all duration-300 rounded-sm shadow-luxury hover:shadow-gold-glow border border-accent/40 active:scale-[0.98]"
            >
              Contact Us Page →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
