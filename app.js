// APP CONSTANTS AND VARIABLES

const KELVIN_CONVERSION = 273;
const ENTER_KEYCODE = 13;

// API key
const key = "c7d17aec8f46f278fbd1a97e901d3fc6";

function selectPage(){
    let pageID = document.body.id;

    switch(pageID){
        case "index":
            runIndex();
            break;
        case "moreWeather":
            runMoreWeather();
            break;
        case "tips":
            runTips();
            break;
    }
}

selectPage();

function changeBackground(condition){
    let bg = selectBackground(condition);
    document.body.style.backgroundImage = "url(" + bg + ")";
}

function selectBackground(condition){
    console.log(condition);
    let bg = [
        "clear.png", "clearNight.png", "cloudy.png", "moonClouds.png", "rain.png", "snow.png", "snowNight.png", 
        "sunClouds.png", "thunderstorm.png"
    ];

    console.log("backgrounds/" + bg[0])

    if (condition === "01d")
        return "backgrounds/" + bg[0];
    else if (condition === "02d" || condition === "03d")
        return "backgrounds/" + bg[7];
    else if (condition === "04d" || condition === "50d")
        return "backgrounds/" + bg[2];
    else if (condition === "09d" || condition === "09n" || condition === "10d" || condition === "10n")
        return "backgrounds/" + bg[4];
    else if (condition === "11d" || condition === "11n")
        return "backgrounds/" + bg[8];
    else if (condition === "01n")
        return "backgrounds/" + bg[1];
    else if (condition === "02n" || condition === "03n" || "04n")
        return "backgrounds/" + bg[3];
    else if (condition === "13d")
        return "backgrounds/" + bg[5];
    else
        return "backgrounds/" + bg[6];
}

function runIndex(){
    // Selecting elements from HTML file by making them accessible on JS

    const dateElement = document.querySelector(".current-date");
    const notificationElement = document.querySelector(".notification");
    const iconElement = document.querySelector(".weather-icon");
    const tempElement = document.querySelector(".temperature-value p"); // p selects the paragraph
    const descElement = document.querySelector(".temperature-description p");
    const locationElement = document.querySelector(".location h1");
    const tempFeelElement = document.querySelector(".temperature-feelsLike p");
    const searchBoxElement = document.querySelector(".search-txt");

    // Storing weather data inside an object
    const weather = {};
    weather.temperature = {
        unit : "celsius"
    };

    // Accessing user location

    // First check if the geolocation device is available
    // Check if geolocation property is in navigator (if service is available)
    if ("geolocation" in navigator){
        // Obtain user position
        navigator.geolocation.getCurrentPosition(setPosition, showError);   // both param are predefined methods
    }
    else{
        // Error message display
        notificationElement.style.display = "block";
        notificationElement.innerHTML = "<p>Browser does not support geolocation.</p>"
    }

    // User C to F and vice versa conversion
    // First param indicates mouse click, second is the function to be called once clicked
    tempElement.addEventListener("click", function(){
        // Return null if no temperature found
        if (weather.temperature.value === undefined || weather.temperature.feelsLike === undefined)
            return null;
        else{
            // Converting from C to F
            if (weather.temperature.unit === "celsius" || weather.temperature.unit === "celsius"){
                // Convert C temp into F and store it in let, then round
                let convertedTemperatureValue = Math.floor(celsiusToFahrenheit(weather.temperature.value));
                let convertedTemperatureFeel = Math.floor(celsiusToFahrenheit(weather.temperature.feelsLike));

                // Change unit property in weather as F and change display of temperature in HTML
                // Keep temperature number since user will not see and conversion back to C
                weather.temperature.unit = "fahrenheit";
                tempElement.innerHTML = `${convertedTemperatureValue}°F`;
                tempFeelElement.innerHTML = `Feels like ${convertedTemperatureFeel}°F`;
            }
            // Converting from F to C
            else{
                // Change unit property to C
                // Change user display
                weather.temperature.unit = "celsius";
                tempElement.innerHTML = `${weather.temperature.value}°C`;
                tempFeelElement.innerHTML = `Feels like ${weather.temperature.feelsLike}°C`;
            }
        }
    });

    searchBoxElement.addEventListener("keypress", setQuery);

    function setQuery(event){
        if (event.keyCode == ENTER_KEYCODE){
            //getResults(searchBox.value);
            console.log(searchBoxElement.value);
            getWeatherByName(searchBoxElement.value);
        }
    }

    // Finding user's position
    // overriding predefined setPosition
    function setPosition(position){
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        
        getWeatherByGeo(latitude, longitude);
    }

    // Display error message if there is no geolocation service
    // overriding predefined error
    function showError(error){
        notificationElement.style.display = "block";
        notificationElement.innerHTML = `<p>${error.message}</p>`;
    }

    // Hide error message for when user uses searchbox
    function hideError(){
        notificationElement.style.display = "none";
    }

    // Get weather info from API provider
    function getWeatherByGeo(latitude, longitude){
        // storing the address of the specific weather info from API
        let api = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
        getWeather(api);
    }

    function getWeatherByName(cityName){
        let api = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${key}`;
        getWeather(api);
        hideError();
    }

    function getWeather(api){
        // Access weather info from API
        fetch(api)
        // .then is for successive access of data, response is the info accessed
        // unamed function is suitable for functions inside a function, or store it in a variable
        .then(function(response){
            let data = response.json();
            return data;
        })
        .then(function(data){
            try{
                // Adding new properties to weather as info is received from API
                weather.temperature.value = Math.floor(data.main.temp - KELVIN_CONVERSION);
                weather.temperature.feelsLike = Math.floor(data.main.feels_like - KELVIN_CONVERSION);
                weather.description = data.weather[0].description;
                weather.iconId = data.weather[0].icon;
                weather.city = data.name;
                weather.country = data.sys.country;
                weather.timezone = data.timezone;
                weather.date = [
                    formatDay(toDate(data.dt, weather.timezone).getDay()),
                    formatMonth(toDate(data.dt, weather.timezone).getMonth()),
                    toDate(data.dt, weather.timezone).getDate(),
                    toDate(data.dt, weather.timezone).getUTCFullYear()
                ]
                weather.temperature.tempMin = Math.floor(data.main.temp_min - KELVIN_CONVERSION);
                weather.temperature.tempMax = Math.floor(data.main.temp_max - KELVIN_CONVERSION);
                weather.pressure = data.main.pressure;
                weather.humidity = data.main.humidity;
                weather.windSpeed = data.wind.speed;
                weather.sunrise = to12HourClock(data.sys.sunrise, weather.timezone);
                weather.sunset = to12HourClock(data.sys.sunset, weather.timezone);

                localStorage.setItem("weatherData", JSON.stringify(weather));
            } catch(error){
                alert(`Location does not exist!\nPlease enter a municipality in the format "name" or "name, country abbreviation".\nEx. San Francisco, US`);
            }
        })
        .then(function(){
            // Display weather accordingly
            displayWeather();
            changeBackground(weather.iconId);
        });
    }

    // Displaying weather by changing HTML content through JS
    function displayWeather(){
        dateElement.innerHTML = `${weather.date[0] + " " + weather.date[1] + " " + weather.date[2] + ", " + weather.date[3]}`;
        iconElement.innerHTML = `<img src="icons/${weather.iconId}.png">`;
        tempElement.innerHTML = `${weather.temperature.value}°C`;
        tempFeelElement.innerHTML = `Feels like ${weather.temperature.feelsLike}°C`;
        descElement.innerHTML = weather.description;
        locationElement.innerHTML = `${weather.city}, ${weather.country}`;
    }

    // Unix to mm-dd-yyy conversion
    function toDate(seconds, offset){
        let userDate = new Date();
        let currentDate = new Date(1000 * seconds + (1000 * offset + userDate.getTimezoneOffset() * 60 * 1000)); // calculate net time difference and add it
        return currentDate;
    }

    // Unix to 24 hr clock conversion
    function to12HourClock(seconds, offset){
        // Make everything relative to UTC
        // Adjust time with offset so 1 Jan 1970 time is relative to location
        // new Date takes in milliseconds from UTC, but given is local time
        let currentDate = new Date (1000 * seconds + 1000 * offset);
        let timeString = currentDate.toISOString().substring(11,16);
        let hours = timeString.substring(0,2);
        let minutes = timeString.substring(3);
        let time;

        if (hours.charAt(0) == 0)
            hours = hours.substring(1);

        if (hours > 12)
            hours -= 12;
        
        time = [hours, minutes];

        return time;
    }

    function formatMonth(numericMonth){
        let allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        for (let i = 0; i < allMonths.length; i ++){
            if (numericMonth === i){
                return allMonths[i];
            }
        }
    }

    function formatDay(numericDay){
        let allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        for (let i = 0; i < allDays.length; i ++){
            if (numericDay === i)
                return allDays[i];
        }
    }
}

function runMoreWeather(){
    // Passing weather values to moreWeather page
    const weather = JSON.parse(localStorage.getItem("weatherData"));

    const minTempElement = document.querySelector(".temp-min-value");
    const maxTempElement = document.querySelector(".temp-max-value");
    const humidityElement = document.querySelector(".humidity-value");
    const windSpeedElement = document.querySelector(".wind-speed-value");
    const pressureElement = document.querySelector(".pressure-value");
    const sunriseElement = document.querySelector(".sunrise-value");
    const sunsetElement = document.querySelector(".sunset-value");

    function displayDetailedWeather(){
        minTempElement.innerHTML = `${weather.temperature.tempMin}°C / ${celsiusToFahrenheit(weather.temperature.tempMin)}°F`;
        maxTempElement.innerHTML = `${weather.temperature.tempMax}°C / ${celsiusToFahrenheit(weather.temperature.tempMax)}°F`;
        humidityElement.innerHTML = `${weather.humidity}%`;
        windSpeedElement.innerHTML = `${weather.windSpeed} m/s`;
        pressureElement.innerHTML = `${weather.pressure} hPa`;
        sunriseElement.innerHTML = `${weather.sunrise[0]}:${weather.sunrise[1]} AM`;
        sunsetElement.innerHTML = `${weather.sunset[0]}:${weather.sunset[1]} PM`
    }

    displayDetailedWeather();

    changeBackground(weather.iconId);
}

function runTips(){
    const weather = JSON.parse(localStorage.getItem("weatherData"));

    const generalTipsElement = document.querySelector(".general-tips");
    const walkingTipsElement = document.querySelector(".walking-tips");
    const drivingTipsElement = document.querySelector(".driving-tips");
    const clothingTipsElement = document.querySelector(".clothing-tips");
    const recreationTipsElement = document.querySelector(".recreation-tips");

    const HOT = 30;
    const WARM = 20;
    const AVERAGE = 10;
    const COOL = 0;
    const COLD = -10;

    var temp = weather.temperature.value;
    var condition = weather.iconId;

    console.log(temp);
    
    if (temp >= HOT)
        tipsForVeryHotTemp();
    else if (temp < HOT && temp >= WARM)
        tipsForHotTemp();
    else if (temp < WARM && temp >= AVERAGE)
        tipsForWarmTemp();
    else if (temp < AVERAGE && temp > COOL)
        tipsForAverageTemp();
    else if (temp <= COOL && temp >= COLD)
        tipsForCoolTemp();
    else
        tipsForColdTemp();

    function tipsForVeryHotTemp(){
        generalTipsElement.innerHTML = `
            <li>Stay hydrated! Try to drink 8-10 glasses of water today</li>
            <li>Keep your living space cool by turning on the AC or fan</li>
            <li>Avoid drinking too much alcohol or caffine</li>
            <li>Consume small, light meals frequently rather than having heavy meals</li>
            <li>Protect those most at risk of a heatstroke (ex. young children, elderly, pets)</li>
        `;

        walkingTipsElement.innerHTML = `
            <li>Pack some water for your trip</li>
        `;

        drivingTipsElement.innerHTML = `
            <li>NEVER leave children or pets in your car, even with the window cracked</li>
            <li>Keep your vehicle cool by turning on the AC</li>
            <li>Have enough water ready in your car for you and your passengers</li>
        `;

        clothingTipsElement.innerHTML = `
            <li>T-shirt and shorts</li>
            <li>Wear loose, light-coloured clothing</li>
        `;

        if (condition === "01d" || condition === "02d" || condition === "03d"){
            walkingTipsElement.innerHTML +=`
                <li>If possible, keep out of the sun at around 3-4 PM</li>
                <li>Try to walk in the shade</li>
                <li>Visit air conditioned buildings often during your trip</li>
                <li>Avoid strenuous physical acivity like exercising</li>
                <li>Apply sunscreen before leaving</li>
            `;
            drivingTipsElement.innerHTML += `
                <li>Use suitable window shades for driving and parking</li>
            `;
            clothingTipsElement.innerHTML += `
                <li>Protect your face by wearing a hat and sunglasses</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Go for a swim!</li>
                <li>Escape the heat by staying inside and doing an indoor hobby</li>
            `;
        }
        else if (condition === "09d" || condition === "09n" || condition === "10d" || condition === "10n"){
            allRainWalking();
            allRainDriving();
            walkingTipsElement.innerHTML +=`
            <li>Visit air conditioned buildings often during your trip</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Escape the heat by staying inside and doing an indoor hobby</li>
            `;
        }
        else if (condition === "11d" || condition === "11n"){
            allThunderstromWalking();
            allRainDriving();
            walkingTipsElement.innerHTML +=`
            <li>Visit air conditioned buildings often during your trip</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Escape the heat by staying inside and doing an indoor hobby</li>
            `;
        }
        else if (condition === "04d" || condition === "50d"){
            walkingTipsElement.innerHTML +=`
                <li>Visit air conditioned buildings often during your trip</li>
                <li>Avoid strenuous physical acivity like exercising</li>
            `;
            if (condition !== "01n")
                drivingTipsElement.innerHTML += `
                    <li>If there is fog, drive slower, use low-beam headlights, and be extra cautious</li>
                `;
            recreationTipsElement.innerHTML = `
                <li>Go for a swim!</li>
                <li>Escape the heat by staying inside and doing an indoor hobby</li>
            `;
        }
        else if (condition === "01n" || condition === "02n" || condition === "03n" || condition === "04n" || condition === "50n"){
            walkingTipsElement.innerHTML +=`
                <li>Visit air conditioned buildings often during your trip</li>
                <li>Avoid strenuous physical acivity like exercising</li>
                <li>Stay safe at night by walking on well-lit streets</li>
            `;
            if (condition !== "01n")
                drivingTipsElement.innerHTML += `
                    <li>If there is fog, drive slower, use low-beam headlights, and be extra cautious</li>
                `;
            recreationTipsElement.innerHTML = `
                <li>Escape the heat by staying inside and doing an indoor hobby</li>
            `;
        }
    }

    function tipsForHotTemp(){
        generalTipsElement.innerHTML = `
            <li>Stay hydrated! Try to drink 8-10 glasses of water today</li>
            <li>Keep your living space cool by turning on the AC or fan</li>
            <li>Cover the windows and turn off uncessary lights</li>
            <li>Maintain a cool core temperature by eating cool foods like salads and fruits</li>
        `;

        walkingTipsElement.innerHTML = `
            <li>Pack some water for your trip</li>
        `;

        drivingTipsElement.innerHTML = `
            <li>NEVER leave children or pets in your car, even with the window cracked</li>
            <li>Keep your vehicle cool by turning on the AC</li>
        `;

        clothingTipsElement.innerHTML = `
            <li>T-shirt and shorts or sweatpants</li>
            <li>Wear loose, light-coloured clothing</li>
        `;

        if (condition === "01d" || condition === "02d" || condition === "03d"){
            walkingTipsElement.innerHTML +=`
                <li>If possible, keep out of the sun at around 3-4 PM</li>
                <li>Try to walk in the shade and visit air conditioned buildings during your trip</li>
                <li>Apply sunscreen before leaving</li>
            `;
            drivingTipsElement.innerHTML += `
                <li>Use suitable window shades for driving and parking</li>
            `;
            clothingTipsElement.innerHTML += `
                <li>Protect your face by wearing a hat and sunglasses</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Swimming</li>
                <li>Go camping or have a picnic</li>
                <li>Play an outdoor sport or go biking</li>
            `;
        }
        else if (condition === "09d" || condition === "09n" || condition === "10d" || condition === "10n"){
            allRainWalking();
            allRainDriving();

            walkingTipsElement.innerHTML +=`
                <li>Visit air conditioned buildings often during your trip</li>
            `;

            if (condition === "09d" || condition === "09n"){
                recreationTipsElement.innerHTML = `
                    <li>Go for a rain hike</li>
                `;
            }

            recreationTipsElement.innerHTML += `
                <li>Stay inside and enjoy an indoor hobby</li>
            `;
        }
        else if (condition === "11d" || condition === "11n"){
            allThunderstromWalking();
            allRainDriving();
            walkingTipsElement.innerHTML +=`
                <li>Visit air conditioned buildings often during your trip</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Stay inside and do an indoor hobby</li>
            `;
        }
        else if (condition === "04d" || condition === "50d"){
            walkingTipsElement.innerHTML +=`
                <li>If it gets too hot, take a break at an air conditioned building</li>
            `;
            drivingTipsElement.innerHTML += `
                <li>If there is fog, drive slower, use low-beam headlights, and be extra cautious</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Swimming</li>
                <li>Go camping or have a picnic</li>
                <li>Play an outdoor sport or go biking</li>
            `;
        }
        else if (condition === "01n" || condition === "02n" || condition === "03n" || condition === "04n" || condition === "50n"){
            generalTipsElement.innerHTML = `
                <li>Stay hydrated! Try to drink 8-10 glasses of water today</li>
                <li>Keep your living space cool by turning on the AC or fan</li>
                <li>Cover the windows and turn off uncessary lights</li>
                <li>Open the window to see if there are cool breezes at night</li>
            `;
            walkingTipsElement.innerHTML +=`
                <li>If it gets too hot, take a break at an air conditioned building</li>
                <li>Stay safe at night by walking on well-lit streets</li>
            `;
            if (condition !== "01n")
                drivingTipsElement.innerHTML += `
                    <li>If there is fog, drive slower, use low-beam headlights, and be extra cautious</li>
                `;
            recreationTipsElement.innerHTML = `
                <li>Swimming</li>
                <li>Go camping or have a picnic</li>
                <li>Play an outdoor sport or go biking</li>
                `;
        }
    }

    function tipsForWarmTemp(){
        generalTipsElement.innerHTML = `
            <li>Stay hydrated! Try to drink at least 8 glasses of water today</li>
        `;
        walkingTipsElement.innerHTML = `
            <li>Pack some water for your trip</li>
        `
        drivingTipsElement.innerHTML = `
            <li>NEVER leave children or pets in your car, even with the window cracked</li>
            <li>Have enough water ready in your car for you and your passengers</li>
        `;
        clothingTipsElement.innerHTML = `
            <li>Sweater and sweatpants</li>
            <li>Wear layers so you can take off and put on accordingly</li>
        `;

        if (condition === "01d" || condition === "02d" || condition === "03d"){
            walkingTipsElement.innerHTML +=`
                <li>If possible, keep out of the sun at around 3-4 PM</li>
                <li>If the sun gets too intense, try walking in the shade</li>
                <li>Apply sunscreen before leaving</li>
            `;
            drivingTipsElement.innerHTML += `
                <li>Use suitable window shades for driving and parking</li>
            `;
            clothingTipsElement.innerHTML += `
                <li>Wear a hat and sunglasses</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Hiking</li>
                <li>Have a picnic</li>
                <li>Do some gardening</li>
                <li>Play an outdoor sport or go biking</li>
            `;
        }
        else if (condition === "09d" || condition === "09n" || condition === "10d" || condition === "10n"){
            allRainWalking();
            allRainDriving();

            drivingTipsElement.innerHTML += `
                <li>Keep your ventilated by turning on the fan temporarily</li>
            `;

            if (condition === "09d" || condition === "09n"){
                recreationTipsElement.innerHTML = `
                    <li>Go for a rain hike</li>
                `;
            }

            recreationTipsElement.innerHTML += `
                <li>Stay inside and enjoy an indoor hobby</li>
            `;
        }
        else if (condition === "11d" || condition === "11n"){
            allThunderstromWalking();
            allRainDriving();

            drivingTipsElement.innerHTML += `
                <li>Keep your vehicle ventilated by turning on the fan temporarily</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Stay inside and enjoy an indoor hobby</li>
            `;
        }
        else if (condition === "04d" || condition === "50d"){
            drivingTipsElement.innerHTML += `
                <li>If there is fog, drive slower, use low-beam headlights, and be extra cautious</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Hiking</li>
                <li>Play an outdoor sport</li>
                <li>Go biking</li>
                `;
        }
        else if (condition === "01n" || condition === "02n" || condition === "03n" || condition === "04n" || condition === "50n"){
            generalTipsElement.innerHTML += `
                <li>Open the window to see for cool breezes at night</li>
            `;
            walkingTipsElement.innerHTML =`
                <li>Stay safe at night by walking on well-lit streets</li>
            `;

            if (condition !== "01n")
                drivingTipsElement.innerHTML += `
                    <li>If there is fog, drive slower, use low-beam headlights, and be extra cautious</li>
                `;

            recreationTipsElement.innerHTML = `
                <li>Hiking</li>
                <li>Play an outdoor sport</li>
                <li>Go biking</li>
                `;
        }
    }

    function tipsForAverageTemp(){
        generalTipsElement.innerHTML = `
            <li>Stay hydrated! Try to drink at least 8 glasses of water today</li>
            <li>Turn on the furnace if it's chilly indoors</li>
        `

        walkingTipsElement.innerHTML = `
            <li>Bring some water for your trip</li>
        `

        drivingTipsElement.innerHTML = `
            <li>NEVER leave children or pets in your car</li>
        `;

        clothingTipsElement.innerHTML = `
            <li>Wear a thick jacket or wool coat</li>
            <li>Stack up on layers</li>
            <li>If it's extra chilly out, wear gloves or earmuffs!</li>
        `;

        recreationTipsElement.innerHTML = `
            <li>Go on a nature hike!</li>
            <li>Go for a brisk jog</li>
        `;

        if (condition === "01d" || condition === "02d" || condition === "03d"){
            walkingTipsElement.innerHTML +=`
                <li>If the sun gets too intense, try walking in the shade</li>
            `;
            drivingTipsElement.innerHTML += `
                <li>Use suitable window shades for driving and parking</li>
            `;
            clothingTipsElement.innerHTML += `
                <li>Wear a hat and sunglasses</li>
            `;
        }
        else if (condition === "09d" || condition === "09n" || condition === "10d" || condition === "10n"){
            allRainWalking();
            allRainDriving();

            drivingTipsElement.innerHTML += `
                <li>Keep your ventilated by turning on the fan temporarily</li>
            `;

            if (condition === "09d" || condition === "09n"){
                recreationTipsElement.innerHTML = `
                    <li>Go for a rain hike</li>
                `;
            }

            recreationTipsElement.innerHTML += `
                <li>Stay inside and enjoy an indoor hobby</li>
            `;
        }
        else if (condition === "11d" || condition === "11n"){
            allThunderstromWalking();
            allRainDriving();

            drivingTipsElement.innerHTML += `
                <li>Keep your vehicle ventilated by turning on the fan temporarily</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Stay inside and enjoy an indoor hobby</li>
            `;
        }
        else if (condition === "04d" || condition === "50d"){
            drivingTipsElement.innerHTML += `
                <li>If there is fog, drive slower, use low-beam headlights, and be extra cautious</li>
            `;
        }
        else if (condition === "01n" || condition === "02n" || condition === "03n" || condition === "04n" || condition === "50n"){
            walkingTipsElement.innerHTML =`
                <li>Stay safe at night by walking on well-lit streets</li>
            `;

            if (condition !== "01n")
                drivingTipsElement.innerHTML += `
                    <li>If there is fog, drive slower, use low-beam headlights, and be extra cautious</li>
                `;
        }

        else if (condition === "13d" || condition === "13n"){
            allSnowDriving();
            allSnowWalking();

            if (condition === "13n")
                walkingTipsElement.innerHTML +=`
                    <li>Stay safe at night by walking on well-lit streets</li>i>
                `;
            
            clothingTipsElement.innerHTML += `
                <li>Put on winter boots</li>
            `;
        }
    }

    function tipsForCoolTemp(){
        generalTipsElement.innerHTML = `
            <li>Stay hydrated! Try to drink at least 8 glasses of water today</li>
            <li>Turn on the furnace to heat up your home</li>
            <li>Have some warming food and drinks (ex. soups, hot chocolate)</li>
        `;

        walkingTipsElement.innerHTML = `
            <li>Bring some hot beverages for your trip</li>
        `;

        drivingTipsElement.innerHTML = `
            <li>NEVER leave children or pets in your car</li>
        `;

        clothingTipsElement.innerHTML = `
            <li>Wear your winter jakcet</li>
            <li>Put on some jeans with long johns if it's extra chilly</li>
            <li>Wear your gloves, earmuffs, hats, and scarves</li>
        `;

        recreationTipsElement.innerHTML = `
            <li>Go skiing, snowboarding, or tobogganing</li>
            <li>Go for a winter hike</li>
            <li>Play hockey or go ice skating</li>
        `;

        if (condition === "13d" || conditon === "13n"){
            allSnowDriving();
            allSnowWalking();

            if (condition === "13n"){
                walkingTipsElement.innerHTML +=`
                    <li>Stay safe at night by walking on well-lit streets</li>i>
                `;
            }
        }
        else if (condition === "01d" || condition === "02d" || condition === "03d"){
            drivingTipsElement.innerHTML += `
                <li>Use suitable window shades for driving and parking</li>
            `;
        }
        else if (condition === "09d" || condition === "09n" || condition === "10d" || condition === "10n"){
            allRainWalking();
            allRainDriving();

            drivingTipsElement.innerHTML += `
                <li>When driving on slushy or slippery roads, accelerate slowly</li>
            `;

            if (condition === "09d" || condition === "09n"){
                recreationTipsElement.innerHTML = `
                    <li>Go for a rain hike</li>
                `;
            }

            recreationTipsElement.innerHTML += `
                <li>Stay inside and enjoy an indoor hobby</li>
            `;
        }
        else if (condition === "11d" || condition === "11n"){
            allThunderstromWalking();
            allRainDriving();

            drivingTipsElement.innerHTML += `
                <li>Keep your vehicle ventilated by turning on the fan temporarily</li>
            `;
            recreationTipsElement.innerHTML = `
                <li>Stay inside and enjoy an indoor hobby</li>
            `;
        }
        else if (condition === "04d" || condition === "50d"){
            drivingTipsElement.innerHTML += `
                <li>If there is fog, drive slower, use low-beam headlights, and be extra cautious</li>
            `;
        }
        else if (condition === "01n" || condition === "02n" || condition === "03n" || condition === "04n" || condition === "50n"){
            walkingTipsElement.innerHTML =`
                <li>Stay safe at night by walking on well-lit streets</li>
            `;

            if (condition !== "01n")
                drivingTipsElement.innerHTML += `
                    <li>If there is fog, drive slower, use low-beam headlights, and be extra cautious</li>
                `;
        }
    }

    function tipsForColdTemp(){
        tipsForCoolTemp();

        generalTipsElement.innerHTML() += `
            <li>If there is a blizzard warning, stay inside!</li>
        `;

        walkingTipsElement.innerHTML() += `
            <li>If you get caught in a blizzard, seek shelter immediately<br>If there are no shelter nearby, dig a snow cave to keep warm</li>
        `;

        drivingTipsElement.innerHTML() += `
            <li>Be extra slow and careful if you get caught in a blizzard</li>
        `;

        clothingTipsElement.innerHTML() += `
            <li>Wear snowpants if you're walking through snow</li>
            <li>Put on at least 3 layers</li>
        `;
    }

    function allRainWalking(){
        walkingTipsElement.innerHTML +=`
        <li>Bring an umbrella!</li>
        <li>Look out for signs of a thunderstorm (ex. dark clouds, lightning, or strong winds)</li>
        `;
    }

    function allThunderstromWalking(){
        walkingTipsElement.innerHTML += `
        <li>Seek refuge in a enclosed building or car</li>
        <li>If there is no shelter, avoid trees. Crouch down in an open area and cover your ears</li>
        <li>Stay away from water (ex. puddles)</li>
        <li>Avoid metal (ex. fences, clotheslines) and drop your backpack in case it contains metal</li>
        <li>Wait 30 minutes after the last observed lightning strike/thunder before heading out again</li>`
    }

    function allRainDriving(){
        drivingTipsElement.innerHTML += `
            <li>Drive slower and have your headlights on</li>
            <li>Use windshield wipers and keep a safe distance between vehicles</li>
            <li>Avoid heavy breaking and avoid hydroplaning when passing large puddles</li>
            <li>If you get caught in a thunderstorm, do not park near trees or other tall objects</li>
        `;
    }

    function allSnowDriving(){
        drivingTipsElement.innerHTML +=`
            <li>Clear your car of ice and snow before driving</li>
            <li>Keep a safe distance from other vehicles</li>
            <li>Switch to snow tires</li>
            <li>If your car skids, don't rush the breaks!<br>Steer in the same direction and gradually go back</li>
        `;
    }

    function allSnowWalking(){
            walkingTipsElement.innerHTML +=`
            <li>Walk on designated walkways as much as possible</li>
            <li>Be extra slow and cautious if walking on snow or ice</li>
            <li>Pack some hot drinks for your trip to keep you warm</li>
        `;
    }

    changeBackground(weather.iconId);
}

// C to F conversion
function celsiusToFahrenheit(temperature){
    return (temperature * 9/5) + 32;
}