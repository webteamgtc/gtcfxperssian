"use client";

import { useState } from "react";
import FadeInSection from "@/app/[locale]/company/contact-us/components/FadeInSection";
import { usePathTranslation } from "@/app/[locale]/LocaleProvider";

function ChevronIcon({ isOpen }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-[#293B93] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FAQS = [
  {
    question: "What is an Economic Calendar?",
    answer:
      "An economic calendar is a schedule of upcoming economic events and data releases — such as interest rate decisions, GDP figures, employment reports, and inflation data — that can move financial markets. Traders use it to plan positions ahead of high-impact events.",
  },
  {
    question: "How do I use the Economic Calendar to trade?",
    answer:
      "Filter events by date range, impact level (High / Medium / Low), and country. Before a high-impact release, check the forecast vs. prior values. If the actual beats the forecast, the affected currency or instrument typically strengthens — and vice versa. Always use proper risk management around news events.",
  },
  {
    question: "What does the impact level (High / Medium / Low) mean?",
    answer:
      "Impact level indicates how much a data release has historically moved the markets. High-impact events — like Non-Farm Payrolls, FOMC decisions, or CPI — tend to cause significant price swings. Medium-impact events cause moderate moves, while Low-impact events rarely shift prices materially.",
  },
  {
    question: "What time zone does the calendar use?",
    answer:
      "By default, the calendar displays event times in your local time zone. You can switch to UTC or any other time zone using the timezone selector at the top of the calendar.",
  },
  {
    question: "Is the Economic Calendar data real-time?",
    answer:
      "Yes. The real-time economic calendar updates actual values as soon as official data is released. Forecast and previous figures are sourced from leading financial data providers and updated regularly",
  },
];

export default function EconomicCalendarFaqSection() {
  const t = usePathTranslation("economicCalendarPage.faq");
  const [openIndex, setOpenIndex] = useState(0);

  const items = FAQS.map((item, index) => ({
    question: t(`items.${index}.question`, item.question),
    answer: t(`items.${index}.answer`, item.answer),
  }));

  return (
    <section className="bg-white py-10 md:py-20">
      <div className="container min-w-0 max-w-full">
        <div className="mx-auto max-w-4xl">
          {/* Section heading */}
          <FadeInSection>
            <div className="mb-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E1E7F6] bg-white px-4 py-2 text-sm font-medium text-[#293B93]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#293B93]" />
                {t("badge", "Q&A")}
              </span>
              <h2 className="HeadingH1 mt-5 font-bold text-[#000032]">{t("heading", "Frequently Asked Questions")}</h2>
            </div>
          </FadeInSection>

          <FadeInSection>
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.question}
                  className={`mb-5 border px-6 py-5 transition-all duration-300 md:px-8 md:py-6 ${
                    isOpen
                      ? "rounded-3xl border-transparent bg-[#F5F7FF]"
                      : "rounded-full border-[#E1E7F6] bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-base font-semibold leading-snug md:text-lg ${
                        isOpen ? "text-[#000032]" : "text-[#4E4E4E]"
                      }`}
                    >
                      {item.question}
                    </span>
                    <ChevronIcon isOpen={isOpen} />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pt-4 text-[15px] leading-[1.8] text-[#5a5a6e]">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
