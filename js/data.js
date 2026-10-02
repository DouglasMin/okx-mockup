// Mock data for the demo app. Prices are starting points; js/app.js moves them live.
window.DATA = {
  // s: symbol, n: name, p: last price (USDT), c: 24h change, v: 24h volume (USDT), lev: max leverage
  coins: [
    { s: 'BTC', n: 'Bitcoin', p: 84603.2, c: -0.0032, v: 542.23e6, lev: 10 },
    { s: 'ETH', n: 'Ethereum', p: 2700.93, c: -0.0019, v: 328.39e6, lev: 10 },
    { s: 'OKB', n: 'OKB', p: 120.93, c: -0.0028, v: 7.03e6, lev: 10 },
    { s: 'XRP', n: 'XRP', p: 1.4867, c: -0.0050, v: 47.58e6, lev: 10 },
    { s: 'SOL', n: 'Solana', p: 118.66, c: 0.0021, v: 90.91e6, lev: 10 },
    { s: 'DOGE', n: 'Dogecoin', p: 0.16782, c: 0.0112, v: 38.2e6, lev: 10 },
    { s: 'SUI', n: 'Sui', p: 2.2761, c: 0.0218, v: 25.9e6, lev: 5 },
    { s: 'PEPE', n: 'Pepe', p: 0.00000712, c: 0.0341, v: 21.5e6, lev: 5 },
    { s: 'ADA', n: 'Cardano', p: 0.4712, c: -0.0084, v: 12.6e6, lev: 5 },
    { s: 'LINK', n: 'Chainlink', p: 12.43, c: 0.0093, v: 11.2e6, lev: 5 },
    { s: 'LTC', n: 'Litecoin', p: 78.12, c: 0.0037, v: 10.1e6, lev: 5 },
    { s: 'TON', n: 'Toncoin', p: 2.983, c: 0.0065, v: 9.8e6, lev: 5 },
    { s: 'AVAX', n: 'Avalanche', p: 17.85, c: -0.0121, v: 8.7e6, lev: 5 },
    { s: 'BCH', n: 'Bitcoin Cash', p: 312.4, c: -0.0015, v: 6.6e6, lev: 5 },
    { s: 'TRX', n: 'TRON', p: 0.2391, c: 0.0012, v: 6.1e6, lev: 5 },
    { s: 'SHIB', n: 'Shiba Inu', p: 0.00001231, c: -0.0066, v: 5.2e6, lev: 5 },
    { s: 'DOT', n: 'Polkadot', p: 3.917, c: -0.0042, v: 4.3e6, lev: 5 },
    { s: 'NEAR', n: 'NEAR Protocol', p: 2.318, c: 0.0105, v: 4.2e6, lev: 5 },
    { s: 'UNI', n: 'Uniswap', p: 5.862, c: 0.0028, v: 3.9e6, lev: 5 },
    { s: 'APT', n: 'Aptos', p: 4.921, c: -0.0073, v: 3.1e6, lev: 5 },
    { s: 'ARB', n: 'Arbitrum', p: 0.3127, c: 0.0158, v: 2.9e6, lev: 5 },
    { s: 'OP', n: 'Optimism', p: 0.7342, c: -0.0211, v: 2.4e6, lev: 5 },
    { s: 'CT', n: 'CT', p: 0.4821, c: 0.1253, v: 18.4e6, lev: 3, isNew: true },
    { s: 'IP', n: 'Story', p: 4.312, c: 0.0624, v: 9.2e6, lev: 3, isNew: true },
    { s: 'KAITO', n: 'KAITO', p: 1.276, c: -0.0341, v: 6.7e6, lev: 3, isNew: true },
    { s: 'BERA', n: 'Berachain', p: 6.84, c: 0.0213, v: 5.5e6, lev: 3, isNew: true },
    { s: 'LAYER', n: 'Solayer', p: 1.128, c: -0.0562, v: 4.1e6, lev: 3, isNew: true },
    { s: 'XAUT', n: 'Tether Gold', p: 3021.5, c: 0.0042, v: 3.8e6, lev: 5, tradfi: true },
    { s: 'PAXG', n: 'PAX Gold', p: 3028.7, c: 0.0039, v: 2.6e6, lev: 5, tradfi: true },
    { s: 'USDC', n: 'USD Coin', p: 1.0001, c: 0.0001, v: 96.4e6, lev: 0, tradfi: true }
  ],

  // Opening balances per account, in coin units.
  balances: {
    funding: { BTC: 0, USDT: 0 },
    trading: { BTC: 0.04120143, USDT: 0.00000097 },
    earn: { BTC: 0, USDT: 0 }
  },

  pnl1y: { btc: 0.0004, pct: 0.0105 },

  favorites: ['BTC', 'ETH', 'OKB', 'XRP', 'SOL'],

  promos: [
    { title: 'CT Trade to Earn', sub: 'Trade CT to share 1M CT — earn up to 5,000 CT', go: 'coin/CT', art: 'orb' },
    { title: 'Simple Earn', sub: 'Put idle BTC to work with up to 5% APR', go: 'earn', art: 'earn' },
    { title: 'Invite friends', sub: 'Earn up to 50% commission on their trading fees', go: 'rewards', art: 'gift' },
    { title: 'Futures fee discount', sub: 'Trade BTC perpetuals with 20% off maker fees', go: 'trade', art: 'chart' },
    { title: 'New listing: IP', sub: 'Story (IP) spot trading is now live', go: 'coin/IP', art: 'orb' },
    { title: 'Copy trading', sub: 'Follow top traders and mirror their positions', go: 'orbit', art: 'chart' },
    { title: 'Convert with zero fees', sub: 'Swap between 300+ tokens in one tap', go: 'trade', art: 'swap' },
    { title: 'Rewards hub', sub: 'Complete tasks to unlock mystery boxes', go: 'rewards', art: 'gift' }
  ],

  earn: [
    { s: 'USDT', apr: 0.50, note: 'New user bonus · up to 500 USDT', term: 'Flexible' },
    { s: 'BTC', apr: 0.05, note: 'Up to 5% APR', term: 'Flexible' },
    { s: 'ETH', apr: 0.032, note: 'Simple Earn', term: 'Flexible' },
    { s: 'SOL', apr: 0.068, note: 'On-chain Earn', term: 'Flexible' },
    { s: 'OKB', apr: 0.041, note: 'Simple Earn', term: 'Flexible' },
    { s: 'DOGE', apr: 0.015, note: 'Simple Earn', term: 'Flexible' },
    { s: 'XRP', apr: 0.012, note: 'Simple Earn', term: 'Flexible' },
    { s: 'USDC', apr: 0.082, note: 'Simple Earn', term: 'Flexible' }
  ],

  web3: [
    { s: 'PEPE', n: 'Pepe', chain: 'Ethereum' },
    { s: 'SOL', n: 'Solana', chain: 'Solana' },
    { s: 'TON', n: 'Toncoin', chain: 'TON' },
    { s: 'ARB', n: 'Arbitrum', chain: 'Arbitrum' },
    { s: 'OP', n: 'Optimism', chain: 'Optimism' },
    { s: 'SUI', n: 'Sui', chain: 'Sui' }
  ],

  posts: [
    { id: 1, user: 'Market Pulse', handle: '@marketpulse', verified: true, t: '12m', text: 'BTC holding the 84K range for the third session in a row. Funding is flat and spot volume is picking up — watching 86K as the next test.', tag: 'BTC', likes: 482, comments: 61 },
    { id: 2, user: 'Lena Park', handle: '@lenatrades', t: '34m', text: 'Rotated part of my stablecoins into SOL this morning. On-chain activity keeps climbing and the chart finally looks constructive.', tag: 'SOL', likes: 156, comments: 22 },
    { id: 3, user: 'Chain Notes', handle: '@chainnotes', verified: true, t: '1h', text: 'ETH/BTC ratio printed a new local low. Historically this has been a zone where patient buyers get paid — but timing it is the hard part.', tag: 'ETH', likes: 903, comments: 140 },
    { id: 4, user: 'Diego M.', handle: '@diegomacro', t: '2h', text: 'Simple plan for this week: DCA a small amount daily, no leverage, no screen-staring. Boring works.', likes: 271, comments: 35 },
    { id: 5, user: 'Alt Season Radar', handle: '@altradar', t: '3h', text: 'CT up double digits after the trade-to-earn campaign went live. Volume 4x the 7-day average.', tag: 'CT', likes: 618, comments: 88 },
    { id: 6, user: 'Mina Cho', handle: '@minacho', t: '5h', text: 'Reminder: turn on 2FA and use an anti-phishing code. Nobody from support will ever ask for your password.', likes: 1204, comments: 97 },
    { id: 7, user: 'Quant Kid', handle: '@quantkid', t: '7h', text: 'XRP compressing into a tight wedge on the 4H. Breakout direction decides the next 10%.', tag: 'XRP', likes: 344, comments: 51 },
    { id: 8, user: 'Daily Digest', handle: '@dailydigest', verified: true, t: '9h', text: 'Today: Fed minutes at 2pm ET, two token unlocks, and the IP spot listing anniversary campaign.', likes: 512, comments: 43 }
  ],

  news: [
    { t: '8m', title: 'Bitcoin steadies near $84K as traders await macro data', src: 'Market brief' },
    { t: '41m', title: 'Solana network activity hits a three-month high', src: 'On-chain' },
    { t: '1h', title: 'Ethereum developers set date for next testnet upgrade', src: 'Ecosystem' },
    { t: '3h', title: 'Stablecoin supply climbs for the sixth straight week', src: 'Markets' },
    { t: '6h', title: 'Gold-backed tokens rally alongside spot gold', src: 'TradFi' }
  ],

  notifications: [
    { t: 'Today 09:12', title: 'CT Trade to Earn is live', body: 'Trade CT to share a 1,000,000 CT prize pool. Ends in 7 days.' },
    { t: 'Yesterday', title: 'Scheduled maintenance', body: 'Some services will be briefly unavailable on Sunday 02:00–02:30 UTC.' },
    { t: 'Yesterday', title: 'New listing: KAITO/USDT', body: 'Spot trading for KAITO is now open.' },
    { t: '3 days ago', title: 'Security reminder', body: 'Set up an anti-phishing code to verify emails from us.' },
    { t: '1 week ago', title: 'Simple Earn rates updated', body: 'BTC flexible APR is now up to 5%.' }
  ],

  rewards: [
    { title: 'Complete identity verification', reward: '10 USDT bonus', done: true },
    { title: 'Make your first deposit', reward: 'Mystery box', done: true },
    { title: 'Trade 100 USDT in spot', reward: '5 USDT trading fee voucher', done: false },
    { title: 'Subscribe to Simple Earn', reward: 'APR boost +2%', done: false },
    { title: 'Invite a friend', reward: 'Up to 50% commission', done: false }
  ]
};
