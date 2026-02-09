// Weather icon mapping
const weatherIcons = {
    'Sunny': '☀️',
    'Cloudy': '☁️',
    'Rainy': '🌧️',
    'Snowy': '❄️',
    'Stormy': '⛈️',
    'Foggy': '🌫️'
};

// Default weather data
const defaultWeather = {
    city: 'London',
    temperature: 22,
    condition: 'Sunny',
    humidity: 65,
    windSpeed: 12
};

// DOM elements
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const city = document.getElementById('city');
const condition = document.getElementById('condition');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const toggleBtn = document.getElementById('toggleForm');
const formCard = document.getElementById('formCard');
const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const tempInput = document.getElementById('tempInput');
const conditionInput = document.getElementById('conditionInput');
const humidityInput = document.getElementById('humidityInput');
const windInput = document.getElementById('windInput');

// Load weather from localStorage or use default
function loadWeather() {
    const saved = localStorage.getItem('weatherData');
    const weatherData = saved ? JSON.parse(saved) : defaultWeather;
    
    // Save default if nothing exists
    if (!saved) {
        localStorage.setItem('weatherData', JSON.stringify(defaultWeather));
    }
    
    displayWeather(weatherData);
}

// Display weather data
function displayWeather(data) {
    weatherIcon.textContent = weatherIcons[data.condition] || '🌤️';
    temperature.textContent = `${data.temperature}°C`;
    city.textContent = data.city;
    condition.textContent = data.condition;
    humidity.textContent = `${data.humidity}%`;
    windSpeed.textContent = `${data.windSpeed} km/h`;
}

// Toggle form visibility
toggleBtn.addEventListener('click', () => {
    formCard.classList.toggle('active');
    
    if (formCard.classList.contains('active')) {
        const saved = localStorage.getItem('weatherData');
        const current = saved ? JSON.parse(saved) : defaultWeather;
        
        cityInput.value = current.city;
        tempInput.value = current.temperature;
        conditionInput.value = current.condition;
        humidityInput.value = current.humidity;
        windInput.value = current.windSpeed;
        
        toggleBtn.textContent = 'Cancel';
    } else {
        toggleBtn.textContent = 'Update Weather';
    }
});

// Handle form submission
weatherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newWeather = {
        city: cityInput.value.trim(),
        temperature: parseInt(tempInput.value),
        condition: conditionInput.value,
        humidity: parseInt(humidityInput.value),
        windSpeed: parseInt(windInput.value)
    };
    
    localStorage.setItem('weatherData', JSON.stringify(newWeather));
    displayWeather(newWeather);
    formCard.classList.remove('active');
    toggleBtn.textContent = 'Update Weather';
    
    weatherForm.reset();
});

// Initialize app
loadWeather();
