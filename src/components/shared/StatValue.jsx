'use client';
import { CountUp } from '@/components/motion';

/**
 * Renders a stat string and counts up its whole-number part:
 * "$0" → $0, "10+" → 10+, "1:2000" → 1:2000 (counts the 2000).
 * Values with decimals ("0.0") or no digits ("Instant") are shown as-is.
 */
export default function StatValue({ value }) {
  const m = String(value).match(/^(.*?)(\d+)(\D*)$/);
  if (!m || /\d\.$|\.\d/.test(String(value))) return value;
  return <CountUp value={Number(m[2])} prefix={m[1]} suffix={m[3]} />;
}
