'use client';
/** Dotted 3D globe (canvas) with pins and arcs between them; drag to spin, pauses off screen. */
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { mapDots } from './mapDots';

const D2R = Math.PI / 180;
const landDots = () => mapDots().map(([x, y]) => [(x / 126) * 360 - 180, (32 - y) / 0.42]);

const toVec = (lon, lat) => [Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R)];
// great-circle point between two unit vectors
function slerp(a, b, t) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(dot);
  if (om < 1e-6) return a;
  const s = Math.sin(om);
  const k1 = Math.sin((1 - t) * om) / s;
  const k2 = Math.sin(t * om) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}

export function RegGlobe({ pins, start = 80 }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const reduce = useReducedMotion();
  const state = useRef({ rot: -start * D2R, drag: null, visible: true, dots: null });

  useEffect(() => {
    const st = state.current;
    st.dots = landDots().map(([lon, lat]) => toVec(lon, lat));
    const cv = canvas.current;
    const ctx = cv.getContext('2d');
    const tilt = 0.32; // radians, show a little of the north
    const ct = Math.cos(tilt);
    const sn = Math.sin(tilt);
    const ents = pins.map((e) => ({ ...e, v: toVec(e.lon, e.lat) }));
    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const r = wrap.current.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.width;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.height = `${H}px`;
    };
    // rotate around the polar axis, then tilt towards the viewer
    const project = (v, R, cx, cy, lift = 1) => {
      const c = Math.cos(st.rot);
      const s = Math.sin(st.rot);
      const x = v[0] * c - v[1] * s;
      const y = v[0] * s + v[1] * c;
      const z = v[2];
      const depth = x * ct + z * sn; // >0 faces the viewer
      const up = z * ct - x * sn;
      return { sx: cx + y * R * lift, sy: cy - up * R * lift, depth };
    };

    const draw = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!st.drag && !reduce) st.rot += dt * 0.00012;
      const R = W * 0.4;
      const cx = W / 2;
      const cy = H / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // atmosphere
      const g = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.25);
      g.addColorStop(0, 'rgba(85,101,189,0.35)');
      g.addColorStop(1, 'rgba(85,101,189,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
      ctx.fill();
      // sphere body
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, 'rgba(85,101,189,0.35)');
      body.addColorStop(1, 'rgba(10,14,38,0.9)');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // land dots
      const ds = Math.max(1.6, R / 105);
      for (const v of st.dots) {
        const p = project(v, R, cx, cy);
        if (p.depth < -0.05) continue;
        ctx.fillStyle = `rgba(255,255,255,${0.18 + 0.72 * Math.max(0, p.depth)})`;
        ctx.fillRect(p.sx - ds / 2, p.sy - ds / 2, ds, ds);
      }

      // arcs HQ → entities with a travelling spark
      const t = (now / 2600) % 1;
      ents.slice(1).forEach((e, i) => {
        const hq = ents[i].v;
        ctx.beginPath();
        let started = false;
        for (let k = 0; k <= 40; k++) {
          const u = k / 40;
          const p = project(slerp(hq, e.v, u), R, cx, cy, 1 + Math.sin(Math.PI * u) * 0.18);
          if (p.depth < -0.1) {
            started = false;
            continue;
          }
          if (!started) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
          started = true;
        }
        ctx.strokeStyle = 'rgba(210,166,122,0.7)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        const u = (t + i * 0.2) % 1;
        const sp = project(slerp(hq, e.v, u), R, cx, cy, 1 + Math.sin(Math.PI * u) * 0.18);
        if (sp.depth > -0.1) {
          ctx.fillStyle = '#f1e3d3';
          ctx.beginPath();
          ctx.arc(sp.sx, sp.sy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // pins
      const pulse = (now / 1600) % 1;
      const pin = (v, gold, label) => {
        const p = project(v, R, cx, cy);
        if (p.depth < 0) return;
        const a = Math.min(1, p.depth * 2.5);
        ctx.globalAlpha = a;
        ctx.strokeStyle = gold ? 'rgba(210,166,122,0.8)' : 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 4 + pulse * 12, 0, Math.PI * 2);
        ctx.globalAlpha = a * (1 - pulse);
        ctx.stroke();
        ctx.globalAlpha = a;
        ctx.fillStyle = gold ? '#b68756' : '#ffffff';
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, gold ? 5 : 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '600 11px Inter, system-ui, sans-serif';
        const w = ctx.measureText(label).width + 12;
        const lx = p.sx + 9 + w > W - 4 ? p.sx - 9 - w : p.sx + 9; // flip the label inwards near the edge
        ctx.fillStyle = gold ? 'rgba(182,135,86,0.95)' : 'rgba(10,14,38,0.8)';
        ctx.beginPath();
        ctx.roundRect(lx, p.sy - 9, w, 18, 5);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, lx + 6, p.sy + 4);
        ctx.globalAlpha = 1;
      };
      ents.forEach((e) => pin(e.v, e.gold, e.label));

      if (st.visible && !reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(performance.now());
    });
    ro.observe(wrap.current);
    const io = new IntersectionObserver(([en]) => {
      st.visible = en.isIntersecting;
      cancelAnimationFrame(raf);
      if (st.visible) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(wrap.current);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduce, pins]);

  // drag to spin
  const onDown = (e) => {
    state.current.drag = { x: e.clientX, rot: state.current.rot };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    const d = state.current.drag;
    if (d) state.current.rot = d.rot - (e.clientX - d.x) * 0.006;
  };
  const onUp = () => {
    state.current.drag = null;
  };

  return (
    <div ref={wrap} dir="ltr" className="relative mx-auto w-full max-w-[520px] cursor-grab touch-pan-y active:cursor-grabbing" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-hidden>
      <canvas ref={canvas} className="block w-full" />
    </div>
  );
}

