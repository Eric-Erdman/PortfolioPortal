# Python Backend - Stock Screener

## Architecture

```
Alpha Vantage API
        ↓
Backend (FastAPI - Python)
        ↓
Cache (JSON file, refreshes daily)
        ↓
React Frontend
```

## Setup

1. **Install dependencies:**
```bash
pip install -r api/requirements.txt
```

2. **Environment variables:**
Make sure `.env.local` has:
```
VITE_ALPHA_VANTAGE_API_KEY=your_key_here
```

3. **Run locally:**
```bash
cd api
uvicorn index:app --reload --port 8000
```

4. **Test endpoint:**
```
http://localhost:8000/api/daily-stocks
```

## Deployment to Vercel

The `vercel.json` configuration handles Python serverless functions automatically.

Deploy:
```bash
vercel
```

## API Endpoints

### `GET /api/daily-stocks`
Returns filtered stocks meeting all criteria.

Query params:
- `force_refresh=true` - Bypass cache and re-screen

Response:
```json
{
  "success": true,
  "stocks": [...],
  "count": 5,
  "last_updated": "2026-01-30T...",
  "filters_applied": {...}
}
```

### `GET /api/health`
Health check endpoint

## Filtering Criteria

✅ **Implemented:**
- **Exchange:** NYSE/NASDAQ only (manually curated)
- **Market Cap:** ≥ $5B
- **Avg Volume (20d):** ≥ 1.5M shares
- **RSI (14):** ≤ 28 (oversold)
- **Price vs 52w High:** ≤ 75%
- **Price vs 20D SMA:** ≤ 20D SMA
- **Price vs 200D SMA:** ≥ 85% of 200D SMA
- **Revenue Growth (YoY):** ≥ 10%
- **EPS Growth (YoY):** ≥ 8% OR Positive FCF
- **Gross Margin:** ≥ 30%
- **Debt-to-Equity:** ≤ 0.80
- **Trailing P/E:** ≤ 25
- **Price-to-Sales:** ≤ 4.0

## Composite Score (0-100)

Normalized weighted formula:
- **RSI Oversold Strength:** 35%
- **Revenue Growth:** 25%
- **EPS/FCF Strength:** 20%
- **Drawdown Severity:** 20%

Higher score = better opportunity

## Stock Universe

**30 curated NYSE/NASDAQ stocks:**
- Tech: AAPL, MSFT, GOOGL, AMZN, META, NVDA, AMD, INTC, CRM, ORCL, ADBE, NFLX, PYPL, CSCO, QCOM
- Finance: JPM, BAC, GS, MS, C, WFC
- Consumer: WMT, HD, NKE, MCD, SBUX, KO, PEP, TGT
- Industrial: BA, GE, CAT

## Rate Limiting

Alpha Vantage free tier:
- 5 calls/minute
- 25 calls/day

Current implementation:
- 12-second delay between API calls
- Screening 30 stocks takes ~6-7 minutes
- Results cached for 24 hours

## Notes

- **Filter-Then-Score Architecture:** ALL filters applied first, ONLY passing stocks get scored
- **Composite Score:** Normalized 0-100 scale with weighted contributions
- **Top N Selection:** Returns top 5-10 stocks ranked by composite score
- **Verbose Logging:** Check console for detailed filter pass/fail for each stock
