/* 손그림 선화 토끼 스티커 (오리지널). viewBox 0 0 100 100, 먹선 + 흰 몸통 */

const STK_EYES = {
  dot:    '<circle cx="43" cy="69" r="1.9" class="ink"/><circle cx="57" cy="69" r="1.9" class="ink"/>',
  happy:  '<path d="M40 70 Q43 66 46 70 M54 70 Q57 66 60 70"/>',
  closed: '<path d="M40 68.5 Q43 71.5 46 68.5 M54 68.5 Q57 71.5 60 68.5"/>',
  flat:   '<path d="M40 69 h6 M54 69 h6"/>',
  angry:  '<circle cx="43" cy="70" r="1.9" class="ink"/><circle cx="57" cy="70" r="1.9" class="ink"/><path d="M39 64 l7 2.5 M61 64 l-7 2.5"/>',
  sad:    '<circle cx="43" cy="70" r="1.9" class="ink"/><circle cx="57" cy="70" r="1.9" class="ink"/><path d="M39 66 l6 -2.5 M61 66 l-6 -2.5"/>',
  x:      '<path d="M41 67 l4 4 M45 67 l-4 4 M55 67 l4 4 M59 67 l-4 4"/>',
  wink:   '<circle cx="43" cy="69" r="1.9" class="ink"/><path d="M54 70 Q57 66 60 70"/>',
};
const STK_MOUTH = {
  w:     '<path d="M46 74 Q48 76.5 50 74 Q52 76.5 54 74"/>',
  smile: '<path d="M46 74 Q50 78.5 54 74"/>',
  open:  '<path d="M46 74 Q50 81 54 74 Z" class="fill"/>',
  o:     '<circle cx="50" cy="75.5" r="2"/>',
  flat:  '<path d="M47 75 h6"/>',
  frown: '<path d="M46 77 Q50 73 54 77"/>',
};
const STK_PROPS = {
  sparkle:  '<path d="M80 18 v12 M74 24 h12 M88 36 v6 M85 39 h6"/>',
  heart:    '<path d="M78 42 C69 35 67 29 71 26 C74 24 78 26 78 29 C78 26 82 24 85 26 C89 29 87 35 78 42Z" class="fill"/><path d="M73 30 l3 3 M75 28 l3 3" />',
  hearts:   '<path d="M80 36 C75 32 74 29 76 27.5 C78 26.5 80 28 80 29.5 C80 28 82 26.5 84 27.5 C86 29 85 32 80 36Z" class="fill"/><path d="M88 24 C85 21.5 84.5 20 85.5 19 C86.5 18.3 88 19 88 20 C88 19 89.5 18.3 90.5 19 C91.5 20 91 21.5 88 24Z" class="fill"/>',
  zzz:      '<text x="70" y="40" class="t" font-size="12">z</text><text x="78" y="30" class="t" font-size="17">Z</text>',
  tear:     '<path d="M61 73 q-3.5 5.5 0 7.5 q3.5 -2 0 -7.5" class="fill"/>',
  sweat:    '<path d="M71 54 q-4 6 0 8.5 q4 -2.5 0 -8.5" class="fill"/>',
  anger:    '<path d="M72 33 q4.5 0 4.5 -4.5 M81 28.5 q0 4.5 4.5 4.5 M72 41 q4.5 0 4.5 4.5 M85.5 41 q-4.5 0 -4.5 4.5"/>',
  question: '<text x="74" y="44" class="t" font-size="28">?</text>',
  check:    '<path d="M68 32 l6 7 l14 -16" stroke-width="3.2"/>',
  star:     '<path d="M84 18 l2.5 5 5.5 .8 -4 3.9 1 5.5 -5 -2.6 -5 2.6 1 -5.5 -4 -3.9 5.5 -.8z" class="fill"/>',
  dots:     '<circle cx="73" cy="40" r="1.7" class="ink"/><circle cx="79" cy="37" r="1.7" class="ink"/><circle cx="85" cy="34" r="1.7" class="ink"/>',
  wavy:     '<path d="M12 95 q5 -3 10 0 t10 0 M68 95 q5 -3 10 0 t10 0"/>',
  bowl:     '<path d="M32 80 h36 q-2 13 -18 13 q-16 0 -18 -13z" class="fill"/><path d="M34 80 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0"/>',
  book:     '<path d="M33 79 l17 4 l17 -4 v12 l-17 4 l-17 -4z" class="fill"/><path d="M50 83 v12"/>',
  cup:      '<path d="M60 77 h16 v9 q0 7 -8 7 q-8 0 -8 -7z" class="fill"/><path d="M76 80 q5 0 5 4 q0 4 -5 4 M64 72 q-2 -3 0 -6 M71 72 q-2 -3 0 -6"/>',
  armR:     '<path d="M77 72 C84 66 86 58 84 51"/><circle cx="84" cy="48" r="4" class="fill"/>',
  armsUp:   '<path d="M23 72 C16 66 14 58 16 51 M77 72 C84 66 86 58 84 51"/><circle cx="16" cy="48" r="4" class="fill"/><circle cx="84" cy="48" r="4" class="fill"/>',
  blush:    '<path d="M33 75 l3 -3 M36.5 76 l3 -3 M60.5 75 l3 -3 M64 76 l3 -3"/>',
};

const STICKERS = [
  { id: 'best',   word: '최고',   eyes: 'happy',  mouth: 'open',  props: ['sparkle', 'blush'] },
  { id: 'love',   word: '좋아',   eyes: 'happy',  mouth: 'w',     props: ['heart', 'blush'] },
  { id: 'thanks', word: '고마워', eyes: 'closed', mouth: 'smile', props: ['hearts', 'blush'] },
  { id: 'yay',    word: '야호',   eyes: 'happy',  mouth: 'open',  props: ['armR', 'sparkle'] },
  { id: 'fight',  word: '화이팅', eyes: 'wink',   mouth: 'smile', props: ['armR', 'star'] },
  { id: 'done',   word: '끝!',    eyes: 'dot',    mouth: 'smile', props: ['check'] },
  { id: 'hungry', word: '배고파', eyes: 'dot',    mouth: 'o',     props: ['bowl'] },
  { id: 'coffee', word: '커피',   eyes: 'closed', mouth: 'w',     props: ['cup'] },
  { id: 'study',  word: '공부중', eyes: 'flat',   mouth: 'flat',  props: ['book', 'sweat'] },
  { id: 'hmm',    word: '음…',    eyes: 'dot',    mouth: 'flat',  props: ['dots'] },
  { id: 'idk',    word: '몰라',   eyes: 'flat',   mouth: 'w',     props: ['question'] },
  { id: 'sleepy', word: '졸려',   eyes: 'closed', mouth: 'o',     props: ['zzz'] },
  { id: 'nope',   word: '무리',   eyes: 'x',      mouth: 'flat',  props: ['sweat'] },
  { id: 'tired',  word: '지쳐',   eyes: 'closed', mouth: 'frown', props: ['wavy', 'sweat'] },
  { id: 'sad',    word: '슬퍼',   eyes: 'sad',    mouth: 'frown', props: ['tear'] },
  { id: 'angry',  word: '흥!',    eyes: 'angry',  mouth: 'flat',  props: ['anger'] },
];

function stickerSVG(id) {
  const s = STICKERS.find(x => x.id === id);
  if (!s) return '';
  // 지친 토끼는 몸이 살짝 퍼진다
  const body = id === 'tired'
    ? 'M20 92 C8 91 8 80 16 72 C24 62 36 58 50 58 C64 58 76 62 84 72 C92 80 92 91 80 92 Z'
    : 'M28 91 C16 90 14 75 21 64 C27 55 37 51 50 51 C63 51 73 55 79 64 C86 75 84 90 72 91 Z';
  const ears = id === 'tired'
    ? '<path d="M38 62 C28 56 18 50 16 44 C14 39 22 38 30 44 C36 48 42 54 44 60" class="fill"/><path d="M58 60 C62 52 72 44 80 42 C86 41 86 46 80 50 C74 54 66 58 62 62" class="fill"/>'
    : '<path d="M40 54 C34 38 32 19 39 16 C46 13 50 33 48 52" class="fill"/><path d="M54 52 C55 35 60 18 67 20 C74 23 67 39 61 54" class="fill"/>' +
      '<path d="M40 30 C40 25 41 22 42 21 M61 31 C62 27 64 24 65 23" stroke-width="1.4"/>';
  const face = id === 'tired' ? '<g transform="translate(0 5)">' : '<g>';
  return `<svg class="stk" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${s.word}">
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      ${ears}
      <path d="${body}" class="fill"/>
      ${face}${STK_EYES[s.eyes]}${STK_MOUTH[s.mouth]}</g>
      <path d="M40 ${id === 'tired' ? 91 : 89} q3 -4 6 0 M54 ${id === 'tired' ? 91 : 89} q3 -4 6 0" stroke-width="1.8"/>
      ${s.props.map(p => STK_PROPS[p]).join('')}
      <text class="t word" font-size="16" text-anchor="middle" transform="rotate(-6 12 30)">${[...s.word].map((ch, i) => `<tspan x="12" y="${30 + i * 15}">${ch}</tspan>`).join('')}</text>
    </g>
  </svg>`;
}
