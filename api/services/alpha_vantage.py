"""
Alpha Vantage Service - Stock Data Fetching
Handles all API calls to Alpha Vantage with proper error handling and rate limiting
"""

import os
import requests
import time
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

API_KEY = os.getenv('VITE_ALPHA_VANTAGE_API_KEY', '')
BASE_URL = 'https://www.alphavantage.co/query'

# Rate limiting: Alpha Vantage free tier = 5 calls/minute, 25 calls/day
CALL_DELAY = 12  # seconds between calls


class AlphaVantageService:
    def __init__(self, api_key: str = API_KEY):
        self.api_key = api_key
        self.last_call_time = 0
    
    def _rate_limit(self):
        """Enforce rate limiting between API calls"""
        elapsed = time.time() - self.last_call_time
        if elapsed < CALL_DELAY:
            time.sleep(CALL_DELAY - elapsed)
        self.last_call_time = time.time()
    
    def _make_request(self, params: Dict[str, str]) -> Optional[Dict]:
        """Make rate-limited request to Alpha Vantage"""
        self._rate_limit()
        params['apikey'] = self.api_key
        
        try:
            response = requests.get(BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Check for API error messages
            if 'Error Message' in data:
                print(f"API Error: {data['Error Message']}")
                return None
            if 'Note' in data:
                print(f"API Rate Limit: {data['Note']}")
                return None
                
            return data
        except Exception as e:
            print(f"Request failed: {e}")
            return None
    
    def get_global_quote(self, symbol: str) -> Optional[Dict]:
        """Get current price and basic quote data"""
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol
        }
        data = self._make_request(params)
        if data and 'Global Quote' in data:
            return data['Global Quote']
        return None
    
    def get_daily_adjusted(self, symbol: str, outputsize: str = 'compact') -> Optional[Dict]:
        """
        Get daily price history (adjusted for splits/dividends)
        outputsize: 'compact' (100 days) or 'full' (20+ years)
        """
        params = {
            'function': 'TIME_SERIES_DAILY_ADJUSTED',
            'symbol': symbol,
            'outputsize': outputsize
        }
        data = self._make_request(params)
        if data and 'Time Series (Daily)' in data:
            return data['Time Series (Daily)']
        return None
    
    def get_rsi(self, symbol: str, interval: str = 'daily', time_period: int = 14) -> Optional[Dict]:
        """Get RSI indicator values"""
        params = {
            'function': 'RSI',
            'symbol': symbol,
            'interval': interval,
            'time_period': time_period,
            'series_type': 'close'
        }
        data = self._make_request(params)
        if data and 'Technical Analysis: RSI' in data:
            return data['Technical Analysis: RSI']
        return None
    
    def get_sma(self, symbol: str, interval: str = 'daily', time_period: int = 20) -> Optional[Dict]:
        """Get Simple Moving Average"""
        params = {
            'function': 'SMA',
            'symbol': symbol,
            'interval': interval,
            'time_period': time_period,
            'series_type': 'close'
        }
        data = self._make_request(params)
        if data and 'Technical Analysis: SMA' in data:
            return data['Technical Analysis: SMA']
        return None
    
    def get_company_overview(self, symbol: str) -> Optional[Dict]:
        """
        Get fundamental data: market cap, P/E, EPS, revenue, etc.
        """
        params = {
            'function': 'OVERVIEW',
            'symbol': symbol
        }
        return self._make_request(params)
    
    def get_income_statement(self, symbol: str) -> Optional[Dict]:
        """Get annual and quarterly income statements"""
        params = {
            'function': 'INCOME_STATEMENT',
            'symbol': symbol
        }
        return self._make_request(params)
    
    def get_balance_sheet(self, symbol: str) -> Optional[Dict]:
        """Get balance sheet data for debt-to-equity calculation"""
        params = {
            'function': 'BALANCE_SHEET',
            'symbol': symbol
        }
        return self._make_request(params)
    
    def get_cash_flow(self, symbol: str) -> Optional[Dict]:
        """Get cash flow statement"""
        params = {
            'function': 'CASH_FLOW',
            'symbol': symbol
        }
        return self._make_request(params)
    
    def get_earnings(self, symbol: str) -> Optional[Dict]:
        """Get quarterly and annual earnings data"""
        params = {
            'function': 'EARNINGS',
            'symbol': symbol
        }
        return self._make_request(params)


# Singleton instance
alpha_vantage = AlphaVantageService()
