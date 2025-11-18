# Vejr app (simpel)

Denne lille app viser vejret for en by ved at bruge OpenWeatherMap API.

Sådan kører du projektet lokalt:

1. Opret en konto og få en API-nøgle fra https://openweathermap.org/
2. Kopiér `.env.example` til `.env` og sæt `OPENWEATHER_API_KEY` til din nøgle.
3. Installer afhængigheder:

   npm install

4. Start appen:

   npm start

5. Åbn http://localhost:3000 i din browser og søg efter en by (fx "Copenhagen").

Note: API-nøglen skal holdes hemmelig — del den ikke i offentlige repos.

Mulige næste skridt:
- Tilføj caching for at undgå at ramme API-grænser
- Vis 3-dages prognose
- Tilføj tests for server-endpointet
