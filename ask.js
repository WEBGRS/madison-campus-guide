/* Question -> most relevant places and common questions. Shared by the page (instant results)
   and the API Worker (what the AI may read). Chinese is matched by character pairs, English by words. */
(function (root) {
  'use strict';
  var STOP = {};
  ('a an and are as at be but by can do does for from get go have how i if in is it its me my of on or our so ' +
   'that the their there this to was what when where which who why will with would you your near any some much many ' +
   'should could need want there\'s it\'s don\'t im uw madison campus student students').split(' ').forEach(function (w) { STOP[w] = 1; });

  function toks(s) {
    s = String(s || '').toLowerCase();
    var out = [];
    (s.match(/[a-z0-9][a-z0-9'&+-]*/g) || []).forEach(function (w) {
      w = w.replace(/^'+|'+$/g, '');
      if (w.length >= 2 && !STOP[w]) out.push(w.length > 4 && /s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w);
    });
    (s.match(/[㐀-鿿]+/g) || []).forEach(function (run) {
      if (run.length === 1) out.push(run);
      for (var i = 0; i + 1 < run.length; i++) out.push(run.slice(i, i + 2));
    });
    return out;
  }

  // Everyday wording -> the words the entries use (both languages), appended to the query
  var CONCEPTS = [
    [/寄|快递|包裹|邮局|邮寄|shipping|\bship\b|parcel|package|post office|\bmail|usps|fedex|\bups\b/i, 'shipping mail package post office 快递 邮局 寄件 包裹'],
    [/药|处方|pharmac|prescription|medicine/i, 'pharmacy prescription 药店 处方'],
    [/理发|剪头|剪发|发廊|haircut|barber|salon/i, 'haircut barber salon 理发'],
    [/电话卡|手机卡|手机号|号码|\bsim\b|esim|phone plan|cell ?phone/i, 'phone sim prepaid 电话卡 手机卡 手机号'],
    [/打印|复印|扫描|print/i, 'print printing 打印'],
    [/银行|开户|存钱|取钱|\bbank|checking|credit union|\batm\b/i, 'bank account checking 银行 开户'],
    [/看病|生病|医生|发烧|感冒|诊所|doctor|sick|clinic|urgent/i, 'clinic doctor urgent care 看病 医生'],
    [/急诊|emergency|救护/i, 'emergency hospital 急诊'],
    [/牙|dentist|dental/i, 'dental dentist 牙'],
    [/眼镜|验光|隐形|glasses|optometr|eye exam/i, 'eye glasses optometrist 眼镜 验光'],
    [/公交|巴士|\bbus\b|metro/i, 'bus metro 公交'],
    [/机场|飞机|airport|o'?hare|flight/i, 'airport 机场'],
    [/芝加哥|chicago|密尔沃基|milwaukee/i, 'chicago milwaukee coach 大巴'],
    [/健身|运动|gym|workout|fitness/i, 'gym fitness 健身'],
    [/游泳|swim|pool/i, 'pool swim 游泳'],
    [/家具|床垫|桌子|椅子|furniture|mattress|desk|couch/i, 'furniture 家具 thrift'],
    [/二手|thrift|secondhand|used furniture/i, 'thrift used 二手'],
    [/洗衣|干洗|laundr|dry clean/i, 'laundry laundromat dry cleaning 洗衣 干洗'],
    [/买菜|超市|菜市场|grocer|supermarket/i, 'grocery supermarket 超市 买菜'],
    [/中超|亚洲|中国|韩国|日本|asian|chinese|korean|japanese/i, 'asian 亚洲超市 中国'],
    [/自行车|单车|bike|bicycle|scooter/i, 'bike bicycle 自行车'],
    [/网络|宽带|上网|wifi|internet|spectrum/i, 'internet wifi 网络'],
    [/电费|开电|水电|电力|mge|electric/i, 'electric mge 电力'],
    [/停车|parking/i, 'parking garage 停车'],
    [/驾照|驾考|开车|license|dmv|state id/i, 'driver license dmv 驾照'],
    [/警察|报警|police|被偷|丢了|丢失|lost|stolen/i, 'police lost stolen 警察 失物'],
    [/诈骗|骗子|scam|fraud/i, 'scam fraud 诈骗'],
    [/学生证|wiscard/i, 'wiscard 学生证'],
    [/图书馆|自习|library|study/i, 'library study 图书馆 自习'],
    [/打工|兼职|找工作|校内工作|\bjob|employment/i, 'job employment 工作 打工'],
    [/报税|退税|\btax/i, 'tax 报税'],
    [/ssn|社安|安全号/i, 'ssn social security 社安号'],
    [/学费|tuition|bursar/i, 'tuition bursar 学费'],
    [/保险|\bSHIP\b|insurance/, 'insurance ship 保险'],
    [/心理|压力|焦虑|抑郁|mental|counsel|stress|anxiety/i, 'mental health counseling 心理'],
    [/没钱|吃不起|免费吃|食物|food pantry|hungry/i, 'food pantry 食物'],
    [/房东|押金|租房|lease|landlord|deposit|tenant/i, 'tenant landlord lease 房东 押金'],
    [/签证|i-?20|\bopt\b|\bcpt\b|visa/i, 'iss visa i-20 国际学生'],
    [/周末|好玩|景点|博物馆|动物园|museum|\bzoo\b|things to do/i, 'museum park free 博物馆 公园'],
    [/球赛|橄榄球|篮球赛|football|basketball|tickets?/i, 'football tickets 球赛'],
    [/电脑|笔记本|laptop|computer|macbook/i, 'laptop computer 电脑'],
  ];
  function expand(q) {
    var add = [];
    CONCEPTS.forEach(function (c) { if (c[0].test(q)) add.push(c[1]); });
    return add.length ? q + ' ' + add.join(' ') : q;
  }

  function both(o) { return o ? (o.en || '') + ' ' + (o.zh || '') : ''; }

  // Weighted token sets per document; a token's weight is the sum over the fields it appears in
  function fieldsOf(d, type) {
    if (type === 'q') return [[both(d.q), 3], [(d.kw || []).join(' '), 2], [both(d.a ? { en: (d.a.en || []).join(' '), zh: (d.a.zh || []).join(' ') } : null), 1.5]];
    var secs = '';
    Object.keys(d.sec || {}).forEach(function (k) { var s = d.sec[k]; secs += ' ' + (s.en || []).join(' ') + ' ' + (s.zh || []).join(' '); });
    return [[both(d.n), 3], [both(d.kind), 2], [(d.kw || []).join(' '), 2], [both(d.sum), 1.5], [secs, 1], [d.addr || '', 1], [both(d.ht), 0.5]];
  }

  function build(data) {
    var docs = [], df = {};
    function add(d, type) {
      var tf = {}, len = 0;
      fieldsOf(d, type).forEach(function (f) {
        var seen = {};
        toks(f[0]).forEach(function (t) { len++; if (!seen[t]) { seen[t] = 1; tf[t] = (tf[t] || 0) + f[1]; } });
      });
      Object.keys(tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
      docs.push({ type: type, id: d.id, d: d, tf: tf, norm: 1 + 0.12 * Math.log(1 + len) });
    }
    (data.places || []).forEach(function (p) { add(p, 'p'); });
    (data.faq || []).forEach(function (q) { add(q, 'q'); });
    return { docs: docs, df: df, n: docs.length };
  }

  // Top k {type, id, score}; weak tails (under `cut` of the best score, default 35%) are dropped
  function retrieve(ix, question, k, cut) {
    var qt = {}, out = [];
    toks(expand(question)).forEach(function (t) { if (ix.df[t]) qt[t] = Math.log(1 + ix.n / ix.df[t]); });
    var keys = Object.keys(qt);
    if (!keys.length) return [];
    ix.docs.forEach(function (doc) {
      var s = 0;
      for (var i = 0; i < keys.length; i++) { var w = doc.tf[keys[i]]; if (w) s += w * qt[keys[i]]; }
      if (s > 0) out.push({ type: doc.type, id: doc.id, score: (s / doc.norm) * (doc.type === 'q' ? 1.25 : 1) });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    var top = out.length ? out[0].score : 0;
    return out.filter(function (r) { return r.score >= top * (cut == null ? 0.35 : cut); }).slice(0, k || 6);
  }

  function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  // Compact English text of one document, tagged for citation, for the model to read
  function live(s, today) {
    if (!s) return [];
    var en = s.en || [];
    return s.exp && today ? en.filter(function (x, i) { return !s.exp[i] || s.exp[i] >= today; }) : en;
  }

  function context(ix, ref, max, today) {
    var doc = null;
    for (var i = 0; i < ix.docs.length; i++) if (ix.docs[i].type === ref.type && ix.docs[i].id === ref.id) { doc = ix.docs[i]; break; }
    if (!doc) return '';
    var d = doc.d, lines = [];
    if (doc.type === 'q') {
      lines.push('[q:' + d.id + '] Common question: ' + (d.q.en || ''));
      lines.push('Answer: ' + live(d.a, today).join(' '));
    } else {
      lines.push('[p:' + d.id + '] ' + d.n.en + (d.n.zh && d.n.zh !== d.n.en ? ' (' + d.n.zh + ')' : '') + ' — ' + (d.kind.en || ''));
      lines.push('Address: ' + d.addr + (d.phone ? '. Phone: ' + d.phone : ''));
      if (d.ht && d.ht.en) lines.push('Hours: ' + d.ht.en);
      lines.push('Summary: ' + (d.sum.en || ''));
      ['about', 'offers', 'howto', 'cost', 'tips', 'intl'].forEach(function (k) {
        var items = live(d.sec && d.sec[k], today);
        if (items.length) lines.push(k + ': ' + items.join(' | '));
      });
    }
    return clip(lines.join('\n'), max || 1600);
  }

  var api = { toks: toks, expand: expand, build: build, retrieve: retrieve, context: context };
  root.EssAsk = api;  // the page and the Worker read globalThis.EssAsk
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
