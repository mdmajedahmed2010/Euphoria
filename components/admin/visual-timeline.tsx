"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Truck, Package, XCircle } from "lucide-react";

export function VisualOrderTimeline({
  timeline,
  currentStatus,
}: {
  timeline: {
    id: string;
    status: string;
    note: string | null;
    createdAt: Date;
    createdBy: string | null;
  }[];
  currentStatus: string;
}) {
  const steps = [
    { status: "PENDING", label: "Order Placed", icon: Clock },
    { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
    { status: "PROCESSING", label: "Processing", icon: Package },
    { status: "SHIPPED", label: "Shipped", icon: Truck },
    { status: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
  ];

  const getStepIndex = (status: string) => steps.findIndex((s) => s.status === status);
  let currentIndex = getStepIndex(currentStatus);

  const isFailed = ["CANCELLED", "RETURNED", "REFUNDED"].includes(currentStatus);
  if (isFailed) {
    currentIndex = steps.length; // Stop progress bar
  }

  return (
    <div className="w-full">
      {/* Visual Progress Bar */}
      <div className="relative mb-12 mt-6 px-4">
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200 rounded-full"></div>
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: isFailed ? "100%" : `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className={`absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full ${isFailed ? "bg-red-500" : "bg-emerald-500"}`}
        />

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentIndex && !isFailed;
            const isActive = index === currentIndex && !isFailed;

            return (
              <div key={step.status} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm transition-colors ${
                    isCompleted ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
                  } ${isActive ? "ring-4 ring-emerald-100" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
                <div className="absolute mt-12 text-center">
                  <p
                    className={`text-xs font-bold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isFailed && (
        <div className="mt-8 mb-8 rounded-lg bg-red-50 p-4 border border-red-100 flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-bold text-red-900">Order {currentStatus}</h3>
            <p className="text-sm text-red-700">
              This order has been cancelled, returned, or refunded and will not be fulfilled.
            </p>
          </div>
        </div>
      )}

      {/* Detailed Log */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {timeline?.map(
          (
            entry: { id: string; status: string; note: string | null; createdAt: Date; createdBy: string | null },
            index: number
          ) => {
            const isLatest = index === 0;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  {entry.status === "PENDING" ? (
                    <Clock className="w-4 h-4" />
                  ) : entry.status === "CONFIRMED" ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  ) : entry.status === "PROCESSING" ? (
                    <Package className="w-4 h-4 text-indigo-500" />
                  ) : entry.status === "SHIPPED" ? (
                    <Truck className="w-4 h-4 text-purple-500" />
                  ) : entry.status === "DELIVERED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>

                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold ${isLatest ? "text-indigo-600" : "text-slate-900"}`}>
                      {entry.status}
                    </h4>
                    <time className="text-xs font-mono text-slate-400">
                      {new Date(entry.createdAt).toLocaleDateString("en-BD", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                      {entry.note}
                    </p>
                  )}
                  <div className="mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Updated by: {entry.createdBy === "GUEST" ? "Customer" : "Admin"}
                  </div>
                </div>
              </motion.div>
            );
          }
        )}
      </div>
    </div>
  );
}
