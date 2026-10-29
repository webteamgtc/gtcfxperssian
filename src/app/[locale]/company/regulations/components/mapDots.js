// Land dots for the map, generated from public/images/world-dots.svg (126 × 62 dot grid).
// Each row: pairs of base-36 start/end x positions (×2), runs of dots 1 unit apart. Rows follow ROW_Y.
const ROW_Y = [0.0, 0.87, 1.73, 2.6, 3.46, 4.33, 5.2, 6.06, 6.93, 7.79, 8.66, 9.53, 10.39, 11.26, 12.12, 12.99, 13.86, 14.72, 15.59, 16.45, 17.32, 18.19, 19.05, 19.92, 20.78, 21.65, 22.52, 23.38, 24.25, 25.11, 25.98, 26.85, 27.71, 28.58, 29.44, 30.31, 31.18, 32.04, 32.91, 33.77, 34.64, 35.51, 36.37, 37.24, 38.11, 38.97, 39.84, 40.7, 41.57, 42.44, 43.3, 44.17, 45.03, 45.9, 46.77, 47.63, 48.5, 49.36, 50.23, 51.1, 51.96, 52.83, 53.69, 54.56, 55.43, 56.29, 57.16, 58.02, 58.89];
const DATA = '0h0h191f1n1n1t232j3141414l4l4t6h|0c0m10101a1i1o1o1u262g303y424u4w506m|0d0r0v15191h1l1l1p1p1v1v21252j2z3v454p4r4v6r6v6z|00000a181e1e1o1q1u1w22262i2y3u484m4m4q4s4w4w506y|01010b1v21272h2t3t494d4d4h6z|00040c1u242a2i2s3s44484a4e6y|0105091t232529292h2p33373r3x41454b6z|04040a0a0e1w20262i2o34363q3w406y|0d1p1x1x25272j2n3p3v3z6z|0a1o1y2226262k2m3m3u3y6y|0b1n21232l2n3n3t3z6j6n6n6r6v|0c0k0s1m20243m3u446i6o6q|0h0h0t1n1z2529293n3n3r3t3z696n6n|0i0i0w1o202a3e3g3s3s3y686m6o|0x1r21293f3f3p3r3x656l6n|102c3g3g3u646k6m|0x0x111v1z2d3d3h3n696l6l|101w202e3c3c3g3i3m6a|11272b2b3j676b6b|142428282e2g3g6a|13272f2f3h474b67|14262a2a3i42464e4k666a6a|13233d3d3h3l3r3r3v414b4f4j636b6b|14243c3i3s3s3w4046464c4g4k60|13213d3h3t3t3x3x414f4l5t5z5z6969|14203c3g3s3s3y3y424g4k5s60606868|151z3j3p495t61616769|181y3e3o485u6264|191v3d3r3x3z475v|1c1m1q1q1u1w3c4e4i5u|1d1l1x1x394f4j5t|1e1k38464a4i4q5s|1h1l1x1x37474b4n4v5r5v5v|0g0g1g1k1s1s2020384m4w565c5k|1j1r232737474d4l4z555d5j5n5n|1m1q38484e4i4y525g5m|1r1v374f4z515h5l5x5x|1u1u384c50525g5g5k5m5w5y|1z2b394h51535t5t|202c3c4g5s5s5y5y|212h3p4f5f5h5r5r|202i3q4c5g5g5o5s6060|1z2j3p4b5h5h5n5r6363|1y2q3q4a5i5k5q5q5u5w646a|1z2t3r49696f6j6j|202s3s485q5q6a6a6e6e|212r3t49|222q3s4a62666a6a|232p3r494f4h5z656b6b|242q3s484e4g5y6c|252p3t454f4f5v6d|262o3u464e4e5s6e|252j3t454d4f5r6h|262i3u445s6g|252j3v435r6h|242i3w425s6g|252f3v415t5x6565696f|242c686g6w6w|232d696f6x6x|242a6y6y|2329|22286e6e|23276t6t|2226|2127|2226|2325|2224|2325';

const n36 = (s) => parseInt(s, 36);
/** Dots inside a box of the 126 × 62 map grid → [x, y] in map units (x = (lon + 180) / 360 · 126, y ≈ 32 − 0.42 · lat). */
export function mapDots({ x0 = 0, x1 = 126, y0 = 0, y1 = 62 } = {}) {
  const out = [];
  DATA.split('|').forEach((row, r) => {
    const y = ROW_Y[r];
    if (y < y0 || y > y1) return;
    for (let i = 0; i < row.length; i += 4) {
      const a = n36(row.slice(i, i + 2));
      const b = n36(row.slice(i + 2, i + 4));
      for (let x2 = a; x2 <= b; x2 += 2) {
        const x = x2 / 2;
        if (x >= x0 && x <= x1) out.push([x, y]);
      }
    }
  });
  return out;
}
export const project = (lon, lat) => ({ x: ((lon + 180) / 360) * 126, y: 32 - lat * 0.42 });
