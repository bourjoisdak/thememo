/* the memo — 1인용 메모 앱. 메모는 localStorage, 사진은 IndexedDB에 저장 */

// ───────── 설정값 ─────────
const TYPES = {
  note:  { label: 'Notes',   lines: ['Quick', 'Notes'],   head: ['Note', 'Page'] },
  todo:  { label: 'To-do',   lines: ['To-do', 'List'],    head: ['To-do', 'List'] },
  habit: { label: 'Habits',  lines: ['Habit', 'Tracker'], head: ['Habit', 'Tracker'] },
  diary: { label: 'Journal', lines: ['Daily', 'Journal'], head: ['Daily', 'Journal'] },
};

// 카테고리별 키워드. 많이 맞는 쪽으로 분류된다.
const CATEGORIES = [
  { id: 'work', lines: ['Work &', 'Projects'], name: '업무', words: ['회의', '미팅', '보고', '보고서', '프로젝트', '메일', '거래처', '마감', '출근', '퇴근', '업무', '팀장', '클라이언트', '견적', '계약', '발표', '자료', '회사', '결재'] },
  { id: 'study', lines: ['Study &', 'Learning'], name: '공부', words: ['공부', '강의', '책', '독서', '시험', '영어', '단어', '복습', '예습', '수업', '과제', '자격증', '외우', '읽기', '스터디', '인강', '토익'] },
  { id: 'money', lines: ['Money &', 'Budgeting'], name: '돈', words: ['돈', '결제', '카드', '월세', '적금', '가계부', '지출', '송금', '세금', '이체', '통장', '대출', '환불', '월급', '용돈', '할부'] },
  { id: 'health', lines: ['Health &', 'Routines'], name: '건강', words: ['운동', '헬스', '러닝', '달리기', '병원', '약', '다이어트', '물', '수면', '잠', '스트레칭', '요가', '필라테스', '걷기', '만보', '식단', '영양제'] },
  { id: 'shop', lines: ['Shopping', '& Errands'], name: '쇼핑', words: ['사기', '살것', '살 것', '구매', '장보기', '장 보기', '주문', '쿠팡', '마트', '택배', '우유', '계란', '휴지', '세제', '배송'] },
  { id: 'idea', lines: ['Ideas &', 'Inspiration'], name: '아이디어', words: ['아이디어', '생각났', '만들어', '만들기', '기획', '앱', '영감', '컨셉', '콘셉트', '구상', '해보면', '어떨까'] },
  { id: 'people', lines: ['People &', 'Plans'], name: '사람·약속', words: ['약속', '생일', '만나', '친구', '엄마', '아빠', '가족', '선물', '연락', '전화', '모임', '결혼식', '저녁 먹'] },
  { id: 'life', lines: ['Daily', 'Records'], name: '일상·기록', words: ['오늘', '하루', '기분', '날씨', '산책', '카페', '영화', '여행', '맛집', '일기'] },
  { id: 'etc', lines: ['Odds &', 'Ends'], name: '기타', words: [] },
];
const ALL = { id: 'all', lines: ['All Files', '& Archive'], name: '전체' };
for (const c of [ALL, ...CATEGORIES]) c.label = c.lines.join(' ');
// 서류철 = 메모 종류. 처음부터 모두 만들어 두고, 서류철마다 다른 색과 탭 곡선을 쓴다
const FOLDERS = [
  { id: 'all', lines: ['All Files', '& Archive'], name: '전체', color: 'c-main', shape: 's-soft' },
  ...Object.entries(TYPES).map(([id, t], i) => ({
    id, lines: t.lines, name: t.label,
    color: ['c-jordy', 'c-chef', 'c-apple', 'c-moss'][i],
    shape: ['s-lean-l', 's-round', 's-lean-r', 's-soft'][i],
  })),
];
const folderOf = id => FOLDERS.find(f => f.id === id) || FOLDERS[0];
const SLOTS = [0, 2, 1, 3]; // 겹친 탭이 서로 가리지 않도록 좌우로 엇갈림

const FONTS = [
  { id: 'ryuttung',   name: '온글잎 류뚱체',  css: '"OngleipRyudung", "Gaegu", cursive' },
  { id: 'yuntaeng',   name: '온글잎 윤탱체',  css: '"OwnglyphYuntaeng", "Gaegu", cursive' },
  { id: 'pen',        name: '나눔손글씨 펜',  css: '"Nanum Pen Script", cursive' },
  { id: 'gaegu',      name: '개구',           css: '"Gaegu", cursive' },
  { id: 'gamja',      name: '감자꽃',         css: '"Gamja Flower", cursive' },
  { id: 'melody',     name: '하이멜로디',     css: '"Hi Melody", cursive' },
  { id: 'noto-sans',  name: '본고딕',         css: '"Noto Sans KR", sans-serif' },
  { id: 'plex',       name: 'IBM Plex Sans',  css: '"IBM Plex Sans KR", sans-serif' },
  { id: 'noto-serif', name: '본명조',         css: '"Noto Serif KR", serif' },
  { id: 'gowun',      name: '고운바탕',       css: '"Gowun Batang", serif' },
  { id: 'coding',     name: '나눔고딕코딩',   css: '"Nanum Gothic Coding", monospace' },
];

const EMOJI = {
  '표정': '😀😄😊🙂😉😍🥰😋😎🤔😐😴😪😮😢😭😤😡🥲😅🤯🥳😇',
  '마음': '❤️🖤🤍💔✨⭐🌟🔥💯👍👎👏🙏💪✌️👌',
  '사물': '📌📎📝📖📚✏️📅⏰💡💻📱☕🍵🎁🛒💰💳🏠🚗✈️🎧',
  '자연': '☀️⛅🌧️❄️🌈🌙🌸🌷🌿🍀🍂🌊🐶🐱🐰🐥',
  '음식': '🍎🍓🍌🥑🍞🍳🍜🍣🍕🍔🍰🍩🍫🍙🥗',
  '기호': '✅☑️❌⭕❗❓➡️🔁🔔🏁🎯📍⚠️',
};
const MAX_STICKERS = 6;

const STORE_KEY = 'memo-sorter:v1';
const PREF_KEY = 'memo-sorter:prefs:v4';

// ───────── 상태 ─────────
let memos = []; // 아래 유틸이 정의된 뒤 불러온다
let prefs = Object.assign({ font: 'ryuttung', size: 20, theme: null }, load(PREF_KEY, {}));
let view = { type: 'all', q: '' };
let editingId = null;
let quickOverride = { type: null, cat: null };
let pendingStickers = [];
let pendingPhotos = [];
let picker = { mode: null, tab: 'sticker', target: null };

// ───────── 저장 ─────────
function load(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
  catch { return fallback; }
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(memos)); } catch {} }
function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch {} }

// ───────── 유틸 ─────────
const $ = (s, el = document) => el.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => dayKey(new Date());
const fontCss = id => (FONTS.find(f => f.id === id) || FONTS[0]).css;
const catOf = id => (id === 'all' ? ALL : CATEGORIES.find(c => c.id === id) || CATEGORIES.at(-1));
const KO_DAY = ['일', '월', '화', '수', '목', '금', '토'];
const EN_DAY = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const fmtDate = ts => { const d = new Date(ts); return `${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${EN_DAY[d.getDay()].slice(0, 3)}`; };
const fmtHand = ts => { const d = new Date(ts); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${KO_DAY[d.getDay()]}요일`; };
const isSticker = v => STICKERS.some(s => s.id === v);
function lastDays(n) {
  const out = [];
  const t = new Date(); t.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) { const d = new Date(t); d.setDate(t.getDate() - i); out.push(d); }
  return out;
}
const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

// 예전 형식(스티커 id 문자열, 일기 mood)을 위치가 있는 스티커로 바꾼다
function normalize(m) {
  m = { stickers: [], photos: [], ...m };
  m.stickers = m.stickers.filter(Boolean)
    .map((st, i) => typeof st === 'string' ? newSticker(st, i) : st)
    .filter(st => isSticker(st.id));
  if (m.mood) {
    if (isSticker(m.mood)) m.stickers.unshift({ ...newSticker(m.mood, 0), mood: true });
    m.mood = null;
  }
  return m;
}
function newSticker(id, i = 0) {
  return { id, x: clamp(86 - i * 16 + (Math.random() * 8 - 4), 8, 92), y: clamp(10 + i * 6 + Math.random() * 6, 4, 90), r: Math.round(Math.random() * 16 - 8) };
}
const stickerFree = (st, i, removable) => `<div class="stk-free" data-si="${i}" style="left:${st.x}%;top:${st.y}%;--r:${st.r || 0}deg">${stickerSVG(st.id)}${removable ? `<button class="stk-rm" data-unstick="${i}" title="떼기">✕</button>` : ''}</div>`;

// ───────── 사진 저장소: 용량이 큰 사진은 localStorage 대신 IndexedDB에 ─────────
const photoDB = (() => {
  let dbp;
  const open = () => dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open('memo-photos', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('photos');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const run = async (mode, fn) => {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction('photos', mode);
      const req = fn(t.objectStore('photos'));
      t.oncomplete = () => res(req.result);
      t.onerror = () => rej(t.error);
    });
  };
  return {
    put: (id, blob) => run('readwrite', st => st.put(blob, id)),
    get: id => run('readonly', st => st.get(id)),
    del: id => run('readwrite', st => st.delete(id)),
  };
})();
const photoURLs = new Map();
async function photoURL(id) {
  if (!photoURLs.has(id)) {
    const blob = await photoDB.get(id).catch(() => null);
    photoURLs.set(id, blob ? URL.createObjectURL(blob) : '');
  }
  return photoURLs.get(id);
}
function hydratePhotos(root = document) {
  root.querySelectorAll('img[data-photo]:not([src])').forEach(async img => {
    const url = await photoURL(img.dataset.photo);
    if (url) img.src = url; else img.closest('.ph')?.classList.add('missing');
  });
}
function forgetPhotos(ids) {
  for (const id of ids) {
    photoDB.del(id).catch(() => {});
    if (photoURLs.get(id)) URL.revokeObjectURL(photoURLs.get(id));
    photoURLs.delete(id);
  }
}
// 긴 변 1600px JPEG로 줄여서 저장
async function shrinkImage(file, max = 1600) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(res, 'image/jpeg', 0.85));
}
async function storePhotos(files) {
  const ids = [];
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue;
    try { const id = 'p' + uid(); await photoDB.put(id, await shrinkImage(f)); ids.push(id); }
    catch (err) { console.warn('사진 저장 실패', err); }
  }
  if (files.length && !ids.length) alert('사진을 불러오지 못했어요.');
  return ids;
}
const photoFig = (id, i, removable) => `<figure class="ph" data-pi="${i}"><img data-photo="${id}" alt="">${removable ? `<button class="x" data-unphoto="${i}" title="사진 빼기">✕</button>` : ''}</figure>`;

// ───────── 자동 분류 ─────────
const BULLET = /^\s*(?:[-*•·□☐]|\[\s?\]|\d+[.)])\s+/;

function guessType(text) {
  const t = text.trim();
  const lines = t.split('\n').filter(l => l.trim());
  if (/(매일|매주|습관|루틴|꾸준히|챌린지|habit)/i.test(t)) return 'habit';
  if (lines.some(l => BULLET.test(l)) || /(할\s?일|해야\s?(할|함|됨|한다)|todo|to-do)/i.test(t)) return 'todo';
  if (/(일기|오늘은|오늘 하루|하루였|했다\.|였다\.|느꼈다)/.test(t)) return 'diary';
  return 'note';
}

function guessCategory(text, type) {
  const t = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const c of CATEGORIES) {
    let score = 0;
    for (const w of c.words) if (t.includes(w)) score += w.length >= 3 ? 2 : 1;
    if (c.id === 'money' && /\d[\d,]*\s?(원|만원|천원)/.test(t)) score += 2;
    if (c.id === 'people' && /\d+\s?시/.test(t) && /(만나|약속|저녁|점심)/.test(t)) score += 1;
    if (score > bestScore) { best = c.id; bestScore = score; }
  }
  return best || (type === 'diary' ? 'life' : 'etc');
}

// 빠른 입력 텍스트 → 메모 객체
function parseQuick(text, type, cat) {
  const lines = text.trim().split('\n');
  const m = {
    id: uid(), type, category: cat,
    title: '', body: '', items: [], checks: {}, mood: null, stickers: [], photos: [...pendingPhotos],
    font: null, size: null,
    created: Date.now(), updated: Date.now(),
  };
  if (type === 'todo') {
    // "- 우유  - 계란" 처럼 한 줄에 여러 개도 분리
    let parts = [];
    for (const l of lines) {
      if (!l.trim()) continue;
      const split = l.split(/\s+-\s+|^\s*-\s+/).map(s => s.trim()).filter(Boolean);
      parts.push(...(split.length > 1 ? split : [l]));
    }
    if (parts.length > 1 && !BULLET.test(lines[0])) { m.title = parts[0].replace(BULLET, ''); parts = parts.slice(1); }
    m.items = parts.map(p => ({ text: p.replace(BULLET, '').trim(), done: false })).filter(i => i.text);
  } else if (type === 'habit') {
    m.title = lines[0].replace(/^(매일|매주)\s*/, '').trim() || lines[0];
    m.body = lines.slice(1).join('\n');
  } else {
    if (lines.length > 1 && lines[0].length <= 40) { m.title = lines[0]; m.body = lines.slice(1).join('\n').trim(); }
    else m.body = text.trim();
    if (type === 'diary') m.title = m.title || fmtHand(Date.now());
  }
  // 일기는 첫 스티커가 오늘의 기분
  m.stickers = pendingStickers.map((id, i) => ({ ...newSticker(id, i), ...(type === 'diary' && i === 0 ? { mood: true } : {}) }));
  return m;
}

// ───────── 렌더: 서류철 탭 ─────────
const twoLines = lines => lines.map(esc).join('<br>');

const tabInner = c => `<i class="sl l"></i><span class="lbl">${twoLines(c.lines)}</span><i class="sl r"></i>`;
const typeCounts = () => {
  const counts = {};
  for (const m of memos) counts[m.type] = (counts[m.type] || 0) + 1;
  return counts;
};

// 선택 안 된 서류철은 뒤에 겹쳐 쌓고, 선택된 서류철은 맨 앞으로
function renderStack() {
  const back = FOLDERS.filter(f => f.id !== view.type);
  const fold = (f, i) => `<div class="fold ${f.color}" style="--slot:${SLOTS[i % 4]};--slot2:${i % 2}">
      <button class="tab ${f.shape}" data-type="${f.id}" title="${esc(f.name)}">${tabInner(f)}</button><div class="band"></div></div>`;
  $('#stack').innerHTML = back.map(fold).join('');
  const i = back.length, el = $('#front'), front = folderOf(view.type);
  el.className = `fold front ${front.color}`;
  el.style.setProperty('--slot', SLOTS[i % 4]);
  el.style.setProperty('--slot2', i % 2);
  $('#frontTab').className = `tab on ${front.shape}`;
  $('#frontTab').innerHTML = tabInner(front);
}

// All 서류철에서만 서류철 수·메모 수를 보여준다
function renderOverview() {
  const box = $('#overview');
  box.hidden = view.type !== 'all';
  if (box.hidden) return;
  const counts = typeCounts();
  const folders = FOLDERS.slice(1);
  const last = memos.length ? Math.max(...memos.map(m => m.updated)) : null;
  const topics = CATEGORIES.map(c => [c.label, memos.filter(m => m.category === c.id).length]).filter(([, n]) => n).map(([l, n]) => `${l} ${n}`).join(' · ');
  box.innerHTML = `
    <div class="ov-num"><b>${pad(folders.length)}</b><span>FOLDERS</span></div>
    <div class="ov-num"><b>${pad(memos.length)}</b><span>MEMOS</span></div>
    <div class="ov-side">
      <div class="ov-list">${folders.map(f => `<button data-type="${f.id}"><i class="dot ${f.color}"></i>${esc(f.lines.join(' '))}<span class="n">${pad(counts[f.id] || 0)}</span></button>`).join('')}</div>
      <p class="ov-types">${topics || 'NO MEMOS YET'}${last ? ` — LAST FILED ${fmtDate(last)}` : ''}</p>
    </div>`;
}

// ───────── 렌더: 메모 내지 ─────────
function sheetHTML(m) {
  const style = [m.font ? `--card-font:${fontCss(m.font)}` : '', m.size ? `--card-size:${m.size}px` : ''].filter(Boolean).join(';');
  const [h1, h2] = TYPES[m.type].head;
  const photos = m.photos.slice(0, 3);
  const photoHTML = photos.length ? `<div class="sheet-photos" style="--n:${photos.length}">${photos.map((id, i) => photoFig(id, i)).join('')}${m.photos.length > 3 ? `<span class="more">+${m.photos.length - 3}</span>` : ''}</div>` : '';
  let inner = '';
  if (m.type === 'todo') {
    const done = m.items.filter(i => i.done).length;
    inner = `${m.title ? `<h3>${esc(m.title)}</h3>` : ''}
      <ul class="todo-list">${m.items.slice(0, 8).map((it, i) => `
        <li class="${it.done ? 'done' : ''}"><button class="check ${it.done ? 'on' : ''}" data-toggle="${i}" aria-label="체크"></button><span>${esc(it.text)}</span></li>`).join('')}
        ${m.items.length > 8 ? `<li><span>… 외 ${m.items.length - 8}개</span></li>` : ''}
      </ul>
      <div class="progress">${done} / ${m.items.length} DONE</div>`;
  } else if (m.type === 'habit') {
    const days = lastDays(14), tk = todayKey();
    inner = `<h3>${esc(m.title || '습관')}</h3>
      <div class="habit-days">${days.map(d => `<span>${d.getDate()}</span>`).join('')}</div>
      <div class="habit-row">${days.map(d => { const k = dayKey(d); return `<button data-day="${k}" class="${m.checks[k] ? 'on' : ''} ${k === tk ? 'today' : ''}" title="${k}"></button>`; }).join('')}</div>
      <div class="streak"><b>${streak(m)}</b>DAYS IN A ROW · ${monthCount(m)} THIS MONTH</div>`;
  } else {
    inner = `${m.title ? `<h3>${esc(m.title)}</h3>` : ''}${m.body ? `<p class="body ruled">${esc(m.body)}</p>` : ''}`;
  }
  return `<article class="sheet ${m.type}" data-id="${m.id}" style="${style}">
    <header class="sheet-head"><b>${h1}</b><span>${h2}</span></header>
    <p class="bar-label mono"><span>${fmtDate(m.created)}</span><span class="cat">${esc(catOf(m.category).label)}</span></p>
    ${photoHTML}${inner}
    ${m.stickers.length ? `<div class="stk-layer">${m.stickers.map((st, i) => stickerFree(st, i)).join('')}</div>` : ''}
  </article>`;
}

function streak(m) {
  let n = 0;
  const d = new Date(); d.setHours(0, 0, 0, 0);
  if (!m.checks[dayKey(d)]) d.setDate(d.getDate() - 1); // 오늘 아직 안 했으면 어제부터 셈
  while (m.checks[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function monthCount(m) {
  const p = todayKey().slice(0, 7);
  return Object.keys(m.checks).filter(k => k.startsWith(p) && m.checks[k]).length;
}

function renderGrid() {
  const q = view.q.trim().toLowerCase();
  const list = memos
    .filter(m => view.type === 'all' || m.type === view.type)
    .filter(m => !q || [m.title, m.body, ...m.items.map(i => i.text)].join(' ').toLowerCase().includes(q))
    .sort((a, b) => b.updated - a.updated);
  $('#grid').innerHTML = list.map(sheetHTML).join('');
  hydratePhotos($('#grid'));
  $('#empty').hidden = list.length > 0;
}

function render() { renderStack(); renderOverview(); renderGrid(); }

// ───────── 빠른 입력 ─────────
function currentGuess() {
  const text = $('#quick').value;
  const type = quickOverride.type || guessType(text);
  const cat = quickOverride.cat || guessCategory(text, type);
  return { text, type, cat };
}

function renderGuess() {
  const { text, type, cat } = currentGuess();
  if (!text.trim()) { $('#guess').innerHTML = '<span>FILED UNDER → AUTO</span>'; return; }
  $('#guess').innerHTML = `
    <span>FILED UNDER →</span>
    <select id="gType" class="mono">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${k === type ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
    <select id="gCat" class="mono">${CATEGORIES.map(c => `<option value="${c.id}" ${c.id === cat ? 'selected' : ''}>${c.label}</option>`).join('')}</select>
    ${quickOverride.type || quickOverride.cat ? '<button class="mono-link" id="gReset">AUTO</button>' : ''}`;
}

function renderPending() {
  $('#pendingStickers').innerHTML = pendingStickers.map((id, i) => `<button data-unpend="${i}" title="빼기">${stickerSVG(id)}</button>`).join('');
}
function renderPendingPhotos() {
  $('#pendingPhotos').innerHTML = pendingPhotos.map((id, i) => photoFig(id, i, true)).join('');
  hydratePhotos($('#pendingPhotos'));
}
async function addQuickPhotos(files) {
  pendingPhotos.push(...await storePhotos(files));
  renderPendingPhotos();
}

function quickSave() {
  const { text, type, cat } = currentGuess();
  if (!text.trim() && !pendingPhotos.length) return;
  memos.push(parseQuick(text, type, cat));
  save();
  $('#quick').value = '';
  quickOverride = { type: null, cat: null };
  pendingStickers = [];
  pendingPhotos = [];
  renderGuess(); renderPending(); renderPendingPhotos(); render();
  $('#quick').focus();
}

// ───────── 편집기 ─────────
const editing = () => memos.find(x => x.id === editingId);
function touch() { const m = editing(); if (m) { m.updated = Date.now(); save(); } }

function openEditor(id) {
  const m = memos.find(x => x.id === id);
  if (!m) return;
  editingId = id;
  $('#edType').innerHTML = Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${k === m.type ? 'selected' : ''}>${v.label}</option>`).join('');
  $('#edCat').innerHTML = CATEGORIES.map(c => `<option value="${c.id}" ${c.id === m.category ? 'selected' : ''}>${c.label}</option>`).join('');
  $('#edFont').innerHTML = `<option value="">기본 서체</option>` + FONTS.map(f => `<option value="${f.id}" ${f.id === m.font ? 'selected' : ''}>${f.name}</option>`).join('');
  $('#edDate').textContent = fmtHand(m.created);
  $('#edTitle').value = m.title;
  applyEditorFont(m);
  renderEditorHead(m);
  renderEditorStickers(m);
  renderEditorPhotos(m);
  renderEditorContent(m);
  $('#overlay').hidden = false;
}

function renderEditorHead(m) {
  const [h1, h2] = TYPES[m.type].head;
  $('#edHeading').innerHTML = `<b>${h1}</b><span>${h2}</span>`;
}

function applyEditorFont(m) {
  const body = $('#edBody');
  body.style.setProperty('--ed-font', m.font ? fontCss(m.font) : 'var(--memo-font)');
  body.style.setProperty('--ed-size', (m.size || prefs.size) + 'px');
  $('#edSizeVal').textContent = m.size || prefs.size;
}

function renderEditorStickers(m) {
  $('#edStickers').innerHTML = m.stickers.map((st, i) => stickerFree(st, i, true)).join('');
}
function renderEditorPhotos(m) {
  $('#edPhotos').innerHTML = m.photos.map((id, i) => photoFig(id, i, true)).join('');
  hydratePhotos($('#edPhotos'));
}
async function addEditorPhotos(files) {
  const m = editing(); if (!m) return;
  m.photos.push(...await storePhotos(files));
  touch(); renderEditorPhotos(m);
}

function renderEditorContent(m) {
  const box = $('#edContent');
  if (m.type === 'todo') {
    box.innerHTML = `
      <ul class="todo-list ed-todo">${m.items.map((it, i) => `
        <li class="${it.done ? 'done' : ''}">
          <button class="check ${it.done ? 'on' : ''}" data-etoggle="${i}" aria-label="체크"></button>
          <input type="text" data-item="${i}" value="${esc(it.text)}">
          <button class="rm" data-rm="${i}" title="지우기">✕</button>
        </li>`).join('')}
      </ul>
      <button class="mono-link add-item" id="addItem">+ ADD ITEM</button>`;
  } else if (m.type === 'habit') {
    const days = lastDays(28), tk = todayKey();
    const weeks = [0, 7, 14, 21].map(s => days.slice(s, s + 7));
    box.innerHTML = `
      <div class="ed-habit">
        <p class="bar-label mono ed-section">LAST 4 WEEKS — 칸을 눌러 체크</p>
        ${weeks.map(w => `
          <div class="habit-days">${w.map(d => `<span>${d.getMonth() + 1}/${d.getDate()}</span>`).join('')}</div>
          <div class="habit-row">${w.map(d => { const k = dayKey(d); return `<button data-eday="${k}" class="${m.checks[k] ? 'on' : ''} ${k === tk ? 'today' : ''}"></button>`; }).join('')}</div>`).join('')}
        <div class="streak"><b>${streak(m)}</b>DAYS IN A ROW · ${monthCount(m)} THIS MONTH</div>
        <p class="bar-label mono ed-section">NOTES</p>
        <textarea id="edText" class="ruled" placeholder="목표, 규칙 등">${esc(m.body)}</textarea>
      </div>`;
  } else if (m.type === 'diary') {
    box.innerHTML = `
      <p class="bar-label mono">TODAY'S MOOD</p>
      <div class="mood-pick">${STICKERS.map(s => `<button data-mood="${s.id}" class="${m.stickers.some(st => st.mood && st.id === s.id) ? 'on' : ''}" title="${s.word}">${stickerSVG(s.id)}</button>`).join('')}</div>
      <textarea id="edText" class="ruled" placeholder="오늘은 어땠나요">${esc(m.body)}</textarea>`;
  } else {
    box.innerHTML = `<textarea id="edText" class="ruled" placeholder="내용">${esc(m.body)}</textarea>`;
  }
}

// 메모 형태를 바꿀 때 내용을 최대한 보존
function convertType(m, to) {
  if (m.type === to) return;
  if (to === 'todo') {
    const lines = (m.body || '').split('\n').map(l => l.replace(BULLET, '').trim()).filter(Boolean);
    m.items = lines.length ? lines.map(t => ({ text: t, done: false })) : [{ text: '', done: false }];
    m.body = '';
  } else if (m.type === 'todo') {
    m.body = m.items.map(i => (i.done ? '✓ ' : '- ') + i.text).join('\n');
    m.items = [];
  }
  m.type = to;
}

function closeEditor() {
  const m = editing();
  if (m) {
    const empty = !m.title.trim() && !m.body.trim() && !m.items.some(i => i.text.trim()) && !Object.keys(m.checks).length && !m.stickers.length && !m.photos.length;
    if (empty) memos = memos.filter(x => x.id !== m.id);
    else m.items = m.items.filter(i => i.text.trim());
    save();
  }
  editingId = null;
  $('#overlay').hidden = true;
  hidePicker();
  render();
}

// ───────── 스티커·이모지 팝오버 ─────────
function showPicker(anchor, mode, target) {
  picker = { ...picker, mode, target, anchor };
  renderPicker();
  const pop = $('#emojiPop');
  pop.hidden = false;
  const r = anchor.getBoundingClientRect();
  const w = 340, h = Math.min(360, pop.scrollHeight);
  pop.style.left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) + 'px';
  pop.style.top = (r.bottom + h + 8 < window.innerHeight ? r.bottom + 6 : Math.max(8, r.top - h - 6)) + 'px';
}
function renderPicker() {
  const chosen = picker.mode === 'quick' ? pendingStickers : [];
  const tabs = `<div class="pop-tabs"><button data-ptab="sticker" class="${picker.tab === 'sticker' ? 'on' : ''}">STICKERS</button><button data-ptab="emoji" class="${picker.tab === 'emoji' ? 'on' : ''}">EMOJI</button></div>`;
  const body = picker.tab === 'sticker'
    ? `<p class="pop-hint">누르면 메모에 붙고, 메모 위에서 끌어서 옮겨요 (최대 ${MAX_STICKERS}개${picker.mode === 'quick' ? ' · 일기는 첫 장이 오늘의 기분' : ''})</p>
       <div class="sticker-set">${STICKERS.map(s => `<button data-sticker="${s.id}" class="${chosen.includes(s.id) ? 'on' : ''}" title="${s.word}">${stickerSVG(s.id)}</button>`).join('')}</div>`
    : `<p class="pop-hint">커서 위치에 넣어요</p>` + Object.entries(EMOJI).map(([g, s]) => `
       <h5>${g}</h5><div class="emoji-set">${[...new Intl.Segmenter().segment(s)].map(x => `<button data-emoji="${x.segment}">${x.segment}</button>`).join('')}</div>`).join('');
  $('#emojiPop').innerHTML = tabs + body;
}
function hidePicker() { $('#emojiPop').hidden = true; picker.mode = null; }

function toggleSticker(list, id) {
  const i = list.indexOf(id);
  if (i >= 0) list.splice(i, 1);
  else if (list.length < MAX_STICKERS) list.push(id);
}

function insertAtCursor(el, text) {
  const s = el.selectionStart ?? el.value.length, e = el.selectionEnd ?? el.value.length;
  el.value = el.value.slice(0, s) + text + el.value.slice(e);
  el.selectionStart = el.selectionEnd = s + text.length;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.focus();
}

// 편집기 안에서 마지막으로 포커스된 입력칸에 이모지를 넣는다
let lastField = null;
document.addEventListener('focusin', e => {
  if (e.target.closest('#edBody') && e.target.matches('input, textarea')) lastField = e.target;
});

// ───────── 환경설정 적용 ─────────
function applyPrefs() {
  const root = document.documentElement;
  root.style.setProperty('--memo-font', fontCss(prefs.font));
  root.style.setProperty('--memo-size', prefs.size + 'px');
  if (prefs.theme) root.dataset.theme = prefs.theme; else delete root.dataset.theme;
}

// ───────── 이벤트 ─────────
function bind() {
  const now = new Date();
  $('#today').textContent = `${now.getMonth() + 1}월 ${now.getDate()}일`;
  $('#weekday').textContent = `${EN_DAY[now.getDay()]} · ${now.getFullYear()}`;

  // 빠른 입력
  $('#quick').addEventListener('input', renderGuess);
  $('#quick').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); quickSave(); } });
  $('#quickSave').addEventListener('click', quickSave);
  $('#guess').addEventListener('change', e => {
    if (e.target.id === 'gType') quickOverride.type = e.target.value;
    if (e.target.id === 'gCat') quickOverride.cat = e.target.value;
    renderGuess();
  });
  $('#guess').addEventListener('click', e => { if (e.target.id === 'gReset') { quickOverride = { type: null, cat: null }; renderGuess(); } });
  $('#quickEmoji').addEventListener('click', e => { e.stopPropagation(); showPicker(e.currentTarget, 'quick', $('#quick')); });
  $('#pendingStickers').addEventListener('click', e => {
    const b = e.target.closest('[data-unpend]'); if (!b) return;
    pendingStickers.splice(+b.dataset.unpend, 1); renderPending();
  });
  $('#quickPhoto').addEventListener('change', e => { addQuickPhotos([...e.target.files]); e.target.value = ''; });
  $('#pendingPhotos').addEventListener('click', e => {
    const b = e.target.closest('[data-unphoto]'); if (!b) return;
    forgetPhotos(pendingPhotos.splice(+b.dataset.unphoto, 1)); renderPendingPhotos();
  });
  dropZone($('#capture'), addQuickPhotos);
  dropZone($('#editor'), addEditorPhotos);

  // 필터
  for (const id of ['#stack', '#overview']) $(id).addEventListener('click', e => { const b = e.target.closest('[data-type]'); if (b) { view.type = b.dataset.type; render(); } });
  $('#search').addEventListener('input', e => { view.q = e.target.value; renderGrid(); });

  // 내지: 체크는 바로, 나머지는 편집기 열기
  $('#grid').addEventListener('click', e => {
    const card = e.target.closest('.sheet'); if (!card) return;
    if (Date.now() - lastDragEnd < 300) return; // 스티커를 옮긴 직후의 클릭은 무시
    const m = memos.find(x => x.id === card.dataset.id);
    const t = e.target.closest('[data-toggle]');
    const d = e.target.closest('[data-day]');
    if (t) { const it = m.items[+t.dataset.toggle]; it.done = !it.done; m.updated = Date.now(); save(); renderGrid(); return; }
    if (d) { const k = d.dataset.day; m.checks[k] ? delete m.checks[k] : (m.checks[k] = true); m.updated = Date.now(); save(); renderGrid(); return; }
    openEditor(m.id);
  });

  // 편집기
  $('#edClose').addEventListener('click', closeEditor);
  $('#edDone').addEventListener('click', closeEditor);
  $('#overlay').addEventListener('click', e => { if (e.target.id === 'overlay') closeEditor(); });
  $('#edDelete').addEventListener('click', () => {
    if (!confirm('이 메모를 삭제할까요?')) return;
    forgetPhotos(editing()?.photos || []);
    memos = memos.filter(x => x.id !== editingId); save();
    editingId = null; $('#overlay').hidden = true; render();
  });
  $('#edTitle').addEventListener('input', e => { editing().title = e.target.value; touch(); });
  $('#edType').addEventListener('change', e => { const m = editing(); convertType(m, e.target.value); touch(); renderEditorHead(m); renderEditorContent(m); });
  $('#edCat').addEventListener('change', e => { editing().category = e.target.value; touch(); });
  $('#edFont').addEventListener('change', e => { const m = editing(); m.font = e.target.value || null; touch(); applyEditorFont(m); });
  document.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => {
    const m = editing();
    m.size = Math.max(12, Math.min(40, (m.size || prefs.size) + +b.dataset.size));
    touch(); applyEditorFont(m);
  }));
  $('#edEmoji').addEventListener('click', e => {
    e.stopPropagation();
    const target = lastField && document.body.contains(lastField) ? lastField : ($('#edText') || $('#edTitle'));
    showPicker(e.currentTarget, 'editor', target);
  });
  $('#edStickers').addEventListener('click', e => {
    const b = e.target.closest('[data-unstick]'); if (!b) return;
    const m = editing(); m.stickers.splice(+b.dataset.unstick, 1); touch(); renderEditorStickers(m);
    if (m.type === 'diary') renderEditorContent(m);
  });
  $('#edPhoto').addEventListener('change', e => { addEditorPhotos([...e.target.files]); e.target.value = ''; });
  $('#edPhotos').addEventListener('click', e => {
    const m = editing();
    const x = e.target.closest('[data-unphoto]');
    if (x) { forgetPhotos(m.photos.splice(+x.dataset.unphoto, 1)); touch(); renderEditorPhotos(m); return; }
    const img = e.target.closest('img[data-photo]');
    if (img?.src) window.open(img.src, '_blank'); // 원본 크기로 보기
  });

  $('#edContent').addEventListener('input', e => {
    const m = editing();
    if (e.target.id === 'edText') m.body = e.target.value;
    if (e.target.dataset.item != null) m.items[+e.target.dataset.item].text = e.target.value;
    touch();
  });
  $('#edContent').addEventListener('keydown', e => {
    if (e.target.dataset.item != null && e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      const m = editing(), i = +e.target.dataset.item;
      m.items.splice(i + 1, 0, { text: '', done: false }); touch(); renderEditorContent(m);
      $(`[data-item="${i + 1}"]`).focus();
    }
  });
  $('#edContent').addEventListener('click', e => {
    const m = editing();
    const t = e.target.closest('[data-etoggle]'), rm = e.target.closest('[data-rm]');
    const day = e.target.closest('[data-eday]'), mood = e.target.closest('[data-mood]');
    if (t) { const it = m.items[+t.dataset.etoggle]; it.done = !it.done; }
    else if (rm) m.items.splice(+rm.dataset.rm, 1);
    else if (e.target.id === 'addItem') m.items.push({ text: '', done: false });
    else if (day) { const k = day.dataset.eday; m.checks[k] ? delete m.checks[k] : (m.checks[k] = true); }
    else if (mood) {
      const cur = m.stickers.findIndex(st => st.mood);
      const same = cur >= 0 && m.stickers[cur].id === mood.dataset.mood;
      if (cur >= 0) m.stickers.splice(cur, 1);
      if (!same) m.stickers.unshift({ ...newSticker(mood.dataset.mood, 0), mood: true });
      renderEditorStickers(m);
    }
    else return;
    touch(); renderEditorContent(m);
    if (e.target.id === 'addItem') $(`[data-item="${m.items.length - 1}"]`).focus();
  });

  // 팝오버
  $('#emojiPop').addEventListener('click', e => {
    e.stopPropagation();
    const tab = e.target.closest('[data-ptab]');
    const stk = e.target.closest('[data-sticker]');
    const emo = e.target.closest('[data-emoji]');
    if (tab) { picker.tab = tab.dataset.ptab; renderPicker(); }
    else if (stk && picker.mode === 'quick') { toggleSticker(pendingStickers, stk.dataset.sticker); renderPending(); renderPicker(); }
    else if (stk && picker.mode === 'editor') {
      const m = editing();
      if (m.stickers.length < MAX_STICKERS) { m.stickers.push(newSticker(stk.dataset.sticker, m.stickers.length)); touch(); renderEditorStickers(m); }
    }
    else if (emo && picker.target) insertAtCursor(picker.target, emo.dataset.emoji);
  });
  document.addEventListener('click', e => { if (!e.target.closest('#emojiPop')) hidePicker(); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('#emojiPop').hidden) hidePicker();
    else if (!$('#overlay').hidden) closeEditor();
    else if (!$('#settings').hidden) $('#settings').hidden = true;
  });

  // 설정
  $('#settingsBtn').addEventListener('click', () => {
    $('#setFont').innerHTML = FONTS.map(f => `<option value="${f.id}" ${f.id === prefs.font ? 'selected' : ''}>${f.name}</option>`).join('');
    $('#setSize').value = prefs.size; $('#setSizeVal').textContent = prefs.size + 'px';
    $('#settings').hidden = false;
  });
  $('#settings').addEventListener('click', e => { if (e.target.id === 'settings' || e.target.closest('[data-close]')) $('#settings').hidden = true; });
  $('#setFont').addEventListener('change', e => { prefs.font = e.target.value; savePrefs(); applyPrefs(); });
  $('#setSize').addEventListener('input', e => { prefs.size = +e.target.value; $('#setSizeVal').textContent = prefs.size + 'px'; savePrefs(); applyPrefs(); });
  $('#themeBtn').addEventListener('click', () => {
    const dark = prefs.theme ? prefs.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    prefs.theme = dark ? 'light' : 'dark'; savePrefs(); applyPrefs();
  });

  // 백업
  $('#exportBtn').addEventListener('click', async () => {
    const photos = {};
    for (const id of memos.flatMap(m => m.photos)) {
      const b = await photoDB.get(id).catch(() => null);
      if (b) photos[id] = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });
    }
    const blob = new Blob([JSON.stringify({ memos, prefs, photos }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `memo-backup-${todayKey()}.json`; a.click();
    URL.revokeObjectURL(a.href);
  });
  $('#importFile').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.memos)) throw 0;
      if (!confirm(`메모 ${data.memos.length}개를 불러옵니다. 현재 메모는 대체됩니다.`)) return;
      for (const [id, url] of Object.entries(data.photos || {})) await photoDB.put(id, await (await fetch(url)).blob());
      memos = data.memos.map(normalize); save(); render();
    } catch { alert('올바른 백업 파일이 아니에요.'); }
    e.target.value = '';
  });
}

// ───────── 스티커 끌어 옮기기 (메모 카드·편집기 공통) ─────────
let drag = null, lastDragEnd = 0;
document.addEventListener('pointerdown', e => {
  const el = e.target.closest('.stk-free');
  if (!el || e.target.closest('.stk-rm') || e.button > 0) return;
  const layer = el.parentElement;
  const memoId = layer.closest('.sheet')?.dataset.id || editingId;
  drag = { el, layer, memoId, i: +el.dataset.si, sx: e.clientX, sy: e.clientY, moved: false };
  el.setPointerCapture(e.pointerId);
  e.preventDefault();
});
document.addEventListener('pointermove', e => {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
  drag.moved = true;
  drag.el.classList.add('dragging');
  const r = drag.layer.getBoundingClientRect();
  drag.x = clamp((e.clientX - r.left) / r.width * 100);
  drag.y = clamp((e.clientY - r.top) / r.height * 100);
  drag.el.style.left = drag.x + '%';
  drag.el.style.top = drag.y + '%';
});
document.addEventListener('pointerup', () => {
  if (!drag) return;
  const d = drag; drag = null;
  d.el.classList.remove('dragging');
  if (!d.moved) return;
  lastDragEnd = Date.now();
  const m = memos.find(x => x.id === d.memoId), st = m?.stickers[d.i];
  if (!st) return;
  st.x = Math.round(d.x * 10) / 10;
  st.y = Math.round(d.y * 10) / 10;
  save();
});

// 사진 파일을 끌어다 놓을 수 있는 영역
function dropZone(el, onFiles) {
  const hasFiles = e => [...(e.dataTransfer?.types || [])].includes('Files');
  el.addEventListener('dragover', e => { if (!hasFiles(e)) return; e.preventDefault(); el.classList.add('drop-on'); });
  el.addEventListener('dragleave', e => { if (!el.contains(e.relatedTarget)) el.classList.remove('drop-on'); });
  el.addEventListener('drop', e => {
    if (!hasFiles(e)) return;
    e.preventDefault(); el.classList.remove('drop-on');
    onFiles([...e.dataTransfer.files]);
  });
}

memos = load(STORE_KEY, []).map(normalize);
applyPrefs();
bind();
renderGuess();
render();
