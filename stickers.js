/* 플래너 스티커 (오리지널 일러스트). viewBox 0 0 100 100, 배경 없는 투명 바탕 */

const C = {
  ink: '#3B3B3B', coral: '#EB6A55', red: '#E2483B', pink: '#F3A9A0', blush: '#F7C8BE', peach: '#F6B98E',
  mustard: '#F2B13D', yellow: '#F8D04B', orange: '#F28C3A', teal: '#6FB3AC', sage: '#A9C8A0', green: '#7DBA5A',
  sky: '#79AEE0', pale: '#CFE0F2', blue: '#4E86C8', navy: '#3E5C7E', lav: '#B7A3DE', brown: '#A87452',
  grey: '#9AA7B4', cream: '#FFF3E0', white: '#FFFFFF',
};

// ───────── 그리기 도구 ─────────
const polar = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
function starPath(cx, cy, R, r, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) pts.push(polar(cx, cy, i % 2 ? r : R, -90 + i * 180 / n));
  return 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L') + 'Z';
}
const rays = (cx, cy, r1, r2, n, color, w = 4, from = 0, to = 360) => {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = from + (to - from) * (to - from === 360 ? i / n : i / (n - 1));
    const [x1, y1] = polar(cx, cy, r1, a), [x2, y2] = polar(cx, cy, r2, a);
    out += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return out;
};
const petals = (cx, cy, dist, pr, n, color, rot = -90) => {
  let out = '';
  for (let i = 0; i < n; i++) { const [x, y] = polar(cx, cy, dist, rot + i * 360 / n); out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${pr}" fill="${color}"/>`; }
  return out;
};
const stroke = (d, color, w = 6) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// 글자 스티커: 줄마다 크기를 맞추고 글자마다 색을 바꾼다
function words(lines, palette, { font = 'en', max = 30 } = {}) {
  const ko = font === 'ko';
  const family = ko ? '"Jua", "Gaegu", sans-serif' : '"Fredoka", "Jost", sans-serif';
  const cw = ko ? 0.98 : 0.6;
  const sizes = lines.map(l => Math.min(max, 92 / (Math.max(l.length, 1) * cw)));
  const gap = 0.08;
  const total = sizes.reduce((a, b) => a + b * (1 + gap), 0) - sizes.at(-1) * gap;
  let y = 50 - total / 2, k = 0, out = '';
  lines.forEach((line, i) => {
    y += sizes[i] * 0.86;
    const spans = [...line].map(ch => ch === ' ' ? ' ' : `<tspan fill="${palette[k++ % palette.length]}">${ch}</tspan>`).join('');
    out += `<text x="50" y="${y.toFixed(1)}" font-size="${sizes[i].toFixed(1)}" text-anchor="middle" font-family='${family}' font-weight="${ko ? 400 : 600}">${spans}</text>`;
    y += sizes[i] * (0.14 + gap);
  });
  return out;
}
// 말풍선
const bubble = (fill, text, color = C.white, fs = 22, font = 'en') => `<path d="M12 24 Q12 12 24 12 H76 Q88 12 88 24 V56 Q88 68 76 68 H46 L28 86 L32 68 H24 Q12 68 12 56 Z" fill="${fill}"/>
  <text x="50" y="${(40 + fs * 0.35).toFixed(1)}" font-size="${fs}" text-anchor="middle" fill="${color}" font-family='${font === 'ko' ? '"Jua", sans-serif' : '"Fredoka", sans-serif'}' font-weight="${font === 'ko' ? 400 : 600}">${text}</text>`;

// 표정
const EYES = {
  dot: `<circle cx="37" cy="46" r="4.5" fill="${C.ink}"/><circle cx="63" cy="46" r="4.5" fill="${C.ink}"/>`,
  happy: stroke('M30 48 Q37 39 44 48 M56 48 Q63 39 70 48', C.ink, 4.5),
  closed: stroke('M30 45 Q37 52 44 45 M56 45 Q63 52 70 45', C.ink, 4.5),
  angry: `<circle cx="37" cy="49" r="4.5" fill="${C.ink}"/><circle cx="63" cy="49" r="4.5" fill="${C.ink}"/>` + stroke('M28 37 L44 43 M72 37 L56 43', C.ink, 4.5),
  sad: `<circle cx="37" cy="48" r="4.5" fill="${C.ink}"/><circle cx="63" cy="48" r="4.5" fill="${C.ink}"/>` + stroke('M29 41 L43 37 M71 41 L57 37', C.ink, 4),
  heart: `<path d="M37 54 C28 47 27 40 32 37 C35 35 37 38 37 40 C37 38 39 35 42 37 C47 40 46 47 37 54Z" fill="${C.red}"/><path d="M63 54 C54 47 53 40 58 37 C61 35 63 38 63 40 C63 38 65 35 68 37 C73 40 72 47 63 54Z" fill="${C.red}"/>`,
  wide: `<circle cx="37" cy="45" r="6.5" fill="${C.white}"/><circle cx="63" cy="45" r="6.5" fill="${C.white}"/><circle cx="37" cy="46" r="4" fill="${C.ink}"/><circle cx="63" cy="46" r="4" fill="${C.ink}"/>`,
};
const MOUTH = {
  grin: `<path d="M33 60 Q50 82 67 60 Z" fill="${C.ink}"/><path d="M40 70 Q50 76 60 70 Q50 66 40 70Z" fill="${C.coral}"/>`,
  smile: stroke('M36 62 Q50 74 64 62', C.ink, 4.5),
  flat: stroke('M38 66 H62', C.ink, 4.5),
  frown: stroke('M36 70 Q50 58 64 70', C.ink, 4.5),
  o: `<ellipse cx="50" cy="67" rx="7" ry="9" fill="${C.ink}"/>`,
  small: stroke('M44 66 Q50 70 56 66', C.ink, 4),
};
const cheeks = `<ellipse cx="28" cy="60" rx="6" ry="4" fill="${C.coral}" opacity=".45"/><ellipse cx="72" cy="60" rx="6" ry="4" fill="${C.coral}" opacity=".45"/>`;
const face = (fill, eyes, mouth, extra = '') => `<circle cx="50" cy="52" r="38" fill="${fill}"/>${EYES[eyes]}${MOUTH[mouth]}${extra}`;

// ───────── 스티커 목록 ─────────
// group: 고르는 창의 묶음, k: 메모 위 기본 크기 배율
const STICKER_GROUPS = [
  ['mark', '기호'], ['face', '표정'], ['talk', '말풍선'], ['text', '문구'], ['nature', '자연'], ['item', '생활'],
];
const STICKER_ART = {
  // 기호
  check:    ['mark', '체크', .6, stroke('M20 54 L40 74 L82 28', C.teal, 13)],
  cross:    ['mark', '엑스', .55, stroke('M26 26 L74 74 M74 26 L26 74', C.coral, 13)],
  star:     ['mark', '별', .6, `<path d="${starPath(50, 54, 42, 19)}" fill="${C.mustard}" stroke="${C.mustard}" stroke-width="6" stroke-linejoin="round"/>`],
  heart:    ['mark', '하트', .6, `<path d="M50 86 C20 66 8 48 16 32 C24 16 44 18 50 34 C56 18 76 16 84 32 C92 48 80 66 50 86Z" fill="${C.coral}"/>`],
  hearto:   ['mark', '빈 하트', .6, stroke('M50 82 C22 64 12 48 19 34 C26 20 44 22 50 36 C56 22 74 20 81 34 C88 48 78 64 50 82Z', C.coral, 6)],
  drop:     ['mark', '물방울', .55, `<path d="M50 10 C63 32 77 46 77 63 C77 79 65 90 50 90 C35 90 23 79 23 63 C23 46 37 32 50 10Z" fill="${C.sky}"/><ellipse cx="39" cy="62" rx="5" ry="10" fill="${C.white}" opacity=".6"/>`],
  bulb:     ['mark', '아이디어', .65, `${rays(50, 42, 30, 40, 7, C.mustard, 4, 200, 340)}<circle cx="50" cy="46" r="21" fill="${C.yellow}"/><rect x="40" y="62" width="20" height="9" rx="2" fill="${C.grey}"/><rect x="42" y="72" width="16" height="8" rx="4" fill="${C.navy}"/>${stroke('M45 52 L50 42 L55 52', C.mustard, 3)}`],
  arrow:    ['mark', '화살표', .6, stroke('M20 78 C24 44 50 30 78 36', C.coral, 6) + stroke('M64 24 L80 36 L66 50', C.coral, 6)],
  sparkle:  ['mark', '반짝', .55, `<path d="M50 8 C54 40 60 46 92 50 C60 54 54 60 50 92 C46 60 40 54 8 50 C40 46 46 40 50 8Z" fill="${C.mustard}"/>`],
  burst:    ['mark', '포인트', .45, rays(50, 50, 8, 38, 8, C.coral, 7)],
  dots:     ['mark', '점점점', .55, [[30, 22], [52, 18], [74, 24], [24, 42], [46, 40], [68, 44], [34, 62], [58, 62], [80, 64], [44, 82], [66, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${C.ink}"/>`).join('')],
  zigzag:   ['mark', '지그재그', .6, stroke('M10 60 L22 44 L34 60 L46 44 L58 60 L70 44 L82 60 L92 46', C.teal, 6)],
  pin:      ['mark', '압정', .55, stroke('M54 52 L80 86', C.grey, 5) + `<circle cx="44" cy="38" r="22" fill="${C.coral}"/><circle cx="36" cy="31" r="6" fill="${C.white}" opacity=".5"/>`],
  clip:     ['mark', '클립', .6, `<g transform="rotate(-25 50 50)">${stroke('M40 76 V28 C40 14 64 14 64 28 V78 C64 92 46 92 46 78 V36 C46 28 58 28 58 36 V70', C.coral, 5)}</g>`],
  flag:     ['mark', '깃발', .6, stroke('M28 12 V90', C.grey, 5) + `<path d="M30 14 H80 L68 32 L80 50 H30Z" fill="${C.red}"/>`],
  // 표정
  happy:    ['face', '신나', .7, face(C.yellow, 'happy', 'grin', cheeks)],
  smile:    ['face', '좋아', .7, face(C.yellow, 'dot', 'smile', cheeks)],
  meh:      ['face', '그냥', .7, face(C.mustard, 'dot', 'flat')],
  sad:      ['face', '슬퍼', .7, face(C.sky, 'sad', 'frown', `<path d="M66 56 q-4 7 0 10 q4 -3 0 -10" fill="${C.white}"/>`)],
  angry:    ['face', '화나', .7, face(C.coral, 'angry', 'frown')],
  love:     ['face', '사랑', .7, face(C.pink, 'heart', 'smile')],
  sleepy:   ['face', '졸려', .7, face(C.lav, 'closed', 'small', `<text x="74" y="26" font-size="18" fill="${C.navy}" font-family='"Fredoka", sans-serif' font-weight="600">z</text><text x="84" y="14" font-size="13" fill="${C.navy}" font-family='"Fredoka", sans-serif' font-weight="600">z</text>`)],
  shock:    ['face', '놀람', .7, face(C.peach, 'wide', 'o')],
  // 말풍선
  yes:      ['talk', 'YES', .85, bubble(C.coral, 'YES')],
  no:       ['talk', 'NO', .8, bubble(C.red, 'NO', C.white, 26)],
  ok:       ['talk', 'OK', .7, `<circle cx="50" cy="50" r="36" fill="${C.navy}"/><text x="50" y="60" font-size="28" text-anchor="middle" fill="${C.white}" font-family='"Fredoka", sans-serif' font-weight="600">OK</text>`],
  hello:    ['talk', 'HELLO', .9, bubble(C.teal, 'HELLO', C.white, 18)],
  doit:     ['talk', 'DO IT', .85, bubble(C.mustard, 'DO IT', C.white, 19)],
  thanks:   ['talk', '고마워', .9, bubble(C.pink, '고마워', C.white, 20, 'ko')],
  wait:     ['talk', '잠깐!', .85, bubble(C.blue, '잠깐!', C.white, 21, 'ko')],
  // 문구
  wow:      ['text', 'WOW', 1, words(['WOW'], [C.coral, C.teal, C.mustard], { max: 38 })],
  awesome:  ['text', 'AWESOME', 1.2, words(['AWESOME'], [C.coral, C.mustard, C.teal, C.pink, C.blue, C.orange, C.green])],
  tasks:    ['text', 'TASKS!', 1, words(['TASKS!'], [C.navy, C.coral])],
  checklist:['text', 'CHECK LIST', 1, words(['CHECK', 'LIST'], [C.coral, C.coral, C.pink, C.pink])],
  todo:     ['text', 'TO DO', 1, words(['TO DO'], [C.blue, C.teal, C.mustard, C.coral])],
  done:     ['text', 'DONE!', 1, words(['DONE!'], [C.green, C.teal])],
  goodjob:  ['text', 'GOOD JOB', 1.05, words(['GOOD', 'JOB'], [C.mustard, C.orange, C.coral, C.pink])],
  today:    ['text', 'TODAY', 1, words(['TODAY'], [C.sky, C.blue, C.navy])],
  urgent:   ['text', 'URGENT', 1.1, words(['URGENT'], [C.red, C.red, C.coral])],
  note:     ['text', 'NOTE', .9, words(['NOTE'], [C.lav, C.blue])],
  candoit:  ['text', 'YOU CAN DO IT', 1.15, words(['YOU', 'CAN', 'DO IT'], [C.teal, C.mustard, C.coral, C.blue])],
  fresh:    ['text', 'EVERY DAY IS A FRESH START', 1.2, words(['EVERY', 'DAY IS A', 'FRESH', 'START'], [C.mustard, C.orange, C.coral, C.pink])],
  positive: ['text', 'POSITIVE ENERGY', 1.2, words(['POSITIVE', 'ENERGY'], [C.coral, C.pink, C.blue, C.sky])],
  goodthings:['text', 'GOOD THINGS ARE COMING', 1.2, words(['GOOD', 'THINGS', 'ARE', 'COMING'], [C.pink, C.mustard, C.orange])],
  seegood:  ['text', 'SEE THE GOOD', 1, words(['SEE', 'THE', 'GOOD'], [C.mustard, C.navy])],
  best:     ['text', '최고!', .95, words(['최고!'], [C.coral, C.mustard, C.teal], { font: 'ko', max: 34 })],
  cando:    ['text', '할 수 있어', 1.05, words(['할 수', '있어'], [C.blue, C.teal, C.mustard, C.coral], { font: 'ko' })],
  welldone: ['text', '수고했어', 1.05, words(['수고', '했어'], [C.pink, C.coral, C.mustard], { font: 'ko' })],
  complete: ['text', '완료!', .95, words(['완료!'], [C.green, C.teal], { font: 'ko', max: 34 })],
  important:['text', '중요!', .95, words(['중요!'], [C.red, C.coral], { font: 'ko', max: 34 })],
  fighting: ['text', '오늘도 화이팅', 1.15, words(['오늘도', '화이팅'], [C.orange, C.mustard, C.teal, C.blue, C.coral], { font: 'ko' })],
  remember: ['text', '잊지 마!', 1, words(['잊지', '마!'], [C.navy, C.lav], { font: 'ko' })],
  // 자연
  sun:      ['nature', '해', .8, rays(50, 50, 28, 42, 12, C.mustard, 4) + `<circle cx="50" cy="50" r="22" fill="${C.yellow}"/>`],
  sunrise:  ['nature', '해돋이', .85, rays(50, 70, 30, 44, 7, C.mustard, 4, 180, 360) + `<path d="M24 70 A26 26 0 0 1 76 70 Z" fill="${C.mustard}"/>` + stroke('M14 76 H86', C.mustard, 4)],
  rainbow:  ['nature', '무지개', .9, stroke('M12 76 A38 38 0 0 1 88 76', C.pink, 10).replace('round"', 'butt"') + stroke('M23 76 A27 27 0 0 1 77 76', C.peach, 10).replace('round"', 'butt"') + stroke('M34 76 A16 16 0 0 1 66 76', C.coral, 10).replace('round"', 'butt"')],
  flower:   ['nature', '꽃', .8, petals(50, 50, 22, 17, 5, C.orange) + `<circle cx="50" cy="50" r="12" fill="${C.mustard}"/>`],
  blossom:  ['nature', '분홍 꽃', .7, petals(50, 50, 21, 15, 5, C.pink) + `<circle cx="50" cy="50" r="9" fill="${C.coral}"/>`],
  bloom:    ['nature', '파란 꽃', .6, [0, 90, 180, 270].map(a => `<ellipse cx="50" cy="28" rx="11" ry="20" fill="${C.pale}" transform="rotate(${a} 50 50)"/>`).join('') + `<circle cx="50" cy="50" r="7" fill="${C.sky}"/>`],
  palm:     ['nature', '야자수', .95, stroke('M54 92 C56 70 50 48 46 32', C.orange, 6) + `<path d="M46 30 C34 16 18 18 10 28 C24 24 34 26 46 32Z M46 30 C50 14 64 8 76 12 C64 16 54 22 46 32Z M46 32 C62 26 80 30 88 42 C74 36 60 34 46 34Z M46 32 C34 34 22 44 20 56 C28 46 38 38 46 34Z" fill="${C.teal}"/>`],
  cloud:    ['nature', '구름', .8, `<path d="M24 70 C12 70 10 52 24 50 C24 36 42 30 50 40 C56 28 76 30 76 46 C90 46 92 70 76 70Z" fill="${C.pale}"/>`],
  moon:     ['nature', '달', .7, `<path d="M62 14 C38 18 24 42 32 64 C40 84 64 90 82 78 C58 78 44 56 50 36 C54 26 58 20 62 14Z" fill="${C.lav}"/><path d="${starPath(76, 30, 9, 4)}" fill="${C.mustard}"/>`],
  umbrella: ['nature', '우산', .8, `<path d="M12 50 C14 26 34 14 50 14 C66 14 86 26 88 50 C82 44 74 44 69 50 C64 44 56 44 50 50 C44 44 36 44 31 50 C26 44 18 44 12 50Z" fill="${C.coral}"/>` + stroke('M50 50 V80 C50 88 40 88 40 80', C.navy, 5)],
  leaf:     ['nature', '잎', .6, `<path d="M20 80 C20 40 44 18 82 18 C82 56 60 80 20 80Z" fill="${C.green}"/>` + stroke('M24 76 C40 58 56 42 74 26', C.sage, 3)],
  // 생활
  calendar: ['item', '달력', .8, `<rect x="16" y="22" width="68" height="62" rx="9" fill="${C.cream}"/><path d="M16 31 Q16 22 25 22 H75 Q84 22 84 31 V40 H16Z" fill="${C.coral}"/>${stroke('M32 14 V28 M68 14 V28', C.navy, 6)}<text x="50" y="76" font-size="30" text-anchor="middle" fill="${C.navy}" font-family='"Fredoka", sans-serif' font-weight="600">31</text>`],
  clock:    ['item', '알람', .75, `<circle cx="28" cy="22" r="10" fill="${C.mustard}"/><circle cx="72" cy="22" r="10" fill="${C.mustard}"/>${stroke('M30 82 L24 90 M70 82 L76 90', C.navy, 5)}<circle cx="50" cy="54" r="32" fill="${C.coral}"/><circle cx="50" cy="54" r="24" fill="${C.cream}"/>${stroke('M50 54 V38 M50 54 L61 60', C.navy, 5)}`],
  coffee:   ['item', '커피', .75, `${stroke('M38 26 Q34 18 40 12 M52 26 Q48 18 54 12', C.grey, 4)}<path d="M20 34 H72 V58 C72 74 60 84 46 84 C32 84 20 74 20 58Z" fill="${C.teal}"/>${stroke('M72 42 H78 C88 42 88 60 78 60 H72', C.teal, 6)}<rect x="20" y="34" width="52" height="8" fill="${C.brown}"/><rect x="12" y="86" width="68" height="6" rx="3" fill="${C.grey}"/>`],
  book:     ['item', '책', .75, `<g transform="rotate(-8 50 50)"><rect x="22" y="14" width="56" height="72" rx="6" fill="${C.blue}"/><rect x="22" y="72" width="56" height="14" rx="4" fill="${C.cream}"/><rect x="22" y="14" width="10" height="72" rx="4" fill="${C.navy}"/><rect x="40" y="26" width="28" height="8" rx="4" fill="${C.yellow}"/></g>`],
  pencil:   ['item', '연필', .7, `<g transform="rotate(45 50 50)"><rect x="38" y="20" width="24" height="52" fill="${C.yellow}"/><rect x="38" y="20" width="8" height="52" fill="${C.mustard}"/><path d="M38 72 H62 L50 94Z" fill="${C.peach}"/><path d="M45 85 H55 L50 94Z" fill="${C.ink}"/><rect x="38" y="12" width="24" height="8" fill="${C.grey}"/><path d="M38 12 V6 Q38 2 42 2 H58 Q62 2 62 6 V12Z" fill="${C.pink}"/></g>`],
  coin:     ['item', '돈', .65, `<circle cx="50" cy="50" r="38" fill="${C.mustard}"/><circle cx="50" cy="50" r="29" fill="${C.yellow}"/><text x="50" y="63" font-size="36" text-anchor="middle" fill="${C.orange}" font-family='"Fredoka", sans-serif' font-weight="600">₩</text>`],
  card:     ['item', '카드', .75, `<rect x="10" y="24" width="80" height="54" rx="9" fill="${C.teal}"/><rect x="10" y="36" width="80" height="10" fill="${C.navy}"/><rect x="20" y="54" width="18" height="13" rx="3" fill="${C.yellow}"/>${stroke('M48 64 H78', C.white, 4)}`],
  bag:      ['item', '쇼핑', .75, `${stroke('M38 36 V28 C38 16 62 16 62 28 V36', C.coral, 6)}<path d="M20 34 H80 L86 88 H14Z" fill="${C.pink}"/><circle cx="38" cy="46" r="4" fill="${C.coral}"/><circle cx="62" cy="46" r="4" fill="${C.coral}"/>`],
  dumbbell: ['item', '운동', .75, `<g transform="rotate(-30 50 50)"><rect x="24" y="46" width="52" height="8" rx="3" fill="${C.grey}"/><rect x="12" y="30" width="14" height="40" rx="5" fill="${C.navy}"/><rect x="74" y="30" width="14" height="40" rx="5" fill="${C.navy}"/><rect x="4" y="38" width="8" height="24" rx="3" fill="${C.blue}"/><rect x="88" y="38" width="8" height="24" rx="3" fill="${C.blue}"/></g>`],
  water:    ['item', '물', .65, `<path d="M26 14 H74 L66 88 H34Z" fill="${C.pale}"/><path d="M29 40 H71 L66 88 H34Z" fill="${C.sky}"/><ellipse cx="42" cy="58" rx="3" ry="10" fill="${C.white}" opacity=".6"/>`],
  pill:     ['item', '약', .6, `<g transform="rotate(-35 50 50)"><path d="M50 32 H32 A18 18 0 0 0 32 68 H50Z" fill="${C.coral}"/><path d="M50 32 H68 A18 18 0 0 1 68 68 H50Z" fill="${C.cream}"/><rect x="24" y="38" width="16" height="5" rx="2.5" fill="${C.white}" opacity=".55"/></g>`],
  house:    ['item', '집', .75, `<rect x="22" y="44" width="56" height="44" fill="${C.cream}"/><path d="M12 48 L50 14 L88 48Z" fill="${C.coral}"/><rect x="42" y="62" width="16" height="26" rx="3" fill="${C.mustard}"/><rect x="28" y="54" width="10" height="10" fill="${C.sky}"/><rect x="62" y="54" width="10" height="10" fill="${C.sky}"/>`],
  plane:    ['item', '여행', .75, `<g transform="rotate(-30 50 50)"><path d="M46 8 C50 2 54 2 54 8 V38 L88 58 V66 L54 56 V80 L64 88 V94 L50 90 L36 94 V88 L46 80 V56 L12 66 V58 L46 38Z" fill="${C.sky}"/></g>`],
  gift:     ['item', '선물', .75, `<rect x="16" y="40" width="68" height="48" rx="4" fill="${C.coral}"/><rect x="12" y="30" width="76" height="14" rx="4" fill="${C.red}"/><rect x="44" y="30" width="12" height="58" fill="${C.mustard}"/><path d="M50 30 C40 14 24 18 30 28 Z M50 30 C60 14 76 18 70 28 Z" fill="${C.mustard}"/>`],
  cake:     ['item', '생일', .75, `<rect x="47" y="12" width="6" height="18" rx="2" fill="${C.sky}"/><path d="M50 2 C56 8 54 12 50 12 C46 12 44 8 50 2Z" fill="${C.orange}"/><rect x="18" y="30" width="64" height="26" rx="6" fill="${C.pink}"/><path d="M18 42 Q26 50 34 42 Q42 50 50 42 Q58 50 66 42 Q74 50 82 42 V36 H18Z" fill="${C.cream}"/><rect x="12" y="56" width="76" height="30" rx="6" fill="${C.peach}"/><rect x="12" y="66" width="76" height="6" fill="${C.cream}"/>`],
  phone:    ['item', '전화', .65, `<rect x="28" y="8" width="44" height="84" rx="10" fill="${C.navy}"/><rect x="33" y="18" width="34" height="58" rx="3" fill="${C.pale}"/><circle cx="50" cy="84" r="4" fill="${C.grey}"/>`],
  mail:     ['item', '편지', .75, `<rect x="10" y="24" width="80" height="54" rx="6" fill="${C.cream}"/>${stroke('M12 28 L50 56 L88 28', C.coral, 5)}<path d="${starPath(76, 66, 7, 3)}" fill="${C.mustard}"/>`],
  music:    ['item', '음악', .6, `${stroke('M38 72 V20 L78 12 V62', C.lav, 6)}<ellipse cx="30" cy="74" rx="12" ry="9" fill="${C.lav}"/><ellipse cx="70" cy="64" rx="12" ry="9" fill="${C.lav}"/>`],
  camera:   ['item', '사진', .75, `<rect x="10" y="30" width="80" height="54" rx="9" fill="${C.grey}"/><rect x="34" y="20" width="32" height="14" rx="4" fill="${C.grey}"/><circle cx="50" cy="57" r="19" fill="${C.navy}"/><circle cx="50" cy="57" r="11" fill="${C.sky}"/><circle cx="76" cy="40" r="4" fill="${C.coral}"/>`],
  trophy:   ['item', '트로피', .7, `${stroke('M28 26 H16 C16 44 26 48 32 48 M72 26 H84 C84 44 74 48 68 48', C.mustard, 5)}<path d="M26 16 H74 V36 C74 52 62 62 50 62 C38 62 26 52 26 36Z" fill="${C.yellow}"/><rect x="45" y="62" width="10" height="14" fill="${C.mustard}"/><rect x="30" y="76" width="40" height="12" rx="3" fill="${C.brown}"/>`],
  bowl:     ['item', '밥', .75, `${stroke('M56 8 L70 46 M68 6 L78 44', C.brown, 4)}<path d="M28 46 C30 36 40 32 50 34 C60 32 70 36 72 46Z" fill="${C.cream}"/><path d="M12 46 H88 C88 70 72 86 50 86 C28 86 12 70 12 46Z" fill="${C.coral}"/>${stroke('M24 58 H76', C.white, 3)}`],
  paw:      ['item', '반려동물', .6, `<ellipse cx="50" cy="66" rx="20" ry="17" fill="${C.brown}"/>${[[24, 44], [40, 28], [60, 28], [76, 44]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="11" fill="${C.brown}"/>`).join('')}`],
};

const STICKERS = Object.entries(STICKER_ART).map(([id, [group, word, k]]) => ({ id, group, word, k }));
// 일기의 '오늘의 기분'에 쓰는 표정
const MOOD_STICKERS = STICKERS.filter(s => s.group === 'face').map(s => s.id);
// 예전 토끼 스티커 → 새 스티커
const LEGACY_STICKERS = {
  love: 'heart', thanks: 'thanks', yay: 'happy', fight: 'cando', hungry: 'bowl',
  study: 'book', hmm: 'meh', idk: 'meh', nope: 'cross', tired: 'sleepy',
};

const stickerScale = id => STICKERS.find(s => s.id === id)?.k ?? 1;
function stickerSVG(id) {
  const art = STICKER_ART[id];
  if (!art) return '';
  return `<svg class="stk" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${art[1]}">${art[3]}</svg>`;
}
