// The app's Avatar (packages/nextjs/components/Avatar.tsx), ported to plain JS with a tiny keccak256.
(function (root) {
  const M = (1n << 64n) - 1n;
  const rol = (x, n) => (n ? ((x << BigInt(n)) | (x >> BigInt(64 - n))) & M : x);
  const RC = [];
  for (let i = 0, R = 1; i < 24; i++) {
    let rc = 0n;
    for (let j = 0; j < 7; j++) {
      R = ((R << 1) ^ ((R >> 7) * 0x71)) & 0xff;
      if (R & 2) rc ^= 1n << BigInt((1 << j) - 1);
    }
    RC.push(rc);
  }
  const f = A => {
    for (let r = 0; r < 24; r++) {
      const C = [0, 1, 2, 3, 4].map(x => A[x] ^ A[x + 5] ^ A[x + 10] ^ A[x + 15] ^ A[x + 20]);
      for (let x = 0; x < 5; x++) {
        const D = C[(x + 4) % 5] ^ rol(C[(x + 1) % 5], 1);
        for (let y = 0; y < 25; y += 5) A[x + y] ^= D;
      }
      let x = 1, y = 0, cur = A[1];
      for (let t = 0; t < 24; t++) {
        const Y = (2 * x + 3 * y) % 5;
        x = y;
        y = Y;
        const tmp = A[x + 5 * y];
        A[x + 5 * y] = rol(cur, ((t + 1) * (t + 2) / 2) % 64);
        cur = tmp;
      }
      for (let y = 0; y < 25; y += 5) {
        const T = A.slice(y, y + 5);
        for (let x = 0; x < 5; x++) A[x + y] = T[x] ^ (~T[(x + 1) % 5] & M & T[(x + 2) % 5]);
      }
      A[0] ^= RC[r];
    }
  };
  // Single-block keccak256 (inputs under 136 bytes are all we need).
  const keccak = bytes => {
    const block = new Uint8Array(136);
    block.set(bytes);
    block[bytes.length] ^= 1;
    block[135] ^= 0x80;
    const A = Array(25).fill(0n);
    for (let i = 0; i < 17; i++) for (let b = 7; b >= 0; b--) A[i] = (A[i] << 8n) | BigInt(block[i * 8 + b]);
    f(A);
    const out = [];
    for (let i = 0; i < 4; i++) for (let b = 0; b < 8; b++) out.push(Number((A[i] >> BigInt(8 * b)) & 0xffn));
    return out;
  };
  const hexBytes = hex => (hex.slice(2).match(/../g) || []).map(h => parseInt(h, 16));

  const COBALT = "#0052FF", BABY = "#E3EDF5", INK = "#081019", MISTY = "#ACC4D6", WHITE = "#FFFFFF";
  const THEMES = [
    [COBALT, WHITE, INK], [BABY, COBALT, WHITE], [MISTY, INK, WHITE], [INK, COBALT, WHITE],
    [MISTY, COBALT, WHITE], [BABY, INK, WHITE], [COBALT, MISTY, INK], [INK, BABY, INK],
  ];
  const pick = (n, ...o) => o[n % o.length];

  const avatar = (address, size) => {
    const [theme, shape, eyes, mouth, extra, px, py, tilt] = keccak(hexBytes(address));
    const [bg, body, face] = pick(theme, ...THEMES);
    const pupil = `fill="${body}" transform="translate(${((px % 3) - 1) * 2} ${((py % 3) - 1) * 2})"`;
    const line = `fill="none" stroke="${face}" stroke-width="3" stroke-linecap="round"`;
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="shrink-0 rounded-full" aria-hidden="true">
<rect width="64" height="64" fill="${bg}"/>
<g transform="rotate(${((tilt % 5) - 2) * 6} 32 40)">
<g fill="${body}">${pick(
      extra,
      "",
      `<path d="M32 20V7" stroke="${body}" stroke-width="3"/><circle cx="32" cy="7" r="4"/>`,
      `<circle cx="15" cy="20" r="8"/><circle cx="49" cy="20" r="8"/>`,
      `<path d="M19 27 15 8l13 11zM45 27l4-19-13 11z"/>`,
    )}${pick(
      shape,
      `<circle cx="32" cy="38" r="22"/>`,
      `<rect x="11" y="16" width="42" height="52" rx="16"/>`,
      `<path d="M12 66V36a20 20 0 0 1 40 0v30z"/>`,
      `<rect x="14" y="20" width="36" height="36" rx="10" transform="rotate(45 32 38)"/>`,
    )}</g>
${pick(
      eyes,
      `<g fill="${face}"><circle cx="24" cy="33" r="3.5"/><circle cx="40" cy="33" r="3.5"/></g>`,
      `<circle cx="24" cy="32" r="6.5" fill="${face}"/><circle cx="40" cy="32" r="6.5" fill="${face}"/><g ${pupil}><circle cx="24" cy="32" r="3"/><circle cx="40" cy="32" r="3"/></g>`,
      `<circle cx="32" cy="31" r="9" fill="${face}"/><circle cx="32" cy="31" r="4" ${pupil}/>`,
      `<path d="M19 34q5-7 10 0M35 34q5-7 10 0" ${line}/>`,
    )}${pick(
      mouth,
      `<path d="M25 44q7 7 14 0" ${line}/>`,
      `<circle cx="32" cy="46" r="3.5" fill="${face}"/>`,
      `<path d="M24 43h16a8 8 0 0 1-16 0z" fill="${face}"/>`,
      `<path d="M24 46q4-4 8 0t8 0" ${line}/>`,
    )}
</g>
<circle cx="32" cy="32" r="31.5" fill="none" stroke="${WHITE}" stroke-width="2"/>
</svg>`;
  };
  root.keccak = keccak;
  root.avatar = avatar;
})(typeof window === "undefined" ? globalThis : window);
