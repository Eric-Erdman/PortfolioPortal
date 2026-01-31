"""
Yahoo Finance Service - Stock Data Fetching using yfinance
Fast, free, and perfect for screening large stock universes
"""

import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import ta


class YFinanceService:
    """
    Service for fetching stock data from Yahoo Finance
    Advantages over Alpha Vantage:
    - Free and unlimited
    - Fast bulk data fetching
    - Built-in technical indicators
    - No rate limits
    """
    
    def __init__(self):
        self.cache = {}
    
    def get_sp500_tickers(self) -> List[str]:
        """Get list of S&P 500 stock tickers"""
        try:
            # Fetch S&P 500 list from Wikipedia with proper headers
            url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            tables = pd.read_html(url, storage_options=headers)
            sp500_table = tables[0]
            tickers = sp500_table['Symbol'].tolist()
            # Clean tickers (remove dots, etc.)
            tickers = [ticker.replace('.', '-') for ticker in tickers]
            print(f"Fetched {len(tickers)} S&P 500 tickers")
            return tickers
        except Exception as e:
            print(f"Error fetching S&P 500 tickers: {e}")
            return []
    
    def get_nasdaq100_tickers(self) -> List[str]:
        """Get list of NASDAQ-100 tickers"""
        try:
            url = 'https://en.wikipedia.org/wiki/NASDAQ-100'
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            tables = pd.read_html(url, storage_options=headers)
            nasdaq_table = tables[4]  # Usually the 5th table
            tickers = nasdaq_table['Ticker'].tolist()
            print(f"Fetched {len(tickers)} NASDAQ-100 tickers")
            return tickers
        except Exception as e:
            print(f"Error fetching NASDAQ-100 tickers: {e}")
            return []
    
    def get_stock_data(self, symbol: str, period: str = '1y') -> Optional[Dict[str, Any]]:
        """
        Fetch comprehensive stock data for a single symbol
        Returns all data needed for filtering
        """
        try:
            print(f"Fetching {symbol}...")
            
            # Create ticker object
            ticker = yf.Ticker(symbol)
            
            # Get historical data (1 year for calculations)
            hist = ticker.history(period='1y')
            if hist.empty:
                print(f"  No historical data for {symbol}")
                return None
            
            # Get current price
            current_price = hist['Close'].iloc[-1]
            
            # Get info (fundamentals)
            info = ticker.info
            
            # Calculate technical indicators
            # RSI (14-day)
            rsi = ta.momentum.RSIIndicator(hist['Close'], window=14).rsi().iloc[-1]
            
            # Simple Moving Averages
            sma_20 = hist['Close'].rolling(window=20).mean().iloc[-1]
            sma_200 = hist['Close'].rolling(window=200).mean().iloc[-1] if len(hist) >= 200 else None
            
            # 52-week high/low
            high_52w = hist['High'].tail(252).max()
            low_52w = hist['Low'].tail(252).min()
            
            # Average volume (20-day)
            avg_volume = hist['Volume'].tail(20).mean()
            
            # Calculate year-over-year metrics
            revenue_growth = None
            eps_growth = None
            
            if 'revenueGrowth' in info and info['revenueGrowth'] is not None:
                revenue_growth = info['revenueGrowth']
            
            if 'earningsGrowth' in info and info['earningsGrowth'] is not None:
                eps_growth = info['earningsGrowth']
            
            # Gross margin
            gross_margin = None
            if 'grossMargins' in info and info['grossMargins'] is not None:
                gross_margin = info['grossMargins']
            
            # Debt to equity
            debt_to_equity = None
            if 'debtToEquity' in info and info['debtToEquity'] is not None:
                debt_to_equity = info['debtToEquity'] / 100  # Convert from percentage
            
            # Free cash flow
            free_cash_flow = info.get('freeCashflow', 0)
            
            # Compile all data
            stock_data = {
                'symbol': symbol,
                'name': info.get('longName', symbol),
                'current_price': float(current_price),
                'market_cap': info.get('marketCap', 0),
                'rsi': float(rsi) if not np.isnan(rsi) else None,
                'sma_20': float(sma_20) if not np.isnan(sma_20) else None,
                'sma_200': float(sma_200) if sma_200 and not np.isnan(sma_200) else None,
                'high_52w': float(high_52w),
                'low_52w': float(low_52w),
                'avg_volume': float(avg_volume),
                'revenue_growth': revenue_growth,
                'eps_growth': eps_growth,
                'gross_margin': gross_margin,
                'debt_to_equity': debt_to_equity,
                'pe_ratio': info.get('trailingPE', None),
                'price_to_sales': info.get('priceToSalesTrailing12Months', None),
                'free_cash_flow': free_cash_flow,
                'sector': info.get('sector', 'Unknown'),
                'industry': info.get('industry', 'Unknown'),
                'exchange': info.get('exchange', 'Unknown')
            }
            
            return stock_data
            
        except Exception as e:
            print(f"  Error fetching {symbol}: {e}")
            return None
    
    def screen_universe(self, tickers: List[str], 
                       min_market_cap: float = 5e9,
                       min_volume: float = 1.5e6,
                       max_rsi: float = 30) -> List[str]:
        """
        Fast pre-screening of stock universe
        Returns candidate tickers that pass basic filters
        This is MUCH faster than fetching full data for all stocks
        """
        print(f"\nPre-screening {len(tickers)} stocks...")
        print(f"   Filters: Market Cap ≥ ${min_market_cap/1e9:.1f}B, Volume ≥ {min_volume/1e6:.1f}M, RSI ≤ {max_rsi}")
        
        candidates = []
        
        # Fetch basic info in batches (faster)
        for i, symbol in enumerate(tickers):
            if i % 50 == 0:
                print(f"   Progress: {i}/{len(tickers)}")
            
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                
                # Quick filters
                market_cap = info.get('marketCap', 0)
                avg_volume = info.get('averageVolume', 0)
                
                if market_cap >= min_market_cap and avg_volume >= min_volume:
                    # Passed basic filters, add to candidates
                    candidates.append(symbol)
                    
            except Exception as e:
                continue
        
        print(f"Pre-screening complete: {len(candidates)} candidates from {len(tickers)} stocks")
        return candidates
    
    def get_bulk_data(self, symbols: List[str]) -> List[Dict[str, Any]]:
        """
        Fetch detailed data for multiple symbols
        """
        results = []
        total = len(symbols)
        
        print(f"\nFetching detailed data for {total} candidates...")
        
        for i, symbol in enumerate(symbols, 1):
            print(f"[{i}/{total}] {symbol}")
            data = self.get_stock_data(symbol)
            if data:
                results.append(data)
        
        return results


# Singleton instance
yfinance_service = YFinanceService()
