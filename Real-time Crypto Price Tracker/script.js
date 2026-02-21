const cryptoList = document.getElementById('crypto-list');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view-section');
const chartCanvas = document.getElementById('priceChart').getContext('2d');
const selectedIcon = document.getElementById('selectedIcon');
const selectedCoinName = document.getElementById('selectedCoinName');
const selectedCoinPrice = document.getElementById('selectedCoinPrice');
const detailMktCap = document.getElementById('detailMktCap');
const detailVol = document.getElementById('detailVol');
const detailHigh = document.getElementById('detailHigh');
const detailLow = document.getElementById('detailLow');
const trendingContainer = document.getElementById('trending-list');
const timeBtns = document.querySelectorAll('.time-btn');
let allCoins = [];
let chartInstance = null;
let currentCoinId = 'bitcoin';
let currentDays = 1;
const LIST_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false';
const CHART_URL = (id, days) => `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
const TRENDING_URL = 'https://api.coingecko.com/api/v3/search/trending';
async function init() {
    setupNavigation();
    await fetchMarketData();
    if (allCoins.length > 0) {
        loadCoinDetails(allCoins[0]);
    }
}
function setupNavigation() {
    navItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.style.display = 'none');
            item.classList.add('active');
            if (index === 0) document.getElementById('view-dashboard').style.display = 'block';
            if (index === 1) {
                document.getElementById('view-trending').style.display = 'block';
                fetchTrending();
            }
            if (index === 2) document.getElementById('view-portfolio').style.display = 'block';
            if (index === 3) document.getElementById('view-news').style.display = 'block';
            if (index === 4) document.getElementById('view-settings').style.display = 'block';
        });
    });
}
async function fetchMarketData() {
    try {
        refreshBtn.classList.add('rotating');
        const res = await fetch(LIST_URL);
        const data = await res.json();
        allCoins = data;
        renderList(allCoins);
    } catch (err) {
        console.error("List fetch error:", err);
    }
}
function renderList(data) {
    cryptoList.innerHTML = '';
    data.forEach(coin => {
        const el = document.createElement('div');
        el.className = 'list-row';
        el.onclick = () => {
            navItems[0].click();
            loadCoinDetails(coin);
        };

        const changeClass = coin.price_change_percentage_24h >= 0 ? 'success' : 'danger';

        el.innerHTML = `
            <div class="list-coin">
                <img src="${coin.image}" alt="icon">
                <span>${coin.symbol.toUpperCase()}</span>
            </div>
            <div>$${coin.current_price.toLocaleString()}</div>
            <div class="${changeClass}">${coin.price_change_percentage_24h.toFixed(2)}%</div>
        `;
        cryptoList.appendChild(el);
    });
}
async function loadCoinDetails(coin) {
    currentCoinId = coin.id;

    selectedIcon.src = coin.image;
    selectedIcon.style.display = 'block';
    selectedCoinName.innerText = coin.name;
    selectedCoinPrice.innerText = `$${coin.current_price.toLocaleString()}`;

    detailMktCap.innerText = `$${(coin.market_cap / 1e9).toFixed(2)}B`;
    detailVol.innerText = `$${(coin.total_volume / 1e6).toFixed(2)}M`;
    detailHigh.innerText = `$${coin.high_24h.toLocaleString()}`;
    detailLow.innerText = `$${coin.low_24h.toLocaleString()}`;

    await loadChart(currentCoinId, currentDays);
}
async function loadChart(coinId, days) {
    if (chartInstance) chartInstance.destroy();

    try {
        const res = await fetch(CHART_URL(coinId, days));
        const data = await res.json();
        const prices = data.prices;

        const labels = prices.map(p => {
            const date = new Date(p[0]);
            return days === 1 ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString();
        });
        const priceData = prices.map(p => p[1]);

        const gradient = chartCanvas.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        chartInstance = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price (USD)',
                    data: priceData,
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#1e293b',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#64748b',
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: { color: '#334155' },
                        ticks: { color: '#64748b' }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });

    } catch (err) {
        console.error("Chart fetch error:", err);
    }
}
async function fetchTrending() {
    trendingContainer.innerHTML = '<div class="loader"></div>';
    try {
        const res = await fetch(TRENDING_URL);
        const data = await res.json();
        const coins = data.coins;

        trendingContainer.innerHTML = '';
        coins.forEach((item, index) => {
            const coin = item.item;
            const el = document.createElement('div');
            el.className = 'trending-card';
            el.innerHTML = `
                <div class="rank">#${index + 1}</div>
                <img src="${coin.large}" alt="${coin.name}" style="width: 50px; border-radius: 50%;">
                <div>
                    <h4>${coin.name} (${coin.symbol})</h4>
                    <p>Rank: ${coin.market_cap_rank}</p>
                    <p style="font-size: 0.8rem; opacity: 0.7;">Price (BTC): ${coin.price_btc.toFixed(8)}</p>
                </div>
            `;
            trendingContainer.appendChild(el);
        });

    } catch (err) {
        trendingContainer.innerHTML = '<p>Failed to load trending coins</p>';
    }
}
timeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        timeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const days = e.target.getAttribute('data-days');
        currentDays = parseInt(days);
        loadChart(currentCoinId, currentDays);
    });
});
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allCoins.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.symbol.toLowerCase().includes(term)
    );
    renderList(filtered);
});

refreshBtn.addEventListener('click', fetchMarketData);
init();
