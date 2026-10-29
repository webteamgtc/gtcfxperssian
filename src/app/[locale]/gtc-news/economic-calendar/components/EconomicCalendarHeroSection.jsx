"use client";

import FadeInSection from "@/app/[locale]/company/contact-us/components/FadeInSection";
import { usePathTranslation } from "@/app/[locale]/LocaleProvider";

const REGISTER_HREF = "https://client.gtcfx.com/register";

const MINI_EVENTS = [
  { time: "09:45", currency: "CNH", country: "cn", name: "Caixin Mfg PMI",    actual: "–",    fcst: "50.5",  prev: "50.4",  impact: "medium" },
  { time: "11:00", currency: "EUR", country: "eu", name: "Mfg PMI Final",      actual: "49.6", fcst: "49.3",  prev: "49.3",  impact: "medium", actualColor: "text-[#2eab71]" },
  { time: "14:30", currency: "USD", country: "us", name: "NFP Employment",     actual: "–",    fcst: "+185K", prev: "+175K", impact: "high" },
  { time: "14:30", currency: "USD", country: "us", name: "ISM Mfg PMI",        actual: "48.9", fcst: "49.8",  prev: "49.2",  impact: "high",   actualColor: "text-[#e04a4a]" },
  { time: "16:00", currency: "USD", country: "us", name: "Construction Spend", actual: "–",    fcst: "49.8",  prev: "0.5%",  impact: "low" },
];

const IMPACT_COLORS = {
  high:   "bg-[#e74c3c]",
  medium: "bg-[#f5b800]",
  low:    "bg-[#c5cdd8]",
};

const STAT_VALUE_FALLBACKS = ["1,800", "25+", "Real-time"];
const STAT_LABEL_FALLBACKS = [
  "Events per month",
  "Countries covered",
  "Data updates",
];

export default function EconomicCalendarHeroSection({ locale = "en" }) {
  const t = usePathTranslation("economicCalendarPage.hero");
  const tabKeys = ["yesterday", "today", "tomorrow", "thisWeek"];
  const columnKeys = ["time", "event", "actual", "forecast", "prior"];
  const columnLabels = ["TIME", "EVENT", "ACTUAL", "FORECAST", "PRIOR"];

  return (
    <section
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat py-14 md:py-20"
      style={{ backgroundImage: "url('/breadcamp/leverage.webp')" }}
    >
      <div className="absolute inset-0 bg-white/25" />

      <div className="container relative z-10 min-w-0 max-w-full pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            {/* Left */}
            <FadeInSection>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E1E7F6] bg-white px-4 py-2 text-sm font-medium text-[#293B93]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#293B93]" />
                  {t("badge", "Professional Trading Tool")}
                </span>

                <h1 className="HeadingH1 mt-6 text-[#000032]">
                  {t("headingPrefix", "Your daily")}{" "}
                  <span className="text-[#293B93]">{t("headingAccent1", "trading")}</span>
                  <br />
                  <span className="text-[#293B93]">{t("headingAccent2", "command")}</span>{" "}
                  {t("headingSuffix", "center")}
                </h1>

                <p className="Text mt-5 max-w-md font-normal leading-[1.7] text-[#5a5a6e]">
                  {t("sub", "Track high-impact economic events, analyze historical data, and execute trades the moment the market moves — all in one professional workspace.")}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#calendar"
                    className="inline-flex items-center gap-2 rounded-full bg-[#293B93] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2d75]"
                  >
                    {t("viewCalendarCta", "View Live Calendar")}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a
                    href={REGISTER_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-[#293B93] px-6 py-3 text-sm font-semibold text-[#293B93] transition hover:bg-[#293B93]/5"
                  >
                    {t("alertsCta", "Set Event Alerts")}
                  </a>
                </div>

                {/* Stats */}
                <div className="mt-10 flex flex-wrap gap-8">
                  {STAT_VALUE_FALLBACKS.map((fallbackValue, index) => (
                    <div key={index}>
                      <p className="HeadingH3 font-bold text-[#293B93]">
                        {t(`statValues.${index}`, fallbackValue)}
                      </p>
                      <p className="TextSmall mt-1 font-normal text-[#5a5a6e]">
                        {t(`stats.${index}`, STAT_LABEL_FALLBACKS[index])}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* Right — Mini calendar card */}
            <FadeInSection delay={0.15}>
              <div className="w-full rounded-2xl border border-[#E1E7F6] bg-white shadow-lg overflow-hidden">

                {/* Card header */}
                <div className="flex items-center justify-between border-b border-[#E1E7F6] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-[#293B93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <span className="text-sm font-semibold text-[#000032]">{t("card.title", "Economic Calendar")}</span>
                  </div>
                  <span className="rounded bg-[#F0F4FF] px-2.5 py-1 text-xs font-medium text-[#293B93]">{t("card.timezone", "UTC+4 · GST")}</span>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#E1E7F6]">
                  {tabKeys.map((key, index) => (
                    <span
                      key={key}
                      className={`flex-1 py-2.5 text-center text-xs font-medium ${
                        key === "today"
                          ? "bg-[#293B93] text-white"
                          : "text-[#8a8a9a]"
                      }`}
                    >
                      {t(`card.tabs.${index}`, ["Yesterday", "Today", "Tomorrow", "This Week"][index])}
                    </span>
                  ))}
                </div>

                {/* Table — matches screenshot layout */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#ededed]">
                        {columnKeys.map((key, i) => (
                          <th
                            key={key}
                            className={`px-4 py-3 text-[11px] font-normal uppercase tracking-[0.06em] text-[#999999] ${
                              ["actual", "forecast", "prior"].includes(key) ? "text-center" : ""
                            }`}
                          >
                            {t(`card.columns.${key}`, columnLabels[i])}
                          </th>
                        ))}
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {MINI_EVENTS.map((ev, i) => (
                        <tr key={i} className="border-b border-[#ededed] last:border-b-0">
                          {/* Time */}
                          <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[#666666]">{ev.time}</td>

                          {/* Impact dot + country code */}
                          <td className="whitespace-nowrap px-2 py-3">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${IMPACT_COLORS[ev.impact]}`} />
                              <span className="text-[13px] font-semibold text-[#333333]">{ev.currency}</span>
                            </span>
                          </td>

                          {/* Event name */}
                          <td className="min-w-[140px] px-4 py-3">
                            <span className="text-[13px] font-medium text-[#333333]">{t(`events.${i}`, ev.name)}</span>
                          </td>

                          {/* Actual */}
                          <td className="px-3 py-3 text-center text-[13px] font-semibold tabular-nums">
                            <span className={ev.actualColor || "text-[#333333]"}>{ev.actual}</span>
                          </td>

                          {/* Forecast */}
                          <td className="px-3 py-3 text-center text-[13px] tabular-nums text-[#666666]">{ev.fcst}</td>

                          {/* Prior */}
                          <td className="px-3 py-3 text-center text-[13px] tabular-nums text-[#666666]">{ev.prev}</td>

                          {/* Trade button */}
                          <td className="px-3 py-3 text-right">
                            <span className="inline-block rounded-full bg-[#EEF1FB] px-3 py-1 text-[11px] font-semibold text-[#293B93]">
                              {t("card.tradeCta", "Trade")} {ev.currency}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </FadeInSection>

          </div>
        </div>
      </div>
    </section>
  );
}
