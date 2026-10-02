# OKX mockup

Static HTML recreation of two OKX app screens (iPhone, dark mode), with the BTC balance set to **0.0412 BTC**.

| Page | File |
| --- | --- |
| Home (Exchange tab) | `index.html` |
| Assets | `assets.html` |

Open either file in a browser. The phone screen is laid out at 402 × 874 pt, which is iPhone 16 Pro size, and scales to fit the window. The OKX and Assets tabs in the bottom bar link the two pages. If you want to serve the folder instead, run `python3 -m http.server` and open http://localhost:8000.

## Changing the balance

The BTC amount appears in these places:

- `index.html`: the big balance number (`<span class="num" …>0.0412</span>`)
- `assets.html`: the big balance number, the **Trading** portfolio card, the BTC row amount (`0.04120143`) and the BTC row value

## Notes

- Text uses Inter (bundled in `fonts/` under the SIL Open Font License). Bitcoin `฿` signs are drawn in CSS because Inter has no glyph for them.
- Browsers round font metrics differently. `js/fit.js` pins each text baseline (`data-bl`) to the position measured from the reference screenshots, so the layout lines up the same in every browser.
- Icons, coin logos, the sparkline and the banner artwork are inline SVG/CSS approximations.
