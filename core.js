/* Pure logic shared by the page and tests: Madison time, open status, distance, search. */
(function (root) {
  'use strict';
  var DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  var WD = { Mon: 'Mo', Tue: 'Tu', Wed: 'We', Thu: 'Th', Fri: 'Fr', Sat: 'Sa', Sun: 'Su' };
  var CAMPUS = { lat: 43.07529, lng: -89.39907 }; // Library Mall (OSM)

  // Weekday + minutes since midnight in Madison
  function madisonNow(date) {
    var f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
    var o = {};
    f.formatToParts(date || new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { day: WD[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }

  function alwaysOpen(h) {
    return DAYS.every(function (d) { return h[d] && h[d].length === 1 && h[d][0][0] === 0 && h[d][0][1] >= 1440; });
  }

  // {open, always, until(min, may exceed 1440), next:{day, min, k}} or null when hours are unknown
  function status(h, now) {
    if (!h) return null;
    if (alwaysOpen(h)) return { open: true, always: true };
    var di = DAYS.indexOf(now.day), m = now.min, until = null;
    (h[now.day] || []).forEach(function (s) { if (s[0] <= m && m < s[1]) until = Math.max(until || 0, s[1]); });
    (h[DAYS[(di + 6) % 7]] || []).forEach(function (s) { if (s[1] > 1440 && m < s[1] - 1440) until = Math.max(until || 0, s[1] - 1440); });
    if (until != null) return { open: true, until: until };
    for (var k = 0; k < 8; k++) {
      var d = DAYS[(di + k) % 7];
      var spans = (h[d] || []).slice().sort(function (a, b) { return a[0] - b[0]; });
      for (var i = 0; i < spans.length; i++) {
        if (k === 0 && spans[i][0] <= m) continue;
        return { open: false, next: { day: d, min: spans[i][0], k: k } };
      }
    }
    return { open: false, next: null };
  }

  function miles(a, b) {
    var R = 3958.8, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  // Straight line x 1.25 for streets, 20 min per mile on foot
  function walkMinutes(mi) { return Math.max(1, Math.round(mi * 1.25 * 20)); }

  function fold(s) { return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ''); }

  // 0 = no match; higher = better. Every query word must match somewhere.
  function matchScore(p, q, catLabels) {
    var words = fold(q).split(/\s+/).filter(Boolean);
    if (!words.length) return 1;
    var name = fold(p.n.en + ' ' + p.n.zh);
    var hay = name + ' ' + fold([p.kind.en, p.kind.zh, p.addr, (p.kw || []).join(' '), catLabels || ''].join(' '));
    var score = 1;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (name.indexOf(w) >= 0) score += 3;
      else if (hay.indexOf(w) >= 0) score += 1;
      else return 0;
    }
    if (name.indexOf(fold(q).trim()) >= 0) score += 5;
    return score;
  }

  var api = { DAYS: DAYS, CAMPUS: CAMPUS, madisonNow: madisonNow, status: status, alwaysOpen: alwaysOpen,
    miles: miles, walkMinutes: walkMinutes, matchScore: matchScore, fold: fold };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EssCore = api;
})(this);
