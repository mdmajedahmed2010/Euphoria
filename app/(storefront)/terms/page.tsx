/**
 * Euphoria — Terms & Conditions
 * Euphoria | Authentic Authentic Luxury jewelry & Designer Collections
 */

import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & Conditions — Euphoria | Euphoria",
  description:
    "Euphoriaের Terms & Conditions। Order Process, Delivery Policy, Cash on Delivery, 3-Day Exchange Policy সম্পর্কে বিস্তারিত জানুন।",
};

const sections = [
  {
    id: "01",
    title: "আমাদের পরিচয় ও ব্যবসায়িক মডেল",
    content: `Euphoria বাংলাদেশে প্রিমিয়াম ট্র্যাডিশনাল শাড়ি এবং এক্সক্লুসিভ কালেকশনের একটি নির্ভরযোগ্য বুটিক ব্র্যান্ড।

আমরা ১০০% অরিজিনাল প্রিমিয়াম কালেকশন ও ফ্যাব্রিক সরবরাহ করি। সকল ড্রেস প্রিমিয়াম ফিনিশিং এবং নিখুঁত সূচিকর্ম দ্বারা সমৃদ্ধ।`,
  },
  {
    id: "02",
    title: "Order Process",
    content: `Order করতে আমাদের Facebook Page-এ Inbox করুন অথবা সরাসরি ওয়েবসাইটে অর্ডার প্লেস করুন। অর্ডার করার সময় নিম্নের তথ্য প্রদান করুন:
• আপনার পূর্ণ নাম
• সক্রিয় ফোন নম্বর
• সম্পূর্ণ ডেলিভারি ঠিকানা (জেলা ও থানা সহ)
• পছন্দের পণ্যের বিস্তারিত (ছবি/নাম)

✅ 𝐑𝐞𝐚𝐝𝐲 𝐒𝐭𝐨𝐜𝐤: Inside dhaka Cash on Delivery (𝐂𝐎𝐃)

✅ 𝐏𝐫𝐞 𝐎𝐫𝐝𝐞𝐫: 
• Be 𝟏𝟎𝟎% sure before placing an order. Order cancel is 𝐍𝐨𝐭 𝐀𝐥𝐥𝐨𝐰𝐞𝐝.
• Have to advance 500tk for price below 3000 and 1000tk for price 5000.
• When sharing a dress link from the website or other sources, a 𝟓𝟎% advance payment is mandatory.
• Delivery time within 𝟐𝟎-𝟐𝟓 days inshaallah.`,
  },
  {
    id: "03",
    title: "Delivery Policy",
    content: `ডেলিভারি চার্জ:
• ঢাকার ভিতরে: ৳80
• ঢাকার বাইরে: ৳150

ডেলিভারি সময়:
• ঢাকার ভিতরে: ২৪–৪৮ ঘন্টা (১-২ কার্যদিবস)
• ঢাকার বাইরে: ২–৪ কার্যদিবস

Cash on Delivery সুবিধায় পণ্য ডেলিভারি ম্যানের থেকে বুঝে পাওয়ার পর মূল্য পরিশোধ করুন।`,
  },
  {
    id: "04",
    title: "Return & Exchange Policy",
    content: `You have to 𝐜𝐡𝐞𝐜𝐤 𝐩𝐫𝐨𝐝𝐮𝐜𝐭𝐬 in front of the delivery man if you find any problem direct call me or ask the delivery man to call me.

You can’t simply return a product by giving random excuses, you need to have a legit reason.
You can’t hold any product for more than 15days after it arrives (but if you have any family or financial issues please share we’ll consider).

If I cant delivered your pre order product within the given period then u will get back ur advance money 𝐈𝐧𝐬𝐭𝐚𝐧𝐭𝐥𝐲!`,
    highlight: false,
  },
  {
    id: "05",
    title: "পণ্যের গুণমান ও অরিজিনালিটি",
    content: `Euphoriaের প্রতিটি ড্রেস:
• ১০০% আসল ও প্রিমিয়াম কাপড়ের নিশ্চয়তা
• উন্নত ফিনিশিং ও নিখুঁত কাজ
• Premium কোয়ালিটি ও পজিটিভ ফিডব্যাক`,
  },
  {
    id: "06",
    title: "Privacy ও তথ্যের নিরাপত্তা",
    content: `আপনার ব্যক্তিগত তথ্য (নাম, ফোন, ঠিকানা) শুধুমাত্র Order Process ও Delivery-র জন্য ব্যবহার করা হয়। আমরা কোনো তৃতীয় পক্ষের সাথে আপনার তথ্য শেয়ার করি না।`,
  },
  {
    id: "07",
    title: "যোগাযোগ",
    content: `যেকোনো প্রশ্ন বা সমস্যার জন্য:

Facebook Page: facebook.com/EuphoriaByAbida
ফোন/হোয়াটসঅ্যাপ: ${BUSINESS.PHONE}
ইমেইল: ${BUSINESS.EMAIL}
ঠিকানা: Dhaka, Bangladesh`,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fdfaf5]">
      {/* Page Header */}
      <section className="bg-[#0a0a0a] py-16 md:py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#d4af37] translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-block px-4 py-1.5 border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#fcfaf6] text-[10px] uppercase tracking-[0.28em] font-bold rounded-full">
            আমাদের শর্তাবলী
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
            Terms & Conditions
          </h1>
          <p className="text-[#fcfaf6]/80 text-sm leading-relaxed">
            Euphoriaে কেনাকাটা করার আগে আমাদের শর্তাবলী পড়ুন।
          </p>
          <p className="text-[#d4af37]/70 text-xs">সর্বশেষ আপডেট: জুলাই ২০২৬</p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((section) => (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className="rounded-sm p-6 md:p-8 bg-white border border-[#e8e0d0] border-l-4 border-l-[#0a0a0a]"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-mono text-[#d4af37] font-bold bg-[#0a0a0a]/10 px-2 py-0.5 rounded">
                  {section.id}
                </span>
                <h2 className="text-base md:text-lg font-bold text-[#1a0008]">
                  {section.title}
                </h2>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}

          {/* Acceptance Notice */}
          <div className="text-center pt-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a0a0a]/5 border border-[#d4af37]/25">
              <span className="text-[#d4af37] text-sm">✦</span>
              <p className="text-xs text-[#0a0a0a] font-medium">
                Euphoriaে Order করে আপনি এই Terms & Conditions-এ সম্মত হচ্ছেন
              </p>
              <span className="text-[#d4af37] text-sm">✦</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/refund-policy"
                className="text-sm text-[#0a0a0a] hover:underline font-semibold"
              >
                Refund & Exchange Policy →
              </Link>
              <span className="text-[#d4af37] hidden sm:inline">|</span>
              <Link
                href="/contact"
                className="text-sm text-[#0a0a0a] hover:underline font-semibold"
              >
                Contact Us →
              </Link>
              <span className="text-[#d4af37] hidden sm:inline">|</span>
              <Link
                href="/privacy-policy"
                className="text-sm text-[#0a0a0a] hover:underline font-semibold"
              >
                Privacy Policy →
              </Link>
            </div>

            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center h-12 px-10 bg-[#0a0a0a] text-[#fcfaf6] text-xs font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-[#1a1a1a] transition-all shadow-sm"
              >
                কেনাকাটা শুরু করুন
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
