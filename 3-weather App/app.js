// API Configuration
const API_KEY = 'f00c38e0279b7bc85480c3fe775d518c';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loader = document.getElementById('loader');
const error = document.getElementById('error');
const weatherInfo = document.getElementById('weatherInfo');
const errorMessage = document.getElementById('errorMessage');

// Weather Data Elements
const dateTime = document.getElementById('dateTime');
const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const temp = document.getElementById('temp');
const condition = document.getElementById('condition');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// Fetch Weather Data
async function getWeatherData(city) {
    try {
        // Show loader, hide other sections
        showLoader();
        
        const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            throw new Error('Location not found');
        }
        
        const data = await response.json();
        displayWeatherData(data);
        
    } catch (err) {
        showError(err.message);
    }
}

// Display Weather Data
function displayWeatherData(data) {
    // Update date and time
    updateDateTime();
    
    // Update location
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.alt = data.weather[0].description;
    
    // Update temperature and condition
    temp.textContent = `${Math.round(data.main.temp)}°C`;
    condition.textContent = data.weather[0].description;
    
    // Update weather details
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // Change background based on weather condition
    updateBackground(data.weather[0].main.toLowerCase());
    
    // Hide loader and error, show weather info
    hideLoader();
    hideError();
    showWeatherInfo();
}

// Update Date and Time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateTime.textContent = now.toLocaleDateString('en-US', options);
}

// Update Background Based on Weather
function updateBackground(weatherCondition) {
    // Remove all weather classes
    document.body.className = '';
    
    // Add appropriate class based on weather
    const weatherClasses = {
        'clear': 'clear',
        'clouds': 'clouds',
        'rain': 'rain',
        'drizzle': 'rain',
        'snow': 'snow',
        'thunderstorm': 'thunderstorm',
        'mist': 'mist',
        'haze': 'haze',
        'fog': 'fog'
    };
    
    const weatherClass = weatherClasses[weatherCondition] || '';
    if (weatherClass) {
        document.body.classList.add(weatherClass);
    }
}

// UI State Management
function showLoader() {
    loader.classList.add('active');
    weatherInfo.classList.remove('active');
    error.classList.remove('active');
}

function hideLoader() {
    loader.classList.remove('active');
}

function showError(message) {
    errorMessage.textContent = message || 'Location not found. Please try again.';
    error.classList.add('active');
    loader.classList.remove('active');
    weatherInfo.classList.remove('active');
}

function hideError() {
    error.classList.remove('active');
}

function showWeatherInfo() {
    weatherInfo.classList.add('active');
}

// Load default city on page load
window.addEventListener('load', () => {
    getWeatherData('London');
});
