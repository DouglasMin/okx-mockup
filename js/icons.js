// SVG icon set. Every function returns an SVG string.
(function () {
  var svg = function (w, h, vb, body, attrs) {
    return '<svg width="' + w + '" height="' + h + '" viewBox="' + vb + '" ' + (attrs || '') + ' aria-hidden="true">' + body + '</svg>';
  };
  var stroke = function (c, w) {
    return 'fill="none" stroke="' + (c || 'currentColor') + '" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round"';
  };

  var I = {};

  // ---- header ----
  I.grid = function () {
    var r = '';
    for (var y = 0; y < 3; y++) for (var x = 0; x < 3; x++) r += '<rect x="' + x * 7.2 + '" y="' + y * 7.2 + '" width="3.6" height="3.6" rx=".8"/>';
    return svg(18, 18, '0 0 18 18', r, 'fill="currentColor"');
  };
  I.gift = function () {
    return svg(18, 18, '0 0 18 18',
      '<rect x="1" y="5.4" width="16" height="3.8" rx=".4"/><path d="M2.2 9.2v7.6c0 .1.1.2.2.2h13.2c.1 0 .2-.1.2-.2V9.2M9 5.4V17M3.7 5.4V3.6a2.65 2.65 0 0 1 5.3 0M9 3.6a2.65 2.65 0 0 1 5.3 0v1.8"/>',
      'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"');
  };
  I.inbox = function () {
    return svg(20, 20, '0 0 20 20',
      '<path d="M6.6 14.7H2.9c-1 0-1.9-.8-1.9-1.9V2.9C1 1.9 1.8 1 2.9 1h14.2c1 0 1.9.8 1.9 1.9v9.9c0 1-.8 1.9-1.9 1.9h-3.7M1 5.2h18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>' +
      '<path d="M10 12l3.4 3.7H6.6z" fill="currentColor" stroke="currentColor" stroke-width=".8" stroke-linejoin="round"/><rect x="9.05" y="15.2" width="1.9" height="4.8" fill="currentColor"/>');
  };
  I.search = function (s) {
    s = s || 16;
    return svg(s, s, '0 0 16 16', '<circle cx="6.7" cy="6.7" r="5.6"/><path d="M10.9 10.9l3.9 3.9"/>', stroke(null, 2));
  };
  I.scan = function () {
    return svg(16, 16, '0 0 16 16', '<path d="M1 5V1h4M11 1h4v4M15 11v4h-4M5 15H1v-4M2.6 8h10.8"/>', 'fill="none" stroke="currentColor" stroke-width="1.6"');
  };
  I.flame = function () {
    return svg(12.4, 16, '0 0 12.4 16',
      '<defs><linearGradient id="fo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8f1f"/><stop offset=".55" stop-color="#f4511e"/><stop offset="1" stop-color="#e2361b"/></linearGradient>' +
      '<linearGradient id="fi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdf4a"/><stop offset="1" stop-color="#ffb012"/></linearGradient></defs>' +
      '<path d="M6.3.4c.7 2.6 4.6 4.6 5.4 8.6.7 3.8-2 6.7-5.5 6.7C2.7 15.7.2 13 .7 9.6c.3-2.2 1.7-3.5 2.4-4.8.3 1.3.8 2.1 1.5 2.5C4.4 4.5 5.3 2.1 6.3.4z" fill="url(#fo)"/>' +
      '<path d="M6.3 7.3c.9 1.8 3.1 3.1 2.9 5.3-.2 1.8-1.5 2.9-3 2.9-1.6 0-2.9-1.1-2.8-2.8.1-1.3 1-2 1.5-2.7.3.7.7 1.1 1.1 1.2-.3-1.5-.2-2.8.3-3.9z" fill="url(#fi)"/>');
  };
  I.eye = function (off) {
    var body = '<path d="M.9 6C2.9 2.3 5.6.9 8.4.9s5.5 1.4 7.5 5.1c-2 3.7-4.7 5.1-7.5 5.1S2.9 9.7.9 6z"/><circle cx="8.4" cy="6" r="2.3"/>';
    if (off) body += '<path d="M2 11.4L14.8.6"/>';
    return svg(17, 12, '0 0 17 12', body, 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"');
  };
  I.caret = function () {
    return svg(6, 4, '0 0 6 4', '<path d="M.6.5h4.8L3 3.5z" fill="currentColor" stroke="currentColor" stroke-width=".6" stroke-linejoin="round"/>');
  };
  I.caretLg = function () {
    return svg(8.4, 5.8, '0 0 8.4 5.8', '<path d="M.7.6h7L4.2 5.2z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>');
  };
  I.chevR = function (w) {
    return svg(6, 9, '0 0 6 9', '<path d="M1 .9l3.9 3.6L1 8.1"/>', stroke(null, w || 1.6));
  };
  I.chevL = function () {
    return svg(11, 19, '0 0 11 19', '<path d="M9.5 1.5L1.8 9.5l7.7 8"/>', stroke(null, 2.2));
  };
  I.chevUp = function () {
    return svg(12, 7, '0 0 12 7', '<path d="M1 6l5-5 5 5"/>', stroke(null, 1.7));
  };
  I.close = function () {
    return svg(14, 14, '0 0 14 14', '<path d="M1.5 1.5l11 11M12.5 1.5l-11 11"/>', stroke(null, 1.8));
  };
  I.history = function () {
    return svg(16, 16, '0 0 16 16',
      '<path d="M10.6 6.2V2c0-.6-.4-1-1-1H2c-.6 0-1 .4-1 1v12c0 .6.4 1 1 1h5.4M3.8 4.2h4.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="12.2" cy="12.2" r="3.8" fill="currentColor"/><path d="M12.2 10.2v2.3h1.6" fill="none" stroke="#000" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>');
  };
  I.sliders = function () {
    return svg(20, 18, '0 0 20 18', '<path d="M0 4.2h20M0 13.4h20"/><circle cx="13.6" cy="4.2" r="3" fill="#000"/><circle cx="6.2" cy="13.4" r="3" fill="#000"/>', 'fill="none" stroke="currentColor" stroke-width="1.8"');
  };
  I.star = function (on) {
    return svg(20, 20, '0 0 20 20', '<path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.7L10 14.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
      on ? 'fill="#f5c542" stroke="#f5c542" stroke-width="1.4" stroke-linejoin="round"' : stroke(null, 1.5));
  };
  I.bell = function () {
    return svg(18, 18, '0 0 18 18', '<path d="M4 13V8a5 5 0 0 1 10 0v5l1.5 1.8h-13zM7.2 16.6a2 2 0 0 0 3.6 0"/>', stroke(null, 1.7));
  };
  I.plus = function () {
    return svg(18, 18, '0 0 18 18', '<path d="M9 2v14M2 9h14"/>', stroke(null, 2.2));
  };
  I.chart = function () {
    return svg(20, 18, '0 0 20 18', '<path d="M1 1v16h18"/><path d="M4.5 12l4-4.5 3.5 3 6-6.5"/>', stroke(null, 1.7));
  };
  I.dots = function () {
    return svg(18, 4, '0 0 18 4', '<circle cx="2" cy="2" r="1.8"/><circle cx="9" cy="2" r="1.8"/><circle cx="16" cy="2" r="1.8"/>', 'fill="currentColor"');
  };
  I.heart = function (on) {
    return svg(16, 15, '0 0 16 15', '<path d="M8 13.8S1 9.6 1 4.9A3.7 3.7 0 0 1 8 3a3.7 3.7 0 0 1 7 1.9c0 4.7-7 8.9-7 8.9z"/>',
      on ? 'fill="#e2566e" stroke="#e2566e" stroke-width="1.4" stroke-linejoin="round"' : stroke(null, 1.4));
  };
  I.comment = function () {
    return svg(16, 15, '0 0 16 15', '<path d="M2.5 1.2h11c.8 0 1.4.6 1.4 1.4v7.2c0 .8-.6 1.4-1.4 1.4H7.2L3.6 14v-2.8H2.5c-.8 0-1.4-.6-1.4-1.4V2.6c0-.8.6-1.4 1.4-1.4z"/>', stroke(null, 1.4));
  };
  I.share = function () {
    return svg(15, 15, '0 0 15 15', '<path d="M7.5 9.5V1.2M4.3 4.2l3.2-3 3.2 3M1.5 8v5c0 .5.4.8.8.8h10.4c.4 0 .8-.3.8-.8V8"/>', stroke(null, 1.4));
  };
  I.swap = function () {
    return svg(16, 16, '0 0 16 16', '<path d="M4.5 1.5v13M1.5 11.5l3 3 3-3M11.5 14.5v-13M8.5 4.5l3-3 3 3"/>', stroke(null, 1.6));
  };
  I.check = function () {
    return svg(14, 11, '0 0 14 11', '<path d="M1.5 5.8l3.8 3.7L12.5 1.5"/>', stroke(null, 2));
  };
  I.verified = function () {
    return svg(13, 13, '0 0 13 13', '<circle cx="6.5" cy="6.5" r="6.2" fill="#cafd5c"/><path d="M3.8 6.6l1.8 1.8 3.6-3.8" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>');
  };

  // ---- quick actions (black on lime) ----
  I.deposit = function () {
    return svg(20, 20, '0 0 20 20', '<path d="M5.3 4.4a8.3 8.3 0 1 0 9.4 0M10 1.2v11.6M6.4 9.3l3.6 3.6 3.6-3.6"/>', stroke(null, 2));
  };
  I.withdraw = function () {
    return svg(20, 20, '0 0 20 20', '<path d="M5.3 4.4a8.3 8.3 0 1 0 9.4 0M10 13V1.4M6.4 5l3.6-3.6L13.6 5"/>', stroke(null, 2));
  };
  I.transfer = function (w) {
    w = w || 18;
    return svg(w, w * 16 / 18, '0 0 18 16', '<path d="M1 5.4h16L12.6 1M17 10.6H1l4.4 4.4"/>', 'fill="none" stroke="currentColor" stroke-width="2"');
  };
  I.earn = function (w) {
    w = w || 20;
    return svg(w, w * 17 / 20, '0 0 20 17', '<path d="M8.6 15.8V10.6M8.6 10.6H4.3c-1.5 0-2.6-1.1-2.6-2.6V7.2c0-1.4 1.1-2.5 2.5-2.5h4.4zM8.6 10.6V6.2c0-2.8 2.2-5 5-5h4.7v4.4c0 2.8-2.2 5-5 5z"/>', stroke(null, 2));
  };
  I.bag = function () {
    return svg(10, 11, '0 0 10 11', '<path d="M3.1 3.4L1.2 8.9c-.2.6.2 1.2.9 1.2h5.8c.7 0 1.1-.6.9-1.2L6.9 3.4zM3.1 3.4L2.4.9h5.2l-.7 2.5"/><circle cx="5" cy="7" r=".9" fill="currentColor" stroke="none"/>', 'fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"');
  };

  // ---- tab bar ----
  I.tabOkx = function () {
    return svg(16, 16, '0 0 16 16', '<rect x="0" y="0" width="5.33" height="5.33"/><rect x="10.67" y="0" width="5.33" height="5.33"/><rect x="5.33" y="5.33" width="5.33" height="5.33"/><rect x="0" y="10.67" width="5.33" height="5.33"/><rect x="10.67" y="10.67" width="5.33" height="5.33"/>', 'fill="currentColor"');
  };
  I.tabExplore = function () {
    return svg(16, 16, '0 0 16 16', '<path d="M.6.7l10.6 5.4 4.3 9.1L3.8 11.5z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><circle cx="7.9" cy="7.9" r="1.3" fill="#000"/>');
  };
  I.tabTrade = function () {
    return svg(22, 21, '0 0 22 21', '<path d="M.8 7.3h20.4L15.4 1.5M21.2 13.6H.8l5.8 5.8"/>', 'fill="none" stroke="#000" stroke-width="2.4"');
  };
  I.tabOrbit = function (dot) {
    return svg(22, 21, '0 0 22 21',
      '<circle cx="7.5" cy="12" r="6.9" fill="currentColor"/>' +
      '<path d="M1.4 18.4c3.6.2 9.6-3 14.8-9.6" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M2.6 17.2c-1.3 1.3-1.7 2.5-.6 2.6 1.7.2 5-1 8.4-3.1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
      (dot ? '<circle cx="17.4" cy="3.8" r="3.6" fill="#ce5245" stroke="#000" stroke-width=".7"/>' : ''));
  };
  I.tabAssets = function () {
    return svg(16, 16, '0 0 16 16', '<path d="M7.7 0a7.8 7.8 0 1 0 7.8 7.8H7.7z"/><path d="M9 6.5V.1a7.8 7.8 0 0 1 6.4 6.4z"/>', 'fill="currentColor"');
  };

  // ---- coins ----
  var COLORS = {
    DOGE: '#c2a633', ADA: '#2a62d6', TON: '#0098ea', TRX: '#e8112d', AVAX: '#e84142', LINK: '#2a5ada', DOT: '#e6007a',
    LTC: '#345d9d', PEPE: '#3d9a3f', SUI: '#4da2ff', SHIB: '#e64a19', UNI: '#ff007a', BCH: '#0ac18e', NEAR: '#2b2b2b',
    APT: '#2b2b2b', CT: '#6b4bd6', IP: '#2b2b2b', KAITO: '#1f8a8a', BERA: '#7a4a1e', LAYER: '#5b5bd6', XAUT: '#c9a64b',
    PAXG: '#e4c25b', USDC: '#2775ca', WLD: '#2b2b2b', ARB: '#28a0f0', OP: '#ff0420', FIL: '#0090ff', ETC: '#33a35b'
  };
  I.coin = function (sym, size) {
    size = size || 26;
    var b;
    switch (sym) {
      case 'BTC':
        b = '<circle cx="13" cy="13" r="13" fill="#e89952"/><g transform="rotate(14 13 13)" fill="#fff"><path fill-rule="evenodd" d="M8.6 6.6h6.3c2.3 0 3.6 1.2 3.6 3 0 1.3-.7 2.2-1.8 2.6 1.4.3 2.5 1.5 2.5 3.1 0 2.1-1.5 3.6-3.9 3.6H8.6zm2.7 2.1v2.8h3.2c1 0 1.5-.5 1.5-1.4s-.5-1.4-1.5-1.4zm0 4.8v3.1h3.5c1.1 0 1.7-.6 1.7-1.55s-.6-1.55-1.7-1.55z"/><rect x="10.6" y="4.5" width="1.7" height="2.6"/><rect x="13.6" y="4.5" width="1.7" height="2.6"/><rect x="10.6" y="18.4" width="1.7" height="2.6"/><rect x="13.6" y="18.4" width="1.7" height="2.6"/></g>';
        break;
      case 'ETH':
        b = '<circle cx="13" cy="13" r="13" fill="#6983ed"/><path d="M13 4.6l5.2 8.7L13 11z" fill="#fff" opacity=".9"/><path d="M13 4.6L7.8 13.3 13 11z" fill="#fff"/><path d="M7.8 13.3L13 11l5.2 2.3L13 16.4z" fill="#fff" opacity=".82"/><path d="M13 17.4l5.2-3.1L13 21.6z" fill="#fff" opacity=".9"/><path d="M13 17.4l-5.2-3.1L13 21.6z" fill="#fff"/>';
        break;
      case 'OKB':
        b = '<circle cx="13" cy="13" r="12.6" fill="#000" stroke="#262626" stroke-width=".8"/><g fill="#fff"><rect x="5.7" y="5.7" width="4.87" height="4.87"/><rect x="15.43" y="5.7" width="4.87" height="4.87"/><rect x="10.57" y="10.57" width="4.87" height="4.87"/><rect x="5.7" y="15.43" width="4.87" height="4.87"/><rect x="15.43" y="15.43" width="4.87" height="4.87"/></g>';
        break;
      case 'XRP':
        b = '<circle cx="13" cy="13" r="12.7" fill="#292c33" stroke="#151617" stroke-width=".6"/><g fill="#fff"><path d="M4.3 5.6h3l3.8 3.9c1.1 1.1 2.7 1.1 3.8 0l3.8-3.9h3l-5.1 5.2c-2.1 2.1-5.1 2.1-7.2 0z"/><path d="M4.3 20.4h3l3.8-3.9c1.1-1.1 2.7-1.1 3.8 0l3.8 3.9h3l-5.1-5.2c-2.1-2.1-5.1-2.1-7.2 0z"/></g>';
        break;
      case 'SOL':
        b = '<defs><linearGradient id="solg" x1="19" y1="6" x2="8" y2="20" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5fe8c4"/><stop offset=".5" stop-color="#8f8fe0"/><stop offset="1" stop-color="#b65cf0"/></linearGradient></defs><circle cx="13" cy="13" r="12.7" fill="#262931" stroke="#0e0f10" stroke-width=".6"/><g fill="url(#solg)"><path d="M8.7 7.6h11.1l-2.1 2.4H6.6z"/><path d="M6.6 11.8h11.1l2.1 2.4H8.7z"/><path d="M8.7 16h11.1l-2.1 2.4H6.6z"/></g>';
        break;
      case 'USDT':
        b = '<circle cx="13" cy="13" r="13" fill="#409092"/><path d="M6 10.1l3.5-3.5h7l3.5 3.5L13 19.4z" fill="#fff" stroke="#fff" stroke-width=".8" stroke-linejoin="round"/><path d="M9.1 8.6h7.8v1.55h-3.1v6.2h-1.6v-6.2H9.1z" fill="#409092"/><ellipse cx="13" cy="11.6" rx="4.4" ry="1.2" fill="none" stroke="#409092" stroke-width=".9"/>';
        break;
      default:
        var col = COLORS[sym] || '#3a3a3a';
        var t = sym.length > 3 ? sym.slice(0, 1) : sym.slice(0, sym.length > 2 ? 1 : 2);
        b = '<circle cx="13" cy="13" r="13" fill="' + col + '"/><text x="13" y="17.6" text-anchor="middle" font-family="Inter,sans-serif" font-size="' + (t.length > 1 ? 10 : 13) + '" font-weight="700" fill="#fff">' + t + '</text>';
    }
    return svg(size, size, '0 0 26 26', b);
  };

  window.ICONS = I;
})();
