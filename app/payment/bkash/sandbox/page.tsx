"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function BkashSandboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order");
  const amount = searchParams.get("amount");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment/webhook?gateway=bkash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentID: `PAY-${Date.now()}`, orderId }),
      });
      if (res.ok) {
        router.push(`/order/success?order=${orderId}&gateway=bkash`);
      } else {
        alert("Payment failed");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Payment error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          {/* Using a generic pink circle as bKash logo placeholder for sandbox */}
          <div className="w-20 h-20 bg-[#e2136e] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">bKash</span>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">bKash Sandbox</h1>
          <p className="text-gray-500 text-sm mt-1">This is a test payment environment</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-semibold text-gray-800">{orderId}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Amount:</span>
            <span className="font-bold text-[#e2136e]">৳{amount}</span>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-[#e2136e] hover:bg-[#c0105d] text-white py-3 rounded-md font-bold text-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Payment"}
        </button>

        <button onClick={() => router.back()} className="text-gray-500 text-sm hover:underline">
          Cancel & Return to Merchant
        </button>
      </div>
    </div>
  );
}

export default function BkashSandbox() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        </div>
      }
    >
      <BkashSandboxContent />
    </Suspense>
  );
}
