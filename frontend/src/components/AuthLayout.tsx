import type { ReactNode } from "react";

const tapeLines = [
  "Rent · ₹25,000 · Recurring",
  "Salary · ₹85,000 · Income",
  "Food · ₹3,200 · Expense",
  "Flight to Goa · ₹16,000",
  "Bonus · ₹45,000 · Income",
  "Scuba Diving · ₹8,500",
  "Bank Savings · ₹50,000",
  "Hotel Booking · ₹12,000",
  "Groceries · ₹950",
  "Petrol Refill · ₹2,500",
];

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      <div className="relative md:w-1/2 bg-navy overflow-hidden flex flex-col justify-between px-10 py-12 min-h-[280px] md:min-h-screen">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
          <div className="tape-column">
            {[...tapeLines, ...tapeLines].map((line, i) => (
              <p key={i} className="font-mono text-sm text-slate-soft whitespace-nowrap py-3">
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <span className="font-mono text-xs tracking-widest text-gold uppercase">
            AI-Powered Finance
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl md:text-5xl text-white leading-[1.1]">{title}</h1>
          <p className="mt-4 font-sans text-slate-soft text-base leading-relaxed">{subtitle}</p>
        </div>

        <div className="relative z-10 font-mono text-xs text-slate-soft">
          Track. Understand. Ask.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-paper">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}