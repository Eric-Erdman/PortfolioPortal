"""
Main API endpoint for filtered stocks
Uses yfinance for efficient large-universe screening

UNIVERSE SIZE ADVANTAGE:
- Can screen 500+ stocks (entire S&P 500) in 3-5 minutes
- Pre-filters quickly to identify candidates
- Only fetches detailed data for promising stocks
- Results in 5-10 high-quality filtered stocks
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List, Dict, Any
import os
import json
import asyncio
from datetime import datetime, timedelta
from pathlib import Path

# Import our services
import sys
sys.path.append(str(Path(__file__).parent))
from services.yfinance_service import yfinance_service
from services.stock_filter import stock_filter

app = FastAPI(title="Stock Screener API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global progress state for real-time updates
progress_state = {
    'status': 'idle',  # idle, running, complete, error
    'stage': '',  # fetching_universe, pre_screening, fetching_details, filtering, complete
    'current': 0,
    'total': 0,
    'message': '',
    'stocks_found': 0
}

# Stock universe - NO LONGER NEEDED!
# yfinance can dynamically fetch S&P 500, NASDAQ-100, or any list
# We'll screen the ENTIRE S&P 500 (~500 stocks) to find the best opportunities

# Universe options:
UNIVERSE_SOURCE = 'sp500'  # Options: 'sp500', 'nasdaq100', 'both', or custom list

# Cache configuration
CACHE_FILE = Path(__file__).parent / "cache" / "filtered_stocks.json"
CACHE_DURATION_HOURS = 24  # Refresh once per day


def load_cache() -> Dict[str, Any]:
    """Load cached filtered stocks"""
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, 'r') as f:
                cache = json.load(f)
                cache_time = datetime.fromisoformat(cache.get('timestamp', '2000-01-01'))
                
                # Check if cache is still valid
                if datetime.now() - cache_time < timedelta(hours=CACHE_DURATION_HOURS):
                    return cache
        except Exception as e:
            print(f"Error loading cache: {e}")
    return None


def save_cache(data: Dict[str, Any]):
    """Save filtered stocks to cache"""
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    try:
        with open(CACHE_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving cache: {e}")


async def screen_stocks(force_refresh: bool = False) -> List[Dict[str, Any]]:
    """
    Screen all stocks in universe and return filtered results
    This is expensive (many API calls), so we cache results
    """
    global progress_state
    
    # Try to load from cache first
    if not force_refresh:
        cached = load_cache()
        if cached:
            print("Returning cached results")
            # Delete old cache to force fresh screening if 0 stocks
            if cached.get('passed_filters', 0) == 0:
                print("WARNING: Cache has 0 stocks, deleting and re-screening...")
                CACHE_FILE.unlink(missing_ok=True)
            else:
                return cached['stocks']
    
    print(f"\n{'='*60}")
    print(f"Starting intelligent stock screening with yfinance")
    print(f"Universe: {UNIVERSE_SOURCE.upper()}")
    print(f"{'='*60}\n")
    
    progress_state = {
        'status': 'running',
        'stage': 'fetching_universe',
        'current': 0,
        'total': 0,
        'message': f'Fetching {UNIVERSE_SOURCE.upper()} stock universe...',
        'stocks_found': 0
    }
    
    # STEP 1: Get stock universe
    if UNIVERSE_SOURCE == 'sp500':
        stock_universe = yfinance_service.get_sp500_tickers()
    elif UNIVERSE_SOURCE == 'nasdaq100':
        stock_universe = yfinance_service.get_nasdaq100_tickers()
    elif UNIVERSE_SOURCE == 'both':
        sp500 = yfinance_service.get_sp500_tickers()
        nasdaq = yfinance_service.get_nasdaq100_tickers()
        stock_universe = list(set(sp500 + nasdaq))  # Remove duplicates
    else:
        stock_universe = []
    
    if not stock_universe:
        progress_state = {
            'status': 'error',
            'stage': 'error',
            'message': 'Failed to fetch stock universe',
            'stocks_found': 0
        }
        raise Exception("Failed to fetch stock universe")
    
    print(f"Universe size: {len(stock_universe)} stocks")
    progress_state.update({
        'total': len(stock_universe),
        'message': f'Found {len(stock_universe)} stocks in universe'
    })
    
    # STEP 2: Fast pre-screening (reduces 500 -> ~100 candidates)
    progress_state.update({
        'stage': 'pre_screening',
        'message': f'Pre-screening by market cap ≥ ${stock_filter.MIN_MARKET_CAP/1e9:.0f}B and volume ≥ {stock_filter.MIN_AVG_VOLUME/1e6:.1f}M...'
    })
    
    candidates = yfinance_service.screen_universe(
        stock_universe,
        min_market_cap=stock_filter.MIN_MARKET_CAP,
        min_volume=stock_filter.MIN_AVG_VOLUME,
        max_rsi=stock_filter.MAX_RSI + 5  # Slightly relaxed for pre-screen
    )
    
    if not candidates:
        print("No candidates passed pre-screening")
        progress_state = {
            'status': 'complete',
            'stage': 'complete',
            'message': 'WARNING: 0 stocks passed pre-screening filters. Try adjusting filter criteria.',
            'stocks_found': 0,
            'current': len(stock_universe),
            'total': len(stock_universe)
        }
        return []
    
    print(f"\nPre-screening found {len(candidates)} candidates")
    progress_state.update({
        'current': len(stock_universe) - len(candidates),
        'message': f'{len(candidates)} candidates passed pre-screening (filtered out {len(stock_universe) - len(candidates)})'
    })
    print(f"Fetching detailed data for candidates...")
    
    # STEP 3: Fetch detailed data (only for candidates - efficient!)
    progress_state.update({
        'stage': 'fetching_details',
        'total': len(candidates),
        'current': 0,
        'message': f'Fetching detailed data for {len(candidates)} candidates... (2-4 minutes)'
    })
    
    candidate_data = []
    for i, ticker in enumerate(candidates, 1):
        stock_data = yfinance_service.get_stock_data(ticker)
        if stock_data:
            candidate_data.append(stock_data)
        
        # Update progress every stock
        progress_state.update({
            'current': i,
            'message': f'Analyzing {ticker}... ({i}/{len(candidates)})'
        })
        
        # Log every 10 stocks
        if i % 10 == 0:
            print(f"  Progress: {i}/{len(candidates)} stocks analyzed...")
        
        # Small delay to allow progress updates
        await asyncio.sleep(0.01)
    
    print(f"\nFetched data for {len(candidate_data)} stocks")
    print(f"Applying all 12 strict filters...")
    
    # STEP 4: Apply all filters
    progress_state.update({
        'stage': 'filtering',
        'total': len(candidate_data),
        'current': 0,
        'stocks_found': 0,
        'message': f'Applying 12 strict filters to {len(candidate_data)} stocks...'
    })
    
    filtered_stocks = []
    for i, stock_data in enumerate(candidate_data, 1):
        result = stock_filter.filter_stock(stock_data)
        if result:
            filtered_stocks.append(result)
            print(f"{result['symbol']} passed all filters (score: {result['composite_score']})")
        
        # Update progress
        progress_state.update({
            'current': i,
            'stocks_found': len(filtered_stocks),
            'message': f'Filtering... ({i}/{len(candidate_data)}) - {len(filtered_stocks)} stocks found so far'
        })
        
        # Small delay to allow progress updates
        await asyncio.sleep(0.01)
    
    # STEP 5: Sort by composite score (descending)
    filtered_stocks.sort(key=lambda x: x.get('composite_score', 0), reverse=True)
    
    # Take top 5-10
    top_stocks = filtered_stocks[:10]
    
    print(f"\n{'='*60}")
    print(f"Screening complete!")
    print(f"{len(stock_universe)} stocks screened")
    print(f"{len(candidates)} candidates identified")
    print(f"{len(filtered_stocks)} passed all 12 filters")
    print(f"Top {len(top_stocks)} stocks selected")
    print(f"{'='*60}\n")
    
    # Show top stocks
    if top_stocks:
        print("\nTOP OPPORTUNITIES:")
        for i, stock in enumerate(top_stocks, 1):
            print(f"  {i}. {stock['symbol']}: Score {stock['composite_score']}/100 | RSI {stock['rsi']:.1f} | {stock['name']}")
    
    # Cache results
    cache_data = {
        'timestamp': datetime.now().isoformat(),
        'universe': UNIVERSE_SOURCE,
        'total_screened': len(stock_universe),
        'candidates': len(candidates),
        'passed_filters': len(filtered_stocks),
        'stocks': top_stocks
    }
    save_cache(cache_data)
    
    # Mark as complete
    if len(top_stocks) == 0:
        progress_state = {
            'status': 'complete',
            'stage': 'complete',
            'message': 'WARNING: 0 stocks passed all 12 strict filters. Consider relaxing filter criteria.',
            'stocks_found': 0,
            'current': len(candidate_data),
            'total': len(candidate_data)
        }
    else:
        progress_state = {
            'status': 'complete',
            'stage': 'complete',
            'message': f'Screening complete! Found {len(top_stocks)} stocks.',
            'stocks_found': len(top_stocks),
            'current': len(candidate_data),
            'total': len(candidate_data)
        }
    
    return top_stocks


@app.get("/")
async def root():
    return {"message": "Stock Screener API is running"}


@app.get("/api/screening-progress")
async def screening_progress():
    """Server-Sent Events endpoint for real-time progress updates"""
    async def event_generator():
        last_state = None
        timeout = 300  # 5 minutes max
        elapsed = 0
        
        while elapsed < timeout:
            # Only send if state changed
            current_state = progress_state.copy()
            if current_state != last_state:
                yield f"data: {json.dumps(current_state)}\n\n"
                last_state = current_state
            
            # Stop streaming when done or error
            if current_state['status'] in ['complete', 'error']:
                await asyncio.sleep(1)  # Give time for final update to be sent
                break
            
            await asyncio.sleep(0.5)  # Check every 500ms
            elapsed += 0.5
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/api/daily-stocks")
async def get_daily_stocks(force_refresh: bool = False):
    """
    Main endpoint: Return filtered stocks
    Query param: force_refresh=true to bypass cache
    """
    try:
        stocks = await screen_stocks(force_refresh=force_refresh)
        
        return JSONResponse(content={
            'success': True,
            'stocks': stocks,
            'count': len(stocks),
            'last_updated': datetime.now().isoformat(),
            'universe': UNIVERSE_SOURCE,
            'filters_applied': {
                'exchange': 'NYSE/NASDAQ (S&P 500)',
                'min_market_cap': '$5B',
                'min_volume': '1.5M shares',
                'max_rsi': 28,
                'max_price_vs_52w': '75%',
                'min_revenue_growth': '10%',
                'min_eps_growth': '8% OR positive FCF',
                'min_gross_margin': '30%',
                'max_debt_to_equity': 0.80,
                'max_trailing_pe': 25,
                'max_price_to_sales': 4.0
            },
            'scoring_weights': {
                'rsi_oversold': '35%',
                'revenue_growth': '25%',
                'eps_fcf_strength': '20%',
                'drawdown_severity': '20%'
            },
            'methodology': {
                'step_1': 'Screen S&P 500 (~500 stocks)',
                'step_2': 'Pre-filter by market cap + volume',
                'step_3': 'Fetch detailed data for candidates',
                'step_4': 'Apply all 12 strict filters',
                'step_5': 'Rank by composite score',
                'time': '3-5 minutes',
                'advantage': 'Finds hidden opportunities across entire market'
            }
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# Vercel serverless function handler
handler = app
