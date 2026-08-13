"use client";

/**
 * Euphoria — Contact Us Page
 * Euphoria | Authentic Jewellery
 */

import Image from "next/image";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

const contactDetails = [
  {
    icon: Phone,
    label: "ফোন",
    value: BUSINESS.PHONE,
    href: `tel:${BUSINESS.PHONE.replace(/[^0-9+]/g, "")}`,
    note: "Sunday–Saturday, 10am–9pm",
  },
  {
    icon: MessageCircle,
    label: "Facebook Inbox",
    value: "Euphoria",
    href: BUSINESS.FACEBOOK,
    note: "Order-এর জন্য Inbox করুন — সবচেয়ে দ্রুত সাড়া পাবেন",
  },
  {
    icon: Mail,
    label: "ইমেইল",
    value: BUSINESS.EMAIL,
    href: `mailto:${BUSINESS.EMAIL}`,
    note: "আমরা ২৪ ঘন্টার মধ্যে reply করি",
  },
  {
    icon: MapPin,
    label: "ঠিকানা",
    value: BUSINESS.ADDRESS,
    href: "",
    note: "Mirpur, Dhaka, Bangladesh",
  },
  {
    icon: Clock,
    label: "অনলাইন সাপোর্ট সময়",
    value: "সকাল ১০টা – রাত ৯টা (প্রতিদিন)",
    href: null,
    note: "২৪/৭ ফেসবুক ইনবক্স খোলা থাকে",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[45vh] md:h-[55vh] overflow-hidden bg-primary">
        <Image
          src="/euphoria/banner.jpg"
          alt="Euphoria — আমাদের সাথে যোগাযোগ করুন"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/80" />
        <div className="absolute inset-0 flex items-center justify-center flex-col text-center px-6">
          <span className="inline-block px-4 py-1.5 border border-accent/50 bg-accent/10 text-accent-light text-[10px] uppercase tracking-[0.28em] font-bold rounded-full mb-4">
            আমাদের সাথে যোগাযোগ • CONTACT US
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground tracking-tight leading-tight mb-3 font-heading">
            Contact Us
          </h1>
          <p className="text-accent text-base md:text-lg font-medium tracking-wide">
            আমরা আপনার প্রশ্নের উত্তর দিতে প্রস্তুত
          </p>
        </div>
      </section>

      {/* Tagline Strip */}
      <section className="bg-primary py-4 px-6 text-center border-t border-accent/30">
        <p className="text-accent text-sm font-semibold tracking-wide">
          ✦ Order-এর জন্য আমাদের Facebook Page-এ Inbox করুন — সবচেয়ে দ্রুত সাড়া পাবেন ✦
        </p>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Contact Details */}
            <div className="space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold mb-3">
                  যোগাযোগের তথ্য
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4 font-heading">
                  আমাদের সাথে সরাসরি
                  <br />
                  <span className="italic font-normal text-primary">কথা বলুন</span>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Euphoria — Dressing well is a form of good manners.
                  অর্ডার, প্রোডাক্ট বা ডেলিভারি সংক্রান্ত যেকোনো তথ্যের জন্য সরাসরি যোগাযোগ করুন।
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contactDetails.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-start gap-4 p-5 rounded-sm bg-background border border-accent/30 hover:border-accent hover:shadow-md transition-all group"
                  >
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <detail.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold">
                        {detail.label}
                      </p>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          target={detail.href.startsWith("http") ? "_blank" : undefined}
                          rel={detail.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-sm font-bold text-foreground hover:text-primary transition-colors block"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="text-sm font-bold text-foreground">{detail.value}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{detail.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Facebook CTA */}
              <a
                href={BUSINESS.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 h-14 w-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-bold rounded-sm transition-all shadow-md active:scale-[0.99] tracking-wide"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook Inbox-এ Order করুন
              </a>
            </div>

            {/* Right: Message Form */}
            <div className="bg-background border border-accent/30 rounded-sm p-8 shadow-sm">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-foreground mb-1 font-heading">মেসেজ পাঠান</h3>
                <p className="text-xs text-muted-foreground">
                  আমরা দ্রুত আপনার বার্তাটি পর্যালোচনা করে উত্তর দিব।
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।\nFor faster response, please inbox us on Facebook!");
                }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      className="w-full h-11 px-4 border border-accent/30 rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors bg-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
                      ফোন নম্বর *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01903-888804"
                      className="w-full h-11 px-4 border border-accent/30 rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors bg-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
                    ইমেইল
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full h-11 px-4 border border-accent/30 rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors bg-muted"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
                    বিষয় *
                  </label>
                  <select
                    required
                    className="w-full h-11 px-4 border border-accent/30 rounded-sm text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors bg-muted"
                  >
                    <option value="">বিষয় নির্বাচন করুন</option>
                    <option value="order">Order সংক্রান্ত</option>
                    <option value="product">Jewelry স্টক ও ইনফো</option>
                    <option value="bridal">Bridal Special Collection</option>
                    <option value="delivery">Delivery সংক্রান্ত</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
                    আপনার বার্তা *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="আপনার প্রশ্ন বা বার্তা লিখুন..."
                    className="w-full px-4 py-3 border border-accent/30 rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none bg-muted"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-13 bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all duration-300 shadow-luxury hover:shadow-gold-glow border border-accent/40 active:scale-[0.99] py-4 cursor-pointer"
                >
                  মেসেজ পাঠান →
                </button>

                <p className="text-[11px] text-center text-muted-foreground">
                  দ্রুত সাড়ার জন্য{" "}
                  <a
                    href={BUSINESS.FACEBOOK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    Facebook Inbox
                  </a>{" "}
                  করুন।
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Address Section */}
      <section className="bg-muted py-12 px-6 border-t border-accent/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold mb-3">
            আমাদের অবস্থান
          </p>
          <h2 className="text-2xl font-bold text-foreground mb-2 font-heading">Euphoria</h2>
          <p className="text-sm text-muted-foreground mb-6 font-medium">
            Mirpur, Dhaka, Bangladesh
          </p>
        </div>
      </section>
    </main>
  );
}
