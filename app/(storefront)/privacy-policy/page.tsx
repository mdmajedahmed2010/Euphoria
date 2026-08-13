/**
 * Euphoria — Privacy Policy
 * Euphoria | Authentic Authentic Luxury jewelry & Designer Collections
 */

import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy — Euphoria | Euphoria",
  description:
    "Euphoriaের Privacy Policy। আমরা আপনার ব্যক্তিগত তথ্যের নিরাপত্তাকে সর্বোচ্চ গুরুত্ব দিই।",
};

const privacySections = [
  {
    id: "01",
    title: "আমরা কোন তথ্য সংগ্রহ করি?",
    content: `আপনি যখন আমাদের কাছে Order করেন, তখন আমরা নিচের তথ্য সংগ্রহ করি:
• আপনার নাম
• ফোন নম্বর
• ডেলিভারি ঠিকানা (ঢাকা / ঢাকার বাইরে)
• Email (যদি প্রদান করেন)

আমরা কোনো Payment Card তথ্য, পিন নম্বর বা সংবেদনশীল ব্যাংক তথ্য সংগ্রহ করি না।`,
  },
  {
    id: "02",
    title: "আমরা এই তথ্য কীভাবে ব্যবহার করি?",
    content: `আপনার তথ্য শুধুমাত্র নিম্নলিখিত কাজে ব্যবহৃত হয়:
• Order Processing ও Confirmation
• Delivery Coordination (কুরিয়ার সার্ভিসের মাধ্যমে)
• Customer Service (সমস্যা বা প্রশ্নের ক্ষেত্রে)
• নতুন Collection ও Offer সম্পর্কে জানানো (আপনার সম্মতিতে)`,
  },
  {
    id: "03",
    title: "আমরা কি তৃতীয় পক্ষের সাথে তথ্য শেয়ার করি?",
    content: `আমরা আপনার ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করি না।

শুধুমাত্র Delivery Partner (Courier Service) আপনার ঠিকানা ও ফোন নম্বর পায় — শুধুমাত্র পণ্য সঠিকভাবে পৌঁছে দেওয়ার জন্য।`,
  },
  {
    id: "04",
    title: "Cookies ও Website Analytics",
    content: `আমাদের ওয়েবসাইটে আপনার অভিজ্ঞতা উন্নত করতে আমরা Cookies ব্যবহার করতে পারি। এতে Shopping Cart তথ্য ও ব্যবহারকারীর পছন্দ সংরক্ষিত থাকে।

আমরা Website Traffic বোঝার জন্য Anonymous Analytics ব্যবহার করি — এতে কোনো ব্যক্তিগত তথ্য সংরক্ষিত হয় না।`,
  },
  {
    id: "05",
    title: "Facebook Page ও Messaging",
    content: `আপনি যখন আমাদের Facebook Page-এ Inbox করেন, তখন Facebook-এর নিজস্ব Privacy Policy প্রযোজ্য হয়।

Facebook Messenger-এ আপনার পাঠানো তথ্য (নাম, ঠিকানা, Order Details) শুধুমাত্র Order Process করতে ব্যবহৃত হয়।`,
  },
  {
    id: "06",
    title: "তথ্যের নিরাপত্তা",
    content: `আমরা আপনার তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। আমাদের ওয়েবসাইটে SSL Encryption ব্যবহার করা হয়।

আপনার তথ্য শুধুমাত্র Authorized Team Members দেখতে পারেন।`,
  },
  {
    id: "07",
    title: "আপনার অধিকার",
    content: `আপনার নিম্নলিখিত অধিকার আছে:
• আমাদের কাছে থাকা আপনার তথ্য জানার অধিকার
• তথ্য সংশোধনের অনুরোধ করার অধিকার
• Marketing Communication থেকে Opt-out করার অধিকার

এই বিষয়ে আমাদের Facebook Inbox বা ইমেইলে যোগাযোগ করুন।`,
  },
  {
    id: "08",
    title: "Policy আপডেট",
    content: `আমরা এই Privacy Policy যেকোনো সময় আপডেট করতে পারি। যেকোনো পরিবর্তন ওয়েবসাইটে এবং Facebook Page-এ জানানো হবে।

সর্বশেষ আপডেট: জুলাই ২০২৬`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fdfaf5]">
      {/* Page Header */}
      <section className="bg-[#0a0a0a] py-16 md:py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#d4af37] -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-block px-4 py-1.5 border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#fcfaf6] text-[10px] uppercase tracking-[0.28em] font-bold rounded-full">
            গোপনীয়তা নীতি
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
            Privacy Policy
          </h1>
          <p className="text-[#fcfaf6]/80 text-sm leading-relaxed">
            আমরা আপনার ব্যক্তিগত তথ্যের নিরাপত্তাকে সর্বোচ্চ গুরুত্ব দিই।
          </p>
          <p className="text-[#d4af37]/70 text-xs">সর্বশেষ আপডেট: জুলাই ২০২৬</p>
        </div>
      </section>

      {/* Commitment Strip */}
      <section className="bg-[#0a0a0a] py-4 px-6 text-center border-t border-[#d4af37]/30">
        <p className="text-[#fcfaf6] text-sm font-semibold tracking-wide">
          ✦ আমরা আপনার তথ্য কখনো বিক্রি করি না বা তৃতীয় পক্ষকে দিই না ✦
        </p>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Intro */}
          <div className="bg-white border border-[#e8e0d0] rounded-sm p-6 md:p-8 mb-8 border-l-4 border-l-[#d4af37]">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Euphoria আপনার গোপনীয়তাকে সম্মান করে। এই Privacy Policy
              আপনাকে জানাবে আমরা কোন তথ্য সংগ্রহ করি, কীভাবে ব্যবহার করি এবং কীভাবে সুরক্ষিত রাখি।
              আমাদের Website ব্যবহার করে বা Order করে আপনি এই Policy-তে সম্মত হচ্ছেন।
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-5 mb-12">
            {privacySections.map((section) => (
              <div
                key={section.id}
                className="bg-white border border-[#e8e0d0] rounded-sm p-6 border-l-4 border-l-[#0a0a0a]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-mono text-[#d4af37] font-bold bg-[#0a0a0a]/10 px-2 py-0.5 rounded">
                    {section.id}
                  </span>
                  <h2 className="text-base font-bold text-[#1a0008]">{section.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="bg-[#f7f0e8] rounded-sm p-6 text-center border border-[#d4af37]/20">
            <h3 className="text-base font-bold text-[#1a0008] mb-2">
              Privacy সম্পর্কে প্রশ্ন আছে?
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              আমাদের সাথে যোগাযোগ করুন — আমরা আপনার প্রশ্নের উত্তর দিতে সদা প্রস্তুত।
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={BUSINESS.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-11 px-7 bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-bold rounded-sm transition-all shadow-sm tracking-wide"
              >
                Facebook Inbox করুন
              </a>
              <a
                href={`mailto:${BUSINESS.EMAIL}`}
                className="inline-flex items-center justify-center h-11 px-6 border-2 border-[#0a0a0a]/30 text-[#0a0a0a] text-sm font-semibold rounded-sm hover:bg-[#0a0a0a]/5 hover:border-[#0a0a0a] transition-all"
              >
                {BUSINESS.EMAIL}
              </a>
            </div>
          </div>

          {/* Policy Links */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-8">
            <Link href="/terms" className="hover:text-[#0a0a0a] transition-colors font-medium">
              Terms & Conditions
            </Link>
            <span className="text-[#d4af37]">·</span>
            <Link
              href="/refund-policy"
              className="hover:text-[#0a0a0a] transition-colors font-medium"
            >
              Refund Policy
            </Link>
            <span className="text-[#d4af37]">·</span>
            <Link href="/contact" className="hover:text-[#0a0a0a] transition-colors font-medium">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
