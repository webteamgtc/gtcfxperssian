/** Lets the hero quick links switch the instrument-schedule tab. */
export const SCHEDULE_TAB_EVENT = 'dl:schedule-tab';

export function selectScheduleTab(key) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SCHEDULE_TAB_EVENT, { detail: key }));
}
