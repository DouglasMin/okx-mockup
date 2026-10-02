// Scales the fixed 402 x 874 phone screen to fit the window, and pins every
// text baseline to the exact position measured from the reference screenshots.
// Browsers round font ascent/descent differently, so line-height alone can be
// off by 1-2px; [data-bl] gives the wanted baseline (px from the top of the
// nearest [data-blref] ancestor, or of the screen) and we nudge to match it.
(function () {
  var W = 402, H = 874;
  var screen = document.getElementById("screen");

  function fit() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var s = Math.min(vw / W, vh / H);
    screen.style.transform = "translate(" + (vw - W * s) / 2 + "px," + (vh - H * s) / 2 + "px) scale(" + s + ")";
  }

  function pinBaselines() {
    var k = screen.getBoundingClientRect().width / W;
    var els = [].slice.call(screen.querySelectorAll("[data-bl]"));
    els.forEach(function (el) { el.style.transform = ""; });
    var marks = els.map(function (el) {
      var m = document.createElement("span");
      m.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      el.appendChild(m);
      return m;
    });
    var shifts = els.map(function (el, i) {
      var ref = (el.parentElement && el.parentElement.closest("[data-blref]")) || screen;
      var y = (marks[i].getBoundingClientRect().top - ref.getBoundingClientRect().top) / k;
      return parseFloat(el.getAttribute("data-bl")) - y;
    });
    marks.forEach(function (m) { m.remove(); });
    els.forEach(function (el, i) { el.style.transform = "translateY(" + shifts[i].toFixed(2) + "px)"; });
  }

  function show() { screen.classList.add("ready"); }

  window.addEventListener("resize", fit);
  fit();
  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fonts.then(function () { pinBaselines(); show(); });
  setTimeout(show, 2000);
})();
