// OKX demo app: router, state, price engine, tabs and pages.
(function () {
  'use strict';

  var D = window.DATA, I = window.ICONS;
  var app = document.getElementById('app');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------------------------------------------------------------- storage
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem('okxdemo.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem('okxdemo.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ }
    }
  };

  // ---------------------------------------------------------------- state
  var USD = 0.99962; // USDT -> USD
  var ACCTS = { funding: 'Funding', trading: 'Trading', earn: 'Earn' };
  var TABS = ['home', 'explore', 'trade', 'orbit', 'assets'];

  var S = {
    coins: {},
    order: [],
    bal: JSON.parse(JSON.stringify(D.balances)),
    hide: store.get('hide', false),
    ccy: store.get('ccy', 'BTC'),
    favs: store.get('favs', D.favorites.slice()),
    homeMode: 'exchange',
    homeTab: 'fav',
    exTab: 'crypto',
    exFilter: 'all',
    exSort: null,
    pair: 'BTC',
    side: 'buy',
    otype: 'limit',
    tmode: 'spot',
    tr: { touched: false, pct: 0 },
    orders: [],
    history: [],
    ordersTab: 'open',
    obTab: 'foryou',
    obSeen: false,
    liked: {},
    posts: D.posts.map(function (p) { return Object.assign({}, p); }),
    dexOn: false,
    hideSmall: false,
    cryptoOpen: true,
    billsTab: 'all',
    live: false
  };

  D.coins.forEach(function (c) {
    var o = Object.assign({}, c);
    o.open = c.p / (1 + c.c);
    o.hi = Math.max(c.p, o.open) * 1.0128;
    o.lo = Math.min(c.p, o.open) * 0.9886;
    S.coins[c.s] = o;
    S.order.push(c.s);
  });
  S.coins.USDT = { s: 'USDT', n: 'Tether', p: 1, c: 0, open: 1, hi: 1, lo: 1, v: 0, lev: 0, stable: true };

  // ---------------------------------------------------------------- format
  var dpOf = function (p) { return p >= 10000 ? 1 : p >= 10 ? 2 : p >= 1 ? 4 : p >= 0.01 ? 5 : 8; };
  var nf = function (n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var fP = function (p) { return nf(p, dpOf(p)); };
  var fU = function (p) { return '$' + nf(p * USD, Math.max(2, dpOf(p))); };
  var fV = function (v) { return '$' + (v >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : (v / 1e3).toFixed(2) + 'K'); };
  var fPct = function (c) { return (c >= 0 ? '+' : '') + (c * 100).toFixed(2) + '%'; };
  var trim = function (s) { return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
  var BAHT = '<span class="baht">B</span>';
  var fB = function (x, d) { return BAHT + trim(x.toFixed(d || 5)); };
  var fAmt = function (x) { return x === 0 ? '0' : x.toFixed(8); };
  var fQty = function (x) { return x === 0 ? '0' : trim(x.toFixed(8)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); };
  var cls = function (c) { return c >= 0 ? 'up' : 'down'; };

  // ---------------------------------------------------------------- balances
  var hold = function (s) { var t = 0; for (var a in S.bal) t += S.bal[a][s] || 0; return t; };
  var toBtc = function (s, x) { return x * S.coins[s].p / S.coins.BTC.p; };
  var acctBtc = function (a) { var t = 0; for (var s in S.bal[a]) t += toBtc(s, S.bal[a][s]); return t; };
  var totalBtc = function () { return acctBtc('funding') + acctBtc('trading') + acctBtc('earn'); };
  var heldSyms = function () {
    var set = {};
    ['BTC', 'USDT'].forEach(function (s) { set[s] = 1; });
    for (var a in S.bal) for (var s in S.bal[a]) if (S.bal[a][s] > 0) set[s] = 1;
    return Object.keys(set).sort(function (x, y) { return toBtc(y, hold(y)) - toBtc(x, hold(x)); });
  };
  var locked = function (sym) {
    return S.orders.reduce(function (t, o) {
      if (o.side === 'buy' && sym === 'USDT') return t + o.price * o.amount;
      if (o.side === 'sell' && o.sym === sym) return t + o.amount;
      return t;
    }, 0);
  };
  var avail = function (sym) { return Math.max(0, (S.bal.trading[sym] || 0) - locked(sym)); };

  function totalHTML() {
    if (S.hide) return '****';
    var b = totalBtc();
    if (S.ccy === 'BTC') return b.toFixed(4);
    var usdt = b * S.coins.BTC.p;
    return nf(S.ccy === 'USD' ? usdt * USD : usdt, 2);
  }
  function pnlHTML() {
    if (S.hide) return '****';
    var pct = ' (+' + (D.pnl1y.pct * 100).toFixed(2) + '%)';
    if (S.ccy === 'BTC') return '+' + BAHT + D.pnl1y.btc.toFixed(4) + pct;
    return '+$' + nf(D.pnl1y.btc * S.coins.BTC.p * USD, 2) + pct;
  }
  function holdUsd(s) { return '≈ $' + nf(hold(s) * S.coins[s].p * USD, 2); }

  // ---------------------------------------------------------------- live bindings
  // Elements carry data-b="kind:arg"; refresh() rewrites them from state.
  var B = {
    p: function (s) { return { t: fP(S.coins[s].p), v: S.coins[s].p }; },
    u: function (s) { return { t: fU(S.coins[s].p) }; },
    c: function (s) { return { t: fPct(S.coins[s].c), dir: S.coins[s].c >= 0 }; },
    ct: function (s) { return { t: fPct(S.coins[s].c), dir: S.coins[s].c >= 0 }; },
    v: function (s) { return { t: fV(S.coins[s].v) }; },
    vb: function (s) { var c = S.coins[s]; return { t: nf(c.v / c.p, c.p > 100 ? 2 : 0) }; },
    hi: function (s) { return { t: fP(S.coins[s].hi) }; },
    lo: function (s) { return { t: fP(S.coins[s].lo) }; },
    total: function () { return { h: totalHTML() }; },
    unit: function () { return { t: S.ccy }; },
    pnl: function () { return { h: pnlHTML() }; },
    eye: function () { return { h: I.eye(S.hide) }; },
    acct: function (a) { return { h: S.hide ? '****' : fB(acctBtc(a)) }; },
    acctu: function (a) { return { t: S.hide ? '****' : '≈ $' + nf(acctBtc(a) * S.coins.BTC.p * USD, 2) }; },
    hold: function (s) { return { t: S.hide ? '****' : fAmt(hold(s)) }; },
    holdv: function (s) { return { h: S.hide ? '****' : fB(toBtc(s, hold(s))) }; },
    holdu: function (s) { return { t: S.hide ? '****' : holdUsd(s) }; },
    ah: function (k) { var p = k.split('.'); return { t: S.hide ? '****' : fQty(S.bal[p[0]][p[1]] || 0) + ' ' + p[1] }; },
    sw: function (k) { return { on: !!S[k] }; }
  };

  function flash(el, up) {
    el.classList.remove('flash-up', 'flash-down');
    void el.offsetWidth;
    el.classList.add(up ? 'flash-up' : 'flash-down');
  }

  function refresh(root) {
    $$('[data-b]', root).forEach(function (el) {
      var kv = el.getAttribute('data-b'), i = kv.indexOf(':');
      var k = i < 0 ? kv : kv.slice(0, i), a = i < 0 ? '' : kv.slice(i + 1);
      var f = B[k];
      if (!f) return;
      var r = f(a);
      if (r.h !== undefined) {
        if (el._h !== r.h) { el.innerHTML = r.h; el._h = r.h; }
      } else if (r.t !== undefined && el.textContent !== r.t) {
        if (r.v !== undefined && el._v !== undefined && r.v !== el._v && !el.classList.contains('noflash')) flash(el, r.v > el._v);
        el.textContent = r.t;
      }
      if (r.v !== undefined) el._v = r.v;
      if (r.dir !== undefined) { el.classList.toggle('up', r.dir); el.classList.toggle('down', !r.dir); }
      if (r.on !== undefined) el.classList.toggle('on', r.on);
    });
  }

  // ---------------------------------------------------------------- price engine
  var gauss = function () { return (Math.random() + Math.random() + Math.random() - 1.5) / 0.75; };

  function simTick() {
    S.order.forEach(function (s) {
      var c = S.coins[s];
      if (c.liveOk || Math.random() > 0.6) return;
      var vol = s === 'USDC' ? 0.00003 : (s === 'BTC' || s === 'ETH' ? 0.00045 : 0.0009);
      var np = c.p * (1 + gauss() * vol + (c.open - c.p) / c.open * 0.002);
      c.p = np;
      c.c = c.p / c.open - 1;
      c.v *= 1 + Math.random() * 0.0004;
      if (c.p > c.hi) c.hi = c.p;
      if (c.p < c.lo) c.lo = c.p;
    });
  }

  function liveFetch() {
    if (!window.fetch || !window.AbortController) return Promise.resolve(false);
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 6000);
    return fetch('https://www.okx.com/api/v5/market/tickers?instType=SPOT', { signal: ctl.signal })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        clearTimeout(timer);
        if (!j || !j.data || !j.data.length) return false;
        var n = 0;
        j.data.forEach(function (t) {
          var parts = t.instId.split('-');
          if (parts[1] !== 'USDT') return;
          var c = S.coins[parts[0]];
          if (!c || c.stable) return;
          var last = +t.last, open = +t.open24h;
          if (!last || !open) return;
          c.p = last; c.open = open; c.c = last / open - 1;
          c.hi = +t.high24h || c.hi; c.lo = +t.low24h || c.lo;
          c.v = +t.volCcy24h || c.v;
          c.liveOk = true; n++;
        });
        return n > 0;
      })
      .catch(function () { clearTimeout(timer); return false; });
  }

  function afterPrices() {
    fillLimitOrders();
    refresh();
    if (curTab === 'trade' && !stack.length) { renderBook(); trRecalc(); }
    var top = stack[stack.length - 1];
    if (top && top.def.tick) top.def.tick(top.el, top.arg);
  }

  function startEngine() {
    var simTimer = setInterval(function () {
      if (document.hidden) return;
      simTick();
      afterPrices();
    }, 1800);
    liveFetch().then(function (ok) {
      if (!ok) return;
      S.live = true;
      afterPrices();
      setInterval(function () {
        if (document.hidden) return;
        liveFetch().then(function (ok2) { if (ok2) afterPrices(); });
      }, 4000);
    });
    return simTimer;
  }

  // ---------------------------------------------------------------- shared pieces
  var SPARK = '<g fill="#51a459"><rect x="5" y="53" width="1" height="1"/><rect x="5" y="57" width="1" height="1"/><rect x="9" y="49" width="1" height="1"/><rect x="9" y="53" width="1" height="1"/><rect x="9" y="57" width="1" height="1"/><rect x="13" y="37" width="1" height="1"/><rect x="13" y="41" width="1" height="1"/><rect x="13" y="45" width="1" height="1"/><rect x="13" y="49" width="1" height="1"/><rect x="13" y="53" width="1" height="1"/><rect x="13" y="57" width="1" height="1"/><rect x="17" y="37" width="1" height="1"/><rect x="17" y="41" width="1" height="1"/><rect x="17" y="45" width="1" height="1"/><rect x="17" y="49" width="1" height="1"/><rect x="17" y="53" width="1" height="1"/><rect x="17" y="57" width="1" height="1"/><rect x="21" y="41" width="1" height="1"/><rect x="21" y="45" width="1" height="1"/><rect x="21" y="49" width="1" height="1"/><rect x="21" y="53" width="1" height="1"/><rect x="21" y="57" width="1" height="1"/><rect x="25" y="33" width="1" height="1"/><rect x="25" y="37" width="1" height="1"/><rect x="25" y="41" width="1" height="1"/><rect x="25" y="45" width="1" height="1"/><rect x="25" y="49" width="1" height="1"/><rect x="25" y="53" width="1" height="1"/><rect x="25" y="57" width="1" height="1"/><rect x="29" y="37" width="1" height="1"/><rect x="29" y="41" width="1" height="1"/><rect x="29" y="45" width="1" height="1"/><rect x="29" y="49" width="1" height="1"/><rect x="29" y="53" width="1" height="1"/><rect x="29" y="57" width="1" height="1"/><rect x="33" y="37" width="1" height="1"/><rect x="33" y="41" width="1" height="1"/><rect x="33" y="45" width="1" height="1"/><rect x="33" y="49" width="1" height="1"/><rect x="33" y="53" width="1" height="1"/><rect x="33" y="57" width="1" height="1"/><rect x="37" y="33" width="1" height="1"/><rect x="37" y="37" width="1" height="1"/><rect x="37" y="41" width="1" height="1"/><rect x="37" y="45" width="1" height="1"/><rect x="37" y="49" width="1" height="1"/><rect x="37" y="53" width="1" height="1"/><rect x="37" y="57" width="1" height="1"/><rect x="41" y="29" width="1" height="1"/><rect x="41" y="33" width="1" height="1"/><rect x="41" y="37" width="1" height="1"/><rect x="41" y="41" width="1" height="1"/><rect x="41" y="45" width="1" height="1"/><rect x="41" y="49" width="1" height="1"/><rect x="41" y="53" width="1" height="1"/><rect x="41" y="57" width="1" height="1"/><rect x="45" y="29" width="1" height="1"/><rect x="45" y="33" width="1" height="1"/><rect x="45" y="37" width="1" height="1"/><rect x="45" y="41" width="1" height="1"/><rect x="45" y="45" width="1" height="1"/><rect x="45" y="49" width="1" height="1"/><rect x="45" y="53" width="1" height="1"/><rect x="45" y="57" width="1" height="1"/><rect x="49" y="25" width="1" height="1"/><rect x="49" y="29" width="1" height="1"/><rect x="49" y="33" width="1" height="1"/><rect x="49" y="37" width="1" height="1"/><rect x="49" y="41" width="1" height="1"/><rect x="49" y="45" width="1" height="1"/><rect x="49" y="49" width="1" height="1"/><rect x="49" y="53" width="1" height="1"/><rect x="49" y="57" width="1" height="1"/><rect x="53" y="33" width="1" height="1"/><rect x="53" y="37" width="1" height="1"/><rect x="53" y="41" width="1" height="1"/><rect x="53" y="45" width="1" height="1"/><rect x="53" y="49" width="1" height="1"/><rect x="53" y="53" width="1" height="1"/><rect x="53" y="57" width="1" height="1"/><rect x="57" y="33" width="1" height="1"/><rect x="57" y="37" width="1" height="1"/><rect x="57" y="41" width="1" height="1"/><rect x="57" y="45" width="1" height="1"/><rect x="57" y="49" width="1" height="1"/><rect x="57" y="53" width="1" height="1"/><rect x="57" y="57" width="1" height="1"/><rect x="61" y="21" width="1" height="1"/><rect x="61" y="25" width="1" height="1"/><rect x="61" y="29" width="1" height="1"/><rect x="61" y="33" width="1" height="1"/><rect x="61" y="37" width="1" height="1"/><rect x="61" y="41" width="1" height="1"/><rect x="61" y="45" width="1" height="1"/><rect x="61" y="49" width="1" height="1"/><rect x="61" y="53" width="1" height="1"/><rect x="61" y="57" width="1" height="1"/><rect x="65" y="21" width="1" height="1"/><rect x="65" y="25" width="1" height="1"/><rect x="65" y="29" width="1" height="1"/><rect x="65" y="33" width="1" height="1"/><rect x="65" y="37" width="1" height="1"/><rect x="65" y="41" width="1" height="1"/><rect x="65" y="45" width="1" height="1"/><rect x="65" y="49" width="1" height="1"/><rect x="65" y="53" width="1" height="1"/><rect x="65" y="57" width="1" height="1"/><rect x="69" y="13" width="1" height="1"/><rect x="69" y="17" width="1" height="1"/><rect x="69" y="21" width="1" height="1"/><rect x="69" y="25" width="1" height="1"/><rect x="69" y="29" width="1" height="1"/><rect x="69" y="33" width="1" height="1"/><rect x="69" y="37" width="1" height="1"/><rect x="69" y="41" width="1" height="1"/><rect x="69" y="45" width="1" height="1"/><rect x="69" y="49" width="1" height="1"/><rect x="69" y="53" width="1" height="1"/><rect x="69" y="57" width="1" height="1"/><rect x="73" y="13" width="1" height="1"/><rect x="73" y="17" width="1" height="1"/><rect x="73" y="21" width="1" height="1"/><rect x="73" y="25" width="1" height="1"/><rect x="73" y="29" width="1" height="1"/><rect x="73" y="33" width="1" height="1"/><rect x="73" y="37" width="1" height="1"/><rect x="73" y="41" width="1" height="1"/><rect x="73" y="45" width="1" height="1"/><rect x="73" y="49" width="1" height="1"/><rect x="73" y="53" width="1" height="1"/><rect x="73" y="57" width="1" height="1"/><rect x="77" y="9" width="1" height="1"/><rect x="77" y="13" width="1" height="1"/><rect x="77" y="17" width="1" height="1"/><rect x="77" y="21" width="1" height="1"/><rect x="77" y="25" width="1" height="1"/><rect x="77" y="29" width="1" height="1"/><rect x="77" y="33" width="1" height="1"/><rect x="77" y="37" width="1" height="1"/><rect x="77" y="41" width="1" height="1"/><rect x="77" y="45" width="1" height="1"/><rect x="77" y="49" width="1" height="1"/><rect x="77" y="53" width="1" height="1"/><rect x="77" y="57" width="1" height="1"/></g> <path d="M4.9 51.6 L7.0 51.6 L9.1 25.6 L11.6 28.2 L13.3 33.4 L15.7 34.3 L18.4 29.2 L20.7 37.2 L23.2 31.8 L25.4 31.4 L27.3 30.5 L29.4 33.4 L30.7 34.5 L32.3 34.5 L34.7 29.7 L36.8 29.0 L39.8 26.6 L42.7 25.6 L44.5 24.7 L46.4 21.5 L48.7 23.4 L50.7 24.2 L55.5 30.5 L57.8 20.2 L59.4 20.0 L62.3 15.2 L65.0 17.9 L69.6 6.7 L72.2 10.2 L74.6 6.7 L76.6 6.5" fill="none" stroke="#51a459" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" filter="url(#glow)"/>';
  function spark() {
    return '<svg width="82" height="62" viewBox="0 0 82 62" aria-hidden="true"><defs><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="b"/><feComponentTransfer in="b" result="g"><feFuncA type="linear" slope="1.1"/></feComponentTransfer><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' + SPARK + '</svg>';
  }

  function balBlock(extra, assets) {
    return '<div class="bal ' + extra + '">' +
      '<div class="bal-label"><span>Est total value</span><button class="tap" data-act="hide" data-b="eye">' + I.eye(S.hide) + '</button></div>' +
      '<div class="bal-amt"><span class="big" data-b="total">' + totalHTML() + '</span>' +
      '<button class="unit tap" data-act="ccy"><span data-b="unit">' + S.ccy + '</span>' + I.caret() + '</button></div>' +
      '<div class="bal-pnl"><span class="lab">1Y PnL</span><span class="val num" data-b="pnl">' + pnlHTML() + '</span>' + (assets ? I.chevR(1.7) : '') + '</div>' +
      '<button class="bal-chart tap" ' + (assets ? '' : 'data-act="tab" data-v="assets"') + '>' + spark() + '</button>' +
      (assets ? '<button class="hist tap" data-go="bills">' + I.history() + '</button>' : '') +
      '</div>';
  }

  // Market row. opts.fut = futures style, opts.sub = override subtitle.
  function mrow(s, opts) {
    opts = opts || {};
    var c = S.coins[s];
    var pair = opts.fut
      ? '<span class="base">' + s + 'USDT</span><span class="quote">Perp</span><span class="lev">' + (c.v > 100e6 ? 100 : 50) + 'x</span>'
      : '<span class="base">' + s + '</span><span class="quote">/ USDT</span>' + (c.lev ? '<span class="lev">' + c.lev + 'x</span>' : '');
    return '<div class="mrow" data-go="coin/' + s + '">' +
      '<div class="ci">' + I.coin(s, 26) + '</div>' +
      '<div class="nm"><div class="pair">' + pair + '</div><div class="sub"' + (opts.sub ? '>' + esc(opts.sub) : ' data-b="v:' + s + '">' + fV(c.v)) + '</div></div>' +
      '<div class="px"><div class="p num" data-b="p:' + s + '">' + fP(c.p) + '</div><div class="u num" data-b="u:' + s + '">' + fU(c.p) + '</div></div>' +
      '<div class="badge ' + cls(c.c) + '" data-b="c:' + s + '">' + fPct(c.c) + '</div></div>';
  }

  function emptyHTML(text, btn) {
    return '<div class="empty"><div class="em-ic">' + I.search(20) + '</div>' + text + (btn || '') + '</div>';
  }

  var PROMO_ART = {
    orb: '<svg width="80" height="92" viewBox="0 0 80 92"><defs><radialGradient id="orbg" cx=".3" cy=".25" r=".85"><stop offset="0" stop-color="#8b8b8b"/><stop offset=".55" stop-color="#3f3f3f"/><stop offset="1" stop-color="#242424"/></radialGradient></defs>' +
      '<rect x="9.6" y="25.4" width="4.4" height="4.4" rx=".4" transform="rotate(45 11.8 27.6)" fill="#e9e9e9"/><circle cx="18.75" cy="59" r="13.25" fill="#e8e8e8"/>' +
      '<rect x="16.2" y="56.45" width="5.1" height="5.1" transform="rotate(45 18.75 59)" fill="none" stroke="#1e1e1e" stroke-width="1"/>' +
      '<circle cx="38.75" cy="39" r="20" fill="url(#orbg)" opacity=".96"/><circle cx="38.75" cy="39" r="19.6" fill="none" stroke="rgba(255,255,255,.14)" stroke-width=".8"/>' +
      '<path d="M38.75 34.6q.5 4.6 5 5.4q-4.5.8-5 5.4q-.5-4.6-5-5.4q4.5-.8 5-5.4z" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="round"/></svg>',
    earn: '<svg width="80" height="92" viewBox="0 0 80 92"><circle cx="44" cy="46" r="24" fill="#cafd5c"/><g transform="translate(33 37)" color="#000">' + I.earn(22) + '</g><circle cx="16" cy="28" r="3" fill="#e9e9e9"/></svg>',
    gift: '<svg width="80" height="92" viewBox="0 0 80 92"><circle cx="44" cy="46" r="24" fill="#2e2e2e" stroke="rgba(255,255,255,.12)"/><g transform="translate(34 36) scale(1.1)" color="#fff">' + I.gift() + '</g><rect x="12" y="62" width="6" height="6" rx="1" transform="rotate(45 15 65)" fill="#cafd5c"/></svg>',
    chart: '<svg width="80" height="92" viewBox="0 0 80 92"><rect x="16" y="22" width="56" height="48" rx="10" fill="#2e2e2e"/><path d="M24 58l10-12 9 7 10-15 10 6" fill="none" stroke="#5cb865" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="63" cy="44" r="3" fill="#cafd5c"/></svg>',
    swap: '<svg width="80" height="92" viewBox="0 0 80 92"><circle cx="44" cy="46" r="24" fill="#e8e8e8"/><g transform="translate(33 37.5)" color="#000">' + I.transfer(22) + '</g></svg>'
  };

  var WALLET = '<svg width="52" height="42" viewBox="0 0 52 42" aria-hidden="true"><defs><linearGradient id="wl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a9a9a9"/><stop offset=".55" stop-color="#6b6b6b"/><stop offset="1" stop-color="#3b3b3b"/></linearGradient>' +
    '<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.05" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/></filter></defs>' +
    '<path d="M7.6 6.6V3.8L42.6.1l.9 6.5z" fill="#ececec"/><rect x="2.8" y="6.2" width="46.8" height="35" rx="2" fill="#2e2e2e"/><rect x="2.8" y="6.2" width="46.8" height="35" rx="2" fill="url(#wl)" filter="url(#grain)"/>' +
    '<path d="M49.6 18.8h-9.2a5.6 5.6 0 0 0 0 11.2h9.2" fill="#3a3a3a" stroke="#e2e2e2" stroke-width="1.2"/><circle cx="43" cy="24.4" r="1.3" fill="#ededed"/><rect x="0" y="26.2" width="15.8" height="6.2" fill="#ebebeb"/><rect x="0" y="35" width="15.8" height="6.2" fill="#ebebeb"/></svg>';

  function avatarColor(name) {
    var cols = ['#cafd5c', '#7fd1ff', '#ffb86b', '#c9a7ff', '#7be0b5', '#ff8fa3', '#ffe27a'];
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return cols[h % cols.length];
  }
  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }

  // ================================================================ HOME
  var HOME_TABS = [['fav', 'Favorites'], ['new', 'New'], ['crypto', 'Crypto'], ['tradfi', 'TradFi'], ['hot', 'Hot']];

  function renderHome() {
    return '<div class="home-hd">' +
      '<div class="left"><button class="tap" data-go="menu">' + I.grid() + '</button></div>' +
      '<div class="seg"><div class="seg-in" id="homeSeg"><i class="knob"></i>' +
      '<button class="on" data-act="homeMode" data-v="exchange">Exchange</button><button data-act="homeMode" data-v="web3">Web3</button></div></div>' +
      '<div class="right"><button class="tap" data-go="rewards">' + I.gift() + '</button><button class="tap" data-go="notifications">' + I.inbox() + '</button></div>' +
      '</div>' +
      '<div class="home-search"><button class="searchbar tap" data-go="search">' + I.search() + '<span>' + I.flame() + '</span><span>#BTCInflowETHOutflow</span></button>' +
      '<button class="circle-btn tap" data-act="scan">' + I.scan() + '</button></div>' +
      '<div id="homeBody">' + homeExchange() + '</div>';
  }

  function homeExchange() {
    return balBlock('home-bal') +
      '<div class="cta"><button class="btn" data-act="deposit">Deposit crypto</button><button class="btn" data-act="tab" data-v="trade">Trade</button></div>' +
      '<div class="carousel hscroll" id="carousel">' + D.promos.map(function (p) {
        return '<button class="promo" data-go="' + p.go + '"><div class="ttl">' + p.title + I.chevR(1.8) + '</div><div class="sub">' + p.sub + '</div><div class="art">' + PROMO_ART[p.art] + '</div></button>';
      }).join('') + '</div>' +
      '<div class="dots" id="dots">' + D.promos.map(function (_, i) { return '<i class="' + (i ? '' : 'on') + '"></i>'; }).join('') + '</div>' +
      '<div class="mkt-tabs hscroll chips" id="homeTabs">' + homeTabsHTML() + '</div>' +
      '<div class="mkt-list" id="homeList">' + homeListHTML() + '</div>';
  }

  function homeWeb3() {
    return '<div class="w3-card"><div class="k">Web3 wallet</div><div class="v">$0.00</div>' +
      '<div class="n">Self-custody balances appear here. Below are tokens trending on-chain right now.</div></div>' +
      '<div class="label-sm">Trending on-chain</div>' +
      D.web3.map(function (t) { return mrow(t.s, { sub: t.chain }); }).join('');
  }

  function homeTabsHTML() {
    return HOME_TABS.map(function (t) {
      var on = S.homeTab === t[0];
      return '<button class="chip' + (on ? ' on' : '') + '" data-act="homeTab" data-v="' + t[0] + '">' + t[1] +
        (t[0] === 'new' ? '<i class="newdot"></i>' : '') + (t[0] === 'fav' && on ? I.caretLg() : '') + '</button>';
    }).join('') + '<button class="more tap" data-act="tab" data-v="explore">' + I.chevR(1.8) + '</button>';
  }

  function listFor(kind) {
    var all = S.order.filter(function (s) { return !S.coins[s].tradfi; });
    switch (kind) {
      case 'fav': return S.favs.filter(function (s) { return S.coins[s]; });
      case 'new': return all.filter(function (s) { return S.coins[s].isNew; });
      case 'tradfi': return S.order.filter(function (s) { return S.coins[s].tradfi; });
      case 'hot': return all.slice().sort(function (a, b) { return Math.abs(S.coins[b].c) - Math.abs(S.coins[a].c); }).slice(0, 10);
      case 'gainers': return all.slice().sort(function (a, b) { return S.coins[b].c - S.coins[a].c; }).slice(0, 12);
      case 'losers': return all.slice().sort(function (a, b) { return S.coins[a].c - S.coins[b].c; }).slice(0, 12);
      case 'crypto': return all.filter(function (s) { return !S.coins[s].isNew; }).slice(0, 10);
      default: return all;
    }
  }

  function homeListHTML() {
    var l = listFor(S.homeTab);
    if (!l.length) return emptyHTML('No favorites yet', '<div style="margin-top:16px"><button class="btn" data-act="tab" data-v="explore">Add favorites</button></div>');
    return l.map(function (s) { return mrow(s); }).join('');
  }

  function mountHome(el) {
    var car = $('#carousel', el);
    if (!car) return;
    var dots = $$('#dots i', el), lastTouch = 0, idx = 0;
    var slideW = function () { var a = car.children[0], b = car.children[1]; return a && b ? b.offsetLeft - a.offsetLeft : 1; };
    car.addEventListener('scroll', function () {
      var i = Math.round(car.scrollLeft / slideW());
      if (i !== idx) { idx = i; dots.forEach(function (d, j) { d.classList.toggle('on', j === i); }); }
    }, { passive: true });
    car.addEventListener('touchstart', function () { lastTouch = Date.now(); }, { passive: true });
    clearInterval(mountHome.t);
    mountHome.t = setInterval(function () {
      if (!document.body.contains(car) || curTab !== 'home' || stack.length || Date.now() - lastTouch < 6000 || document.hidden) return;
      var n = (idx + 1) % D.promos.length;
      car.scrollTo({ left: n * slideW(), behavior: 'smooth' });
    }, 4500);
  }

  // ================================================================ EXPLORE
  var EX_TABS = [['fav', 'Favorites'], ['crypto', 'Crypto'], ['spot', 'Spot'], ['futures', 'Futures'], ['tradfi', 'TradFi']];
  var EX_FILTERS = [['all', 'All'], ['hot', 'Hot'], ['gainers', 'Gainers'], ['losers', 'Losers'], ['new', 'New listings']];

  function renderExplore() {
    return '<div class="ex-top"><button class="searchbar tap" data-go="search">' + I.search() + '<span>Search crypto</span></button></div>' +
      '<div class="ex-tabs hscroll" id="exTabs">' + exTabsHTML() + '</div>' +
      '<div class="ex-sub hscroll chips" id="exSub">' + exSubHTML() + '</div>' +
      '<div class="ex-list" id="exList">' + exListHTML() + '</div>';
  }
  function exTabsHTML() {
    return EX_TABS.map(function (t) { return '<button class="' + (S.exTab === t[0] ? 'on' : '') + '" data-act="exTab" data-v="' + t[0] + '">' + t[1] + '</button>'; }).join('');
  }
  function exSubHTML() {
    if (S.exTab === 'fav' || S.exTab === 'tradfi') return '';
    return EX_FILTERS.map(function (f) { return '<button class="chip sm' + (S.exFilter === f[0] ? ' on' : '') + '" data-act="exFilter" data-v="' + f[0] + '">' + f[1] + '</button>'; }).join('');
  }
  function exListHTML() {
    var l;
    if (S.exTab === 'fav') l = listFor('fav');
    else if (S.exTab === 'tradfi') l = listFor('tradfi');
    else l = S.exFilter === 'all' ? listFor(S.exTab === 'crypto' ? 'crypto-all' : 'all') : listFor(S.exFilter);
    if (S.exTab === 'crypto' && S.exFilter === 'all') l = S.order.filter(function (s) { return !S.coins[s].tradfi; });
    if (S.exSort) {
      var k = S.exSort.key, d = S.exSort.dir;
      l = l.slice().sort(function (a, b) { return (S.coins[a][k] - S.coins[b][k]) * d; });
    }
    var sortBtn = function (key, label, style) {
      var st = S.exSort && S.exSort.key === key ? (S.exSort.dir > 0 ? ' asc on' : ' desc on') : '';
      return '<button class="' + st + '" data-act="sort" data-v="' + key + '"' + (style ? ' style="' + style + '"' : '') + '>' + label + '<span class="sort"><i></i><i></i></span></button>';
    };
    var head = '<div class="colhead">' + sortBtn('v', 'Name / Vol') + '<span class="grow"></span>' + sortBtn('p', 'Last price', 'margin-right:13px') + sortBtn('c', '24h chg', 'width:80px;justify-content:flex-end') + '</div>';
    if (!l.length) return head + emptyHTML('No favorites yet. Tap the star on any market to add it.');
    var fut = S.exTab === 'futures';
    return head + l.map(function (s) { return mrow(s, { fut: fut }); }).join('');
  }

  // ================================================================ TRADE
  function renderTrade() {
    return '<div class="tr-top" id="trTop">' + trTopHTML() + '</div><div id="trMain"></div>';
  }
  function trTopHTML() {
    return [['spot', 'Spot'], ['futures', 'Futures']].map(function (t) {
      return '<button class="' + (S.tmode === t[0] ? 'on' : '') + '" data-act="tmode" data-v="' + t[0] + '">' + t[1] + '</button>';
    }).join('');
  }

  function renderTradeMain() {
    var s = S.pair, c = S.coins[s], buy = S.side === 'buy', fut = S.tmode === 'futures';
    var pairName = fut ? s + 'USDT Perp' : s + '/USDT';
    var label = fut ? (buy ? 'Open long' : 'Open short') : (buy ? 'Buy ' : 'Sell ') + (fut ? '' : s);
    var marks = [0, 25, 50, 75, 100].map(function (p) { return '<i class="mark" style="left:' + p + '%"></i>'; }).join('');
    $('#trMain').innerHTML =
      '<div class="tr-pair"><button class="nm tap" data-act="pairSheet">' + pairName + I.caretLg() + '</button>' +
      '<span class="chg" data-b="c:' + s + '">' + fPct(c.c) + '</span>' +
      (fut ? '<span class="chip sm on" style="margin-left:8px">Cross 10x</span>' : '') +
      '<div class="icons"><button class="nav-btn tap" data-go="coin/' + s + '">' + I.chart() + '</button></div></div>' +
      '<div class="tr-body"><div class="tr-form">' +
      '<div class="bs"><button class="buy' + (buy ? ' on' : '') + '" data-act="side" data-v="buy">' + (fut ? 'Long' : 'Buy') + '</button><button class="sell' + (buy ? '' : ' on') + '" data-act="side" data-v="sell">' + (fut ? 'Short' : 'Sell') + '</button></div>' +
      '<button class="field select" data-act="otype"><span>' + (S.otype === 'limit' ? 'Limit' : 'Market') + '</span>' + I.caretLg() + '</button>' +
      (S.otype === 'limit'
        ? '<div class="field"><input id="inPrice" inputmode="decimal" autocomplete="off" value="' + c.p.toFixed(dpOf(c.p)) + '"><button class="step" data-act="step" data-v="-1">−</button><button class="step" data-act="step" data-v="1">+</button></div>'
        : '<div class="field"><span class="muted" style="font-size:13px">Market price</span></div>') +
      '<div class="field"><input id="inAmt" inputmode="decimal" autocomplete="off" placeholder="Amount"><span class="unit">' + s + '</span></div>' +
      '<div class="slider" id="slider"><div class="track"></div><div class="fill" id="slFill"></div>' + marks + '<i class="thumb" id="slThumb" style="left:0"></i></div>' +
      '<div class="kv"><span>Total</span><b id="trTotal">0 USDT</b></div>' +
      '<div class="kv"><span>Available</span><b id="trAvail"></b></div>' +
      '<div class="kv"><span>Max ' + (buy ? 'buy' : 'sell') + '</span><b id="trMax"></b></div>' +
      '<button class="btn lg ' + (buy ? 'buy' : 'sell') + '" data-act="placeOrder">' + label + '</button>' +
      '</div><div class="tr-book" id="book"></div></div>' +
      '<div class="tr-orders"><div class="tabsline">' +
      '<button class="' + (S.ordersTab === 'open' ? 'on' : '') + '" data-act="ordersTab" data-v="open">Open orders (<span id="ocount">' + S.orders.length + '</span>)</button>' +
      '<button class="' + (S.ordersTab === 'hist' ? 'on' : '') + '" data-act="ordersTab" data-v="hist">Order history</button></div>' +
      '<div id="ordersList">' + ordersHTML() + '</div></div>';
    S.tr = { touched: false, pct: 0 };
    var inP = $('#inPrice'), inA = $('#inAmt');
    if (inP) inP.addEventListener('input', function () { S.tr.touched = true; trRecalc(); });
    inA.addEventListener('input', function () { S.tr.pct = -1; trRecalc(); });
    bindSlider($('#slider'));
    renderBook();
    trRecalc();
    refresh($('#trMain'));
  }

  function trPrice() {
    var c = S.coins[S.pair], inP = $('#inPrice');
    if (S.otype === 'market' || !inP) return c.p;
    if (!S.tr.touched) inP.value = c.p.toFixed(dpOf(c.p));
    return parseFloat(inP.value) || 0;
  }

  function trRecalc() {
    if (!$('#trTotal')) return;
    var s = S.pair, buy = S.side === 'buy', price = trPrice(), inA = $('#inAmt');
    var av = buy ? avail('USDT') : avail(s);
    var max = buy ? (price ? av / price : 0) : av;
    if (S.tr.pct >= 0) inA.value = S.tr.pct > 0 ? trim((max * S.tr.pct / 100).toFixed(s === 'BTC' ? 6 : 4)) : '';
    var amt = parseFloat(inA.value) || 0;
    $('#trTotal').textContent = nf(amt * price, 2) + ' USDT';
    $('#trAvail').textContent = (buy ? fQty(av) + ' USDT' : fQty(av) + ' ' + s);
    $('#trMax').textContent = buy ? trim(max.toFixed(6)) + ' ' + s : nf(av * price, 2) + ' USDT';
    var pct = S.tr.pct >= 0 ? S.tr.pct : (max ? Math.min(100, amt / max * 100) : 0);
    setSlider(pct);
  }

  function setSlider(p) {
    var f = $('#slFill'), t = $('#slThumb');
    if (!f) return;
    f.style.width = p + '%';
    t.style.left = p + '%';
    $$('#slider .mark').forEach(function (m, i) { m.classList.toggle('on', i * 25 <= p && p > 0); });
  }

  function bindSlider(el) {
    var set = function (x) {
      var r = el.getBoundingClientRect();
      var p = Math.max(0, Math.min(100, (x - r.left) / r.width * 100));
      [0, 25, 50, 75, 100].forEach(function (m) { if (Math.abs(p - m) < 4) p = m; });
      S.tr.pct = Math.round(p);
      trRecalc();
    };
    el.addEventListener('pointerdown', function (e) {
      el.setPointerCapture(e.pointerId);
      set(e.clientX);
      var mv = function (ev) { set(ev.clientX); };
      var up = function () { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
      el.addEventListener('pointermove', mv);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  }

  function bookAmt(a) {
    return a >= 1e6 ? (a / 1e6).toFixed(2) + 'M' : a >= 1e3 ? (a / 1e3).toFixed(2) + 'K' : a >= 1 ? a.toFixed(3) : a.toFixed(5);
  }

  function renderBook() {
    var el = $('#book');
    if (!el) return;
    var c = S.coins[S.pair], d = dpOf(c.p), tick = Math.pow(10, -d);
    var mk = function (dir) {
      var rows = [], px = c.p, cum = 0;
      for (var i = 0; i < 7; i++) {
        px += dir * tick * (1 + Math.floor(Math.random() * 4)) * Math.max(1, Math.round(c.p * 0.00001 / tick));
        var a = (150 + Math.random() * 5800) / c.p;
        cum += a;
        rows.push({ p: px, a: a, cum: cum });
      }
      return rows;
    };
    var asks = mk(1), bids = mk(-1);
    var max = Math.max(asks[6].cum, bids[6].cum);
    var row = function (r, side) {
      return '<div class="book-row ' + side + '" data-act="bookPrice" data-v="' + r.p.toFixed(d) + '"><i class="bar" style="width:' + (r.cum / max * 100).toFixed(1) + '%"></i><span class="p">' + fP(r.p) + '</span><span>' + bookAmt(r.a) + '</span></div>';
    };
    el.innerHTML = '<div class="book-hd"><span>Price (USDT)</span><span>Amount (' + S.pair + ')</span></div>' +
      asks.slice().reverse().map(function (r) { return row(r, 'ask'); }).join('') +
      '<div class="book-mid"><div class="p ' + cls(c.c) + '">' + fP(c.p) + '</div><div class="u">' + fU(c.p) + '</div></div>' +
      bids.map(function (r) { return row(r, 'bid'); }).join('');
  }

  function ordersHTML() {
    if (S.ordersTab === 'open') {
      if (!S.orders.length) return emptyHTML('No open orders');
      return S.orders.map(function (o) {
        return '<div class="order"><div class="t"><span><span class="sd ' + (o.side === 'buy' ? 'up' : 'down') + '">' + (o.side === 'buy' ? 'Buy' : 'Sell') + '</span>' + o.sym + '/USDT</span>' +
          '<button class="cancel" data-act="cancelOrder" data-v="' + o.id + '">Cancel</button></div>' +
          '<div class="grid"><div>Limit price<b>' + fP(o.price) + '</b></div><div>Amount<b>' + trim(o.amount.toFixed(6)) + '</b></div><div>Time<b>' + o.time + '</b></div></div></div>';
      }).join('');
    }
    var h = S.history.filter(function (x) { return x.kind === 'trade'; });
    if (!h.length) return emptyHTML('No order history');
    return h.map(function (o) {
      return '<div class="order"><div class="t"><span><span class="sd ' + (o.side === 'buy' ? 'up' : 'down') + '">' + (o.side === 'buy' ? 'Buy' : 'Sell') + '</span>' + o.sym + '/USDT</span><span class="muted" style="font-size:12px;font-weight:500">Filled</span></div>' +
        '<div class="grid"><div>Avg price<b>' + fP(o.price) + '</b></div><div>Amount<b>' + trim(o.amount.toFixed(6)) + '</b></div><div>Time<b>' + o.time + '</b></div></div></div>';
    }).join('');
  }

  function refreshOrders() {
    var l = $('#ordersList'), n = $('#ocount');
    if (l) l.innerHTML = ordersHTML();
    if (n) n.textContent = S.orders.length;
  }

  var nowStr = function () {
    var d = new Date(), z = function (n) { return (n < 10 ? '0' : '') + n; };
    return z(d.getMonth() + 1) + '/' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes());
  };

  function execTrade(sym, side, price, amount) {
    var fee = 0.001;
    if (side === 'buy') {
      S.bal.trading.USDT -= price * amount;
      S.bal.trading[sym] = (S.bal.trading[sym] || 0) + amount * (1 - fee);
    } else {
      S.bal.trading[sym] -= amount;
      S.bal.trading.USDT = (S.bal.trading.USDT || 0) + amount * price * (1 - fee);
    }
    if (S.bal.trading.USDT < 1e-12) S.bal.trading.USDT = Math.max(0, S.bal.trading.USDT);
    S.history.unshift({ kind: 'trade', sym: sym, side: side, price: price, amount: amount, time: nowStr() });
  }

  function fillLimitOrders() {
    var filled = [];
    S.orders = S.orders.filter(function (o) {
      var p = S.coins[o.sym].p;
      if ((o.side === 'buy' && p <= o.price) || (o.side === 'sell' && p >= o.price)) { filled.push(o); return false; }
      return true;
    });
    if (!filled.length) return;
    filled.forEach(function (o) { execTrade(o.sym, o.side, o.price, o.amount); });
    toast('Limit order filled');
    refreshOrders();
    rerenderCrypto();
  }

  // ================================================================ ORBIT
  function renderOrbit() {
    return '<div class="ob-hd"><h1>Orbit</h1><div class="icons"><button class="nav-btn tap" data-go="search">' + I.search(18) + '</button>' +
      '<button class="nav-btn tap" data-go="notifications">' + I.bell() + '</button></div></div>' +
      '<div class="ob-tabs hscroll" id="obTabs">' + obTabsHTML() + '</div><div id="obFeed">' + obFeedHTML() + '</div>';
  }
  function obTabsHTML() {
    return [['foryou', 'For you'], ['following', 'Following'], ['news', 'News']].map(function (t) {
      return '<button class="' + (S.obTab === t[0] ? 'on' : '') + '" data-act="obTab" data-v="' + t[0] + '">' + t[1] + '</button>';
    }).join('');
  }
  function postHTML(p) {
    var liked = !!S.liked[p.id];
    var tag = p.tag && S.coins[p.tag]
      ? '<button class="tag" data-go="coin/' + p.tag + '">' + I.coin(p.tag, 18) + p.tag + '/USDT <span class="' + cls(S.coins[p.tag].c) + '" data-b="ct:' + p.tag + '">' + fPct(S.coins[p.tag].c) + '</span></button>'
      : '';
    return '<article class="post"><div class="who"><div class="avatar" style="background:' + avatarColor(p.user) + '">' + esc(initials(p.user)) + '</div>' +
      '<div class="grow"><div class="nm">' + esc(p.user) + (p.verified ? I.verified() : '') + '</div><div class="hd">' + esc(p.handle) + ' · ' + p.t + '</div></div></div>' +
      '<div class="tx">' + esc(p.text) + '</div>' + tag +
      '<div class="bar"><button class="' + (liked ? 'liked' : '') + '" data-act="like" data-v="' + p.id + '">' + I.heart(liked) + '<span>' + (p.likes + (liked ? 1 : 0)) + '</span></button>' +
      '<button data-act="comment" data-v="' + p.id + '">' + I.comment() + '<span>' + p.comments + '</span></button>' +
      '<button data-act="share">' + I.share() + '</button></div></article>';
  }
  function obFeedHTML() {
    if (S.obTab === 'news') {
      return D.news.map(function (n) { return '<div class="news"><div class="src">' + n.src + ' · ' + n.t + '</div><div class="ttl">' + n.title + '</div></div>'; }).join('');
    }
    if (S.obTab === 'following') {
      return emptyHTML('Follow traders to see their posts here', '<div style="margin-top:16px"><button class="btn" data-act="obTab" data-v="foryou">Discover traders</button></div>');
    }
    return S.posts.map(postHTML).join('');
  }

  // ================================================================ ASSETS
  function renderAssets() {
    var acts = [['deposit', 'Deposit', I.deposit()], ['withdraw', 'Withdraw', I.withdraw()], ['transfer', 'Transfer', I.transfer()], ['earn', 'Earn', I.earn()]];
    return '<div class="assets-top">' + balBlock('', true) + '</div>' +
      '<div class="actions">' + acts.map(function (a) {
        return '<button class="act" ' + (a[0] === 'earn' ? 'data-go="earn"' : 'data-act="' + a[0] + '"') + '><span class="c">' + a[2] + '</span><span class="l">' + a[1] + '</span></button>';
      }).join('') + '</div>' +
      '<button class="dex' + (S.dexOn ? ' gone' : '') + '" data-act="dex" id="dexCard"><div class="ttl">Enable DEX trading</div><div class="sub">Trade DEX tokens on the Exchange</div><div class="art">' + WALLET + '</div></button>' +
      '<div class="sec-hd portfolio-hd"><h2>Portfolio</h2><button class="tap" data-act="filter">' + I.sliders() + '</button></div>' +
      '<div class="pcards hscroll">' + ['funding', 'trading', 'earn'].map(function (a) {
        var ic = a === 'funding' ? I.bag() : a === 'trading' ? I.transfer(11) : I.earn(11);
        return '<button class="pcard" data-go="account/' + a + '"><div class="ic">' + ic + '</div><div class="lab">' + ACCTS[a] + '</div><div class="amt" data-b="acct:' + a + '">' + fB(acctBtc(a)) + '</div></button>';
      }).join('') + '</div>' +
      '<div class="sec-hd crypto-hd"><h3>Crypto</h3><button data-act="cryptoToggle" class="' + (S.cryptoOpen ? '' : 'collapsed') + '">' + I.chevUp() + '</button></div>' +
      '<div id="cryptoList"' + (S.cryptoOpen ? '' : ' style="display:none"') + '>' + cryptoListHTML() + '</div>';
  }
  function aprFor(s) {
    var e = D.earn.filter(function (x) { return x.s === s; })[0];
    return e ? Math.round(e.apr * 100) : 0;
  }
  function assetRow(s) {
    var apr = aprFor(s);
    return '<div class="arow" data-go="asset/' + s + '"><span class="ci">' + I.coin(s, 30) + '</span>' +
      '<div class="grow"><div class="sym">' + s + (apr ? '<span class="apr">Up to ' + apr + '% APR</span>' : '') + '</div><div class="qty" data-b="hold:' + s + '">' + fAmt(hold(s)) + '</div></div>' +
      '<div class="val" data-b="holdv:' + s + '">' + fB(toBtc(s, hold(s))) + '</div></div>';
  }
  function cryptoListHTML() {
    var syms = heldSyms().filter(function (s) { return !S.hideSmall || hold(s) * S.coins[s].p >= 1; });
    return '<div class="colh2"><span>Name/Amount</span><span class="r">Value/Spot PnL</span></div>' + syms.map(assetRow).join('');
  }
  function rerenderCrypto() {
    var l = $('#cryptoList');
    if (l) { l.innerHTML = cryptoListHTML(); refresh(l); }
  }

  // ================================================================ PAGES
  function shell(title, body, right) {
    return '<header class="navbar"><div class="navbar-in"><button class="nav-btn tap" data-act="back" aria-label="Back">' + I.chevL() + '</button>' +
      '<div class="nav-title">' + title + '</div><div style="width:40px;display:flex;justify-content:flex-end">' + (right || '') + '</div></div></header>' + body;
  }

  var ABOUT = {
    BTC: 'Bitcoin is the first decentralized cryptocurrency — a peer-to-peer electronic cash system with a fixed supply of 21 million coins.',
    ETH: 'Ethereum is a programmable blockchain for smart contracts and decentralized apps. ETH pays for computation and secures the network through staking.',
    OKB: 'OKB is a utility token used for trading-fee discounts, launch campaigns and gas on X Layer.',
    XRP: 'XRP is the native asset of the XRP Ledger, built for fast, low-cost cross-border settlement.',
    SOL: 'Solana is a high-throughput blockchain designed for low fees and fast confirmations. SOL is used for fees and staking.',
    DOGE: 'Dogecoin started as a meme in 2013 and became one of the most widely held cryptocurrencies.',
    USDT: 'Tether (USDT) is a stablecoin designed to track the value of the US dollar.'
  };

  // [label, per-step volatility, span in ms, typical drift over the span]
  var TFS = [['15m', 0.0004, 9e5, 0.003], ['1H', 0.0008, 3.6e6, 0.008], ['4H', 0.0015, 1.44e7, 0.02], ['1D', 0.0022, 8.64e7, 0], ['1W', 0.0052, 6.048e8, 0.07]];

  function seeded(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    return function () {
      h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }

  // Seeded random walk pinned at both ends (Brownian bridge): it starts at the
  // 24h open for 1D (so the chart agrees with the 24h change) and ends at the live price.
  function series(s, tf) {
    var t = TFS.filter(function (x) { return x[0] === tf; })[0], rnd = seeded(s + tf), n = 90, w = [0];
    var c = S.coins[s], end = Math.log(c.p);
    var start = tf === '1D' ? Math.log(c.open) : end - (rnd() * 2 - 1) * t[3];
    for (var i = 1; i < n; i++) w.push(w[i - 1] + (rnd() + rnd() + rnd() - 1.5) / 0.75 * t[1]);
    var out = w.map(function (v, k) {
      var f = k / (n - 1);
      return Math.exp(start + (end - start) * f + v - f * w[n - 1]);
    });
    return { data: out, step: t[2] / (n - 1) };
  }

  function drawChart(svg, ser) {
    var box = svg.parentNode, w = box.clientWidth || 360, h = box.clientHeight || 240, d = ser.data, n = d.length;
    var mn = Math.min.apply(null, d), mx = Math.max.apply(null, d), pad = (mx - mn) * 0.12 || mx * 0.001;
    mn -= pad; mx += pad;
    var X = function (i) { return i / (n - 1) * (w - 56); };
    var Y = function (v) { return h - 18 - (v - mn) / (mx - mn) * (h - 30); };
    var up = d[n - 1] >= d[0], col = up ? '#5cb865' : '#e2566e';
    var line = d.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join('');
    var grid = '';
    for (var g = 0; g < 4; g++) {
      var gv = mn + (mx - mn) * (g + 0.5) / 4, gy = Y(gv);
      grid += '<line x1="0" x2="' + (w - 56) + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '" stroke="#161616"/><text x="' + (w - 4) + '" y="' + (gy + 3.5).toFixed(1) + '" text-anchor="end" font-size="10" fill="#666" font-family="Inter">' + fP(gv) + '</text>';
    }
    var ly = Y(d[n - 1]);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.innerHTML = '<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".28"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient></defs>' + grid +
      '<path d="' + line + 'L' + X(n - 1).toFixed(1) + ' ' + (h - 18) + 'L0 ' + (h - 18) + 'Z" fill="url(#cg)"/>' +
      '<path d="' + line + '" fill="none" stroke="' + col + '" stroke-width="1.7" stroke-linejoin="round"/>' +
      '<line x1="0" x2="' + (w - 56) + '" y1="' + ly.toFixed(1) + '" y2="' + ly.toFixed(1) + '" stroke="' + col + '" stroke-dasharray="2 3" opacity=".6"/>' +
      '<rect x="' + (w - 54) + '" y="' + (ly - 9).toFixed(1) + '" width="54" height="18" rx="3" fill="' + col + '"/><text x="' + (w - 27) + '" y="' + (ly + 3.6).toFixed(1) + '" text-anchor="middle" font-size="10" font-weight="600" fill="#fff" font-family="Inter">' + fP(d[n - 1]) + '</text>' +
      '<circle cx="' + X(n - 1).toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="3" fill="' + col + '"><animate attributeName="r" values="3;5;3" dur="1.6s" repeatCount="indefinite"/></circle>' +
      '<g id="scrub" style="display:none"><line id="sx" y1="0" y2="' + (h - 18) + '" stroke="#777" stroke-dasharray="3 3"/><circle id="sd" r="4" fill="#fff" stroke="' + col + '" stroke-width="2"/></g>';
    svg._geo = { X: X, Y: Y, n: n, w: w };
  }

  var PAGES = {};

  PAGES.coin = {
    render: function (s) {
      var c = S.coins[s];
      if (!c || c.stable) return shell('Market', emptyHTML('Market not found'));
      return shell(s + '/USDT<small>' + esc(c.n) + ' · Spot</small>',
        '<div class="cd-price"><div class="p" data-b="p:' + s + '">' + fP(c.p) + '</div>' +
        '<div class="s"><span class="' + cls(c.c) + '" data-b="ct:' + s + '">' + fPct(c.c) + '</span><span class="muted" data-b="u:' + s + '">' + fU(c.p) + '</span></div></div>' +
        '<div class="cd-stats"><div>24h high<b data-b="hi:' + s + '">' + fP(c.hi) + '</b></div><div>24h low<b data-b="lo:' + s + '">' + fP(c.lo) + '</b></div>' +
        '<div>24h vol (' + s + ')<b data-b="vb:' + s + '"></b></div><div>24h vol (USDT)<b data-b="v:' + s + '">' + fV(c.v) + '</b></div></div>' +
        '<div class="tf">' + TFS.map(function (t) { return '<button class="' + (t[0] === '1D' ? 'on' : '') + '" data-act="tf" data-v="' + t[0] + '">' + t[0] + '</button>'; }).join('') + '</div>' +
        '<div class="chartbox"><div class="chart-tip"></div><svg preserveAspectRatio="none"></svg></div>' +
        '<div class="about"><h3>About ' + esc(c.n) + '</h3><p>' + (ABOUT[s] || esc(c.n) + ' (' + s + ') trades on spot markets against USDT.') + '</p></div>' +
        '<div class="bottombar"><button class="btn buy" data-act="tradeGo" data-v="buy:' + s + '">Buy</button><button class="btn sell" data-act="tradeGo" data-v="sell:' + s + '">Sell</button></div>',
        '<button class="nav-btn tap" data-act="fav" data-v="' + s + '">' + I.star(S.favs.indexOf(s) >= 0) + '</button>');
    },
    cls: 'has-bar',
    mount: function (el, s) {
      if (!S.coins[s] || S.coins[s].stable) return;
      el._tf = '1D';
      el._ser = series(s, '1D');
      var svg = $('.chartbox svg', el), box = $('.chartbox', el), tip = $('.chart-tip', el);
      setTimeout(function () { drawChart(svg, el._ser); }, 30);
      var scrub = function (x) {
        var g = svg._geo; if (!g) return;
        var r = box.getBoundingClientRect(), i = Math.round(Math.max(0, Math.min(1, (x - r.left) / (g.w - 56))) * (g.n - 1));
        var v = el._ser.data[i], px = g.X(i), py = g.Y(v);
        var sg = $('#scrub', svg); sg.style.display = '';
        $('#sx', svg).setAttribute('x1', px); $('#sx', svg).setAttribute('x2', px);
        $('#sd', svg).setAttribute('cx', px); $('#sd', svg).setAttribute('cy', py);
        var t = new Date(Date.now() - (g.n - 1 - i) * el._ser.step), z = function (n) { return (n < 10 ? '0' : '') + n; };
        tip.innerHTML = '<b>' + fP(v) + '</b> <span class="muted">' + z(t.getMonth() + 1) + '/' + z(t.getDate()) + ' ' + z(t.getHours()) + ':' + z(t.getMinutes()) + '</span>';
        tip.style.left = Math.max(60, Math.min(r.width - 60, px)) + 'px';
        tip.classList.add('on');
      };
      var end = function () { tip.classList.remove('on'); var sg = $('#scrub', svg); if (sg) sg.style.display = 'none'; };
      var edge = false;
      box.addEventListener('pointerdown', function (e) {
        edge = e.clientX - app.getBoundingClientRect().left < 28;   // leave the left edge to swipe-back
        if (!edge) scrub(e.clientX);
      });
      box.addEventListener('pointermove', function (e) {
        if (edge || (sw && sw.on)) { end(); return; }
        if (e.pressure > 0 || e.pointerType === 'mouse' && e.buttons) scrub(e.clientX);
      });
      box.addEventListener('pointerup', end);
      box.addEventListener('pointerleave', end);
      box.addEventListener('pointercancel', end);
      refresh(el);
    },
    tick: function (el, s) {
      if (!el._ser) return;
      el._ser.data[el._ser.data.length - 1] = S.coins[s].p;
      if (!$('.chart-tip.on', el)) drawChart($('.chartbox svg', el), el._ser);
    }
  };

  PAGES.search = {
    render: function () {
      return '<header class="navbar"><div class="navbar-in" style="gap:12px;padding:0 var(--g)"><div class="search-in">' + I.search() +
        '<input id="sq" placeholder="Search crypto" autocomplete="off" autocorrect="off" spellcheck="false"></div>' +
        '<button class="tap" data-act="back" style="font-size:15px;color:var(--grey-3)">Cancel</button></div></header><div id="sres"></div>';
    },
    mount: function (el) {
      var q = $('#sq', el), res = $('#sres', el);
      var draw = function () {
        var v = q.value.trim().toUpperCase();
        if (!v) {
          var hot = listFor('hot').slice(0, 8);
          res.innerHTML = '<div class="label-sm">Hot searches</div><div class="hot">' + hot.map(function (s) {
            return '<button data-go="coin/' + s + '">' + I.coin(s, 16) + s + '</button>';
          }).join('') + '</div><div class="label-sm">Top volume</div>' +
            S.order.filter(function (s) { return !S.coins[s].tradfi; }).slice().sort(function (a, b) { return S.coins[b].v - S.coins[a].v; }).slice(0, 8).map(function (s) { return mrow(s); }).join('');
        } else {
          var l = S.order.filter(function (s) { return s.indexOf(v) >= 0 || S.coins[s].n.toUpperCase().indexOf(v) >= 0; });
          res.innerHTML = l.length ? l.map(function (s) { return mrow(s); }).join('') : emptyHTML('No results for “' + esc(q.value.trim()) + '”');
        }
      };
      q.addEventListener('input', draw);
      draw();
      setTimeout(function () { try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); } }, 380);
    }
  };

  PAGES.menu = {
    render: function () {
      var items = [
        ['deposit', 'Deposit', I.deposit(), 'act'], ['withdraw', 'Withdraw', I.withdraw(), 'act'], ['transfer', 'Transfer', I.transfer(), 'act'], ['earn', 'Earn', I.earn(), 'go'],
        ['explore', 'Markets', I.tabExplore(), 'tab'], ['trade', 'Trade', I.chart(), 'tab'], ['orbit', 'Orbit', I.tabOrbit(false), 'tab'], ['rewards', 'Rewards', I.gift(), 'go'],
        ['notifications', 'Inbox', I.bell(), 'go'], ['search', 'Search', I.search(18), 'go'], ['bills', 'Bills', I.history(), 'go'], ['assets', 'Assets', I.tabAssets(), 'tab']
      ];
      return shell('',
        '<div class="profile"><div class="avatar" style="background:var(--lime)">T</div><div><div style="font-size:18px;font-weight:700">Trader</div>' +
        '<div class="muted" style="font-size:12px;margin-top:4px">UID 5810****2793</div></div></div>' +
        '<div class="menu-grid">' + items.map(function (it) {
          var attr = it[3] === 'act' ? 'data-act="' + it[0] + '"' : it[3] === 'tab' ? 'data-act="tab" data-v="' + it[0] + '"' : 'data-go="' + it[0] + '"';
          return '<button ' + attr + '><span class="mi">' + it[2] + '</span>' + it[1] + '</button>';
        }).join('') + '</div>' +
        '<div class="label-sm" style="margin-top:14px">Preferences</div>' +
        '<div class="lrow" data-act="hide"><div class="grow t1">Hide balances</div><span class="sw" data-b="sw:hide"></span></div>' +
        '<div class="lrow" data-act="ccy"><div class="grow t1">Display currency</div><span class="muted" data-b="unit">' + S.ccy + '</span>' + I.chevR() + '</div>' +
        '<div class="lrow" data-act="toggleSmall"><div class="grow t1">Hide small assets</div><span class="sw" data-b="sw:hideSmall"></span></div>');
    },
    mount: function (el) { refresh(el); }
  };

  PAGES.notifications = {
    render: function () {
      return shell('Inbox', D.notifications.map(function (n) {
        return '<div class="lrow" style="align-items:flex-start"><div class="em-ic" style="width:36px;height:36px;border-radius:50%;background:var(--tile);display:flex;align-items:center;justify-content:center;flex:none;color:#fff">' + I.bell() + '</div>' +
          '<div class="grow"><div class="t1">' + n.title + '</div><div class="t2">' + n.body + '</div><div class="t2" style="color:#666">' + n.t + '</div></div></div>';
      }).join(''));
    }
  };

  PAGES.rewards = {
    render: function () {
      var done = D.rewards.filter(function (r) { return r.done; }).length;
      return shell('Rewards',
        '<div class="card" style="margin-top:8px"><div class="muted" style="font-size:12.5px">Tasks completed</div><div style="font-size:26px;font-weight:700;margin-top:6px">' + done + ' / ' + D.rewards.length + '</div>' +
        '<div style="height:6px;border-radius:3px;background:#333;margin-top:14px;overflow:hidden"><div style="height:100%;width:' + (done / D.rewards.length * 100) + '%;background:var(--lime)"></div></div></div>' +
        '<div class="label-sm">Tasks</div>' + D.rewards.map(function (r, i) {
          return '<div class="task' + (r.done ? ' done' : '') + '" data-act="task" data-v="' + i + '"><span class="ck">' + (r.done ? I.check() : '') + '</span><div class="grow"><div style="font-size:14.5px;font-weight:500">' + r.title + '</div>' +
            '<div class="muted" style="font-size:12px;margin-top:4px">' + r.reward + '</div></div>' + (r.done ? '<span class="muted" style="font-size:12px">Done</span>' : I.chevR()) + '</div>';
        }).join(''));
    }
  };

  PAGES.earn = {
    render: function () {
      return shell('Simple Earn',
        '<div class="card" style="margin-top:8px"><div class="muted" style="font-size:12.5px">Earn balance</div><div style="font-size:26px;font-weight:700;margin-top:6px" data-b="acct:earn"></div>' +
        '<div class="muted" style="font-size:12px;margin-top:6px" data-b="acctu:earn"></div></div>' +
        '<div id="earnPos"></div><div class="label-sm">Products</div>' +
        D.earn.map(function (p) {
          return '<div class="lrow"><span>' + I.coin(p.s, 32) + '</span><div class="grow"><div class="t1">' + p.s + '</div><div class="t2">' + p.term + ' · ' + p.note + '</div></div>' +
            '<div class="end"><div class="t1 up">' + (p.apr * 100).toFixed(2) + '%</div><div class="t2">APR</div></div>' +
            '<button class="btn" style="height:30px;padding:0 12px;font-size:12.5px;margin-left:4px" data-act="subscribe" data-v="' + p.s + '">Subscribe</button></div>';
        }).join(''));
    },
    mount: function (el) { PAGES.earn.update(el); refresh(el); },
    update: function (el) {
      var pos = $('#earnPos', el);
      if (!pos) return;
      var syms = Object.keys(S.bal.earn).filter(function (s) { return S.bal.earn[s] > 0; });
      pos.innerHTML = syms.length ? '<div class="label-sm">Your positions</div>' + syms.map(function (s) {
        return '<div class="lrow"><span>' + I.coin(s, 32) + '</span><div class="grow"><div class="t1">' + s + '</div><div class="t2" data-b="ah:earn.' + s + '"></div></div>' +
          '<button class="btn dark" style="height:30px;padding:0 12px;font-size:12.5px" data-act="redeem" data-v="' + s + '">Redeem</button></div>';
      }).join('') : '';
      refresh(pos);
    }
  };

  PAGES.account = {
    render: function (a) {
      if (!ACCTS[a]) return shell('Account', emptyHTML('Unknown account'));
      return shell(ACCTS[a] + ' account',
        '<div class="card" style="margin-top:8px"><div class="muted" style="font-size:12.5px">Total value</div><div style="font-size:26px;font-weight:700;margin-top:6px" data-b="acct:' + a + '"></div>' +
        '<div class="muted" style="font-size:12px;margin-top:6px" data-b="acctu:' + a + '"></div>' +
        '<div style="display:flex;gap:10px;margin-top:16px"><button class="btn" data-act="transfer">Transfer</button>' +
        (a === 'earn' ? '<button class="btn dark" data-go="earn">Simple Earn</button>' : '<button class="btn dark" data-act="tab" data-v="trade">Trade</button>') + '</div></div>' +
        '<div class="label-sm">Assets</div>' + heldSyms().map(function (s) {
          return '<div class="lrow" data-go="asset/' + s + '"><span>' + I.coin(s, 30) + '</span><div class="grow"><div class="t1">' + s + '</div><div class="t2">' + esc(S.coins[s].n) + '</div></div>' +
            '<div class="end"><div class="t1" data-b="ah:' + a + '.' + s + '"></div></div></div>';
        }).join(''));
    },
    mount: function (el) { refresh(el); }
  };

  PAGES.asset = {
    render: function (s) {
      if (!S.coins[s]) return shell('Asset', emptyHTML('Unknown asset'));
      return shell(s,
        '<div class="cd-price" style="display:flex;align-items:center;gap:14px;padding-top:12px">' + I.coin(s, 44) +
        '<div><div class="p" style="font-size:26px" data-b="hold:' + s + '"></div><div class="muted" style="margin-top:4px" data-b="holdu:' + s + '"></div></div></div>' +
        '<div class="label-sm" style="margin-top:10px">Distribution</div>' + ['funding', 'trading', 'earn'].map(function (a) {
          return '<div class="lrow" data-go="account/' + a + '"><div class="grow t1">' + ACCTS[a] + '</div><div class="end"><div class="t1" data-b="ah:' + a + '.' + s + '"></div></div>' + I.chevR() + '</div>';
        }).join('') +
        (s !== 'USDT' ? '<div class="label-sm">Market</div>' + mrow(s) : '') +
        '<div class="bottombar"><button class="btn dark" data-act="transfer" data-v="' + s + '">Transfer</button>' +
        '<button class="btn" data-act="tradeGo" data-v="buy:' + (s === 'USDT' ? 'BTC' : s) + '">Trade</button></div>');
    },
    cls: 'has-bar',
    mount: function (el) { refresh(el); }
  };

  PAGES.bills = {
    render: function () {
      return shell('Bills', '<div class="chips hscroll" style="padding-top:6px" id="billTabs"></div><div id="billList" style="margin-top:8px"></div>');
    },
    mount: function (el) { PAGES.bills.update(el); },
    update: function (el) {
      var tabs = [['all', 'All'], ['trade', 'Trade'], ['transfer', 'Transfer'], ['earn', 'Earn']];
      $('#billTabs', el).innerHTML = tabs.map(function (t) { return '<button class="chip sm' + (S.billsTab === t[0] ? ' on' : '') + '" data-act="billsTab" data-v="' + t[0] + '">' + t[1] + '</button>'; }).join('');
      var l = S.history.filter(function (h) { return S.billsTab === 'all' || h.kind === S.billsTab; });
      $('#billList', el).innerHTML = l.length ? l.map(function (h) {
        var title, sub, amt;
        if (h.kind === 'trade') { title = (h.side === 'buy' ? 'Buy ' : 'Sell ') + h.sym; sub = 'Spot · ' + fP(h.price) + ' USDT'; amt = (h.side === 'buy' ? '+' : '-') + trim(h.amount.toFixed(6)) + ' ' + h.sym; }
        else if (h.kind === 'transfer') { title = 'Transfer'; sub = ACCTS[h.from] + ' → ' + ACCTS[h.to]; amt = fQty(h.amount) + ' ' + h.sym; }
        else { title = h.redeem ? 'Redeem' : 'Subscribe'; sub = 'Simple Earn'; amt = fQty(h.amount) + ' ' + h.sym; }
        return '<div class="lrow"><span>' + I.coin(h.sym, 30) + '</span><div class="grow"><div class="t1">' + title + '</div><div class="t2">' + sub + ' · ' + h.time + '</div></div><div class="end"><div class="t1">' + amt + '</div></div></div>';
      }).join('') : emptyHTML('No records yet');
    }
  };

  // ================================================================ ROUTER
  var base, screens = {}, tabbar, fab, curTab = 'home', stack = [], seq = 0, pendingTab = null;

  function buildShell() {
    base = document.createElement('div');
    base.className = 'layer';
    var html = TABS.map(function (t) { return '<section class="screen" id="tab-' + t + '"></section>'; }).join('') +
      '<button class="fab-post hide" data-act="compose" aria-label="New post">' + I.plus() + '</button>' +
      '<nav class="tabbar">' +
      '<button class="tab" data-tab="home"><span class="ic">' + I.tabOkx() + '</span><span class="lbl">OKX</span></button>' +
      '<button class="tab" data-tab="explore"><span class="ic">' + I.tabExplore() + '</span><span class="lbl">Explore</span></button>' +
      '<button class="tab tab-trade" data-tab="trade"><span class="fab">' + I.tabTrade() + '</span><span class="lbl">Trade</span></button>' +
      '<button class="tab" data-tab="orbit"><span class="ic orbit" id="orbitIc">' + I.tabOrbit(true) + '</span><span class="lbl">Orbit</span></button>' +
      '<button class="tab" data-tab="assets"><span class="ic">' + I.tabAssets() + '</span><span class="lbl">Assets</span></button>' +
      '</nav>';
    base.innerHTML = html;
    app.appendChild(base);
    TABS.forEach(function (t) { screens[t] = $('#tab-' + t, base); });
    tabbar = $('.tabbar', base);
    fab = $('.fab-post', base);
    var toastEl = document.createElement('div');
    toastEl.className = 'toast';
    app.appendChild(toastEl);

    screens.home.innerHTML = renderHome();
    screens.explore.innerHTML = renderExplore();
    screens.trade.innerHTML = renderTrade();
    screens.orbit.innerHTML = renderOrbit();
    screens.assets.innerHTML = renderAssets();
    renderTradeMain();
    mountHome(screens.home);

    tabbar.addEventListener('click', function (e) {
      var b = e.target.closest('.tab');
      if (!b) return;
      var t = b.getAttribute('data-tab');
      if (t === curTab) screens[t].scrollTo({ top: 0, behavior: 'smooth' });
      else setTabRoute(t);
    });
  }

  function setTab(t) {
    curTab = t;
    TABS.forEach(function (x) { screens[x].classList.toggle('on', x === t); });
    $$('.tab', tabbar).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === t); });
    fab.classList.toggle('hide', t !== 'orbit');
    if (t === 'orbit' && !S.obSeen) { S.obSeen = true; $('#orbitIc').innerHTML = I.tabOrbit(false); }
    if (t === 'trade') { renderBook(); trRecalc(); }
    if (t === 'home') positionKnob();
    refresh(screens[t]);
  }

  function setTabRoute(t) {
    history.replaceState({ tab: t }, '', '#/' + t);
    setTab(t);
  }

  function goTab(t) {
    if (stack.length) { pendingTab = t; history.go(-stack.length); }
    else setTabRoute(t);
  }

  function go(route) {
    var name = route.split('/')[0];
    if (TABS.indexOf(name) >= 0) { goTab(name); return; }
    var k = ++seq;
    history.pushState({ k: k, route: route }, '', '#/' + route);
    pushPage(route, k, true);
  }

  function underOf(i) { return i > 0 ? stack[i - 1].el : base; }

  function pushPage(route, k, animate) {
    var parts = route.split('/'), name = parts[0], arg = decodeURIComponent(parts.slice(1).join('/'));
    var def = PAGES[name];
    if (!def) { toast('Page not found'); return; }
    var el = document.createElement('section');
    el.className = 'page' + (def.cls ? ' ' + def.cls : '');
    el.innerHTML = def.render(arg);
    var nav = $('.navbar', el), bar = $('.bottombar', el), sc = document.createElement('div');
    sc.className = 'page-scroll';
    Array.prototype.slice.call(el.childNodes).forEach(function (n) { if (n !== nav && n !== bar) sc.appendChild(n); });
    el.insertBefore(sc, bar || null);
    app.insertBefore(el, $('.toast', app));
    var entry = { k: k, route: route, el: el, def: def, arg: arg };
    stack.push(entry);
    var under = underOf(stack.length - 1);
    if (def.mount) def.mount(el, arg);
    if (animate === false) { el.classList.add('in'); under.classList.add('behind'); return; }
    el.getBoundingClientRect();
    requestAnimationFrame(function () {
      el.classList.add('in');
      under.classList.add('behind');
    });
  }

  function popTo(i) {
    // keep stack[0..i], remove the rest; animate only the top one
    while (stack.length > i + 1) {
      var e = stack.pop(), isTop = stack.length === i + 1;
      var under = underOf(stack.length);
      under.style.transform = ''; under.style.filter = '';
      if (isTop) {
        under.classList.remove('behind');
        e.el.style.transform = '';
        e.el.classList.remove('in', 'behind', 'dragging');
        (function (node) { setTimeout(function () { node.remove(); }, 450); })(e.el);
      } else {
        under.classList.remove('behind');
        e.el.remove();
      }
    }
    var top = stack[stack.length - 1];
    if (top && top.def.update) top.def.update(top.el, top.arg);
    if (top) refresh(top.el); else refresh(screens[curTab]);
  }

  window.addEventListener('popstate', function (e) {
    var st = e.state || {};
    if (st.k) {
      var i = -1;
      for (var j = 0; j < stack.length; j++) if (stack[j].k === st.k) i = j;
      if (i >= 0) popTo(i);
      else pushPage(st.route, st.k, true);
      return;
    }
    popTo(-1);
    var t = pendingTab || st.tab || (location.hash.replace(/^#\/?/, '').split('/')[0]);
    pendingTab = null;
    if (TABS.indexOf(t) < 0) t = curTab;
    setTabRoute(t);
  });

  function back() {
    if (stack.length) history.back();
  }

  // ---- edge swipe back ----
  var sw = null;
  app.addEventListener('touchstart', function (e) {
    if (!stack.length || e.touches.length > 1) return;
    var top = stack[stack.length - 1], t = e.touches[0];
    var left = app.getBoundingClientRect().left;
    if (!top.el.contains(e.target) || t.clientX - left > 28) return;
    sw = { x0: t.clientX, y0: t.clientY, top: top, under: underOf(stack.length - 1), w: app.clientWidth, on: false, t0: Date.now(), dx: 0 };
  }, { passive: true });
  app.addEventListener('touchmove', function (e) {
    if (!sw) return;
    var t = e.touches[0], dx = t.clientX - sw.x0, dy = t.clientY - sw.y0;
    if (!sw.on) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        sw.on = true;
        sw.top.el.classList.add('dragging');
        sw.under.classList.add('dragging');
      } else if (Math.abs(dy) > 10) { sw = null; return; }
      else return;
    }
    e.preventDefault();
    sw.dx = Math.max(0, dx);
    var f = sw.dx / sw.w;
    sw.top.el.style.transform = 'translateX(' + sw.dx + 'px)';
    sw.under.style.transform = 'translateX(' + (-28 + 28 * f) + '%)';
    sw.under.style.filter = 'brightness(' + (0.55 + 0.45 * f) + ')';
  }, { passive: false });
  app.addEventListener('touchend', function () {
    if (!sw) return;
    var s = sw;
    sw = null;
    if (!s.on) return;
    s.top.el.classList.remove('dragging');
    s.under.classList.remove('dragging');
    var v = s.dx / Math.max(1, Date.now() - s.t0);
    if (s.dx > s.w * 0.33 || v > 0.6) {
      s.top.el.style.transform = 'translateX(100%)';
      s.under.style.transform = '';
      s.under.style.filter = '';
      s.under.classList.remove('behind');
      history.back();
    } else {
      s.top.el.style.transform = '';
      s.under.style.transform = '';
      s.under.style.filter = '';
    }
  });

  // ================================================================ SHEETS & TOAST
  var sheets = [];
  function sheet(title, body, onMount) {
    var bd = document.createElement('div'), sh = document.createElement('div');
    bd.className = 'backdrop';
    sh.className = 'sheet';
    sh.innerHTML = '<div class="grab"><i></i></div>' + (title ? '<div class="sh-hd"><h4>' + title + '</h4><button class="tap" data-close aria-label="Close">' + I.close() + '</button></div>' : '') + '<div class="sh-body">' + body + '</div>';
    app.appendChild(bd);
    app.appendChild(sh);
    var closed = false;
    var close = function () {
      if (closed) return;
      closed = true;
      bd.classList.remove('on');
      sh.classList.remove('on');
      sh.style.transform = '';
      sheets = sheets.filter(function (x) { return x !== close; });
      setTimeout(function () { bd.remove(); sh.remove(); }, 400);
    };
    sheets.push(close);
    bd.addEventListener('click', close);
    sh.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
    // drag down to dismiss
    var y0 = null, dy = 0;
    $$('.grab, .sh-hd', sh).forEach(function (h) {
      h.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; dy = 0; sh.classList.add('dragging'); }, { passive: true });
      h.addEventListener('touchmove', function (e) { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
      h.addEventListener('touchend', function () { sh.classList.remove('dragging'); if (dy > 90) close(); else sh.style.transform = ''; y0 = null; });
    });
    sh.getBoundingClientRect();
    requestAnimationFrame(function () { bd.classList.add('on'); sh.classList.add('on'); });
    if (onMount) onMount(sh, close);
    return close;
  }
  function closeSheet() { if (sheets.length) sheets[sheets.length - 1](); }

  var toastT;
  function toast(msg) {
    var t = $('.toast', app);
    t.innerHTML = I.check() + '<span>' + esc(msg) + '</span>';
    t.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('on'); }, 1900);
  }

  function coinPickSheet(title, act, syms) {
    sheet(title, '<div style="padding:0 var(--g) 10px"><div class="search-in"><span style="color:#fff">' + I.search() + '</span><input class="cps" placeholder="Search" autocomplete="off"></div></div><div class="cpl"></div>', function (sh) {
      var inp = $('.cps', sh), list = $('.cpl', sh);
      var draw = function () {
        var v = inp.value.trim().toUpperCase();
        var l = syms.filter(function (s) { return !v || s.indexOf(v) >= 0 || S.coins[s].n.toUpperCase().indexOf(v) >= 0; });
        list.innerHTML = l.map(function (s) {
          var c = S.coins[s];
          return '<div class="opt" data-act="' + act + '" data-v="' + s + '"><span class="row-flex" style="gap:12px">' + I.coin(s, 28) + '<span><div style="font-weight:600">' + s + '</div><div class="sub">' + esc(c.n) + '</div></span></span>' +
            (c.stable ? '' : '<span class="num" style="text-align:right"><div style="font-size:14px">' + fP(c.p) + '</div><div class="sub ' + cls(c.c) + '">' + fPct(c.c) + '</div></span>') + '</div>';
        }).join('') || emptyHTML('No results');
      };
      inp.addEventListener('input', draw);
      draw();
    });
  }

  function transferSheet(preset) {
    var st = { from: 'trading', to: 'funding', sym: preset && S.coins[preset] && (preset === 'BTC' || preset === 'USDT') ? preset : 'BTC' };
    sheet('Transfer', '<div class="xfer"><div class="box"><span class="k">From</span><span class="v grow" data-x="fromL"></span></div>' +
      '<button class="swapbtn tap" data-x="swap">' + I.swap() + '</button>' +
      '<div class="box"><span class="k">To</span><span class="v grow" data-x="toL"></span></div>' +
      '<div class="amt"><div class="k"><span>Amount</span><button class="coinsel tap" data-x="coin"></button></div>' +
      '<div class="in"><input class="xin" inputmode="decimal" placeholder="0.00" autocomplete="off"><button class="max" data-x="max">Max</button></div>' +
      '<div class="k" style="margin-top:8px"><span>Available</span><span class="xav num"></span></div></div>' +
      '<button class="btn lg" style="margin-top:18px" data-x="ok">Confirm</button></div>', function (sh, close) {
      var inp = $('.xin', sh);
      var av = function () { return st.from === 'trading' ? avail(st.sym) : (S.bal[st.from][st.sym] || 0); };
      var draw = function () {
        $('[data-x="fromL"]', sh).textContent = ACCTS[st.from];
        $('[data-x="toL"]', sh).textContent = ACCTS[st.to];
        $('[data-x="coin"]', sh).innerHTML = I.coin(st.sym, 20) + st.sym + I.caretLg();
        $('.xav', sh).textContent = fQty(av()) + ' ' + st.sym;
      };
      draw();
      sh.addEventListener('click', function (e) {
        var x = e.target.closest('[data-x]');
        if (!x) return;
        var k = x.getAttribute('data-x');
        if (k === 'swap') { var t = st.from; st.from = st.to; st.to = t; inp.value = ''; draw(); }
        if (k === 'coin') { st.sym = st.sym === 'BTC' ? 'USDT' : 'BTC'; inp.value = ''; draw(); }
        if (k === 'max') { inp.value = fQty(av()); }
        if (k === 'ok') {
          var a = parseFloat(inp.value) || 0;
          if (a <= 0) { toast('Enter an amount'); return; }
          if (a > av() + 1e-12) { toast('Insufficient balance'); return; }
          S.bal[st.from][st.sym] -= a;
          S.bal[st.to][st.sym] = (S.bal[st.to][st.sym] || 0) + a;
          S.history.unshift({ kind: 'transfer', sym: st.sym, amount: a, from: st.from, to: st.to, time: nowStr() });
          close();
          toast('Transfer completed');
          afterBalance();
        }
      });
    });
  }

  function earnSheet(sym, redeem) {
    var src = function () { return redeem ? (S.bal.earn[sym] || 0) : avail(sym) + (S.bal.funding[sym] || 0); };
    var apr = (D.earn.filter(function (p) { return p.s === sym; })[0] || { apr: 0 }).apr;
    sheet((redeem ? 'Redeem ' : 'Subscribe ') + sym, '<div class="xfer">' +
      (redeem ? '' : '<div class="box" style="justify-content:space-between"><span class="muted" style="font-size:13px">Flexible APR</span><span class="v up">' + (apr * 100).toFixed(2) + '%</span></div>') +
      '<div class="amt"><div class="k"><span>Amount</span><span class="coinsel">' + I.coin(sym, 20) + sym + '</span></div>' +
      '<div class="in"><input class="xin" inputmode="decimal" placeholder="0.00" autocomplete="off"><button class="max" data-x="max">Max</button></div>' +
      '<div class="k" style="margin-top:8px"><span>' + (redeem ? 'In Earn' : 'Available') + '</span><span class="num">' + fQty(src()) + ' ' + sym + '</span></div></div>' +
      '<button class="btn lg" style="margin-top:18px" data-x="ok">' + (redeem ? 'Redeem' : 'Subscribe') + '</button></div>', function (sh, close) {
      var inp = $('.xin', sh);
      sh.addEventListener('click', function (e) {
        var x = e.target.closest('[data-x]');
        if (!x) return;
        if (x.getAttribute('data-x') === 'max') inp.value = fQty(src());
        if (x.getAttribute('data-x') === 'ok') {
          var a = parseFloat(inp.value) || 0;
          if (a <= 0) { toast('Enter an amount'); return; }
          if (a > src() + 1e-12) { toast('Insufficient balance'); return; }
          if (redeem) {
            S.bal.earn[sym] -= a;
            S.bal.funding[sym] = (S.bal.funding[sym] || 0) + a;
          } else {
            var fromT = Math.min(a, avail(sym));
            S.bal.trading[sym] = (S.bal.trading[sym] || 0) - fromT;
            S.bal.funding[sym] = (S.bal.funding[sym] || 0) - (a - fromT);
            S.bal.earn[sym] = (S.bal.earn[sym] || 0) + a;
          }
          S.history.unshift({ kind: 'earn', sym: sym, amount: a, redeem: !!redeem, time: nowStr() });
          close();
          toast(redeem ? 'Redeemed to Funding' : 'Subscribed');
          afterBalance();
        }
      });
    });
  }

  function afterBalance() {
    refresh();
    rerenderCrypto();
    trRecalc();
    var top = stack[stack.length - 1];
    if (top && top.def.update) top.def.update(top.el, top.arg);
  }

  // ================================================================ ACTIONS
  function positionKnob() {
    var seg = $('#homeSeg');
    if (!seg) return;
    var on = $('button.on', seg), knob = $('.knob', seg);
    if (!on || !on.offsetWidth) return;
    knob.style.width = on.offsetWidth + 'px';
    knob.style.transform = 'translateX(' + (on.offsetLeft - 1.7) + 'px)';
  }

  var ACT = {
    back: back,
    tab: function (v) { closeSheet(); goTab(v); },
    hide: function () { S.hide = !S.hide; store.set('hide', S.hide); refresh(); },
    ccy: function () {
      sheet('Display currency', ['BTC', 'USDT', 'USD'].map(function (c) {
        return '<div class="opt" data-act="setCcy" data-v="' + c + '"><span>' + c + '</span>' + (S.ccy === c ? '<span class="ck">' + I.check() + '</span>' : '') + '</div>';
      }).join(''));
    },
    setCcy: function (v) { S.ccy = v; store.set('ccy', v); closeSheet(); refresh(); },
    homeMode: function (v) {
      if (S.homeMode === v) return;
      S.homeMode = v;
      $$('#homeSeg button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === v); });
      positionKnob();
      var body = $('#homeBody');
      body.innerHTML = v === 'web3' ? homeWeb3() : homeExchange();
      if (v === 'exchange') mountHome(screens.home);
      refresh(body);
    },
    homeTab: function (v) {
      S.homeTab = v;
      $('#homeTabs').innerHTML = homeTabsHTML();
      $('#homeList').innerHTML = homeListHTML();
    },
    scan: function () { toast('Camera is not available here'); },
    deposit: function () { coinPickSheet('Select crypto to deposit', 'pickAsset', ['BTC', 'USDT'].concat(S.order.filter(function (s) { return s !== 'BTC' && !S.coins[s].tradfi; }))); },
    withdraw: function () { coinPickSheet('Select crypto to withdraw', 'pickAsset', heldSyms()); },
    pickAsset: function (v) { closeSheet(); setTimeout(function () { go('asset/' + v); }, 120); },
    transfer: function (v) { transferSheet(v); },
    exTab: function (v) {
      S.exTab = v;
      $('#exTabs').innerHTML = exTabsHTML();
      $('#exSub').innerHTML = exSubHTML();
      $('#exList').innerHTML = exListHTML();
    },
    exFilter: function (v) { S.exFilter = v; $('#exSub').innerHTML = exSubHTML(); $('#exList').innerHTML = exListHTML(); },
    sort: function (v) {
      if (!S.exSort || S.exSort.key !== v) S.exSort = { key: v, dir: -1 };
      else if (S.exSort.dir === -1) S.exSort.dir = 1;
      else S.exSort = null;
      $('#exList').innerHTML = exListHTML();
    },
    tmode: function (v) { S.tmode = v; $('#trTop').innerHTML = trTopHTML(); renderTradeMain(); },
    side: function (v) { S.side = v; renderTradeMain(); },
    otype: function () {
      sheet('Order type', [['limit', 'Limit', 'Buy or sell at a price you set'], ['market', 'Market', 'Fill immediately at the best price']].map(function (o) {
        return '<div class="opt" data-act="setOtype" data-v="' + o[0] + '"><span><div>' + o[1] + '</div><div class="sub">' + o[2] + '</div></span>' + (S.otype === o[0] ? '<span class="ck">' + I.check() + '</span>' : '') + '</div>';
      }).join(''));
    },
    setOtype: function (v) { S.otype = v; closeSheet(); renderTradeMain(); },
    step: function (v) {
      var inP = $('#inPrice'), c = S.coins[S.pair], d = dpOf(c.p);
      var p = (parseFloat(inP.value) || c.p) + (+v) * Math.pow(10, -d);
      inP.value = p.toFixed(d);
      S.tr.touched = true;
      trRecalc();
    },
    bookPrice: function (v) {
      var inP = $('#inPrice');
      if (!inP) return;
      inP.value = v;
      S.tr.touched = true;
      trRecalc();
    },
    pairSheet: function () { coinPickSheet('Select pair', 'pickPair', S.order.slice()); },
    pickPair: function (v) { closeSheet(); S.pair = v; renderTradeMain(); },
    placeOrder: function () {
      var s = S.pair, buy = S.side === 'buy', price = trPrice(), amt = parseFloat($('#inAmt').value) || 0;
      if (!amt || !price) { toast('Enter an amount'); return; }
      var need = buy ? price * amt : amt, have = buy ? avail('USDT') : avail(s);
      if (need > have + 1e-12) { toast('Insufficient balance'); return; }
      if (S.otype === 'market') {
        execTrade(s, S.side, price, amt);
        toast('Order filled');
      } else {
        S.orders.unshift({ id: ++seq, sym: s, side: S.side, price: price, amount: amt, time: nowStr() });
        toast('Order placed');
      }
      $('#inAmt').value = '';
      S.tr.pct = 0;
      trRecalc();
      refreshOrders();
      afterBalance();
    },
    cancelOrder: function (v) {
      S.orders = S.orders.filter(function (o) { return String(o.id) !== v; });
      refreshOrders();
      trRecalc();
      toast('Order canceled');
    },
    ordersTab: function (v) {
      S.ordersTab = v;
      $$('.tr-orders .tabsline button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === v); });
      refreshOrders();
    },
    tradeGo: function (v) {
      var p = v.split(':');
      S.side = p[0];
      S.pair = S.coins[p[1]] && !S.coins[p[1]].stable ? p[1] : 'BTC';
      renderTradeMain();
      goTab('trade');
    },
    fav: function (v, el) {
      var i = S.favs.indexOf(v);
      if (i >= 0) S.favs.splice(i, 1); else S.favs.push(v);
      store.set('favs', S.favs);
      el.innerHTML = I.star(i < 0);
      toast(i < 0 ? 'Added to favorites' : 'Removed from favorites');
      if (S.homeTab === 'fav') $('#homeList').innerHTML = homeListHTML();
      if (S.exTab === 'fav') $('#exList').innerHTML = exListHTML();
    },
    tf: function (v, el) {
      var page = el.closest('.page'), top = stack[stack.length - 1];
      if (!page || !top) return;
      $$('.tf button', page).forEach(function (b) { b.classList.toggle('on', b === el); });
      page._tf = v;
      page._ser = series(top.arg, v);
      drawChart($('.chartbox svg', page), page._ser);
    },
    obTab: function (v) {
      S.obTab = v;
      $('#obTabs').innerHTML = obTabsHTML();
      $('#obFeed').innerHTML = obFeedHTML();
    },
    like: function (v, el) {
      S.liked[v] = !S.liked[v];
      var p = S.posts.filter(function (x) { return String(x.id) === v; })[0];
      el.classList.toggle('liked', S.liked[v]);
      el.innerHTML = I.heart(S.liked[v]) + '<span>' + (p.likes + (S.liked[v] ? 1 : 0)) + '</span>';
    },
    comment: function (v) {
      sheet('Reply', '<div class="xfer"><textarea class="compose" placeholder="Write a reply…"></textarea><button class="btn lg" style="margin-top:14px" data-x="ok">Reply</button></div>', function (sh, close) {
        var ta = $('textarea', sh);
        setTimeout(function () { ta.focus(); }, 380);
        $('[data-x="ok"]', sh).addEventListener('click', function () {
          if (!ta.value.trim()) { toast('Write something first'); return; }
          var p = S.posts.filter(function (x) { return String(x.id) === v; })[0];
          if (p) p.comments++;
          close();
          $('#obFeed').innerHTML = obFeedHTML();
          toast('Reply posted');
        });
      });
    },
    share: function () {
      if (navigator.share) navigator.share({ title: 'Orbit', url: location.href }).catch(function () {});
      else toast('Link copied');
    },
    compose: function () {
      sheet('New post', '<div class="xfer"><textarea class="compose" maxlength="500" placeholder="What’s happening in the market?"></textarea><button class="btn lg" style="margin-top:14px" data-x="ok">Post</button></div>', function (sh, close) {
        var ta = $('textarea', sh);
        setTimeout(function () { ta.focus(); }, 380);
        $('[data-x="ok"]', sh).addEventListener('click', function () {
          var txt = ta.value.trim();
          if (!txt) { toast('Write something first'); return; }
          var m = txt.match(/\$([A-Za-z]{2,6})/);
          var tag = m && S.coins[m[1].toUpperCase()] ? m[1].toUpperCase() : null;
          S.posts.unshift({ id: ++seq, user: 'You', handle: '@you', t: 'now', text: txt, tag: tag, likes: 0, comments: 0 });
          close();
          ACT.obTab('foryou');
          screens.orbit.scrollTo({ top: 0, behavior: 'smooth' });
          toast('Posted');
        });
      });
    },
    dex: function () {
      sheet('Enable DEX trading', '<div class="xfer"><p class="muted" style="font-size:13.5px;line-height:20px">Trade tokens from decentralized exchanges directly in your Exchange account. Prices come from on-chain liquidity and may move quickly.</p>' +
        '<button class="btn lg" style="margin-top:18px" data-act="dexOn">Enable</button></div>');
    },
    dexOn: function () {
      S.dexOn = true;
      closeSheet();
      $('#dexCard').classList.add('gone');
      toast('DEX trading enabled');
    },
    filter: function () {
      sheet('Display', '<div class="opt" data-act="toggleSmall"><span>Hide small assets<div class="sub">Assets worth less than $1</div></span><span class="sw' + (S.hideSmall ? ' on' : '') + '" data-b="sw:hideSmall"></span></div>' +
        '<div class="opt" data-act="hide"><span>Hide balances</span><span class="sw' + (S.hide ? ' on' : '') + '" data-b="sw:hide"></span></div>');
    },
    toggleSmall: function () { S.hideSmall = !S.hideSmall; rerenderCrypto(); refresh(); },
    cryptoToggle: function (v, el) {
      S.cryptoOpen = !S.cryptoOpen;
      el.classList.toggle('collapsed', !S.cryptoOpen);
      $('#cryptoList').style.display = S.cryptoOpen ? '' : 'none';
    },
    subscribe: function (v) { earnSheet(v, false); },
    redeem: function (v) { earnSheet(v, true); },
    billsTab: function (v) {
      S.billsTab = v;
      var top = stack[stack.length - 1];
      if (top && top.def === PAGES.bills) PAGES.bills.update(top.el);
    },
    task: function (v) {
      var map = ['', '', 'trade', 'earn', ''];
      var r = D.rewards[+v];
      if (r.done) return;
      if (map[+v]) go(map[+v]);
      else toast('Invite link copied');
    }
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]');
    if (a && app.contains(a)) {
      var f = ACT[a.getAttribute('data-act')];
      if (f) { e.preventDefault(); f(a.getAttribute('data-v'), a, e); }
      return;
    }
    var g = e.target.closest('[data-go]');
    if (g && app.contains(g)) { e.preventDefault(); closeSheet(); go(g.getAttribute('data-go')); }
  });

  // ================================================================ BOOT
  function boot() {
    buildShell();
    var route = location.hash.replace(/^#\/?/, '') || 'home';
    var name = route.split('/')[0];
    if (TABS.indexOf(name) >= 0) setTabRoute(name);
    else {
      setTabRoute('home');
      if (PAGES[name]) go(route);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(positionKnob);
    setTimeout(positionKnob, 60);
    window.addEventListener('resize', function () {
      positionKnob();
      var top = stack[stack.length - 1];
      if (top && top.el._ser) drawChart($('.chartbox svg', top.el), top.el._ser);
    });
    startEngine();
  }

  boot();
})();
