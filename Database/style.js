const axios = require("axios");
const mysql = require("mysql2");

const apiKey = "YOUR_API_KEY";
const city = "London";
const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "weather_db",
});

connection.connect();

async function fetchWeatherData() {
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    const cityQuery = `SELECT city_id FROM Cities WHERE city_name = ?`;
    connection.query(cityQuery, [city], (err, result) => {
      if (err) throw err;

      const city_id = result[0].city_id;

      data.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toISOString().split("T")[0]; // Format date
        const temp_min = item.main.temp_min;
        const temp_max = item.main.temp_max;
        const humidity = item.main.humidity;
        const wind_speed = item.wind.speed;
        const weather = item.weather[0].description;
        const icon_url = item.weather[0].icon;

        const query = `
          INSERT INTO Weather_Forecasts (city_id, date, temp_min, temp_max, humidity, wind_speed, weather, icon_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(
          query,
          [
            city_id,
            date,
            temp_min,
            temp_max,
            humidity,
            wind_speed,
            weather,
            icon_url,
          ],
          (err) => {
            if (err) throw err;
          }
        );
      });
    });
  } catch (error) {
    console.error(error);
  }
}

fetchWeatherData();
