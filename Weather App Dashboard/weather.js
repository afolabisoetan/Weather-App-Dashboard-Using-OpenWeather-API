const API_KEY = 'dcafbb29bd173041489e5a9d94003dc0';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const cities = [
    'New York',
    'London',
    'Tokyo',
    'Sydney',
    'Paris',
    'Berlin',
    'Mumbai',
    'Los Angeles',
    'Lagos',
    'Toronto',
    'Nairobi',
    'Rio de janeiro'
];

const weatherContainer = document.getElementById('weatherContainer');

async function fetchWeather(city) {
    try {
        const response = await fetch(`${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching weather for ${city}:`, error);
        return null;
    }
}

function createWeatherCard(city, weatherData) {
    if (!weatherData) {
        return `
            <div class="weather-card error">
                <div class="city-name">${city}</div>
                <div>Failed to load weather data</div>
            </div>
        `;
    }

    const { main, weather, wind } = weatherData;
    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    return `
        <div class="weather-card">
            <div class="city-name">${city}</div>
            <img src="${iconUrl}" alt="${weather[0].description}" class="weather-icon">
            <div class="temperature">${Math.round(main.temp)}°C</div>
            <div class="weather-description">${weather[0].description}</div>
            <div class="weather-details">
                <div>
                    <span>Humidity</span>
                    <span>${main.humidity}%</span>
                </div>
                <div>
                    <span>Wind</span>
                    <span>${wind.speed} m/s</span>
                </div>
                <div>
                    <span>Feels like</span>
                    <span>${Math.round(main.feels_like)}°C</span>
                </div>
            </div>
        </div>
    `;
}

async function loadWeatherData() {
    weatherContainer.innerHTML = '<div class="loading">Loading weather data...</div>';
    
    const weatherPromises = cities.map(city => fetchWeather(city));
    const weatherResults = await Promise.all(weatherPromises);
    
    const weatherCards = cities.map((city, index) => 
        createWeatherCard(city, weatherResults[index])
    );
    
    weatherContainer.innerHTML = weatherCards.join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadWeatherData();

    const searchButton = document.getElementById('searchButton');
    const cityInput = document.getElementById('cityInput');
    const errorMessage = document.getElementById('errorMessage');

    searchButton.addEventListener('click', async () => {
        const city = cityInput.value.trim();
        if (city) {
            const city2 = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
            const weatherData = await fetchWeather(city2);
            if (weatherData) {
                // Check if city is already displayed
                const existingCards = weatherContainer.querySelectorAll('.city-name');
                const cityExists = Array.from(existingCards).some(card =>
                    card.textContent.toLowerCase() === city2.toLowerCase()
                );

                if (cityExists) {
                    errorMessage.textContent = 'This place is already displayed';
                    errorMessage.style.display = 'block';
                } else {
                    const card = createWeatherCard(city2, weatherData);
                    weatherContainer.insertAdjacentHTML('afterbegin', card);
                    errorMessage.textContent = '';
                    errorMessage.style.display = 'none';
                }
            } else {
                errorMessage.textContent = 'Failed to load data (perhaps you spelt that place incorrectly?)';
                errorMessage.style.display = 'block';
            }
            cityInput.value = ''; // Clear input
        } else {
            alert('Please enter a city name.');
        }
    });
    
    // Allow enter key to trigger search
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
});
