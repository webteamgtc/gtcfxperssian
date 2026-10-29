"use client";

import FadeInSection from "@/app/[locale]/company/contact-us/components/FadeInSection";
import { localizedHref } from "@/i18n/localizedHref";
import { usePathTranslation } from "@/app/[locale]/LocaleProvider";

const REGISTER_HREF = "/live-account-application";

export default function EconomicCalendarCtaSection({ locale = "en" }) {
  const t = usePathTranslation("economicCalendarPage.cta");
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-[#F2F4FB]">
      {/* Soft bg */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, #F4F6FB 0%, #EEF1FA 50%, #F4F6FB 100%)" }}
      />
      {/* Decorative circle */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D8E0F7]/40" />

      <div className="container relative z-10 min-w-0 max-w-full">
        <div className="mx-auto max-w-2xl text-center">
          <FadeInSection>
            <h2 className="HeadingH1 font-bold text-[#000032]">
              {t("headingLine1", "Data-Driven Trading")}
            </h2>
            <h2 className="HeadingH1 font-bold text-[#293B93]">
              {t("headingLine2", "Seize the Moment")}
            </h2>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <p className="Text mx-auto mt-5 max-w-xl font-normal leading-[1.7] text-[#5a5a6e]">
              {t("sub", "Act on economic data the instant it's released. Open a GTCFX account and trade smarter.")}
            </p>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={localizedHref(locale, REGISTER_HREF)}
                className="inline-flex items-center rounded-full bg-[#293B93] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1f2d75]"
              >
                {t("openCta", "Open Live Account")}
              </a>
              <a
                href={localizedHref(locale, "/trading/free-demo-account")}
                className="inline-flex items-center rounded-full border border-[#293B93] px-8 py-3.5 text-sm font-semibold text-[#293B93] transition hover:bg-[#293B93]/5"
              >
                {t("demoCta", "Try Demo Account")}
              </a>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
