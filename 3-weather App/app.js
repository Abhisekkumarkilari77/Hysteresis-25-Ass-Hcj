// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loader = document.getElementById('loader');
const error = document.getElementById('error');
const weatherInfo = document.getElementById('weatherInfo');
const errorMessage = document.getElementById('errorMessage');

// Data Elements
const cityNameInfo = document.getElementById('cityName');
const dateTimeInfo = document.getElementById('dateTime');
const tempInfo = document.getElementById('temp');
const conditionInfo = document.getElementById('condition');
const weatherIcon = document.getElementById('weatherIcon');
const humidityInfo = document.getElementById('humidity');
const windSpeedInfo = document.getElementById('windSpeed');
const minMaxInfo = document.getElementById('minMax');

// Chart instances
let hourlyTempChart = null;
let hourlyWindChart = null;
let monthlyChart = null;

// WMO Weather Codes Mapping
const weatherCodes = {
    0: { desc: 'Clear Sky', icon: '01d' },
    1: { desc: 'Mainly Clear', icon: '02d' },
    2: { desc: 'Partly Cloudy', icon: '03d' },
    3: { desc: 'Overcast', icon: '04d' },
    45: { desc: 'Fog', icon: '50d' },
    48: { desc: 'Depositing Rime Fog', icon: '50d' },
    51: { desc: 'Light Drizzle', icon: '09d' },
    53: { desc: 'Moderate Drizzle', icon: '09d' },
    55: { desc: 'Dense Drizzle', icon: '09d' },
    61: { desc: 'Slight Rain', icon: '10d' },
    63: { desc: 'Moderate Rain', icon: '10d' },
    65: { desc: 'Heavy Rain', icon: '10d' },
    71: { desc: 'Slight Snow Fall', icon: '13d' },
    73: { desc: 'Moderate Snow Fall', icon: '13d' },
    75: { desc: 'Heavy Snow Fall', icon: '13d' },
    95: { desc: 'Thunderstorm', icon: '11d' }
};

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeatherData(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) getWeatherData(city);
    }
});

// Initialization
window.addEventListener('load', () => {
    getWeatherData('Mumbai'); // Default city
});

async function getWeatherData(city) {
    try {
        showLoader();
        hideError();

        // 1. Geocoding
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found');
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        cityNameInfo.textContent = `${name}, ${country}`;

        // 2. Fetch Forecast (Hourly)
        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();

        // 3. Fetch Monthly (Historical - Last 30 days)
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000);

        const endDate = twoDaysAgo.toISOString().split('T')[0];
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];

        const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,wind_speed_10m_max&timezone=auto`;
        const archiveRes = await fetch(archiveUrl);
        const archiveData = await archiveRes.json();

        displayData(forecastData, archiveData);

    } catch (err) {
        showError(err.message);
    } finally {
        hideLoader();
    }
}

function displayData(forecast, archive) {
    // Current Weather
    const current = forecast.current;
    const code = weatherCodes[current.weather_code] || { desc: 'Unknown', icon: '01d' };

    tempInfo.textContent = `${Math.round(current.temperature_2m)}°C`;
    conditionInfo.textContent = code.desc;
    weatherIcon.src = `https://openweathermap.org/img/wn/${code.icon}@4x.png`;
    humidityInfo.textContent = `${current.relative_humidity_2m}%`;
    windSpeedInfo.textContent = `${current.wind_speed_10m} km/h`;

    const daily = forecast.daily;
    minMaxInfo.textContent = `${Math.round(daily.temperature_2m_min[0])}° / ${Math.round(daily.temperature_2m_max[0])}°`;

    updateDateTime();

    // Update Charts
    updateHourlyCharts(forecast.hourly);
    updateMonthlyChart(archive.daily);

    weatherInfo.style.display = 'block';
}

function updateHourlyCharts(hourly) {
    const labels = hourly.time.slice(0, 24).map(t => new Date(t).getHours() + ':00');
    const temps = hourly.temperature_2m.slice(0, 24);
    const winds = hourly.wind_speed_10m.slice(0, 24);

    // Temp Chart
    if (hourlyTempChart) hourlyTempChart.destroy();
    hourlyTempChart = createChart('hourlyTempChart', labels, temps, 'Temp (°C)', '#818cf8');

    // Wind Chart
    if (hourlyWindChart) hourlyWindChart.destroy();
    hourlyWindChart = createChart('hourlyWindChart', labels, winds, 'Wind (km/h)', '#c084fc');
}

function updateMonthlyChart(daily) {
    const labels = daily.time.map(t => new Date(t).getDate() + '/' + (new Date(t).getMonth() + 1));
    const temps = daily.temperature_2m_max;
    const winds = daily.wind_speed_10m_max;

    if (monthlyChart) monthlyChart.destroy();

    const ctx = document.getElementById('monthlyChart').getContext('2d');
    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Max Temp (°C)',
                    data: temps,
                    borderColor: '#fbbf24',
                    backgroundColor: '#fbbf2420',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Max Wind (km/h)',
                    data: winds,
                    borderColor: '#34d399',
                    backgroundColor: '#34d39920',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#94a3b8', font: { size: 10 } }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#fbbf24', font: { size: 10 } }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#34d399', font: { size: 10 } }
                }
            }
        }
    });
}

function createChart(id, labels, data, label, color) {
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '20', // Add transparency
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0,
                pointHitRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                }
            }
        }
    });
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    dateTimeInfo.textContent = now.toLocaleDateString(undefined, options);
}

function showLoader() { loader.classList.add('active'); }
function hideLoader() { loader.classList.remove('active'); }
function hideError() { error.classList.remove('active'); }
function showError(msg) {
    errorMessage.textContent = msg;
    error.classList.add('active');
}
