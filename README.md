# OKX demo app

A responsive, iOS-style web app modelled on the OKX mobile app (dark mode). It's built with plain HTML, CSS and JavaScript, with no build step and no dependencies. The opening balance is **0.0412 BTC**.

Open `index.html`, or serve the folder (`python3 -m http.server`) and visit http://localhost:8000. On an iPhone, open it in Safari. It fills the screen and respects the notch and home indicator. If you add it to the Home Screen, it opens full screen without the browser bars.

## What's in it

| Tab | What it does |
| --- | --- |
| **OKX** (home) | Exchange/Web3 switch, search, balance with show/hide and BTC/USDT/USD switch, swipeable promo carousel, market lists (Favorites, New, Crypto, TradFi, Hot) |
| **Explore** | Markets by Favorites, Crypto, Spot, Futures and TradFi; Hot/Gainers/Losers/New filters; sort by volume, price or 24h change |
| **Trade** | Spot and Futures order form (limit or market, % slider), live order book, pair picker, open orders and order history. Limit orders fill when the price crosses them. |
| **Orbit** | Social feed with likes, replies and new posts (`$SOL` in a post adds a live price chip), plus News |
| **Assets** | Balance, Deposit/Withdraw coin picker, Transfer between Funding and Trading, Earn, portfolio accounts and the crypto list |

Pages that slide in on top: coin detail (live chart with 15m–1W ranges and touch scrubbing), search, account and asset detail, Simple Earn (subscribe/redeem), Bills, Rewards, Inbox, and the menu (grid icon, top left).

iOS behaviours: pages push and pop with the iOS animation, you can swipe back from the left edge, and the browser back button works. Bottom sheets close when dragged down. Tapping the active tab scrolls it to the top.

## Data

- **Prices:** on load the app tries OKX's public ticker API for live prices. If the browser blocks it, prices move on a built-in simulation instead.
- **Balances** start at 0.0412 BTC (`0.04120143` BTC and `0.00000097` USDT in the Trading account). Trades, transfers and Earn subscriptions change them while the page is open, and a reload resets them. Change the starting amounts in `js/data.js` under `balances`.
- **Preferences** (hidden balances, display currency, favorites) are saved in the browser.
- **Not included:** sign-in, deposit addresses and withdrawal submission. The Deposit and Withdraw buttons only go as far as picking a coin.

## Files

- `index.html`: the app shell
- `css/app.css`: all styles
- `js/app.js`: router, state, price engine, tabs, pages and sheets
- `js/data.js`: markets, balances, promos, posts and other mock content
- `js/icons.js`: SVG icons and coin logos
- `fonts/`: Inter, under the SIL Open Font License
- `assets.html`: redirects to the Assets tab, so the old link keeps working
