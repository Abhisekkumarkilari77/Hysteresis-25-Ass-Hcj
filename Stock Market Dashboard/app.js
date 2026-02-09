// Core state
const state = {
  market: 'india',
  trendRange: 'daily',
  modalTrendRange: 'daily',
  search: '',
  sector: 'all',
  cap: 'all',
  priceMin: null,
  priceMax: null,
  sortField: 'percent',
  sortDirection: 'desc',
  watchlist: {}, // symbol -> { symbol, alertPrice? }
  lastUpdated: null,
};

// --- Utilities ---

function formatNumber(n, decimals = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '–';
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatInteger(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '–';
  return Number(n).toLocaleString();
}

function formatMarketCap(n) {
  if (!n) return '–';
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return formatInteger(n);
}

function loadWatchlist() {
  try {
    const raw = localStorage.getItem('stockDashboardWatchlist');
    if (raw) {
      state.watchlist = JSON.parse(raw);
    }
  } catch {
    state.watchlist = {};
  }
}

function saveWatchlist() {
  try {
    localStorage.setItem('stockDashboardWatchlist', JSON.stringify(state.watchlist));
  } catch {
    // ignore
  }
}

function applyThemeFromStorage() {
  const root = document.querySelector('.app-shell');
  if (!root) return;
  try {
    const stored = localStorage.getItem('stockDashboardTheme');
    if (stored === 'dark') {
      root.dataset.theme = 'dark';
    }
  } catch {
    // ignore localStorage errors (e.g. when opened from file://)
  }
}

function toggleTheme() {
  const root = document.querySelector('.app-shell');
  if (!root) return;
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('stockDashboardTheme', next);
  } catch {
    // ignore
  }
}

function computeMarketStatus() {
  const now = new Date();
  const day = now.getDay(); // 0 Sunday, 6 Saturday
  const hour = now.getHours();
  const minute = now.getMinutes();

  const isWeekend = day === 0 || day === 6;
  const afterOpen = hour > 9 || (hour === 9 && minute >= 15);
  const beforeClose = hour < 15 || (hour === 15 && minute <= 30);
  const open = !isWeekend && afterOpen && beforeClose;

  const el = document.getElementById('marketStatus');
  if (!el) return;
  const dot = document.createElement('span');
  dot.className = `market-status-dot ${open ? 'open' : 'closed'}`;
  el.innerHTML = '';
  el.appendChild(dot);
  el.append(
    document.createTextNode(open ? 'Market open (IST)' : 'Market closed (IST)')
  );
}

function updateLastUpdated() {
  state.lastUpdated = new Date();
  const el = document.getElementById('lastUpdated');
  if (!el) return;
  el.textContent = `Last updated ${state.lastUpdated.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

// --- Filtering / sorting ---

function getVisibleStocks() {
  const market = state.market;
  const q = state.search.trim().toLowerCase();
  const min = state.priceMin;
  const max = state.priceMax;

  const filtered = STOCKS_DATA.filter((s) => {
    if (s.market !== market) return false;

    if (q) {
      const hay =
        (s.symbol || '').toLowerCase() +
        ' ' +
        (s.name || '').toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (state.sector !== 'all' && s.sector !== state.sector) return false;
    if (state.cap !== 'all' && s.marketCap !== state.cap) return false;

    if (min !== null && s.price < min) return false;
    if (max !== null && s.price > max) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = state.sortDirection === 'asc' ? 1 : -1;
    let av;
    let bv;
    if (state.sortField === 'price') {
      av = a.price;
      bv = b.price;
    } else if (state.sortField === 'volume') {
      av = a.volume;
      bv = b.volume;
    } else {
      av = a.percent;
      bv = b.percent;
    }
    if (av === bv) return 0;
    return av > bv ? dir : -dir;
  });

  return sorted;
}

function getGainersAndLosers(limit = 10) {
  const stocks = STOCKS_DATA.filter((s) => s.market === state.market);
  const byPercent = [...stocks].sort((a, b) => b.percent - a.percent);
  const gainers = byPercent.filter((s) => s.percent > 0).slice(0, limit);
  const losers = [...stocks]
    .sort((a, b) => a.percent - b.percent)
    .filter((s) => s.percent < 0)
    .slice(0, limit);
  return { gainers, losers };
}

// --- Rendering: indices ---

function renderIndices() {
  const container = document.getElementById('indicesGrid');
  if (!container) return;
  container.innerHTML = '';

  INDEX_DATA.forEach((idx) => {
    const card = document.createElement('article');
    card.className = 'index-card';

    const header = document.createElement('div');
    header.className = 'index-header';
    header.innerHTML = `
      <span>${idx.id}</span>
      <span class="index-symbol">${idx.symbol}</span>
    `;

    const value = document.createElement('div');
    value.className = 'index-value';
    value.textContent = formatNumber(idx.value, 1);

    const sub = document.createElement('div');
    sub.className = 'index-sub';

    const chip = document.createElement('span');
    const dirClass =
      idx.percent > 0 ? 'chip-positive' : idx.percent < 0 ? 'chip-negative' : 'chip-neutral';
    const sign = idx.percent > 0 ? '+' : '';
    chip.className = `chip ${dirClass}`;
    chip.textContent = `${sign}${formatNumber(idx.change, 1)} (${sign}${formatNumber(
      idx.percent,
      2
    )}%)`;

    const range = document.createElement('span');
    range.textContent = `H ${formatNumber(idx.high, 1)} / L ${formatNumber(
      idx.low,
      1
    )}`;

    sub.appendChild(chip);
    sub.appendChild(range);

    const volume = document.createElement('div');
    volume.className = 'index-sub';
    volume.innerHTML = `<span>Volume</span><span>${idx.volume}</span>`;

    card.appendChild(header);
    card.appendChild(value);
    card.appendChild(sub);
    card.appendChild(volume);

    container.appendChild(card);
  });
}

// --- Rendering: sparkline ---

function renderSparkline(svgEl, series, trend) {
  if (!svgEl || !series || !series.length) return;
  const width = svgEl.clientWidth || 100;
  const height = svgEl.clientHeight || 32;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;

  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1 || 1)) * width;
      const y = height - ((v - min) / span) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const stroke =
    trend === 'bullish'
      ? '#16a34a'
      : trend === 'bearish'
      ? '#dc2626'
      : '#64748b';

  svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svgEl.innerHTML = `
    <polyline
      points="${points}"
      fill="none"
      stroke="${stroke}"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  `;
}

// --- Rendering: stocks grid ---

function renderStocks() {
  const grid = document.getElementById('stocksGrid');
  const empty = document.getElementById('stocksEmptyState');
  if (!grid) return;

  const stocks = getVisibleStocks();
  grid.innerHTML = '';

  if (!stocks.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  stocks.forEach((s) => {
    const card = document.createElement('article');
    card.className = 'stock-card';
    card.dataset.symbol = s.symbol;

    const isWatched = !!state.watchlist[s.symbol];

    const header = document.createElement('div');
    header.className = 'stock-card-header';
    header.innerHTML = `
      <div class="stock-meta">
        <span class="stock-symbol">${s.symbol}</span>
        <span class="stock-name">${s.name}</span>
        <span class="stock-exchange">${s.exchange}</span>
      </div>
      <div class="stock-actions">
        <button
          class="star-button ${isWatched ? 'active' : ''}"
          data-action="toggle-watch"
          data-symbol="${s.symbol}"
        >
          <span class="star-icon">${isWatched ? '★' : '☆'}</span>
          <span>${isWatched ? 'Watching' : 'Watch'}</span>
        </button>
      </div>
    `;

    const priceRow = document.createElement('div');
    priceRow.className = 'stock-price-row';

    const price = document.createElement('div');
    price.className = 'stock-price';
    price.textContent = formatNumber(s.price, 2);

    const chip = document.createElement('div');
    const dirClass =
      s.percent > 0 ? 'change-positive' : s.percent < 0 ? 'change-negative' : '';
    const sign = s.percent > 0 ? '+' : '';
    chip.className = `change-chip ${dirClass}`;
    chip.textContent = `${sign}${formatNumber(s.change, 2)} (${sign}${formatNumber(
      s.percent,
      2
    )}%)`;

    priceRow.appendChild(price);
    priceRow.appendChild(chip);

    const footer = document.createElement('div');
    footer.className = 'stock-footer';

    const trendPill = document.createElement('span');
    const trendClass =
      s.trend === 'bullish'
        ? 'trend-bullish'
        : s.trend === 'bearish'
        ? 'trend-bearish'
        : 'trend-sideways';
    const trendLabel =
      s.trend === 'bullish'
        ? 'Bullish'
        : s.trend === 'bearish'
        ? 'Bearish'
        : 'Sideways';
    trendPill.className = `trend-pill ${trendClass}`;
    trendPill.textContent = trendLabel;

    const prev = document.createElement('span');
    prev.textContent = `Prev close ${formatNumber(s.prevClose, 2)}`;

    footer.appendChild(trendPill);
    footer.appendChild(prev);

    const spark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    spark.classList.add('sparkline');

    card.appendChild(header);
    card.appendChild(priceRow);
    card.appendChild(spark);
    card.appendChild(footer);

    // delegate watch button
    header
      .querySelector('[data-action="toggle-watch"]')
      .addEventListener('click', (evt) => {
        evt.stopPropagation();
        toggleWatchlist(s.symbol);
      });

    grid.appendChild(card);

    // draw sparkline after in DOM
    let history = null;
    if (s.history) {
      history = s.history[state.trendRange] || s.history.daily;
    }
    renderSparkline(spark, history || [], s.trend);
  });
}

// --- Rendering: movers ---

function renderMovers() {
  const { gainers, losers } = getGainersAndLosers();
  const gainersBody = document.querySelector('#gainersTable tbody');
  const losersBody = document.querySelector('#losersTable tbody');
  if (!gainersBody || !losersBody) return;

  gainersBody.innerHTML = '';
  losersBody.innerHTML = '';

  gainers.forEach((s) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.symbol}</td>
      <td class="text-right change-positive">${formatNumber(s.percent, 2)}%</td>
      <td class="text-right">${formatNumber(s.price, 2)}</td>
    `;
    gainersBody.appendChild(tr);
  });

  losers.forEach((s) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.symbol}</td>
      <td class="text-right change-negative">${formatNumber(s.percent, 2)}%</td>
      <td class="text-right">${formatNumber(s.price, 2)}</td>
    `;
    losersBody.appendChild(tr);
  });
}

// --- Rendering: watchlist ---

function renderWatchlist() {
  const list = document.getElementById('watchlistList');
  const empty = document.getElementById('watchlistEmpty');
  if (!list) return;

  const watchedSymbols = Object.keys(state.watchlist);
  list.innerHTML = '';

  if (!watchedSymbols.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  watchedSymbols.forEach((symbol) => {
    const stock = STOCKS_DATA.find((s) => s.symbol === symbol);
    if (!stock) return;
    const item = document.createElement('li');
    item.className = 'watchlist-item';
    item.innerHTML = `
      <div class="watchlist-meta">
        <span class="watchlist-symbol">${stock.symbol}</span>
        <span class="watchlist-name">${stock.name}</span>
      </div>
      <div class="watchlist-actions">
        <span class="${
          stock.percent >= 0 ? 'change-positive' : 'change-negative'
        }">${formatNumber(stock.percent, 2)}%</span>
        <button class="inline-button danger" data-action="remove" data-symbol="${stock.symbol}">
          Remove
        </button>
      </div>
    `;

    item
      .querySelector('[data-action="remove"]')
      .addEventListener('click', () => {
        delete state.watchlist[stock.symbol];
        saveWatchlist();
        renderStocks();
        renderWatchlist();
      });

    list.appendChild(item);
  });
}

function toggleWatchlist(symbol) {
  if (state.watchlist[symbol]) {
    delete state.watchlist[symbol];
  } else {
    state.watchlist[symbol] = { symbol };
  }
  saveWatchlist();
  renderStocks();
  renderWatchlist();
}

// --- Rendering: news ---

function renderNews() {
  const list = document.getElementById('newsList');
  if (!list) return;
  list.innerHTML = '';

  NEWS_ITEMS.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="news-item-title">${item.title}</span>
      <span class="news-item-meta">${item.source} · ${
      item.minutesAgo
    } min ago · ${item.relatedSymbols.join(', ')}</span>
    `;
    list.appendChild(li);
  });
}

// --- Event wiring ---

function initControls() {
  // theme
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // market toggle
  document.querySelectorAll('.market-toggle .toggle-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const market = btn.dataset.market;
      if (!market || market === state.market) return;
      state.market = market;
      document
        .querySelectorAll('.market-toggle .toggle-button')
        .forEach((b) => b.classList.toggle('active', b === btn));
      renderIndices();
      renderStocks();
      renderMovers();
    });
  });

  // search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value;
      renderStocks();
    });
  }

  // filters
  const sectorFilter = document.getElementById('sectorFilter');
  if (sectorFilter) {
    sectorFilter.addEventListener('change', (e) => {
      state.sector = e.target.value;
      renderStocks();
    });
  }
  const capFilter = document.getElementById('capFilter');
  if (capFilter) {
    capFilter.addEventListener('change', (e) => {
      state.cap = e.target.value;
      renderStocks();
    });
  }
  const priceMinInput = document.getElementById('priceMin');
  if (priceMinInput) {
    priceMinInput.addEventListener('change', (e) => {
      const v = e.target.value;
      state.priceMin = v ? Number(v) : null;
      renderStocks();
    });
  }
  const priceMaxInput = document.getElementById('priceMax');
  if (priceMaxInput) {
    priceMaxInput.addEventListener('change', (e) => {
      const v = e.target.value;
      state.priceMax = v ? Number(v) : null;
      renderStocks();
    });
  }

  const sortField = document.getElementById('sortField');
  if (sortField) {
    sortField.addEventListener('change', (e) => {
      state.sortField = e.target.value;
      renderStocks();
    });
  }
  const sortDirection = document.getElementById('sortDirection');
  if (sortDirection) {
    sortDirection.addEventListener('change', (e) => {
      state.sortDirection = e.target.value;
      renderStocks();
    });
  }

  // trend toggle (cards)
  document.querySelectorAll('#trendToggle .toggle-button-sm').forEach((btn) => {
    btn.addEventListener('click', () => {
      const range = btn.dataset.range;
      if (!range || range === state.trendRange) return;
      state.trendRange = range;
      document
        .querySelectorAll('#trendToggle .toggle-button-sm')
        .forEach((b) => b.classList.toggle('active', b === btn));
      renderStocks();
    });
  });

  // movers tabs
  const gainersTable = document.getElementById('gainersTable');
  const losersTable = document.getElementById('losersTable');
  document.querySelectorAll('#moversTabs .toggle-button-sm').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.moversTab;
      document
        .querySelectorAll('#moversTabs .toggle-button-sm')
        .forEach((b) => b.classList.toggle('active', b === btn));
      if (tab === 'gainers') {
        gainersTable.hidden = false;
        losersTable.hidden = true;
      } else {
        gainersTable.hidden = true;
        losersTable.hidden = false;
      }
    });
  });

  // refresh
  const refreshButton = document.getElementById('refreshButton');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      updateLastUpdated();
    });
  }
}

// --- Initialisation ---

function populateSectorFilter() {
  const select = document.getElementById('sectorFilter');
  if (!select) return;
  const sectors = Array.from(
    new Set(STOCKS_DATA.map((s) => s.sector).filter(Boolean))
  ).sort();
  sectors.forEach((sector) => {
    const opt = document.createElement('option');
    opt.value = sector;
    opt.textContent = sector;
    select.appendChild(opt);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyThemeFromStorage();
  loadWatchlist();
  computeMarketStatus();
  updateLastUpdated();
  populateSectorFilter();
  initControls();
  renderIndices();
  renderStocks();
  renderMovers();
  renderWatchlist();
  renderNews();
});

