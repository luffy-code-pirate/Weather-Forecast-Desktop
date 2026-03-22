document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     API / GLOBAL VARIABLES
  ========================== */
  const OWM_API_KEY = "8f15aaa8a8655e8d3a1cb876b94c52ae";
  let clockInterval = null;

  /* =========================
     DOM ELEMENTS
  ========================== */
  const searchForm = document.getElementById("search-form");
  const cityInput = document.getElementById("city-input");
  const geolocationBtn = document.getElementById("geolocation-btn");
  const loadingOverlay = document.getElementById("loading-overlay");
  const errorModal = document.getElementById("error-modal");
  const errorMessageEl = document.getElementById("error-message");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const animationContainer = document.getElementById("animation-container");
  const suggestionBox = document.getElementById("suggestion-box");

  const cityNameEl = document.getElementById("city-name");
  const currentDateEl = document.getElementById("current-date");
  const currentTimeEl = document.getElementById("current-time");
  const currentTempEl = document.getElementById("current-temp");
  const currentWeatherDescEl = document.getElementById("current-weather-desc");
  const currentWeatherIconEl = document.getElementById("current-weather-icon");
  const forecastContainer = document.getElementById("forecast-container");

  const sunriseTimeEl = document.getElementById("sunrise-time");
  const sunsetTimeEl = document.getElementById("sunset-time");
  const humidityEl = document.getElementById("humidity");
  const windSpeedEl = document.getElementById("wind-speed");
  const feelsLikeEl = document.getElementById("feels-like");
  const pressureEl = document.getElementById("pressure");
  const visibilityEl = document.getElementById("visibility");
  const airQualityEl = document.getElementById("air-quality");
  const healthRecommendationsEl = document.getElementById(
    "health-recommendations",
  );

  /* =========================
     BACKGROUND IMAGES - DAY
  ========================== */
  const backgroundImageDay = {
    Clear:
      "Assets/bgimages/clear1.jpg",
    Clouds:
      "Assets/bgimages/clouds1.jpg",
    Rain: "Assets/bgimages/rain1.jpg",
    Drizzle:
      "Assets/bgimages/drizzle1.jpg",
    Thunderstorm:
      "Assets/bgimages/thunder1.jpg",
    Snow: "Assets/bgimages/snow1.jpg",
    Mist: "Assets/bgimages/mist1.jpg",
    Default:
      "Assets/bgimages/default1.jpg",
  };

  /* =========================
     BACKGROUND IMAGES - NIGHT
  ========================== */
  const backgroundImageNight = {
    Clear:
      "Assets/bgimages/clear2.jpg",
    Clouds:
      "Assets/bgimages/clouds2.jpg",
    Rain: "Assets/bgimages/rain2.jpg",
    Drizzle:
      "Assets/bgimages/drizzle2.jpg",
    Thunderstorm:
      "Assets/bgimages/thunder2.jpg",
    Snow: "Assets/bgimages/snow2.jpg",
    Mist: "Assets/bgimages/mist2.jpg",
    Default:
      "Assets/bgimages/default2.jpg",
  };

  /* =========================
     UI HELPER FUNCTIONS
  ========================== */
  const showLoading = () => {
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.classList.add("flex");
  };

  const hideLoading = () => {
    loadingOverlay.classList.add("hidden");
    loadingOverlay.classList.remove("flex");
  };

  const showError = (message) => {
    errorMessageEl.textContent = message;
    errorModal.classList.remove("hidden");
  };

  /* =========================
     TIME / DATE FUNCTIONS
  ========================== */
  const formatLocalTime = (unixTimestamp, timezoneOffset) => {
    return new Date((unixTimestamp + timezoneOffset) * 1000).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      },
    );
  };

  const updateClock = (timezoneOffset) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const localTime = new Date(utc + timezoneOffset * 1000);

    currentTimeEl.textContent = localTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  /* =========================
     AIR QUALITY HELPER
  ========================== */
  const getAqiInfo = (aqi) => {
    switch (aqi) {
      case 1:
        return {
          text: "Good",
          color: "bg-green-500 text-white",
          recommendation:
            "Air quality is great. It's a perfect day to be active outside.",
        };
      case 2:
        return {
          text: "Fair",
          color: "bg-yellow-500 text-black",
          recommendation:
            "Air quality is acceptable. Sensitive people should reduce prolonged outdoor exertion.",
        };
      case 3:
        return {
          text: "Moderate",
          color: "bg-orange-500 text-white",
          recommendation:
            "Sensitive groups may experience mild effects. General public is less likely to be affected.",
        };
      case 4:
        return {
          text: "Poor",
          color: "bg-red-500 text-white",
          recommendation:
            "Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor activity.",
        };
      case 5:
        return {
          text: "Very Poor",
          color: "bg-purple-700 text-white",
          recommendation:
            "Health alert. Avoid outdoor activities if possible, especially for children and elderly.",
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-500 text-white",
          recommendation: "Air quality data is not available at the moment.",
        };
    }
  };

  /* =========================
     FORECAST DATA PROCESSING
  ========================== */
  const processForecast = (forecastList) => {
    const dailyData = {};

    forecastList.forEach((entry) => {
      const date = entry.dt_txt.split(" ")[0];

      if (!dailyData[date]) {
        dailyData[date] = {
          temps_max: [],
          temps_min: [],
          icons: {},
          entry: null,
        };
      }

      dailyData[date].temps_max.push(entry.main.temp_max);
      dailyData[date].temps_min.push(entry.main.temp_min);

      const icon = entry.weather[0].icon;
      dailyData[date].icons[icon] = (dailyData[date].icons[icon] || 0) + 1;

      if (!dailyData[date].entry || entry.dt_txt.includes("12:00:00")) {
        dailyData[date].entry = entry;
      }
    });

    const processed = [];

    for (const date in dailyData) {
      const day = dailyData[date];

      const mostCommonIcon = Object.keys(day.icons).reduce((a, b) =>
        day.icons[a] > day.icons[b] ? a : b,
      );

      day.entry.weather[0].icon = mostCommonIcon;
      day.entry.main.temp_max = Math.max(...day.temps_max);
      day.entry.main.temp_min = Math.min(...day.temps_min);

      processed.push(day.entry);
    }

    return processed.slice(0, 5);
  };

  /* =========================
     BACKGROUND ANIMATIONS
  ========================== */
  const updateNightAnimation = (isNight, condition) => {
    animationContainer.innerHTML = "";

    if (!isNight) return;

    if (condition === "Clear" || condition === "Clouds") {
      for (let i = 0; i < 20; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 2 + 1}px`;
        star.style.height = star.style.width;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        animationContainer.appendChild(star);
      }
    } else if (
      condition === "Rain" ||
      condition === "Drizzle" ||
      condition === "Thunderstorm"
    ) {
      for (let i = 0; i < 60; i++) {
        const drop = document.createElement("div");
        drop.className = "rain-drop";
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.animationDuration = `${Math.random() * 0.7 + 0.5}s`;
        animationContainer.appendChild(drop);
      }
    } else if (condition === "Snow") {
      for (let i = 0; i < 50; i++) {
        const flake = document.createElement("div");
        flake.className = "snowflake";
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.animationDelay = `${Math.random() * 10}s`;
        flake.style.animationDuration = `${Math.random() * 5 + 5}s`;
        flake.style.opacity = `${Math.random() * 0.5 + 0.3}`;
        animationContainer.appendChild(flake);
      }
    }
  };

  /* =========================
     UPDATE UI WITH API DATA
  ========================== */
  const updateUI = (weather, forecast, aqi) => {
    const weatherConditionForBg = weather.weather[0].main;
    const currentTimeUTC = weather.dt;
    const sunriseUTC = weather.sys.sunrise;
    const sunsetUTC = weather.sys.sunset;
    const isNight = currentTimeUTC < sunriseUTC || currentTimeUTC > sunsetUTC;

    if (clockInterval) clearInterval(clockInterval);
    updateClock(weather.timezone);
    clockInterval = setInterval(() => updateClock(weather.timezone), 1000);

    const backgroundSet = isNight ? backgroundImageNight : backgroundImageDay;
    document.body.style.backgroundImage = `url('${backgroundSet[weatherConditionForBg] || backgroundSet.Default
      }')`;

    currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
    currentWeatherIconEl.alt = weather.weather[0].description;

    cityNameEl.textContent = `${weather.name}, ${weather.sys.country}`;

    const localDate = new Date((weather.dt + weather.timezone) * 1000);
    currentDateEl.textContent = localDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    currentTempEl.textContent = `${Math.round(weather.main.temp)}°`;
    currentWeatherDescEl.textContent = weather.weather[0].description;

    sunriseTimeEl.textContent = formatLocalTime(
      weather.sys.sunrise,
      weather.timezone,
    );
    sunsetTimeEl.textContent = formatLocalTime(
      weather.sys.sunset,
      weather.timezone,
    );

    humidityEl.textContent = `${weather.main.humidity}%`;
    windSpeedEl.textContent = `${(weather.wind.speed * 3.6).toFixed(1)} km/h`;
    feelsLikeEl.textContent = `${Math.round(weather.main.feels_like)}°`;
    pressureEl.textContent = `${weather.main.pressure} hPa`;
    visibilityEl.textContent = `${(weather.visibility / 1000).toFixed(1)} km`;

    const aqiValue = aqi.list?.[0]?.main?.aqi ?? 0;
    const aqiInfo = getAqiInfo(aqiValue);
    airQualityEl.textContent = aqiInfo.text;
    airQualityEl.className = `font-bold px-3 py-1 rounded-full text-sm ${aqiInfo.color}`;
    healthRecommendationsEl.innerHTML = `<p class="text-gray-200 text-sm">${aqiInfo.recommendation}</p>`;

    const dailyForecasts = processForecast(forecast.list);
    forecastContainer.innerHTML = "";

    dailyForecasts.forEach((day) => {
      const card = document.createElement("div");
      card.className = "p-4 rounded-2xl text-center card backdrop-blur-xl";
      card.innerHTML = `
        <p class="font-bold text-lg">${new Date(day.dt_txt).toLocaleDateString(
        "en-US",
        {
          weekday: "short",
        },
      )}</p>
        <img
          src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
          alt="${day.weather[0].description}"
          class="w-16 h-16 mx-auto"
        />
        <p class="font-semibold">${Math.round(day.main.temp_max)}° / ${Math.round(day.main.temp_min)}°</p>
      `;
      forecastContainer.appendChild(card);
    });

    updateNightAnimation(isNight, weatherConditionForBg);
  };

  /* =========================
     FETCH WEATHER DATA
  ========================== */
  const fetchWeather = async ({ lat, lon, city }) => {
    showLoading();

    try {
      if (!OWM_API_KEY || OWM_API_KEY === "YOUR_OPENWEATHER_API_KEY") {
        throw new Error("Please add your OpenWeather API key in script.js");
      }

      let latitude = lat;
      let longitude = lon;

      if (city) {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OWM_API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoResponse.ok || geoData.length === 0) {
          throw new Error(`Could not find location data for "${city}".`);
        }

        latitude = geoData[0].lat;
        longitude = geoData[0].lon;
      }

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
      const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}`;

      const [weatherResponse, forecastResponse, aqiResponse] =
        await Promise.all([
          fetch(weatherUrl),
          fetch(forecastUrl),
          fetch(aqiUrl),
        ]);

      if (!weatherResponse.ok || !forecastResponse.ok || !aqiResponse.ok) {
        throw new Error(
          "Failed to fetch weather data. Please check your API key and internet connection.",
        );
      }

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();
      const aqiData = await aqiResponse.json();

      updateUI(weatherData, forecastData, aqiData);
    } catch (error) {
      console.error("Weather data fetch error:", error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  };

  /* =========================
     SEARCH SUGGESTION HELPERS
  ========================== */
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const handleCityInput = async (event) => {
    const query = event.target.value.trim();

    if (query.length < 3) {
      suggestionBox.classList.add("hidden");
      suggestionBox.innerHTML = "";
      return;
    }

    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OWM_API_KEY}`;
      const response = await fetch(geoUrl);
      if (!response.ok) return;

      const cities = await response.json();
      suggestionBox.innerHTML = "";

      if (cities.length > 0) {
        suggestionBox.classList.remove("hidden");

        cities.forEach((city) => {
          const div = document.createElement("div");
          div.className = "p-3 hover:bg-white/10 cursor-pointer";
          div.textContent = `${city.name}${city.state ? ", " + city.state : ""}, ${city.country}`;

          div.onclick = () => {
            cityInput.value = city.name;
            suggestionBox.classList.add("hidden");
            fetchWeather({ lat: city.lat, lon: city.lon });
          };

          suggestionBox.appendChild(div);
        });
      } else {
        suggestionBox.classList.add("hidden");
      }
    } catch (error) {
      console.error("Suggestion fetch error:", error);
    }
  };

  /* =========================
     EVENT LISTENERS
  ========================== */
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = cityInput.value.trim();
    if (city) {
      fetchWeather({ city });
    }

    suggestionBox.classList.add("hidden");
    cityInput.value = "";
  });

  cityInput.addEventListener("input", debounce(handleCityInput, 300));

  document.addEventListener("click", (e) => {
    if (!searchForm.contains(e.target) && !suggestionBox.contains(e.target)) {
      suggestionBox.classList.add("hidden");
    }
  });

  geolocationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          console.log(
            "Geolocation failed or denied. Falling back to default city.",
          );
          fetchWeather({ city: "New Delhi" });
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        },
      );
    } else {
      console.log("Geolocation not supported. Falling back to default city.");
      fetchWeather({ city: "New Delhi" });
    }
  });

  closeModalBtn.addEventListener("click", () => {
    errorModal.classList.add("hidden");
  });

  /* =========================
     INITIAL DEFAULT WEATHER
  ========================== */
  fetchWeather({ city: "New Delhi" });
});
