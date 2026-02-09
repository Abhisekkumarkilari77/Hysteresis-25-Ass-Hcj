"use strict";

// -----------------------------
// Configuration & State
// -----------------------------

const API_BASE = "https://api.coincap.io/v2";
const POLL_INTERVAL_MS = 15000; // 15 seconds polling
const MAX_HISTORY_POINTS = 90; // keep last ~20–25 minutes at 15s refresh

// Synthetic baseline data so the chart has something to show
// even when the app is offline on first load.
const OFFLINE_SEED_ASSETS = {
  bitcoin: 64000,
  ethereum: 3400,
  "binance-coin": 550,
  solana: 150
};
const OFFLINE_SEED_POINTS = 40;

// CoinCap asset IDs for a focused list of popular coins
const TRACKED_ASSET_IDS = [
  "bitcoin",
  "ethereum",
  "tether",
  "solana",
  "binance-coin",
  "xrp",
  "cardano",
  "dogecoin",
  "tron",
  "polkadot"
];

const SUPPORTED_FIATS = ["USD", "EUR", "INR"];

const STORAGE_KEYS = {
  THEME: "cryptoTracker.theme",
  CURRENCY: "cryptoTracker.currency",
  FAVORITES: "cryptoTracker.favorites"
};

const state = {
  coins: [],
  lastCoinsSnapshot: new Map(), // id -> { priceUsd, changePercent24Hr }
  favorites: new Set(),
  sortKey: "rank", // "rank" | "price" | "change"
  sortDir: "asc",
  currency: "USD",
  currencyRates: {
    USD: 1
  }, // symbol -> rateUsd
  priceHistory: new Map(), // id -> [{ time, priceUsd }]
  selectedCoinId: null,
  lastUpdated: null,
  isLoading: false,
  hasInitialized: false,
  error: null
};

// -----------------------------
// DOM References
// -----------------------------

const els = {
  marketStatus: document.getElementById("market-status"),
  lastUpdated: document.getElementById("last-updated"),
  currencySelect: document.getElementById("currency-select"),
  favoritesOnlyToggle: document.getElementById("favorites-only-toggle"),
  themeToggleBtn: document.getElementById("theme-toggle-btn"),
  errorBanner: document.getElementById("error-banner"),
  loadingIndicator: document.getElementById("loading-indicator"),
  tableBody: document.getElementById("crypto-table-body"),
  chartTitle: document.getElementById("chart-title"),
  chartSubtitle: document.getElementById("chart-subtitle"),
  selectedCoinSummary: document.getElementById("selected-coin-summary"),
  priceChart: document.getElementById("price-chart"),
  thPrice: document.getElementById("th-price"),
  thChange: document.getElementById("th-change")
};

let chartCtx;

// -----------------------------
// Utilities
// -----------------------------

function formatCurrency(value, currency) {
  if (value == null || isNaN(value)) return "–";
  try {
    const abs = Math.abs(value);
    const minimumFractionDigits = abs >= 1000 ? 2 : 3;
    const maximumFractionDigits = abs >= 1 ? 4 : 6;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function formatPercent(value) {
  if (value == null || isNaN(value)) return "–";
  const fixed = value.toFixed(2);
  return `${fixed}%`;
}

function formatTime(ts) {
  if (!ts) return "–";
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getCurrencyRate(currency) {
  if (currency === "USD") return 1;
  const rateUsd = state.currencyRates[currency];
  if (!rateUsd || isNaN(rateUsd)) return 1;
  return rateUsd;
}

function convertFromUsd(priceUsd, currency) {
  if (priceUsd == null || isNaN(priceUsd)) return null;
  if (currency === "USD") return priceUsd;
  const rateUsd = getCurrencyRate(currency);
  if (!rateUsd) return priceUsd;
  // CoinCap rates are "1 unit of currency = rateUsd"
  // so value in target currency = priceUsd / rateUsd
  return priceUsd / rateUsd;
}

function getCurrencySymbol(currency) {
  switch (currency) {
    case "EUR":
      return "€";
    case "INR":
      return "₹";
    case "USD":
    default:
      return "$";
  }
}

// -----------------------------
// API
// -----------------------------

async function fetchAssets() {
  const idsParam = TRACKED_ASSET_IDS.join(",");
  const url = `${API_BASE}/assets?ids=${encodeURIComponent(idsParam)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Assets request failed: ${res.status}`);
  }
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

async function fetchRates() {
  const url = `${API_BASE}/rates`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Rates request failed: ${res.status}`);
  }
  const json = await res.json();
  const data = Array.isArray(json.data) ? json.data : [];

  const rates = {
    USD: 1
  };

  for (const entry of data) {
    if (!entry || !SUPPORTED_FIATS.includes(entry.symbol)) continue;
    const rateUsd = Number(entry.rateUsd);
    if (!isNaN(rateUsd) && rateUsd > 0) {
      rates[entry.symbol] = rateUsd;
    }
  }

  return rates;
}

// -----------------------------
// Persistence
// -----------------------------

function loadPreferences() {
  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEYS.THEME);
    if (storedTheme === "light" || storedTheme === "dark") {
      document.body.setAttribute("data-theme", storedTheme);
      state.theme = storedTheme;
    } else {
      const prefersDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      document.body.setAttribute("data-theme", initial);
      state.theme = initial;
    }

    const storedCurrency =
      window.localStorage.getItem(STORAGE_KEYS.CURRENCY) || "USD";
    if (SUPPORTED_FIATS.includes(storedCurrency)) {
      state.currency = storedCurrency;
    }

    const favoritesRaw =
      window.localStorage.getItem(STORAGE_KEYS.FAVORITES) || "[]";
    const parsed = JSON.parse(favoritesRaw);
    if (Array.isArray(parsed)) {
      state.favorites = new Set(parsed);
    }
  } catch {
    // ignore storage errors
  }
}

function savePreferences() {
  try {
    window.localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
    window.localStorage.setItem(STORAGE_KEYS.CURRENCY, state.currency);
    window.localStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify([...state.favorites])
    );
  } catch {
    // ignore storage errors
  }
}

// -----------------------------
// State helpers
// -----------------------------

function seedOfflineHistoryIfNeeded() {
  // Only seed if we have no history at all yet
  if (state.priceHistory.size > 0) return;

  const now = Date.now();
  const stepMs = POLL_INTERVAL_MS;

  Object.entries(OFFLINE_SEED_ASSETS).forEach(([id, basePrice]) => {
    const points = [];
    for (let i = OFFLINE_SEED_POINTS - 1; i >= 0; i--) {
      const t = now - i * stepMs;
      // Gentle synthetic variation using sine + tiny random noise
      const phase = (i / OFFLINE_SEED_POINTS) * Math.PI * 2;
      const variation = Math.sin(phase) * 0.01 + (Math.random() - 0.5) * 0.003;
      const priceUsd = basePrice * (1 + variation);
      points.push({ time: t, priceUsd });
    }
    state.priceHistory.set(id, points);
  });

  // Default selected coin if nothing else is set
  if (!state.selectedCoinId) {
    const seededIds = Object.keys(OFFLINE_SEED_ASSETS);
    if (seededIds.length > 0) {
      state.selectedCoinId = seededIds[0];
    }
  }
}

function updatePriceHistory(coins, nowTs) {
  for (const coin of coins) {
    const id = coin.id;
    const priceUsd = Number(coin.priceUsd);
    if (!id || isNaN(priceUsd)) continue;

    const history = state.priceHistory.get(id) || [];
    history.push({ time: nowTs, priceUsd });
    if (history.length > MAX_HISTORY_POINTS) {
      history.splice(0, history.length - MAX_HISTORY_POINTS);
    }
    state.priceHistory.set(id, history);
  }
}

function computeRowDirection(coin) {
  const prev = state.lastCoinsSnapshot.get(coin.id);
  if (!prev) return null;

  const prevPrice = Number(prev.priceUsd);
  const newPrice = Number(coin.priceUsd);
  if (isNaN(prevPrice) || isNaN(newPrice)) return null;
  if (newPrice > prevPrice * 1.0005) return "up";
  if (newPrice < prevPrice * 0.9995) return "down";
  return null;
}

function snapshotCoins(coins) {
  const snapshot = new Map();
  for (const c of coins) {
    snapshot.set(c.id, {
      priceUsd: c.priceUsd,
      changePercent24Hr: c.changePercent24Hr
    });
  }
  state.lastCoinsSnapshot = snapshot;
}

// -----------------------------
// Rendering: Status & Errors
// -----------------------------

function updateMarketStatus() {
  if (!els.marketStatus) return;
  const dot = els.marketStatus.querySelector(".status-dot");
  const textEl = els.marketStatus.querySelector(".status-text");
  if (!dot || !textEl) return;

  dot.classList.remove("status-live", "status-stale", "status-error");

  if (state.error && !state.hasInitialized) {
    dot.classList.add("status-error");
    textEl.textContent = "Status: Error fetching data";
    return;
  }

  const now = Date.now();
  const ageSec = state.lastUpdated ? (now - state.lastUpdated) / 1000 : null;

  if (!state.lastUpdated) {
    textEl.textContent = "Status: Waiting for data…";
    return;
  }

  if (ageSec != null && ageSec > 90) {
    dot.classList.add("status-stale");
    textEl.textContent = "Status: Data is stale";
  } else if (state.error) {
    dot.classList.add("status-error");
    textEl.textContent = "Status: Degraded (using cached data)";
  } else {
    dot.classList.add("status-live");
    textEl.textContent = "Status: Live market data";
  }
}

function updateLastUpdated() {
  if (!els.lastUpdated) return;
  const valueEl = els.lastUpdated.querySelector(".last-updated-value");
  if (!valueEl) return;
  valueEl.textContent = state.lastUpdated ? formatTime(state.lastUpdated) : "–";
}

function setLoading(isLoading) {
  if (!els.loadingIndicator) return;
  els.loadingIndicator.classList.toggle("hidden", !isLoading);
}

function showError(message) {
  if (!els.errorBanner) return;
  if (!message) {
    els.errorBanner.classList.add("hidden");
    els.errorBanner.textContent = "";
    return;
  }
  els.errorBanner.textContent = message;
  els.errorBanner.classList.remove("hidden");
}

// -----------------------------
// Rendering: Table
// -----------------------------

function getDisplayCoins() {
  let coins = [...state.coins];

  // Filter to tracked set just in case
  coins = coins.filter((c) => TRACKED_ASSET_IDS.includes(c.id));

  const favoritesOnly = !!(
    els.favoritesOnlyToggle && els.favoritesOnlyToggle.checked
  );
  if (favoritesOnly) {
    coins = coins.filter((c) => state.favorites.has(c.id));
  }

  coins.sort((a, b) => {
    // always keep favorites on top
    const aFav = state.favorites.has(a.id);
    const bFav = state.favorites.has(b.id);
    if (aFav !== bFav) {
      return aFav ? -1 : 1;
    }

    let dir = state.sortDir === "desc" ? -1 : 1;
    if (state.sortKey === "price") {
      const aPrice = Number(a.priceUsd);
      const bPrice = Number(b.priceUsd);
      return (aPrice - bPrice) * dir;
    }
    if (state.sortKey === "change") {
      const aCh = Number(a.changePercent24Hr);
      const bCh = Number(b.changePercent24Hr);
      return (aCh - bCh) * dir;
    }

    // rank default
    const aRank = Number(a.rank);
    const bRank = Number(b.rank);
    return (aRank - bRank) * dir;
  });

  return coins;
}

function updateSortIndicators() {
  const indicators = document.querySelectorAll(".sort-indicator");
  indicators.forEach((el) => {
    const key = el.getAttribute("data-for");
    if (!key) return;
    const isActive = key === state.sortKey.replace("rank", "");
    el.classList.toggle("active", isActive);
    if (!isActive) {
      el.textContent = "↕";
    } else {
      el.textContent = state.sortDir === "asc" ? "↑" : "↓";
    }
  });
}

function renderTable() {
  if (!els.tableBody) return;

  const coins = getDisplayCoins();
  const currency = state.currency;

  // If no coins, show an empty state row
  if (!coins.length) {
    els.tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 0.8rem 0; color: var(--muted-text);">
          No data to display. Please check your connection or try again shortly.
        </td>
      </tr>
    `;
    return;
  }

  const fragments = document.createDocumentFragment();

  for (const coin of coins) {
    const row = document.createElement("tr");
    row.dataset.id = coin.id;

    const direction = computeRowDirection(coin);
    if (direction === "up") row.classList.add("row-up");
    if (direction === "down") row.classList.add("row-down");
    if (coin.id === state.selectedCoinId) {
      row.classList.add("selected-row");
    }

    const priceUsd = Number(coin.priceUsd);
    const convertedPrice = convertFromUsd(priceUsd, currency);
    const change = Number(coin.changePercent24Hr);
    const isPositive = !isNaN(change) && change > 0;
    const isNegative = !isNaN(change) && change < 0;

    // Favorite column
    const favTd = document.createElement("td");
    favTd.className = "col-favorite";
    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "favorite-btn";
    if (state.favorites.has(coin.id)) {
      favBtn.classList.add("is-favorite");
    }
    favBtn.innerHTML = "★";
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(coin.id);
    });
    favTd.appendChild(favBtn);

    // Name column
    const nameTd = document.createElement("td");
    nameTd.className = "col-name";
    const nameDiv = document.createElement("div");
    nameDiv.className = "coin-name";
    nameDiv.textContent = coin.name || "";
    const symbolDiv = document.createElement("span");
    symbolDiv.className = "coin-symbol";
    symbolDiv.textContent = coin.symbol || "";
    nameTd.appendChild(nameDiv);
    nameTd.appendChild(symbolDiv);

    // Price column
    const priceTd = document.createElement("td");
    priceTd.className = "price-cell";
    priceTd.textContent =
      convertedPrice == null ? "–" : formatCurrency(convertedPrice, currency);

    // Change column
    const changeTd = document.createElement("td");
    changeTd.className = "change-cell";
    if (isNaN(change)) {
      changeTd.textContent = "–";
    } else {
      changeTd.textContent = formatPercent(change);
      if (isPositive) changeTd.classList.add("change-positive");
      if (isNegative) changeTd.classList.add("change-negative");
    }

    // Trend column
    const trendTd = document.createElement("td");
    const trendSpan = document.createElement("span");
    trendSpan.className = "trend-indicator";
    if (isPositive) {
      trendSpan.classList.add("trend-up");
      trendSpan.textContent = "↑ Up";
    } else if (isNegative) {
      trendSpan.classList.add("trend-down");
      trendSpan.textContent = "↓ Down";
    } else {
      trendSpan.textContent = "—";
    }
    trendTd.appendChild(trendSpan);

    row.appendChild(favTd);
    row.appendChild(nameTd);
    row.appendChild(priceTd);
    row.appendChild(changeTd);
    row.appendChild(trendTd);

    row.addEventListener("click", () => {
      selectCoin(coin.id);
    });

    fragments.appendChild(row);
  }

  els.tableBody.innerHTML = "";
  els.tableBody.appendChild(fragments);

  updateSortIndicators();
}

// -----------------------------
// Rendering: Chart
// -----------------------------

function ensureChartContext() {
  if (!els.priceChart || chartCtx) return;
  const canvas = els.priceChart;

  // Set device-pixel-ratio friendly size
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  chartCtx = canvas.getContext("2d");
  chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function clearChart() {
  if (!chartCtx || !els.priceChart) return;
  const canvas = els.priceChart;
  const rect = canvas.getBoundingClientRect();
  chartCtx.clearRect(0, 0, rect.width, rect.height);
}

function renderSelectedCoinSummary(coin) {
  if (!els.selectedCoinSummary) return;

  if (!coin) {
    els.selectedCoinSummary.innerHTML = "";
    els.chartSubtitle.textContent =
      "Select a coin from the list to view its recent price movement.";
    return;
  }

  const currency = state.currency;
  const priceUsd = Number(coin.priceUsd);
  const convertedPrice = convertFromUsd(priceUsd, currency);
  const change = Number(coin.changePercent24Hr);
  const isPositive = !isNaN(change) && change > 0;
  const isNegative = !isNaN(change) && change < 0;

  const history = state.priceHistory.get(coin.id) || [];
  let rangeText = "Awaiting more data";
  if (history.length > 1) {
    const prices = history.map((p) => p.priceUsd);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const minConv = convertFromUsd(min, currency);
    const maxConv = convertFromUsd(max, currency);
    rangeText = `${formatCurrency(
      minConv,
      currency
    )} – ${formatCurrency(maxConv, currency)}`;
  }

  els.chartSubtitle.textContent = `Recent price movement for ${coin.name} in ${currency}`;

  const changeClass =
    isPositive && !isNegative
      ? "change-positive"
      : isNegative && !isPositive
      ? "change-negative"
      : "";

  els.selectedCoinSummary.innerHTML = `
    <div class="selected-coin-primary">
      <div class="coin-name">
        ${coin.name}
        <span class="coin-symbol">${coin.symbol}</span>
      </div>
      <div class="selected-coin-price">
        ${
          convertedPrice == null
            ? "–"
            : formatCurrency(convertedPrice, currency)
        }
      </div>
    </div>
    <div class="selected-coin-meta">
      <div class="selected-coin-change ${changeClass}">
        24h: ${isNaN(change) ? "–" : formatPercent(change)}
      </div>
      <div class="selected-coin-range">
        Intraday range: ${rangeText}
      </div>
    </div>
  `;
}

function renderChart() {
  ensureChartContext();
  if (!chartCtx || !els.priceChart) return;

  const canvas = els.priceChart;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  clearChart();

  const selectedId = state.selectedCoinId;
  const coin =
    state.coins.find((c) => c.id === selectedId) || state.coins[0] || null;

  if (!coin) {
    chartCtx.save();
    chartCtx.fillStyle = getComputedStyle(document.body).getPropertyValue(
      "--muted-text"
    );
    chartCtx.font = "12px system-ui, -apple-system, sans-serif";
    chartCtx.textAlign = "center";
    chartCtx.textBaseline = "middle";
    chartCtx.fillText(
      "Waiting for market data…",
      width / 2,
      height / 2
    );
    chartCtx.restore();
    return;
  }

  const history = state.priceHistory.get(coin.id) || [];
  if (history.length < 2) {
    chartCtx.save();
    chartCtx.fillStyle = getComputedStyle(document.body).getPropertyValue(
      "--muted-text"
    );
    chartCtx.font = "12px system-ui, -apple-system, sans-serif";
    chartCtx.textAlign = "center";
    chartCtx.textBaseline = "middle";
    chartCtx.fillText(
      "Chart will appear as prices update over time.",
      width / 2,
      height / 2
    );
    chartCtx.restore();
    renderSelectedCoinSummary(coin);
    return;
  }

  const prices = history.map((p) => p.priceUsd);
  const times = history.map((p) => p.time);
  let minPrice = Math.min(...prices);
  let maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    const padding = minPrice * 0.01 || 0.5;
    minPrice -= padding;
    maxPrice += padding;
  }

  const paddingLeft = 8;
  const paddingRight = 6;
  const paddingTop = 10;
  const paddingBottom = 14;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minTime = times[0];
  const maxTime = times[times.length - 1];
  const timeSpan = maxTime - minTime || 1;

  function xForTime(t) {
    const ratio = (t - minTime) / timeSpan;
    return paddingLeft + ratio * chartWidth;
  }

  function yForPrice(p) {
    const ratio = (p - minPrice) / (maxPrice - minPrice || 1);
    return paddingTop + chartHeight - ratio * chartHeight;
  }

  // Background baseline
  chartCtx.save();
  chartCtx.strokeStyle = "rgba(148, 163, 184, 0.35)";
  chartCtx.lineWidth = 1;
  chartCtx.beginPath();
  chartCtx.moveTo(paddingLeft, height - paddingBottom);
  chartCtx.lineTo(width - paddingRight, height - paddingBottom);
  chartCtx.stroke();
  chartCtx.restore();

  const change = Number(coin.changePercent24Hr);
  const isPositive = !isNaN(change) && change > 0;
  const isNegative = !isNaN(change) && change < 0;
  const computedStyles = getComputedStyle(document.body);
  const strokeColor = isPositive
    ? computedStyles.getPropertyValue("--gain-color")
    : isNegative
    ? computedStyles.getPropertyValue("--loss-color")
    : computedStyles.getPropertyValue("--accent-color");

  chartCtx.save();
  chartCtx.strokeStyle = strokeColor.trim();
  chartCtx.lineWidth = 1.6;
  chartCtx.lineJoin = "round";
  chartCtx.lineCap = "round";
  chartCtx.beginPath();

  history.forEach((point, index) => {
    const x = xForTime(point.time);
    const y = yForPrice(point.priceUsd);
    if (index === 0) {
      chartCtx.moveTo(x, y);
    } else {
      chartCtx.lineTo(x, y);
    }
  });

  chartCtx.stroke();
  chartCtx.restore();

  // Draw latest point
  const lastPoint = history[history.length - 1];
  const lastX = xForTime(lastPoint.time);
  const lastY = yForPrice(lastPoint.priceUsd);
  chartCtx.save();
  chartCtx.fillStyle = strokeColor.trim();
  chartCtx.beginPath();
  chartCtx.arc(lastX, lastY, 3, 0, Math.PI * 2);
  chartCtx.fill();
  chartCtx.restore();

  renderSelectedCoinSummary(coin);
}

// -----------------------------
// Interactions
// -----------------------------

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
  } else {
    state.favorites.add(id);
  }
  savePreferences();
  renderTable();
}

function handleSortClick(key) {
  if (state.sortKey === key) {
    state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
  } else {
    state.sortKey = key;
    state.sortDir = key === "rank" ? "asc" : "desc";
  }
  renderTable();
}

function selectCoin(id) {
  state.selectedCoinId = id;
  renderTable();
  renderChart();
}

function handleResize() {
  if (!els.priceChart || !chartCtx) return;
  chartCtx = null;
  ensureChartContext();
  renderChart();
}

// -----------------------------
// Theme & Controls
// -----------------------------

function initControls() {
  if (els.currencySelect) {
    els.currencySelect.value = state.currency;
    els.currencySelect.addEventListener("change", () => {
      const val = els.currencySelect.value;
      if (SUPPORTED_FIATS.includes(val)) {
        state.currency = val;
        savePreferences();
        renderTable();
        renderChart();
      }
    });
  }

  if (els.themeToggleBtn) {
    els.themeToggleBtn.addEventListener("click", () => {
      const current = document.body.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.body.setAttribute("data-theme", next);
      state.theme = next;
      savePreferences();
      renderChart(); // ensure colors update
    });
  }

  if (els.favoritesOnlyToggle) {
    els.favoritesOnlyToggle.addEventListener("change", () => {
      renderTable();
    });
  }

  if (els.thPrice) {
    els.thPrice.addEventListener("click", () => handleSortClick("price"));
  }

  if (els.thChange) {
    els.thChange.addEventListener("click", () => handleSortClick("change"));
  }

  window.addEventListener("resize", () => {
    // debounce simple
    clearTimeout(handleResize._timer);
    handleResize._timer = setTimeout(handleResize, 200);
  });
}

// -----------------------------
// Data Refresh
// -----------------------------

async function refreshData() {
  const firstLoad = !state.hasInitialized;
  if (firstLoad) {
    state.isLoading = true;
    setLoading(true);
  }

  try {
    const [assets, rates] = await Promise.all([
      fetchAssets(),
      // only fetch rates periodically; here we simply fetch whenever we poll
      fetchRates().catch(() => null)
    ]);

    if (rates) {
      state.currencyRates = { ...state.currencyRates, ...rates };
    }

    // sanitize and keep only tracked assets
    const filtered = assets.filter((c) =>
      TRACKED_ASSET_IDS.includes(c.id)
    );

    const nowTs = Date.now();
    updatePriceHistory(filtered, nowTs);
    snapshotCoins(filtered);

    state.coins = filtered;
    state.lastUpdated = nowTs;
    state.error = null;
    state.hasInitialized = true;

    if (!state.selectedCoinId && filtered.length) {
      state.selectedCoinId = filtered[0].id;
    }

    renderTable();
    renderChart();
    updateLastUpdated();
    updateMarketStatus();
    showError("");
  } catch (err) {
    console.error(err);
    state.error =
      "Unable to refresh market data right now. Showing the latest available values.";
    showError(state.error);
    updateMarketStatus();
  } finally {
    state.isLoading = false;
    setLoading(false);
  }
}

// -----------------------------
// Initialization
// -----------------------------

function init() {
  if (!els.priceChart) return;

  loadPreferences();
  // Seed a gentle synthetic history so the chart looks meaningful
  // even before the first successful API call (or when offline).
  seedOfflineHistoryIfNeeded();
  initControls();
  ensureChartContext();
  updateMarketStatus();
  updateLastUpdated();
  updateSortIndicators();

  // Kick off initial data load and polling
  refreshData();
  setInterval(refreshData, POLL_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", init);

