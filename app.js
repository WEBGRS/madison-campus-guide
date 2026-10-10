/* Madison Essentials: list + map + place pages. */
(function () {
  'use strict';
  var D = window.ESS || { cats: [], places: [] };
  var C = window.EssCore;
  var ROUTES = window.ROUTES || {};
  var LOCAL = window.LOCAL || {};
  var $ = function (id) { return document.getElementById(id); };
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem('es:' + k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('es:' + k, v); } catch (e) { /* private mode */ } }
  };
  var lang = LS.get('lang', /^zh/i.test(navigator.language || '') ? 'zh' : 'en');
  var CAT = {}, BY = {};
  D.cats.forEach(function (c, i) { c.i = i; CAT[c.k] = c; });
  D.places.forEach(function (p) { BY[p.id] = p; });

  var T = {
    en: {
      search_ph: 'Search: pharmacy, Asian grocery, printing…', all: 'All', open_now: 'Open now',
      sort: 'Sort', sort_cat: 'By category', sort_dist: 'Nearest first', from: 'From',
      count: '{n} places', count1: '1 place', none: 'Nothing matches. Try another word or clear the filters.',
      clear: 'Clear filters', map: 'Map', list: 'List', back: 'Back', details: 'Details',
      open: 'Open', closed: 'Closed', open24: 'Open 24 hours', closes: 'closes {t}', opens: 'opens {t}',
      opens_tmr: 'opens tomorrow {t}', opens_day: 'opens {d} {t}',
      hours: 'Hours', address: 'Address', phone: 'Phone', website: 'Website', distance: 'Distance',
      bus: 'Nearest bus stops', directions: 'Directions', dist_line: '{mi} mi from {o}', walk: 'about {m} min walk',
      mi: '{mi} mi', walk_short: '{m} min walk',
      sec_about: 'About', sec_offers: 'What you can do here', sec_howto: 'How to use it',
      sec_cost: 'Cost and who can use it', sec_tips: 'Tips', sec_intl: 'International students', sources: 'Sources',
      checked: 'Checked {d}. Hours and rules change, so confirm on the official site before you go.',
      unconfirmed: 'not confirmed', near_same: 'Also nearby', today: 'today',
      foot: 'Not affiliated with UW–Madison. Every place lists its sources. Last checked {d}.',
      me_wait: 'Finding your location…', me_fail: 'Location unavailable — showing distances from Library Mall.',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], noon: 'noon', midnight: 'midnight',
      no_map: 'No map position', m: '{m} m', theme: 'Light or dark', not_found: 'That place is not in the guide.',
      tab_map: 'Map', tab_guide: 'Full guide', jump: 'Jump to a section', map_page: 'Map and bus stops',
      no_stops: 'No Madison Metro stop within 1.5 km (about a mile).',
      tab_faq: 'Ask', related_q: 'Common questions about this place', faq_places: 'Where to go', faq_hit: 'Related common questions',
      ask_title: 'Ask a question', ask_ph: 'e.g. Can I open a bank account without an SSN?', ask_btn: 'Ask', faq_list: 'Common questions',
      ask_note: 'AI answers only from this guide\'s checked entries and can be wrong; follow the linked official pages. Questions are logged to improve the guide.',
      ask_related: 'Related in this guide', ask_wait: 'Writing an answer…', ask_ai: 'AI answer',
      ask_none: 'This guide has nothing on that yet. Try other words, or browse the common questions below.',
      ask_quota: 'You have reached today\'s question limit. The related entries above still apply.',
      ask_fail: 'The AI is not available right now. See the related entries above.',
      ask_verify: 'The automatic browser check did not pass, so AI answers are off here. Reload the page, or allow this site in your blocker. The related entries above still work.',
      ask_busy: 'AI answers are paused for today: the site has reached its daily limit. The related entries above still work.',
      ask_off: 'AI answers are not available on this copy of the site. See the related entries above.',
      ask_numcheck: 'Some numbers in this answer are not in the guide\'s entries. Check the official page before you rely on them.',
      ask_list: 'Ask AI: “{q}”',
      ask_left: 'Questions left today on this device: {n} of {max}.',
      ask_low: 'Only {n} question(s) left today on this device.',
      ask_out: 'This device has used today\'s {max} questions. They come back after midnight, Madison time. The related entries above still work.'
    },
    zh: {
      search_ph: '搜索：药店、亚洲超市、打印……', all: '全部', open_now: '营业中',
      sort: '排序', sort_cat: '按分类', sort_dist: '由近到远', from: '距离从',
      count: '{n} 个地方', count1: '1 个地方', none: '没有符合的地方，换个词或清空筛选。',
      clear: '清空筛选', map: '地图', list: '列表', back: '返回', details: '详情',
      open: '营业中', closed: '已关门', open24: '24 小时开放', closes: '{t} 关门', opens: '{t} 开门',
      opens_tmr: '明天 {t} 开门', opens_day: '{d} {t} 开门',
      hours: '开放时间', address: '地址', phone: '电话', website: '官网', distance: '距离',
      bus: '最近的公交站', directions: '导航', dist_line: '距 {o} {mi} 英里', walk: '步行约 {m} 分钟',
      mi: '{mi} 英里', walk_short: '步行 {m} 分钟',
      sec_about: '这是什么地方', sec_offers: '能做什么', sec_howto: '怎么用', sec_cost: '费用和谁能用',
      sec_tips: '小贴士', sec_intl: '国际学生注意', sources: '资料来源',
      checked: '核对于 {d}。时间和规定会变，出发前以官网为准。',
      unconfirmed: '未核实', near_same: '附近同类', today: '今天',
      foot: '非 UW–Madison 官方网站。每个地方都附资料来源，最近核对于 {d}。',
      me_wait: '正在获取你的位置……', me_fail: '拿不到你的位置，改为从 Library Mall 算距离。',
      days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], noon: '12:00', midnight: '24:00',
      no_map: '没有地图位置', m: '{m} 米', theme: '浅色或深色', not_found: '指南里没有这个地方。',
      tab_map: '地图', tab_guide: '指南全文', jump: '跳到某一类', map_page: '地图和公交站',
      no_stops: '1.5 公里内没有 Madison Metro 公交站。',
      tab_faq: '问答', related_q: '和这里有关的常见问题', faq_places: '去这些地方', faq_hit: '相关常见问题',
      ask_title: '问一个问题', ask_ph: '比如：没有 SSN 能开银行账户吗？', ask_btn: '提问', faq_list: '常见问题',
      ask_note: 'AI 只根据本站核过的资料回答，可能出错，以链接的官网为准。提问会被记录，用来补充本站内容。',
      ask_related: '本站相关内容', ask_wait: '正在整理回答……', ask_ai: 'AI 回答',
      ask_none: '本站暂时没有相关资料。换个说法试试，或看下面的常见问题。',
      ask_quota: '今天的提问次数用完了。上面的相关内容仍然可以看。',
      ask_fail: 'AI 暂时用不了，先看上面的相关内容。',
      ask_verify: '浏览器自动验证没通过，这里暂时用不了 AI 回答。刷新页面，或在拦截插件里放行本站再试。上面的相关内容照样能看。',
      ask_busy: '全站今天的 AI 回答次数已到上限，明天恢复。上面的相关内容照样能看。',
      ask_off: '这个版本的网站没有接 AI 回答，先看上面的相关内容。',
      ask_numcheck: '回答里有数字在本站资料中找不到，用之前请先看官网。',
      ask_list: '问 AI：「{q}」',
      ask_left: '这台设备今天还能问 {n} 次（每天 {max} 次）。',
      ask_low: '注意：这台设备今天只剩 {n} 次提问了。',
      ask_out: '这台设备今天的 {max} 次提问已经用完，麦迪逊时间零点后恢复。上面的相关内容照样能看。'
    }
  };
  function t(k, v) {
    var s = (T[lang] && k in T[lang]) ? T[lang][k] : (T.en[k] != null ? T.en[k] : k);
    if (v) Object.keys(v).forEach(function (x) { s = s.split('{' + x + '}').join(String(v[x])); });
    return s;
  }
  function lo(o) { return o ? (o[lang] || o.en || '') : ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  var GLYPH = {
    cart: '<path d="M3 4h2.2l2.3 10.4a1.2 1.2 0 0 0 1.2.9h8.6a1.2 1.2 0 0 0 1.2-.9L20.4 8H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
    columns: '<path d="M3 9.5 12 4l9 5.5"/><path d="M5.5 10v7.5M10 10v7.5M14 10v7.5M18.5 10v7.5M3.5 20.5h17"/>',
    cross: '<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" fill="currentColor" stroke="none"/>',
    dumbbell: '<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
    book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>',
    bag: '<path d="M5.5 8h13l-1 12.5h-11z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    bus: '<rect x="5" y="3.5" width="14" height="13.5" rx="2.5"/><path d="M5 10.5h14M8 17v3M16 17v3"/>',
    dollar: '<path d="M12 3v18"/><path d="M16.5 7.2c-.6-1.5-2.3-2.4-4.5-2.4-2.6 0-4.4 1.3-4.4 3.2 0 4.3 9 2.6 9 7 0 1.9-1.9 3.3-4.6 3.3-2.3 0-4.1-1-4.7-2.6"/>',
    shield: '<path d="M12 3.2 19 6v5.2c0 4.6-3 8.1-7 9.6-4-1.5-7-5-7-9.6V6z"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>'
  };
  function pin(cat, cls) {
    var c = CAT[cat] || D.cats[0];
    return '<span class="pin ' + (cls || '') + '" style="--c:' + c.c + ';--cd:' + c.cd + ';--gc:' + c.gc + ';--gcd:' + c.gcd + '" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + (GLYPH[c.g] || '') + '</svg></span>';
  }
  function catName(k, l) { var c = CAT[k]; return c ? c[l || lang] : k; }

  // Distance origins
  var ORIGINS = [
    { k: 'campus', en: 'Library Mall', zh: 'Library Mall（校园东）', lat: C.CAMPUS.lat, lng: C.CAMPUS.lng },
    { k: 'union', en: 'Union South', zh: 'Union South（校园中）', lat: 43.07183, lng: -89.40811 },
    { k: 'square', en: 'Capitol Square', zh: '州议会广场（市中心）', lat: 43.0747, lng: -89.38418 }
  ];
  if (LOCAL.home && LOCAL.home.lat) ORIGINS.push({ k: 'home', en: LOCAL.home.en || 'Home', zh: LOCAL.home.zh || '家', lat: LOCAL.home.lat, lng: LOCAL.home.lng });
  ORIGINS.push({ k: 'me', en: 'My location', zh: '我的位置' });
  function origin() {
    var o = ORIGINS.filter(function (x) { return x.k === state.from; })[0] || ORIGINS[0];
    if (o.k === 'me') return state.me ? { k: 'me', en: o.en, zh: o.zh, lat: state.me.lat, lng: state.me.lng } : ORIGINS[0];
    return o;
  }

  var state = {
    cat: CAT[LS.get('cat', 'all')] ? LS.get('cat', 'all') : 'all', q: '', open: false,
    sort: LS.get('sort', 'cat') === 'dist' ? 'dist' : 'cat',
    from: LS.get('from', 'campus'), me: null, sel: null, mapMode: false, listScroll: 0
  };
  if (!ORIGINS.some(function (o) { return o.k === state.from; }) || state.from === 'me') state.from = 'campus';

  function dist(p) {
    if (p.lat == null) return null;
    var o = origin();
    return C.miles({ lat: o.lat, lng: o.lng }, p);
  }
  function fmtMi(mi) { return mi < 0.1 ? '0.1' : mi < 10 ? mi.toFixed(1) : String(Math.round(mi)); }
  function distShort(mi) {
    if (mi == null) return '';
    var m = C.walkMinutes(mi);
    return m <= 30 ? t('mi', { mi: fmtMi(mi) }) + ' · ' + t('walk_short', { m: m }) : t('mi', { mi: fmtMi(mi) });
  }

  // Time formatting
  function fmtT(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    if (lang === 'zh') return h + ':' + (m < 10 ? '0' : '') + m;
    if (min === 0) return t('midnight');
    if (min === 720) return t('noon');
    return (h % 12 || 12) + (m ? ':' + (m < 10 ? '0' : '') + m : '') + (h < 12 ? ' AM' : ' PM');
  }
  function fmtSpan(s) {
    if (s[0] === 0 && s[1] >= 1440) return lang === 'zh' ? '全天' : 'all day';
    var end = s[1] === 1440 ? (lang === 'zh' ? '24:00' : t('midnight')) : fmtT(s[1]);
    return fmtT(s[0]) + '–' + end;
  }
  function statusText(st) {
    if (!st) return '';
    if (st.always) return '<span class="st on">' + esc(t('open24')) + '</span>';
    if (st.open) return '<span class="st on">' + esc(t('open')) + '</span> · ' + esc(t('closes', { t: st.until >= 1440 && st.until % 1440 === 0 ? (lang === 'zh' ? '24:00' : t('midnight')) : fmtT(st.until) }));
    if (!st.next) return '<span class="st off">' + esc(t('closed')) + '</span>';
    var n = st.next, when = n.k === 0 ? t('opens', { t: fmtT(n.min) }) : n.k === 1 ? t('opens_tmr', { t: fmtT(n.min) }) : t('opens_day', { d: t('days')[C.DAYS.indexOf(n.day)], t: fmtT(n.min) });
    return '<span class="st off">' + esc(t('closed')) + '</span> · ' + esc(when);
  }

  // Filtering
  // Search: wording-aware relevance over every entry's text (ask.js), plus a bonus when the name itself matches
  var AIX = null, qHits = [];
  function searchScores(q) {
    if (!AIX) AIX = EssAsk.build(D);
    var ps = {};
    qHits = [];
    EssAsk.retrieve(AIX, q, 80, 0.12).forEach(function (r) { if (r.type === 'p') ps[r.id] = r.score; else qHits.push(r); });
    return ps;
  }
  function visible() {
    var now = C.madisonNow(), out = [];
    var ps = state.q.trim() ? searchScores(state.q) : null;
    if (!ps) qHits = [];
    D.places.forEach(function (p) {
      if (state.cat !== 'all' && p.cat !== state.cat) return;
      var sc = 1;
      if (ps) {
        var ms = C.matchScore(p, state.q, '');  // no category labels: "寄件" in a category name matched every bank
        sc = (ps[p.id] || 0) + (ms ? 4 + 2 * ms : 0);
      }
      if (!sc) return;
      var st = C.status(p.h, now);
      if (state.open && !(st && st.open)) return;
      out.push({ p: p, sc: sc, st: st, mi: dist(p) });
    });
    var byDist = function (a, b) { return (a.mi == null ? 1e9 : a.mi) - (b.mi == null ? 1e9 : b.mi); };
    if (state.q.trim()) out.sort(function (a, b) { return b.sc - a.sc || byDist(a, b); });
    else if (state.sort === 'dist') out.sort(byDist);
    else out.sort(function (a, b) { return CAT[a.p.cat].i - CAT[b.p.cat].i || byDist(a, b); });
    return out;
  }

  // Rail
  function renderCats() {
    var html = '<button class="cat' + (state.cat === 'all' ? ' on' : '') + '" data-cat="all" aria-pressed="' + (state.cat === 'all') + '">' + esc(t('all')) + '</button>';
    D.cats.forEach(function (c) {
      html += '<button class="cat' + (state.cat === c.k ? ' on' : '') + '" data-cat="' + c.k + '" aria-pressed="' + (state.cat === c.k) + '">' + pin(c.k, 'xs') + '<span>' + esc(c[lang]) + '</span></button>';
    });
    var box = $('cats'), left = box.scrollLeft;
    box.innerHTML = html;
    box.scrollLeft = left; // phones scroll the chip row sideways; keep the place
    var on = box.querySelector('.cat.on');
    if (on && box.scrollWidth > box.clientWidth && (on.offsetLeft < box.scrollLeft || on.offsetLeft + on.offsetWidth > box.scrollLeft + box.clientWidth)) {
      box.scrollLeft = on.offsetLeft - 16;
    }
  }
  function renderFilters() {
    $('q').placeholder = t('search_ph');
    $('f-open').textContent = t('open_now');
    $('f-open').setAttribute('aria-pressed', String(state.open));
    $('l-sort').textContent = t('sort');
    $('l-from').textContent = t('from');
    $('f-sort').innerHTML = [['cat', t('sort_cat')], ['dist', t('sort_dist')]].map(function (o) {
      return '<option value="' + o[0] + '"' + (state.sort === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
    }).join('');
    $('f-from').innerHTML = ORIGINS.map(function (o) {
      return '<option value="' + o.k + '"' + (state.from === o.k ? ' selected' : '') + '>' + esc(o[lang]) + '</option>';
    }).join('');
  }
  function rowHtml(r) {
    var p = r.p, alt = lang === 'zh' && p.n.en !== p.n.zh ? '<span class="alt">' + esc(p.n.en) + '</span>' : '';
    var meta = [esc(lo(p.kind))];
    var d = distShort(r.mi);
    if (d) meta.push(esc(d));
    var st = statusText(r.st);
    if (st) meta.push(st);
    return '<li><a class="row" href="#p=' + encodeURIComponent(p.id) + '" data-id="' + esc(p.id) + '">' + pin(p.cat) +
      '<span class="rtext"><span class="rname">' + esc(lo(p.n)) + alt + '</span><span class="rmeta">' + meta.join(' · ') + '</span></span></a></li>';
  }
  var lastVisible = [];
  function renderList() {
    var rows = visible();
    lastVisible = rows;
    var grouped = !state.q.trim() && state.sort === 'cat' && state.cat === 'all';
    var html = '', prev = null;
    rows.forEach(function (r) {
      if (grouped && r.p.cat !== prev) {
        html += '<li class="ghead">' + pin(r.p.cat, 'xs') + '<span>' + esc(catName(r.p.cat)) + '</span></li>';
        prev = r.p.cat;
      }
      html += rowHtml(r);
    });
    // Related common questions go under the places
    var qs = qHits.slice(0, 3).map(function (r) { return FAQ.filter(function (q) { return q.id === r.id; })[0]; }).filter(Boolean);
    if (qs.length) {
      html += '<li class="fq-below">' + esc(t('faq_hit')) + '</li>' + qs.map(function (q) {
        var first = faqItems(q)[0] || '';
        return '<li class="fq-hit"><a href="#faq=' + encodeURIComponent(q.id) + '"><b>' + esc(lo(q.q)) + '</b><span>' +
          esc(first.length > 110 ? first.slice(0, 108) + '…' : first) + '</span></a></li>';
      }).join('');
    }
    var qq = state.q.trim();
    if (qq.length >= 4 && (/[?？吗呢么]|怎么|哪|如何|能不能|可以|how|where|what|can i|do i|is there/i.test(qq) || qq.split(/\s+/).length >= 4)) {
      html += '<li class="ask-row"><a href="#faq" data-ask="1">' + esc(t('ask_list', { q: qq.length > 40 ? qq.slice(0, 39) + '…' : qq })) + '</a></li>';
    }
    if (!rows.length && !qs.length && html.indexOf('ask-row') < 0) html = '<li class="empty"><p>' + esc(t('none')) + '</p><button type="button" class="chip" id="clear">' + esc(t('clear')) + '</button></li>';
    $('list').innerHTML = html;
    $('count').textContent = rows.length === 1 ? t('count1') : t('count', { n: rows.length });
    var clr = $('clear');
    if (clr) clr.onclick = function () { state.q = ''; $('q').value = ''; state.cat = 'all'; state.open = false; LS.set('cat', 'all'); renderAll(true); };
    syncMarkers(rows);
  }

  // Map
  var map = null, markers = {}, tileLayer = null;
  function tileUrl() { return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'; }
  function initMap() {
    if (!window.L || map) return;
    map = L.map('map', { zoomControl: true, attributionControl: false }).setView([C.CAMPUS.lat - 0.002, C.CAMPUS.lng - 0.004], 14);
    L.control.attribution({ position: 'bottomleft' }).addTo(map); // bottom right belongs to the feedback pill
    tileLayer = L.tileLayer(tileUrl(), { maxZoom: 19, maxNativeZoom: 19, attribution: 'Tiles &copy; Esri' }).addTo(map);
    D.places.forEach(function (p) {
      if (p.lat == null) return;
      var m = L.marker([p.lat, p.lng], {
        icon: L.divIcon({ className: 'pin-wrap', html: pin(p.cat), iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12] }),
        title: p.n.en, keyboard: true, riseOnHover: true
      });
      m.on('click', function () { select(p.id, true); });
      markers[p.id] = m;
    });
  }
  function syncMarkers(rows) {
    if (!map) return;
    var show = {};
    rows.forEach(function (r) { show[r.p.id] = 1; });
    Object.keys(markers).forEach(function (id) {
      var m = markers[id], on = !!show[id];
      if (on && !map.hasLayer(m)) m.addTo(map);
      if (!on && map.hasLayer(m)) m.remove();
    });
  }
  function fitVisible() {
    if (!map) return;
    var pts = lastVisible.filter(function (r) { return r.p.lat != null; }).map(function (r) { return [r.p.lat, r.p.lng]; });
    if (state.cat === 'all' && !state.q.trim()) { map.setView([C.CAMPUS.lat - 0.002, C.CAMPUS.lng - 0.004], 14); return; }
    if (pts.length === 1) map.setView(pts[0], 16);
    else if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 16 });
  }
  function popupHtml(p) {
    var st = statusText(C.status(p.h, C.madisonNow()));
    return '<div class="pop"><b>' + esc(lo(p.n)) + '</b><div class="pop-k">' + esc(lo(p.kind)) + (st ? ' · ' + st : '') + '</div>' +
      '<p>' + esc(lo(p.sum)) + '</p><a class="pop-go" href="#p=' + encodeURIComponent(p.id) + '">' + esc(t('details')) + ' →</a></div>';
  }
  function select(id, fromMap) {
    state.sel = id;
    var p = BY[id];
    Object.keys(markers).forEach(function (k) {
      var el = markers[k].getElement();
      if (el) el.classList.toggle('sel', k === id);
    });
    if (map && markers[id]) {
      markers[id].bindPopup(popupHtml(p), { maxWidth: 280, autoPanPadding: [30, 30] }).openPopup();
      if (!fromMap) map.panTo([p.lat, p.lng]);
    }
    var row = document.querySelector('.row[data-id="' + id + '"]');
    document.querySelectorAll('.row.sel').forEach(function (r) { r.classList.remove('sel'); });
    if (row) {
      row.classList.add('sel');
      if (fromMap) row.scrollIntoView({ block: 'nearest' });
    }
  }

  // Place page
  var miniMap = null;
  var SECS = [['about', 'sec_about', false], ['offers', 'sec_offers', true], ['howto', 'sec_howto', true],
    ['cost', 'sec_cost', true], ['tips', 'sec_tips', true], ['intl', 'sec_intl', true]];
  function secHtml(p, key, title, list, hl) {
    var s = p.sec && p.sec[key];
    var items = s ? (s[lang] && s[lang].length ? s[lang] : s.en) : null;
    if (items && s.exp) { var today = C.madisonDate(); items = items.filter(function (x, i) { return !s.exp[i] || s.exp[i] >= today; }); }
    if (!items || !items.length) return '';
    var body = list ? '<ul>' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'
      : items.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('');
    hl = hl || 'h2';
    return '<section class="sec sec-' + key + '"><' + hl + '>' + esc(t(title)) + '</' + hl + '>' + body + '</section>';
  }
  function allSecs(p, hl) { return SECS.map(function (s) { return secHtml(p, s[0], s[1], s[2], hl); }).join(''); }
  function unv(p, f) { return (p.unv || []).indexOf(f) >= 0 ? ' <span class="unv">(' + esc(t('unconfirmed')) + ')</span>' : ''; }
  function hoursHtml(p) {
    var now = C.madisonNow(), html = '';
    var st = statusText(C.status(p.h, now));
    if (st) html += '<div class="now">' + st + '</div>';
    if (p.h && !C.alwaysOpen(p.h)) {
      html += '<table class="week"><tbody>' + C.DAYS.map(function (d, i) {
        var spans = p.h[d] || [];
        return '<tr' + (d === now.day ? ' class="today"' : '') + '><th scope="row">' + esc(t('days')[i]) + '</th><td>' +
          (spans.length ? spans.map(fmtSpan).map(esc).join(', ') : esc(t('closed'))) + '</td></tr>';
      }).join('') + '</tbody></table>';
    }
    if (lo(p.ht)) html += '<p class="ht">' + esc(lo(p.ht)) + unv(p, 'hours') + '</p>';
    return html;
  }
  function stopsHtml(p) {
    if (!p.stops || !p.stops.length) return '';
    return '<ul class="stops">' + p.stops.map(function (s) {
      var chips = s[2].split(' ').map(function (r) {
        var c = ROUTES[r] || ['#1F4E79', '#FFFFFF'];
        return '<span class="route" style="background:' + c[0] + ';color:' + c[1] + '">' + esc(r) + '</span>';
      }).join('');
      return '<li><span class="sname">' + esc(s[0]) + '</span> <span class="sdist">' + esc(t('m', { m: s[1] })) + '</span><span class="routes">' + chips + '</span></li>';
    }).join('') + '</ul>';
  }
  function host(u) { try { return new URL(u).host.replace(/^www\./, ''); } catch (e) { return u; } }
  function fmtDate(d) {
    if (!d) return '';
    var x = new Date(d + 'T12:00:00');
    if (isNaN(x)) return d;
    return lang === 'zh' ? (x.getFullYear() + ' 年 ' + (x.getMonth() + 1) + ' 月 ' + x.getDate() + ' 日')
      : x.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  function nearbySame(p) {
    if (p.lat == null) return [];
    return D.places.filter(function (q) { return q.cat === p.cat && q.id !== p.id && q.lat != null; })
      .map(function (q) { return { q: q, mi: C.miles(p, q) }; })
      .sort(function (a, b) { return a.mi - b.mi; }).slice(0, 3);
  }
  function renderPage(id) {
    var p = BY[id];
    if (!p) { $('page').innerHTML = '<div class="pg-top"><a class="back" href="#">← ' + esc(t('back')) + '</a></div><p class="pg-missing">' + esc(t('not_found')) + '</p>'; return; }
    var o = origin(), mi = dist(p);
    var alt = lang === 'zh' ? p.n.en : '';
    var facts = '';
    facts += '<div class="fact"><div class="fk">' + esc(t('hours')) + '</div><div class="fv">' + hoursHtml(p) + '</div></div>';
    var dir = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(p.n.en + ', ' + p.addr);
    facts += '<div class="fact"><div class="fk">' + esc(t('address')) + '</div><div class="fv">' + esc(p.addr) + unv(p, 'address') +
      ' <a class="dir" href="' + dir + '" target="_blank" rel="noopener">' + esc(t('directions')) + ' ↗</a></div></div>';
    if (p.phone) facts += '<div class="fact"><div class="fk">' + esc(t('phone')) + '</div><div class="fv"><a href="tel:+1' + p.phone.replace(/\D/g, '') + '">' + esc(p.phone) + '</a>' + unv(p, 'phone') + '</div></div>';
    if (p.web) facts += '<div class="fact"><div class="fk">' + esc(t('website')) + '</div><div class="fv"><a href="' + esc(p.web) + '" target="_blank" rel="noopener">' + esc(host(p.web)) + ' ↗</a></div></div>';
    if (mi != null) {
      var wm = C.walkMinutes(mi);
      facts += '<div class="fact"><div class="fk">' + esc(t('distance')) + '</div><div class="fv">' + esc(t('dist_line', { mi: fmtMi(mi), o: o[lang] })) +
        (wm <= 45 ? ' · ' + esc(t('walk', { m: wm })) : '') + '</div></div>';
    }
    var st = stopsHtml(p) || (p.lat != null ? esc(t('no_stops')) : '');
    if (st) facts += '<div class="fact"><div class="fk">' + esc(t('bus')) + '</div><div class="fv">' + st + '</div></div>';

    var near = nearbySame(p).map(function (x) {
      return '<li><a href="#p=' + encodeURIComponent(x.q.id) + '">' + pin(x.q.cat, 'xs') + '<span>' + esc(lo(x.q.n)) + '</span><small>' + esc(t('mi', { mi: fmtMi(x.mi) })) + '</small></a></li>';
    }).join('');
    var srcs = (p.src || []).map(function (s) {
      return '<li><a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a> <span class="host">' + esc(host(s[1])) + '</span></li>';
    }).join('');

    $('page').innerHTML =
      '<div class="pg-top"><a class="back" href="#" id="back">← ' + esc(t('back')) + '</a></div>' +
      '<header class="pg-head"><a class="pg-cat" href="#" data-gocat="' + p.cat + '">' + pin(p.cat, 'sm') + '<span>' + esc(catName(p.cat)) + '</span></a>' +
      '<h1>' + esc(lo(p.n)) + '</h1>' + (alt && alt !== lo(p.n) ? '<div class="pg-alt">' + esc(alt) + '</div>' : '') +
      '<div class="pg-kind">' + esc(lo(p.kind)) + '</div><p class="pg-sum">' + esc(lo(p.sum)) + '</p></header>' +
      '<div class="pg-grid"><aside class="pg-side"><div class="facts">' + facts + '</div>' +
      (p.lat != null ? '<div class="minimap" id="minimap" aria-label="Map"></div>' : '') + '</aside>' +
      '<div class="pg-body">' + allSecs(p, 'h2') +
      relQ(p) +
      (near ? '<section class="sec near"><h2>' + esc(t('near_same')) + '</h2><ul class="nearl">' + near + '</ul></section>' : '') +
      '<section class="sec srcs"><h2>' + esc(t('sources')) + '</h2><ol>' + srcs + '</ol><p class="chk">' + esc(t('checked', { d: fmtDate(p.chk) })) + '</p></section>' +
      '</div></div>';
    document.title = lo(p.n) + ' · Madison Essentials';
    $('back').onclick = function (e) { e.preventDefault(); goBack(); };
    var gc = document.querySelector('[data-gocat]');
    if (gc) gc.onclick = function (e) { e.preventDefault(); state.cat = p.cat; LS.set('cat', p.cat); state.q = ''; $('q').value = ''; goBack(true); };
    if (miniMap) { miniMap.remove(); miniMap = null; }
    if (p.lat != null && window.L) {
      miniMap = L.map('minimap', { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([p.lat, p.lng], 16);
      L.tileLayer(tileUrl(), { maxZoom: 19, attribution: 'Tiles &copy; Esri' }).addTo(miniMap);
      L.marker([p.lat, p.lng], { icon: L.divIcon({ className: 'pin-wrap', html: pin(p.cat, 'sel'), iconSize: [24, 24], iconAnchor: [12, 12] }), keyboard: false }).addTo(miniMap);
    }
  }

  // Full guide: every place in one long page
  var guideLang = null;
  function renderGuide() {
    if (guideLang === lang) return;
    guideLang = lang;
    var toc = '', body = '', jump = '<option value="">' + esc(t('jump')) + '</option>';
    D.cats.forEach(function (c) {
      var ps = D.places.filter(function (p) { return p.cat === c.k; });
      if (!ps.length) return;
      toc += '<div class="toc-cat"><a href="#guide" data-go="g-cat-' + c.k + '">' + pin(c.k, 'xs') + '<b>' + esc(c[lang]) + '</b></a><ul>' +
        ps.map(function (p) { return '<li><a href="#guide" data-go="g-' + esc(p.id) + '">' + esc(lo(p.n)) + '</a></li>'; }).join('') + '</ul></div>';
      jump += '<option value="g-cat-' + c.k + '">' + esc(c[lang]) + '</option>';
      body += '<section class="g-cat" id="g-cat-' + c.k + '"><h2 class="g-cat-h">' + pin(c.k, 'sm') + '<span>' + esc(c[lang]) + '</span></h2>' +
        ps.map(function (p) {
          var alt = lang === 'zh' ? p.n.en : '';
          var facts = '<dt>' + esc(t('address')) + '</dt><dd>' + esc(p.addr) + unv(p, 'address') + '</dd>';
          if (lo(p.ht)) facts += '<dt>' + esc(t('hours')) + '</dt><dd>' + esc(lo(p.ht)) + unv(p, 'hours') + '</dd>';
          if (p.phone) facts += '<dt>' + esc(t('phone')) + '</dt><dd><a href="tel:+1' + p.phone.replace(/\D/g, '') + '">' + esc(p.phone) + '</a></dd>';
          if (p.web) facts += '<dt>' + esc(t('website')) + '</dt><dd><a href="' + esc(p.web) + '" target="_blank" rel="noopener">' + esc(host(p.web)) + ' ↗</a></dd>';
          return '<article class="g-place" id="g-' + esc(p.id) + '"><h3>' + esc(lo(p.n)) + (alt && alt !== lo(p.n) ? ' <span class="g-alt">' + esc(alt) + '</span>' : '') + '</h3>' +
            '<div class="g-kind">' + esc(lo(p.kind)) + ' · <a href="#p=' + encodeURIComponent(p.id) + '">' + esc(t('map_page')) + ' →</a></div>' +
            '<p class="g-sum">' + esc(lo(p.sum)) + '</p><dl class="g-facts">' + facts + '</dl>' + allSecs(p, 'h4') + '</article>';
        }).join('') + '</section>';
    });
    $('toc').innerHTML = toc;
    $('guide').innerHTML = '<select class="g-jump" id="g-jump" aria-label="' + esc(t('jump')) + '">' + jump + '</select>' + body +
      '<p class="g-foot">' + esc(t('foot', { d: fmtDate(D.checked) })) + '</p>';
    $('g-jump').onchange = function () { var el = $(this.value); if (el) el.scrollIntoView(); };
  }
  $('toc').addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]');
    if (!a) return;
    e.preventDefault();
    var el = $(a.getAttribute('data-go'));
    if (el) el.scrollIntoView();
  });
  // Common questions
  var FAQ = D.faq || [];
  function faqItems(q) {
    var items = q.a[lang] && q.a[lang].length ? q.a[lang] : q.a.en;
    if (q.a.exp) { var today = C.madisonDate(); items = items.filter(function (x, i) { return !q.a.exp[i] || q.a.exp[i] >= today; }); }
    return items;
  }
  function relQ(p) {
    var qs = FAQ.filter(function (q) { return q.places.indexOf(p.id) >= 0; });
    if (!qs.length) return '';
    return '<section class="sec relq"><h2>' + esc(t('related_q')) + '</h2><ul>' + qs.map(function (q) {
      return '<li><a href="#faq=' + encodeURIComponent(q.id) + '">' + esc(lo(q.q)) + '</a></li>';
    }).join('') + '</ul></section>';
  }
  var faqLang = null;
  function renderFaq() {
    if (faqLang === lang) return;
    faqLang = lang;
    var html = '<section class="ask"><h1 class="fq-h1">' + esc(t('ask_title')) + '</h1>' +
      '<form class="ask-form" id="ask-form"><input id="ask-q" type="text" maxlength="300" autocomplete="off" aria-label="' + esc(t('ask_title')) + '" placeholder="' + esc(t('ask_ph')) + '">' +
      '<button type="submit">' + esc(t('ask_btn')) + '</button></form><p class="ask-note">' + esc(t('ask_note')) + '</p><p class="ask-left" id="ask-left"></p><div id="ask-out" aria-live="polite"></div></section>' +
      '<h2 class="fq-h2">' + esc(t('faq_list')) + '</h2>';
    D.cats.forEach(function (c) {
      var qs = FAQ.filter(function (q) { return q.topic === c.k; });
      if (!qs.length) return;
      html += '<section class="fq-cat"><h2>' + pin(c.k, 'sm') + '<span>' + esc(c[lang]) + '</span></h2>' + qs.map(function (q) {
        var pls = q.places.map(function (id) {
          var x = BY[id];
          return x ? '<a class="fq-pl" href="#p=' + encodeURIComponent(id) + '">' + pin(x.cat, 'xs') + '<span>' + esc(lo(x.n)) + '</span></a>' : '';
        }).join('');
        return '<details class="fq" id="q-' + esc(q.id) + '"><summary>' + esc(lo(q.q)) + '</summary><div class="fq-a">' +
          faqItems(q).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') +
          (pls ? '<div class="fq-pls"><span class="fq-k">' + esc(t('faq_places')) + '</span>' + pls + '</div>' : '') +
          '<details class="fq-src"><summary>' + esc(t('sources')) + ' (' + q.src.length + ')</summary><ol>' + q.src.map(function (s) {
            return '<li><a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a> <span class="host">' + esc(host(s[1])) + '</span></li>';
          }).join('') + '</ol></details></div></details>';
      }).join('') + '</section>';
    });
    $('faqpage').innerHTML = html;
    $('ask-form').onsubmit = function (e) { e.preventDefault(); ask($('ask-q').value); };
    showLeft(askLeft);
    refreshLeft();
  }

  // Ask a question: related entries at once (local), then an AI answer built from them (Worker)
  var CFG = window.ESS_CONFIG || {};
  var G = CFG.api && window.WebgrsGuard ? WebgrsGuard.create({ api: CFG.api, sitekey: CFG.sitekey, site: 'guide' }) : null;
  var askSeq = 0, askLeft = null, askMax = 10;
  // A random id kept on this device; the API limits questions per device per day
  function deviceId() {
    var id = LS.get('dev', '');
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(id)) {
      var b = new Uint8Array(16);
      (window.crypto || window.msCrypto).getRandomValues(b);
      id = btoa(String.fromCharCode.apply(null, b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      LS.set('dev', id);
    }
    return id;
  }
  function showLeft(n) {
    var el = $('ask-left');
    if (!el) return;
    askLeft = n;
    var form = $('ask-form'), out = n === 0;
    if (form) { $('ask-q').disabled = out; form.querySelector('button').disabled = out; }
    el.className = 'ask-left' + (n != null && n <= 3 ? ' low' : '');
    el.setAttribute('role', n != null && n <= 3 ? 'alert' : 'status');
    el.textContent = n == null ? '' : out ? t('ask_out', { max: askMax }) : n <= 3 ? t('ask_low', { n: n }) : t('ask_left', { n: n, max: askMax });
  }
  function refreshLeft() {
    if (!CFG.api) return;
    fetch(CFG.api.replace(/\/$/, '') + '/api/quota', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dev: deviceId() }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.limit) askMax = j.limit; if (j && j.remaining != null) showLeft(j.remaining); })
      .catch(function () { /* the counter is a convenience */ });
  }
  function refLink(type, id) {
    if (type === 'q') {
      var q = FAQ.filter(function (x) { return x.id === id; })[0];
      return q ? '<a class="fq-pl" href="#faq=' + encodeURIComponent(id) + '"><span>' + esc(lo(q.q)) + '</span></a>' : '';
    }
    var p = BY[id];
    return p ? '<a class="fq-pl" href="#p=' + encodeURIComponent(id) + '">' + pin(p.cat, 'xs') + '<span>' + esc(lo(p.n)) + '</span></a>' : '';
  }
  function answerHtml(text) {
    var tagged = function (s) {
      return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
        .replace(/https:\/\/webgrs\.github\.io\/[a-z0-9\/-]+/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u.replace('https://', '') + '</a>'; })
        .replace(/\[(p|q):([a-z0-9-]+)\]/g, function (m, ty, id) {
        var l = refLink(ty, id);
        return l ? '<span class="cite">' + l + '</span>' : '';
      });
    };
    var out = '', list = [];
    var flush = function () { if (list.length) { out += '<ul>' + list.map(function (x) { return '<li>' + tagged(x) + '</li>'; }).join('') + '</ul>'; list = []; } };
    String(text).split(/\n+/).forEach(function (line) {
      line = line.trim();
      if (!line) return;
      var m = /^(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
      if (m) list.push(m[1]); else { flush(); out += '<p>' + tagged(line.replace(/^#+\s*/, '')) + '</p>'; }
    });
    flush();
    return out;
  }
  function ask(qtext) {
    var q = String(qtext || '').trim(), box = $('ask-out');
    if (q.length < 2 || !box) return;
    var seq = ++askSeq;
    if (!AIX) AIX = EssAsk.build(D);
    var refs = EssAsk.retrieve(AIX, q, 6);
    var rel = refs.map(function (r) { return refLink(r.type, r.id); }).join('');
    box.innerHTML = (rel ? '<div class="ask-rel"><span class="fq-k">' + esc(t('ask_related')) + '</span>' + rel + '</div>' : '') +
      '<div class="ask-ans" id="ask-ans"></div>';
    var ans = $('ask-ans');
    if (!refs.length) { ans.innerHTML = '<p class="ask-msg">' + esc(t('ask_none')) + '</p>'; return; }
    if (!G) { ans.innerHTML = '<p class="ask-msg">' + esc(t('ask_off')) + '</p>'; return; }
    if (askLeft === 0) { ans.innerHTML = '<p class="ask-msg">' + esc(t('ask_out', { max: askMax })) + '</p>'; return; }
    ans.innerHTML = '<p class="ask-msg wait"><span class="spin" aria-hidden="true"></span>' + esc(t('ask_wait')) + '</p>';
    var send = function () { return G.call('/api/ask', { method: 'POST', body: { q: q, lang: lang, dev: deviceId() } }); };
    send().catch(function (e) {
      // Only sessions that passed the human check may ask: run it once more, then retry
      if (e && e.data && e.data.error === 'verify' && G.reverify) return G.reverify().then(send);
      throw e;
    }).then(function (r) {
      if (seq !== askSeq) return;
      if (r.status === 'queued') return;  // leave the spinner as it is
      if (r.limit) askMax = r.limit;
      if (r.remaining != null) showLeft(r.remaining);
      if (!r.answer) { ans.innerHTML = '<p class="ask-msg">' + esc(t('ask_none')) + '</p>'; return; }
      ans.innerHTML = '<div class="ask-k">' + esc(t('ask_ai')) + '</div>' + answerHtml(r.answer) +
        (r.unsupported && r.unsupported.length ? '<p class="ask-warn">' + esc(t('ask_numcheck')) + '</p>' : '');
    }).catch(function (e) {
      if (seq !== askSeq) return;
      if (e && e.data && e.data.error === 'device_limit') {
        if (e.data.limit) askMax = e.data.limit;
        showLeft(0);
        ans.innerHTML = '<p class="ask-msg">' + esc(t('ask_out', { max: askMax })) + '</p>';
        return;
      }
      var code = e && e.data && e.data.error;
      ans.innerHTML = '<p class="ask-msg">' + esc(t(code === 'verify' ? 'ask_verify' : code === 'busy' ? 'ask_busy' : e && e.status === 429 ? 'ask_quota' : 'ask_fail')) + '</p>';
    });
  }
  function showFaq(id) {
    if (!$('view-list').hidden) state.listScroll = $('scroller').scrollTop;
    $('view-list').hidden = true;
    $('view-page').hidden = true;
    $('view-guide').hidden = true;
    $('view-faq').hidden = false;
    renderFaq();
    document.title = t('tab_faq') + ' · Madison Essentials';
    setTab('faq');
    var d = id && $('q-' + id);
    if (d) { d.open = true; d.scrollIntoView(); } else $('view-faq').scrollTop = 0;
    if (state.askQ) { $('ask-q').value = state.askQ; ask(state.askQ); state.askQ = ''; }
  }
  function showGuide() {
    $('view-faq').hidden = true;
    if (!$('view-list').hidden) state.listScroll = $('scroller').scrollTop;
    $('view-list').hidden = true;
    $('view-page').hidden = true;
    $('view-guide').hidden = false;
    renderGuide();
    document.title = t('tab_guide') + ' · Madison Essentials';
    setTab('guide');
  }
  function setTab(k) {
    $('tab-map').classList.toggle('active', k === 'map');
    $('tab-guide').classList.toggle('active', k === 'guide');
    $('tab-faq').classList.toggle('active', k === 'faq');
    $('tab-faq').setAttribute('aria-current', k === 'faq' ? 'page' : 'false');
    $('tab-map').setAttribute('aria-current', k === 'map' ? 'page' : 'false');
    $('tab-guide').setAttribute('aria-current', k === 'guide' ? 'page' : 'false');
  }

  // Views and routing
  var pageFromList = false;
  function showPage(id) {
    if (!$('view-list').hidden) state.listScroll = $('scroller').scrollTop;
    $('view-list').hidden = true;
    $('view-guide').hidden = true;
    $('view-faq').hidden = true;
    $('view-page').hidden = false;
    renderPage(id);
    $('view-page').scrollTop = 0;
    window.scrollTo(0, 0);
    setTab('');
  }
  function showList() {
    $('view-page').hidden = true;
    $('view-guide').hidden = true;
    $('view-faq').hidden = true;
    $('view-list').hidden = false;
    setTab('map');
    document.title = 'Madison Essentials';
    if (miniMap) { miniMap.remove(); miniMap = null; }
    if (map) setTimeout(function () { map.invalidateSize(); }, 0);
    $('scroller').scrollTop = state.listScroll || 0;
  }
  function goBack(refit) {
    if (pageFromList && !refit) { history.back(); return; }
    location.hash = '';
    if (refit) { renderAll(true); }
  }
  function route() {
    var m = /^#p=(.+)$/.exec(location.hash);
    if (m) { showPage(decodeURIComponent(m[1])); return; }
    if (location.hash === '#guide') { showGuide(); pageFromList = false; return; }
    var fq = /^#faq(?:=(.+))?$/.exec(location.hash);
    if (fq) { showFaq(fq[1] ? decodeURIComponent(fq[1]) : ''); pageFromList = false; return; }
    showList();
    pageFromList = false;
  }
  window.addEventListener('hashchange', route);

  function renderAll(refit) {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    $('lang').textContent = lang === 'zh' ? 'EN' : '中文';
    $('theme').setAttribute('aria-label', t('theme'));
    renderCats();
    renderFilters();
    renderList();
    $('switcher').textContent = state.mapMode ? t('list') : t('map');
    $('foot').textContent = t('foot', { d: fmtDate(D.checked) });
    $('tab-map').textContent = t('tab_map');
    $('tab-guide').textContent = t('tab_guide');
    $('tab-faq').textContent = t('tab_faq');
    if (refit) fitVisible();
    if (!$('view-page').hidden) { var m = /^#p=(.+)$/.exec(location.hash); if (m) renderPage(decodeURIComponent(m[1])); }
    if (!$('view-guide').hidden) renderGuide();
    if (!$('view-faq').hidden) renderFaq();
  }

  // Events
  $('cats').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]');
    if (!b) return;
    state.cat = b.getAttribute('data-cat');
    LS.set('cat', state.cat);
    renderCats();
    renderList();
    fitVisible();
  });
  var qTimer = null;
  $('q').addEventListener('input', function () {
    clearTimeout(qTimer);
    qTimer = setTimeout(function () { state.q = $('q').value; renderList(); if (state.q.trim()) fitVisible(); }, 120);
  });
  $('f-open').onclick = function () { state.open = !state.open; renderFilters(); renderList(); };
  $('f-sort').onchange = function () { state.sort = this.value; LS.set('sort', state.sort); renderList(); };
  $('f-from').onchange = function () {
    var v = this.value;
    if (v === 'me') {
      $('count').textContent = t('me_wait');
      if (!navigator.geolocation) { state.from = 'campus'; renderFilters(); renderList(); $('count').textContent = t('me_fail'); return; }
      navigator.geolocation.getCurrentPosition(function (pos) {
        state.me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        state.from = 'me';
        renderFilters();
        renderList();
      }, function () {
        state.from = 'campus';
        renderFilters();
        renderList();
        $('count').textContent = t('me_fail');
      }, { timeout: 10000, maximumAge: 300000 });
      return;
    }
    state.from = v;
    LS.set('from', v);
    renderList();
  };
  $('list').addEventListener('click', function (e) {
    if (e.target.closest('[data-ask]')) state.askQ = state.q.trim();
    var a = e.target.closest('.row');
    if (a) pageFromList = true;
  });
  $('list').addEventListener('mouseover', function (e) {
    var a = e.target.closest('.row');
    if (!a || !map) return;
    var id = a.getAttribute('data-id');
    Object.keys(markers).forEach(function (k) { var el = markers[k].getElement(); if (el) el.classList.toggle('hot', k === id); });
  });
  $('list').addEventListener('mouseleave', function () {
    Object.keys(markers).forEach(function (k) { var el = markers[k].getElement(); if (el) el.classList.remove('hot'); });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.pop-go');
    if (a) pageFromList = true;
  });
  $('switcher').onclick = function () {
    state.mapMode = !state.mapMode;
    document.body.classList.toggle('map-mode', state.mapMode);
    $('switcher').textContent = state.mapMode ? t('list') : t('map');
    if (map) setTimeout(function () { map.invalidateSize(); fitVisible(); }, 0);
  };
  $('lang').onclick = function () { lang = lang === 'zh' ? 'en' : 'zh'; LS.set('lang', lang); renderAll(false); if (state.sel) select(state.sel, true); };
  $('theme').onclick = function () {
    var cur = document.documentElement.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    LS.set('theme', next);
  };
  $('tab-map').onclick = function (e) { e.preventDefault(); if (location.hash) location.hash = ''; };

  // Owner debug table (?debug)
  function renderDebug() {
    var rows = D.places.map(function (p) {
      var st = C.status(p.h, C.madisonNow());
      return '<tr><td>' + esc(p.id) + '</td><td>' + esc(p.cat) + '</td><td>' + (p.lat == null ? '<b>none</b>' : 'ok') + '</td><td>' + (p.stops || []).length +
        '</td><td>' + esc((p.unv || []).join('; ')) + '</td><td>' + esc(p.chk) + '</td><td>' + (st ? (st.open ? 'open' : 'closed') : '-') + '</td></tr>';
    }).join('');
    $('debug').innerHTML = '<button type="button" id="dbg-x">×</button><table><thead><tr><th>id</th><th>cat</th><th>coords</th><th>stops</th><th>unverified</th><th>checked</th><th>now</th></tr></thead><tbody>' + rows + '</tbody></table>';
    $('debug').hidden = false;
    $('dbg-x').onclick = function () { $('debug').hidden = true; };
  }

  initMap();
  renderAll(false);
  route();
  if ($('debug') && /[?&]debug\b/.test(location.search)) renderDebug();
  window.ESSAPP = { state: state, select: select, visible: visible };
})();
