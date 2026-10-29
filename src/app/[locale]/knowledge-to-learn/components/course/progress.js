'use client';
/** Per-viewer course progress (browser storage only; empty when storage is unavailable). */
import { useEffect, useState } from 'react';

const key = (course) => `gtc-learn:${course}`;

function read(course) {
  try {
    const v = JSON.parse(window.localStorage.getItem(key(course)) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Mark `<section>/<article>` of a course as read. */
export function markRead(course, section, article) {
  try {
    const id = `${section}/${article}`;
    const list = read(course);
    if (!list.includes(id)) window.localStorage.setItem(key(course), JSON.stringify([...list, id]));
  } catch {}
}

/** Read lesson ids (`<section>/<article>`) of a course; [] on the server and first render. */
export function useReadLessons(course) {
  const [list, setList] = useState([]);
  useEffect(() => setList(read(course)), [course]);
  return list;
}

export function useMarkRead(course, section, article) {
  useEffect(() => markRead(course, section, article), [course, section, article]);
}
