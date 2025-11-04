// Mikkels

var express = require("express");
var router = express.Router();

/* GET vejrdata for en by route */
router.get("/weather", async (req, res) => {
  const city = req.query.city || "Copenhagen";
  const url = `https://wttr.in/${city}?format=j1`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Kunne ikke hente vejrdata");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Kunne ikke hente vejrdata" });
  }
});

/* GET vejrdata for flere byer route */
router.get("/weathers", async (req, res) => {
  const cities = req.query.cities
    ? req.query.cities.split(",")
    : ["Copenhagen", "Aarhus", "Odense"];
  const urls = cities.map((city) => `https://wttr.in/${city}?format=j1`);

  try {
    const fetches = urls.map((url) => fetch(url).then((r) => r.json()));
    const results = await Promise.all(fetches);
    res.json(
      cities.map((city, i) => ({
        city,
        weather: results[i].current_condition[0],
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Kunne ikke hente vejrdata for alle byer" });
  }
});

module.exports = router;