// Serverless proxy for FRED (Federal Reserve Economic Data).
// The FRED API does not send CORS headers, so the browser can't call it
// directly — this function fetches on the server and forwards the JSON.
// Requires a FRED_API_KEY environment variable (free key from fred.stlouisfed.org).

const SERIES_MAP = {
    m2: 'M2SL',       // M2 Money Stock, monthly, seasonally adjusted
    rates: 'FEDFUNDS'  // Effective Federal Funds Rate, monthly
};

module.exports = async function handler(req, res) {
    const series = req.query.series;
    const seriesId = SERIES_MAP[series];

    if (!seriesId) {
        res.status(400).json({ error: 'Parâmetro "series" inválido. Use "m2" ou "rates".' });
        return;
    }

    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'FRED_API_KEY não configurada no servidor.' });
        return;
    }

    try {
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=13`;
        const fredResponse = await fetch(url);

        if (!fredResponse.ok) {
            res.status(502).json({ error: 'Falha ao consultar o FRED.' });
            return;
        }

        const data = await fredResponse.json();
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro inesperado ao consultar o FRED.' });
    }
}
