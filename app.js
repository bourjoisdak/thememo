/* 메모 서류함 — 브라우저 localStorage에 저장되는 1인용 메모 앱 */

// ───────── 설정값 ─────────
const TYPES = {
  note:  { label: '메모', tab: 'Notes',   head: ['Note', '메모'] },
  todo:  { label: '투두', tab: 'To-do',   head: ['To-do', '할 일 목록'] },
  habit: { label: '습관', tab: 'Habits',  head: ['Habit', '트래커'] },
  diary: { label: '일기', tab: 'Journal', head: ['Daily', '일기'] },
};

// 카테고리별 키워드. 많이 맞는 쪽으로 분류된다.
const CATEGORIES = [
  { id: 'work',   name: '업무',     en: 'work\nmatters',   words: ['회의', '미팅', '보고', '보고서', '프로젝트', '메일', '거래처', '마감', '출근', '퇴근', '업무', '팀장', '클라이언트', '견적', '계약', '발표', '자료', '회사', '결재'] },
  { id: 'study',  name: '공부',     en: 'study\nnotes',    words: ['공부', '강의', '책', '독서', '시험', '영어', '단어', '복습', '예습', '수업', '과제', '자격증', '외우', '읽기', '스터디', '인강', '토익'] },
  { id: 'money',  name: '돈',       en: 'money\ntalks',    words: ['돈', '결제', '카드', '월세', '적금', '가계부', '지출', '송금', '세금', '이체', '통장', '대출', '환불', '월급', '용돈', '할부'] },
  { id: 'health', name: '건강',     en: 'body &\nhealth',  words: ['운동', '헬스', '러닝', '달리기', '병원', '약', '다이어트', '물', '수면', '잠', '스트레칭', '요가', '필라테스', '걷기', '만보', '식단', '영양제'] },
  { id: 'shop',   name: '쇼핑',     en: 'shopping\nlist',  words: ['사기', '살것', '살 것', '구매', '장보기', '장 보기', '주문', '쿠팡', '마트', '택배', '우유', '계란', '휴지', '세제', '배송'] },
  { id: 'idea',   name: '아이디어', en: 'idea\nbank',      words: ['아이디어', '생각났', '만들어', '만들기', '기획', '앱', '영감', '컨셉', '콘셉트', '구상', '해보면', '어떨까'] },
  { id: 'people', name: '사람·약속', en: 'people &\nplans', words: ['약속', '생일', '만나', '친구', '엄마', '아빠', '가족', '선물', '연락', '전화', '모임', '결혼식', '저녁 먹'] },
  { id: 'life',   name: '일상·기록', en: 'daily\nrecords',  words: ['오늘', '하루', '기분', '날씨', '산책', '카페', '영화', '여행', '맛집', '일기'] },
  { id: 'etc',    name: '기타',     en: 'odds &\nends',    words: [] },
];
const ALL = { id: 'all', name: '전체', en: 'behind\nthe memos' };

const FONTS = [
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
const MAX_STICKERS = 3;

const STORE_KEY = 'memo-sorter:v1';
const PREF_KEY = 'memo-sorter:prefs:v2';

// ───────── 상태 ─────────
let memos = load(STORE_KEY, []).map(m => ({ stickers: [], ...m }));
let prefs = Object.assign({ font: 'pen', size: 22, theme: null }, load(PREF_KEY, {}));
let view = { cat: 'all', type: 'all', q: '' };
let editingId = null;
let quickOverride = { type: null, cat: null };
let pendingStickers = [];
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
function polaroid(v) {
  return isSticker(v) ? `<div class="polaroid">${stickerSVG(v)}</div>` : `<div class="polaroid emoji">${esc(v)}</div>`;
}

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
    title: '', body: '', items: [], checks: {}, mood: null, stickers: [],
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
    if (type === 'diary') {
      m.title = m.title || fmtHand(Date.now());
      const mood = pendingStickers[0];
      if (mood) { m.mood = mood; pendingStickers = pendingStickers.slice(1); }
    }
  }
  m.stickers = [...pendingStickers];
  return m;
}

// ───────── 렌더: 서류철 탭 ─────────
function renderFolderTabs() {
  const counts = {};
  for (const m of memos) counts[m.category] = (counts[m.category] || 0) + 1;
  const tabs = [{ ...ALL, n: memos.length }, ...CATEGORIES.map(c => ({ ...c, n: counts[c.id] || 0 }))]
    .filter(t => t.id === 'all' || t.n > 0 || view.cat === t.id);
  $('#folderTabs').innerHTML = tabs.map(t =>
    `<button data-cat="${t.id}" class="${view.cat === t.id ? 'on' : ''}">${esc(t.name)}<span class="n">${pad(t.n)}</span></button>`).join('');
}

function renderTypeTabs() {
  const tabs = [['all', 'All Files'], ...Object.entries(TYPES).map(([k, v]) => [k, `${v.tab} · ${v.label}`])];
  $('#typeTabs').innerHTML = tabs.map(([k, l]) =>
    `<button data-type="${k}" class="${view.type === k ? 'on' : ''}"><span>${esc(l)}</span><span class="ast">✱</span></button>`).join('');
}

function renderCover(list) {
  const c = catOf(view.cat);
  const idx = view.cat === 'all' ? 0 : CATEGORIES.indexOf(c) + 1;
  $('#coverEdition').innerHTML = `FOLDER ${pad(idx)}:<br>${esc(c.name)}${view.type === 'all' ? '' : ' / ' + TYPES[view.type].label}`;
  $('#coverTitle').innerHTML = esc(c.en).replace('\n', '<br>');
  const last = list.length ? Math.max(...list.map(m => m.updated)) : null;
  const mix = Object.entries(TYPES).map(([k, v]) => [v.label, list.filter(m => m.type === k).length]).filter(([, n]) => n).map(([l, n]) => `${l} ${n}`).join(' · ');
  $('#coverRows').innerHTML = `
    <div><span>MEMOS:</span><b>${pad(list.length)}</b></div>
    <div><span>LAST FILED:</span><b>${last ? fmtDate(last) : '—'}</b></div>
    <div><span>CONTAINS:</span><b>${mix || '—'}</b></div>`;
}

// ───────── 렌더: 메모 내지 ─────────
function sheetHTML(m) {
  const style = [m.font ? `--card-font:${fontCss(m.font)}` : '', m.size ? `--card-size:${m.size}px` : ''].filter(Boolean).join(';');
  const [h1, h2] = TYPES[m.type].head;
  const pics = [m.mood, ...m.stickers].filter(Boolean).slice(0, 2);
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
      <div class="streak"><b>${streak(m)}</b>DAYS IN A ROW · 이번 달 ${monthCount(m)}회</div>`;
  } else {
    inner = `${m.title ? `<h3>${esc(m.title)}</h3>` : ''}${m.body ? `<p class="body ruled">${esc(m.body)}</p>` : ''}`;
  }
  return `<article class="sheet ${m.type}" data-id="${m.id}" style="${style}">
    <header class="sheet-head"><b>${h1}</b><span>${h2}</span></header>
    ${pics.length ? `<div class="polaroids">${pics.map(polaroid).join('')}</div>` : ''}
    <p class="bar-label mono"><span>${fmtDate(m.created)}</span><span>${esc(catOf(m.category).name)}</span></p>
    ${inner}
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
    .filter(m => view.cat === 'all' || m.category === view.cat)
    .filter(m => view.type === 'all' || m.type === view.type)
    .filter(m => !q || [m.title, m.body, ...m.items.map(i => i.text)].join(' ').toLowerCase().includes(q))
    .sort((a, b) => b.updated - a.updated);
  renderCover(list);
  $('#grid').innerHTML = list.map(sheetHTML).join('');
  $('#empty').hidden = list.length > 0;
}

function render() { renderFolderTabs(); renderTypeTabs(); renderGrid(); }

// ───────── 빠른 입력 ─────────
function currentGuess() {
  const text = $('#quick').value;
  const type = quickOverride.type || guessType(text);
  const cat = quickOverride.cat || guessCategory(text, type);
  return { text, type, cat };
}

function renderGuess() {
  const { text, type, cat } = currentGuess();
  if (!text.trim()) { $('#guess').innerHTML = '<span>FILED UNDER → 자동 분류</span>'; return; }
  $('#guess').innerHTML = `
    <span>FILED UNDER →</span>
    <select id="gType" class="mono">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${k === type ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
    <select id="gCat" class="mono">${CATEGORIES.map(c => `<option value="${c.id}" ${c.id === cat ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
    ${quickOverride.type || quickOverride.cat ? '<button class="mono-link" id="gReset">AUTO</button>' : ''}`;
}

function renderPending() {
  $('#pendingStickers').innerHTML = pendingStickers.map((id, i) => `<button data-unpend="${i}" title="빼기">${stickerSVG(id)}</button>`).join('');
}

function quickSave() {
  const { text, type, cat } = currentGuess();
  if (!text.trim()) return;
  memos.push(parseQuick(text, type, cat));
  save();
  $('#quick').value = '';
  quickOverride = { type: null, cat: null };
  pendingStickers = [];
  renderGuess(); renderPending(); render();
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
  $('#edCat').innerHTML = CATEGORIES.map(c => `<option value="${c.id}" ${c.id === m.category ? 'selected' : ''}>${c.name}</option>`).join('');
  $('#edFont').innerHTML = `<option value="">기본 서체</option>` + FONTS.map(f => `<option value="${f.id}" ${f.id === m.font ? 'selected' : ''}>${f.name}</option>`).join('');
  $('#edDate').textContent = fmtHand(m.created);
  $('#edTitle').value = m.title;
  applyEditorFont(m);
  renderEditorHead(m);
  renderEditorStickers(m);
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
  $('#edStickers').innerHTML = m.stickers.map((v, i) => `<div class="polaroid">${isSticker(v) ? stickerSVG(v) : esc(v)}<button data-unstick="${i}" title="떼기">✕</button></div>`).join('');
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
        <div class="streak"><b>${streak(m)}</b>DAYS IN A ROW · 이번 달 ${monthCount(m)}회</div>
        <p class="bar-label mono ed-section">NOTES</p>
        <textarea id="edText" class="ruled" placeholder="목표, 규칙 등">${esc(m.body)}</textarea>
      </div>`;
  } else if (m.type === 'diary') {
    box.innerHTML = `
      <p class="bar-label mono">TODAY'S MOOD</p>
      <div class="mood-pick">${STICKERS.map(s => `<button data-mood="${s.id}" class="${m.mood === s.id ? 'on' : ''}" title="${s.word}">${stickerSVG(s.id)}</button>`).join('')}</div>
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
    const empty = !m.title.trim() && !m.body.trim() && !m.items.some(i => i.text.trim()) && !Object.keys(m.checks).length && !m.stickers.length;
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
  const chosen = picker.mode === 'quick' ? pendingStickers : (editing()?.stickers || []);
  const tabs = `<div class="pop-tabs"><button data-ptab="sticker" class="${picker.tab === 'sticker' ? 'on' : ''}">STICKERS</button><button data-ptab="emoji" class="${picker.tab === 'emoji' ? 'on' : ''}">EMOJI</button></div>`;
  const body = picker.tab === 'sticker'
    ? `<p class="pop-hint">메모에 붙여요 (최대 ${MAX_STICKERS}개${picker.mode === 'quick' ? ' · 일기는 첫 장이 오늘의 기분' : ''})</p>
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

  // 필터
  $('#folderTabs').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) { view.cat = b.dataset.cat; render(); } });
  $('#typeTabs').addEventListener('click', e => { const b = e.target.closest('[data-type]'); if (b) { view.type = b.dataset.type; render(); } });
  $('#search').addEventListener('input', e => { view.q = e.target.value; renderGrid(); });

  // 내지: 체크는 바로, 나머지는 편집기 열기
  $('#grid').addEventListener('click', e => {
    const card = e.target.closest('.sheet'); if (!card) return;
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
    else if (mood) m.mood = m.mood === mood.dataset.mood ? null : mood.dataset.mood;
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
    else if (stk && picker.mode === 'editor') { const m = editing(); toggleSticker(m.stickers, stk.dataset.sticker); touch(); renderEditorStickers(m); renderPicker(); }
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
  $('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ memos, prefs }, null, 2)], { type: 'application/json' });
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
      memos = data.memos.map(m => ({ stickers: [], ...m })); save(); render();
    } catch { alert('올바른 백업 파일이 아니에요.'); }
    e.target.value = '';
  });
}

applyPrefs();
bind();
renderGuess();
render();
