import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, Eye, Phone, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Refund & Pre-Order Policy — Euphoria | Euphoria",
  description:
    "Euphoria-এর Refund, Exchange এবং Pre-Order Policy। Delivery-এর সময় পণ্য দেখে নিন।",
};

const policyPoints = [
  {
    icon: Eye,
    title: "Delivery-তে পণ্য চেক করা বাধ্যতামূলক",
    body: "You have to check products in front of the delivery man. If you find any problem, direct call me or ask the delivery man to call me.",
    type: "warning",
  },
  {
    icon: ShieldCheck,
    title: "রিটার্ন এবং রিফান্ড",
    body: "You can’t simply return a product by giving random excuses, you need to have a legit reason. You can’t hold any product for more than 15 days after it arrives (but if you have any family or financial issues please share we’ll consider).",
    type: "info",
  },
  {
    icon: Clock,
    title: "Pre-Order ডেলিভারি সময়",
    body: "Delivery time within 20-25 days inshaallah. If I can't deliver your pre-order product within the given period then you will get back your advance money Instantly!",
    type: "success",
  },
  {
    icon: Truck,
    title: "Delivery System",
    body: "Inside Dhaka: Cash on Delivery (COD) available for Ready Stock products.",
    type: "info",
  },
  {
    icon: AlertTriangle,
    title: "Pre-Order পেমেন্ট শর্তাবলী",
    body: "Be 100% sure before placing an order. Order cancel is Not Allowed. Advance 500 BDT for price below 3000 BDT and 1000 BDT for price 5000 BDT. When sharing a dress link from the website or other sources, a 50% advance payment is mandatory.",
    type: "warning",
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="bg-primary py-16 md:py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-accent -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-accent translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-block px-4 py-1.5 border border-accent/40 bg-accent/10 text-primary-foreground text-[10px] uppercase tracking-[0.28em] font-bold rounded-full">
            Important Information
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
            Refund & Pre-Order Policy
          </h1>
          <p className="text-primary-foreground/80 text-sm leading-relaxed">
            Please read the important information before ordering from Euphoria.
          </p>
        </div>
      </section>

      {/* Main Alert */}
      <section className="bg-primary py-5 px-6 border-t border-accent/30">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 justify-center flex-wrap text-center">
            <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
            <p className="text-primary-foreground text-sm font-bold tracking-wide">
              Same love, same quality — now with a new name: Euphoria
            </p>
            <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Policy Cards */}
          <div className="space-y-5 mb-16">
            {policyPoints.map((point, idx) => (
              <div
                key={point.title}
                className={`flex items-start gap-5 p-6 rounded-sm border ${
                  point.type === "warning"
                    ? "bg-amber-50 border-amber-200 border-l-4 border-l-amber-500"
                    : point.type === "success"
                    ? "bg-emerald-50 border-emerald-100 border-l-4 border-l-emerald-500"
                    : "bg-surface border-border border-l-4 border-l-primary"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                    point.type === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : point.type === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-primary"
                  }`}
                >
                  <point.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/50 font-mono">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h2
                      className={`text-sm font-bold uppercase tracking-wide ${
                        point.type === "warning"
                          ? "text-amber-800"
                          : point.type === "success"
                          ? "text-emerald-800"
                          : "text-foreground"
                      }`}
                    >
                      {point.title}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{point.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact for Help */}
          <div className="text-center space-y-4 mt-8">
            <p className="text-sm text-muted-foreground">
              For any issues or to ask questions, please contact us:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={BUSINESS.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 px-8 bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-bold rounded-sm transition-all shadow-sm tracking-wide"
              >
                Message on Facebook
              </a>
              <a
                href={`tel:${BUSINESS.PHONE}`}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 border-2 border-primary/30 text-primary text-sm font-semibold rounded-sm hover:bg-primary/5 hover:border-primary transition-all tracking-wide"
              >
                <Phone className="h-4 w-4" />
                {BUSINESS.PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
