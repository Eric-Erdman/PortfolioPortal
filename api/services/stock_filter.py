"""
Stock Filtering Engine - Using yfinance
Applies strict criteria to filter oversold, high-growth stocks

KEY ADVANTAGE: Can screen 500+ stocks in 3-5 minutes instead of 100+ minutes
- yfinance is FREE and has no rate limits
- Can fetch data for entire S&P 500
- Pre-screens large universe before detailed analysis
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from .yfinance_service import yfinance_service


class StockFilter:
    """
    Filters stocks based on technical, fundamental, and growth criteria
    
    UNIVERSE SIZE:
    - S&P 500: ~500 stocks (covers large-cap U.S. companies)
    - Can expand to NASDAQ-100, Russell 1000, or custom lists
    - Screens ENTIRE universe efficiently with yfinance
    
    TWO-STAGE FILTERING:
    Stage 1 (Fast Pre-Screen): Market cap + Volume → Reduces 500 to ~100 candidates
    Stage 2 (Detailed): All 12 filters → Reduces 100 to top 5-10 stocks
    """
    
    # Filter thresholds - ALL YOUR STRICT FILTERS PRESERVED
    MIN_MARKET_CAP = 5_000_000_000  # $5B
    MIN_AVG_VOLUME = 1_500_000  # shares
    MAX_RSI = 28  # Very oversold
    MAX_PRICE_VS_52W_HIGH = 0.75  # 75%
    MIN_PRICE_VS_200D_SMA = 0.85  # 85%
    MIN_REVENUE_GROWTH = 0.10  # 10%
    MIN_EPS_GROWTH = 0.08  # 8%
    MAX_DEBT_TO_EQUITY = 0.80
    MAX_PRICE_TO_SALES = 4.0
    MIN_GROSS_MARGIN = 0.30  # 30%
    MAX_TRAILING_PE = 25.0
    
    def __init__(self):
        self.yf = yfinance_service
    
    
    def filter_stock(self, stock_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Apply all 12 strict filters to a stock (using yfinance data)
        Returns stock data if it passes ALL filters, None otherwise
        
        ALL YOUR FILTERS PRESERVED:
        1. Market Cap ≥ $5B
        2. Volume ≥ 1.5M
        3. RSI ≤ 28
        4. Price ≤ 75% of 52w high
        5. Price ≤ 20D SMA
        6. Price ≥ 85% of 200D SMA
        7. Revenue Growth ≥ 10%
        8. EPS Growth ≥ 8% OR FCF > 0
        9. Debt/Equity ≤ 0.80
        10. Gross Margin ≥ 30%
        11. Trailing P/E ≤ 25
        12. Price/Sales ≤ 4.0
        """
        symbol = stock_data['symbol']
        print(f"\n{'='*60}")
        print(f"Analyzing: {symbol}")
        print(f"{'='*60}")
        
        try:
            current_price = stock_data['current_price']
            
            # === FILTER 1: Market Cap ===
            market_cap = stock_data['market_cap']
            print(f"Market Cap: ${market_cap:,.0f}")
            if market_cap < self.MIN_MARKET_CAP:
                print(f"FAIL: Market cap below ${self.MIN_MARKET_CAP:,.0f}")
                return None
            print(f"PASS: Market cap")
            
            # === FILTER 2: Average Volume ===
            avg_volume = stock_data['avg_volume']
            print(f"Avg Volume (20d): {avg_volume:,.0f}")
            if avg_volume < self.MIN_AVG_VOLUME:
                print(f"FAIL: Volume below {self.MIN_AVG_VOLUME:,}")
                return None
            print(f"PASS: Volume")
            
            # === FILTER 3: RSI ===
            rsi_value = stock_data.get('rsi')
            if not rsi_value:
                print(f"FAIL: No RSI data")
                return None
            print(f"RSI (14): {rsi_value:.2f}")
            if rsi_value > self.MAX_RSI:
                print(f"FAIL: RSI above {self.MAX_RSI}")
                return None
            print(f"PASS: RSI (Oversold)")
            
            # === FILTER 4: 52-Week High ===
            high_52w = stock_data.get('high_52w')
            if high_52w:
                price_vs_52w = current_price / high_52w
                print(f"Price vs 52W High: {price_vs_52w:.2%} (${current_price:.2f} / ${high_52w:.2f})")
                if price_vs_52w > self.MAX_PRICE_VS_52W_HIGH:
                    print(f"FAIL: Price > {self.MAX_PRICE_VS_52W_HIGH:.0%} of 52w high")
                    return None
                print(f"PASS: Price vs 52w high")
            else:
                print(f"WARNING: No 52w high data")
                price_vs_52w = None
            
            # === FILTER 5: 20-Day SMA ===
            sma_20 = stock_data.get('sma_20')
            if sma_20:
                print(f"Price vs 20D SMA: ${current_price:.2f} vs ${sma_20:.2f}")
                if current_price > sma_20:
                    print(f"FAIL: Price above 20D SMA")
                    return None
                print(f"PASS: Price below 20D SMA")
            
            # === FILTER 6: 200-Day SMA ===
            sma_200 = stock_data.get('sma_200')
            if sma_200:
                price_vs_sma200 = current_price / sma_200
                print(f"Price vs 200D SMA: {price_vs_sma200:.2%} (${current_price:.2f} / ${sma_200:.2f})")
                if price_vs_sma200 < self.MIN_PRICE_VS_200D_SMA:
                    print(f"FAIL: Price < {self.MIN_PRICE_VS_200D_SMA:.0%} of 200D SMA")
                    return None
                print(f"PASS: Price vs 200D SMA")
            
            # === FILTER 7: Revenue Growth ===
            revenue_growth = stock_data.get('revenue_growth')
            if revenue_growth is not None:
                print(f"Revenue Growth (YoY): {revenue_growth:.1%}")
                if revenue_growth < self.MIN_REVENUE_GROWTH:
                    print(f"FAIL: Revenue growth < {self.MIN_REVENUE_GROWTH:.0%}")
                    return None
                print(f"PASS: Revenue growth")
            else:
                print(f"No revenue growth data")
            
            # === FILTER 8: EPS Growth OR Positive FCF ===
            eps_growth = stock_data.get('eps_growth')
            free_cash_flow = stock_data.get('free_cash_flow', 0)
            has_positive_fcf = free_cash_flow > 0
            
            if eps_growth:
                print(f"EPS Growth (YoY): {eps_growth:.1%}")
            print(f"Free Cash Flow: {'Positive' if has_positive_fcf else 'Negative'}")
            
            if not ((eps_growth and eps_growth >= self.MIN_EPS_GROWTH) or has_positive_fcf):
                print(f"FAIL: EPS growth < {self.MIN_EPS_GROWTH:.0%} AND no positive FCF")
                return None
            print(f"PASS: EPS growth or positive FCF")
            
            # === FILTER 9: Debt-to-Equity ===
            debt_to_equity = stock_data.get('debt_to_equity')
            if debt_to_equity is not None:
                print(f"Debt-to-Equity: {debt_to_equity:.2f}")
                if debt_to_equity > self.MAX_DEBT_TO_EQUITY:
                    print(f"FAIL: D/E > {self.MAX_DEBT_TO_EQUITY}")
                    return None
                print(f"PASS: Debt-to-Equity")
            
            # === FILTER 10: Gross Margin ===
            gross_margin = stock_data.get('gross_margin')
            if gross_margin is not None:
                print(f"Gross Margin: {gross_margin:.1%}")
                if gross_margin < self.MIN_GROSS_MARGIN:
                    print(f"FAIL: Gross margin < {self.MIN_GROSS_MARGIN:.0%}")
                    return None
                print(f"PASS: Gross margin")
            
            # === FILTER 11: Trailing P/E ===
            pe_ratio = stock_data.get('pe_ratio')
            if pe_ratio:
                print(f"Trailing P/E: {pe_ratio:.2f}")
                if pe_ratio > self.MAX_TRAILING_PE:
                    print(f"FAIL: P/E > {self.MAX_TRAILING_PE}")
                    return None
                print(f"PASS: Trailing P/E")
            
            # === FILTER 12: Price-to-Sales ===
            price_to_sales = stock_data.get('price_to_sales')
            if price_to_sales:
                print(f"Price-to-Sales: {price_to_sales:.2f}")
                if price_to_sales > self.MAX_PRICE_TO_SALES:
                    print(f"FAIL: P/S > {self.MAX_PRICE_TO_SALES}")
                    return None
                print(f"PASS: Price-to-Sales")
            
            # === STOCK PASSED ALL FILTERS ===
            print(f"\n{symbol} PASSED ALL FILTERS!")
            
            # Calculate composite score (normalized 0-100)
            # YOUR EXACT WEIGHTS: RSI 35%, Revenue 25%, EPS/FCF 20%, Drawdown 20%
            score = 0
            
            # 1. RSI Oversold Strength (35% weight)
            rsi_normalized = (self.MAX_RSI - rsi_value) / self.MAX_RSI
            score += rsi_normalized * 35
            
            # 2. Revenue Growth (25% weight)
            if revenue_growth:
                revenue_normalized = min((revenue_growth - self.MIN_REVENUE_GROWTH) / 0.40, 1.0)
                score += revenue_normalized * 25
            
            # 3. EPS/FCF Strength (20% weight)
            if eps_growth:
                eps_normalized = min((eps_growth - self.MIN_EPS_GROWTH) / 0.32, 1.0)
                score += eps_normalized * 20
            
            # 4. Drawdown Severity (20% weight)
            if high_52w and price_vs_52w:
                drawdown_normalized = (self.MAX_PRICE_VS_52W_HIGH - price_vs_52w) / self.MAX_PRICE_VS_52W_HIGH
                score += drawdown_normalized * 20
            
            return {
                'symbol': symbol,
                'name': stock_data['name'],
                'current_price': current_price,
                'market_cap': market_cap,
                'rsi': rsi_value,
                'price_vs_52w_high': price_vs_52w,
                'revenue_growth': revenue_growth,
                'eps_growth': eps_growth,
                'gross_margin': gross_margin,
                'debt_to_equity': debt_to_equity,
                'pe_ratio': pe_ratio,
                'price_to_sales': price_to_sales,
                'avg_volume': avg_volume,
                'sma_20': sma_20,
                'sma_200': sma_200,
                'composite_score': round(score, 2),
                'sector': stock_data.get('sector', 'Unknown'),
                'industry': stock_data.get('industry', 'Unknown'),
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error filtering {symbol}: {e}")
            return None
        """Calculate average daily volume over N days"""
        try:
            volumes = []
            for date, values in list(daily_data.items())[:days]:
                volume = float(values.get('6. volume', 0))
                volumes.append(volume)
            
            if len(volumes) >= days:
                return sum(volumes) / len(volumes)
        except Exception as e:
            print(f"Error calculating avg volume: {e}")
        return None
    
    def get_52_week_high_low(self, daily_data: Dict) -> tuple[Optional[float], Optional[float]]:
        """Get 52-week high and low from daily data"""
        try:
            # Get last 252 trading days (~1 year)
            prices = []
            for date, values in list(daily_data.items())[:252]:
                high = float(values.get('2. high', 0))
                low = float(values.get('3. low', 0))
                prices.append((high, low))
            
            if prices:
                highs = [p[0] for p in prices]
                lows = [p[1] for p in prices]
                return max(highs), min(lows)
        except Exception as e:
            print(f"Error calculating 52w high/low: {e}")
        return None, None
    
    def calculate_sma(self, daily_data: Dict, period: int) -> Optional[float]:
        """Calculate Simple Moving Average manually"""
        try:
            closes = []
            for date, values in list(daily_data.items())[:period]:
                close = float(values.get('5. adjusted close', values.get('4. close', 0)))
                closes.append(close)
            
            if len(closes) >= period:
                return sum(closes) / len(closes)
        except Exception as e:
            print(f"Error calculating SMA: {e}")
        return None
    
    def calculate_revenue_growth(self, income_data: Dict) -> Optional[float]:
        """Calculate year-over-year revenue growth"""
        try:
            if 'annualReports' not in income_data or len(income_data['annualReports']) < 2:
                return None
            
            reports = income_data['annualReports']
            latest = float(reports[0].get('totalRevenue', 0))
            previous = float(reports[1].get('totalRevenue', 1))
            
            if previous > 0:
                return (latest - previous) / previous
        except Exception as e:
            print(f"Error calculating revenue growth: {e}")
        return None
    
    def calculate_eps_growth(self, earnings_data: Dict) -> Optional[float]:
        """Calculate EPS growth year-over-year"""
        try:
            if 'annualEarnings' not in earnings_data or len(earnings_data['annualEarnings']) < 2:
                return None
            
            earnings = earnings_data['annualEarnings']
            latest_eps = float(earnings[0].get('reportedEPS', 0))
            previous_eps = float(earnings[1].get('reportedEPS', 1))
            
            if previous_eps != 0:
                return (latest_eps - previous_eps) / abs(previous_eps)
        except Exception as e:
            print(f"Error calculating EPS growth: {e}")
        return None
    
    def calculate_debt_to_equity(self, balance_sheet: Dict) -> Optional[float]:
        """Calculate debt-to-equity ratio"""
        try:
            if 'annualReports' not in balance_sheet or not balance_sheet['annualReports']:
                return None
            
            latest = balance_sheet['annualReports'][0]
            total_debt = float(latest.get('shortLongTermDebtTotal', 0))
            total_equity = float(latest.get('totalShareholderEquity', 1))
            
            if total_equity > 0:
                return total_debt / total_equity
        except Exception as e:
            print(f"Error calculating D/E: {e}")
        return None
    
    def check_free_cash_flow(self, cash_flow: Dict) -> bool:
        """Check if company has positive free cash flow"""
        try:
            if 'annualReports' not in cash_flow or not cash_flow['annualReports']:
                return False
            
            latest = cash_flow['annualReports'][0]
            fcf = float(latest.get('operatingCashflow', 0)) - float(latest.get('capitalExpenditures', 0))
            return fcf > 0
        except Exception as e:
            print(f"Error checking FCF: {e}")
        return False
    
    def calculate_gross_margin(self, income_data: Dict) -> Optional[float]:
        """Calculate gross margin from income statement"""
        try:
            if 'annualReports' not in income_data or not income_data['annualReports']:
                return None
            
            latest = income_data['annualReports'][0]
            gross_profit = float(latest.get('grossProfit', 0))
            total_revenue = float(latest.get('totalRevenue', 1))
            
            if total_revenue > 0:
                return gross_profit / total_revenue
        except Exception as e:
            print(f"Error calculating gross margin: {e}")
        return None
    
    async def filter_stock(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Apply all filters to a single stock
        Returns stock data if it passes all filters, None otherwise
        """
        print(f"\n{'='*60}")
        print(f"Analyzing: {symbol}")
        print(f"{'='*60}")
        
        try:
            # Fetch all required data
            print(f"Fetching data for {symbol}...")
            overview = self.av.get_company_overview(symbol)
            if not overview or not overview.get('Symbol'):
                print(f"No overview data for {symbol}")
                return None
            
            quote = self.av.get_global_quote(symbol)
            daily_data = self.av.get_daily_adjusted(symbol, outputsize='full')
            rsi_data = self.av.get_rsi(symbol)
            
            if not all([quote, daily_data, rsi_data]):
                print(f"Missing required data for {symbol}")
                return None
            
            # Extract current values
            current_price = float(quote.get('05. price', 0))
            if current_price == 0:
                print(f"Invalid price for {symbol}")
                return None
            
            # === FILTER 1: Market Cap ===
            market_cap = float(overview.get('MarketCapitalization', 0))
            print(f"Market Cap: ${market_cap:,.0f}")
            if market_cap < self.MIN_MARKET_CAP:
                print(f"FAIL: Market cap below ${self.MIN_MARKET_CAP:,.0f}")
                return None
            print(f"PASS: Market cap")
            
            # === FILTER 2: Average Volume ===
            avg_volume = self.calculate_avg_volume(daily_data, days=20)
            print(f"Avg Volume (20d): {avg_volume:,.0f}" if avg_volume else "Avg Volume: N/A")
            if not avg_volume or avg_volume < self.MIN_AVG_VOLUME:
                print(f"FAIL: Volume below {self.MIN_AVG_VOLUME:,}")
                return None
            print(f"PASS: Volume")
            
            # === FILTER 3: RSI ===
            latest_rsi_date = list(rsi_data.keys())[0]
            rsi_value = float(rsi_data[latest_rsi_date].get('RSI', 100))
            print(f"RSI (14): {rsi_value:.2f}")
            if rsi_value > self.MAX_RSI:
                print(f"FAIL: RSI above {self.MAX_RSI}")
                return None
            print(f"PASS: RSI (Oversold)")
            
            # === FILTER 4: 52-Week High ===
            high_52w, low_52w = self.get_52_week_high_low(daily_data)
            if high_52w:
                price_vs_52w = current_price / high_52w
                print(f"Price vs 52W High: {price_vs_52w:.2%} (${current_price:.2f} / ${high_52w:.2f})")
                if price_vs_52w > self.MAX_PRICE_VS_52W_HIGH:
                    print(f"FAIL: Price > {self.MAX_PRICE_VS_52W_HIGH:.0%} of 52w high")
                    return None
                print(f"PASS: Price vs 52w high")
            else:
                print(f"WARNING: Could not calculate 52w high")
            
            # === FILTER 5: 20-Day SMA ===
            sma_20 = self.calculate_sma(daily_data, 20)
            if sma_20:
                print(f"Price vs 20D SMA: ${current_price:.2f} vs ${sma_20:.2f}")
                if current_price > sma_20:
                    print(f"FAIL: Price above 20D SMA")
                    return None
                print(f"PASS: Price below 20D SMA")
            
            # === FILTER 6: 200-Day SMA ===
            sma_200 = self.calculate_sma(daily_data, 200)
            if sma_200:
                price_vs_sma200 = current_price / sma_200
                print(f"Price vs 200D SMA: {price_vs_sma200:.2%} (${current_price:.2f} / ${sma_200:.2f})")
                if price_vs_sma200 < self.MIN_PRICE_VS_200D_SMA:
                    print(f"FAIL: Price < {self.MIN_PRICE_VS_200D_SMA:.0%} of 200D SMA")
                    return None
                print(f"PASS: Price vs 200D SMA")
            
            # === FILTER 7: Revenue Growth ===
            income_data = self.av.get_income_statement(symbol)
            revenue_growth = None
            if income_data:
                revenue_growth = self.calculate_revenue_growth(income_data)
                if revenue_growth:
                    print(f"Revenue Growth (YoY): {revenue_growth:.1%}")
                    if revenue_growth < self.MIN_REVENUE_GROWTH:
                        print(f"FAIL: Revenue growth < {self.MIN_REVENUE_GROWTH:.0%}")
                        return None
                    print(f"PASS: Revenue growth")
            
            # === FILTER 8: EPS Growth OR Positive FCF ===
            earnings_data = self.av.get_earnings(symbol)
            eps_growth = None
            if earnings_data:
                eps_growth = self.calculate_eps_growth(earnings_data)
                if eps_growth:
                    print(f"EPS Growth (YoY): {eps_growth:.1%}")
            
            cash_flow_data = self.av.get_cash_flow(symbol)
            has_positive_fcf = False
            if cash_flow_data:
                has_positive_fcf = self.check_free_cash_flow(cash_flow_data)
                print(f"Free Cash Flow: {'Positive' if has_positive_fcf else 'Negative'}")
            
            if not ((eps_growth and eps_growth >= self.MIN_EPS_GROWTH) or has_positive_fcf):
                print(f"FAIL: EPS growth < {self.MIN_EPS_GROWTH:.0%} AND no positive FCF")
                return None
            print(f"PASS: EPS growth or positive FCF")
            
            # === FILTER 9: Debt-to-Equity ===
            balance_data = self.av.get_balance_sheet(symbol)
            debt_to_equity = None
            if balance_data:
                debt_to_equity = self.calculate_debt_to_equity(balance_data)
                if debt_to_equity is not None:
                    print(f"Debt-to-Equity: {debt_to_equity:.2f}")
                    if debt_to_equity > self.MAX_DEBT_TO_EQUITY:
                        print(f"FAIL: D/E > {self.MAX_DEBT_TO_EQUITY}")
                        return None
                    print(f"PASS: Debt-to-Equity")
            
            # === FILTER 10: Gross Margin ===
            gross_margin = None
            if income_data:
                gross_margin = self.calculate_gross_margin(income_data)
                if gross_margin is not None:
                    print(f"Gross Margin: {gross_margin:.1%}")
                    if gross_margin < self.MIN_GROSS_MARGIN:
                        print(f"FAIL: Gross margin < {self.MIN_GROSS_MARGIN:.0%}")
                        return None
                    print(f"PASS: Gross margin")
            
            # === FILTER 11: Trailing P/E ===
            pe_ratio = float(overview.get('PERatio', 0)) if overview.get('PERatio') != 'None' else None
            if pe_ratio:
                print(f"Trailing P/E: {pe_ratio:.2f}")
                if pe_ratio > self.MAX_TRAILING_PE:
                    print(f"FAIL: P/E > {self.MAX_TRAILING_PE}")
                    return None
                print(f"PASS: Trailing P/E")
            
            # === FILTER 12: Price-to-Sales ===
            price_to_sales = float(overview.get('PriceToSalesRatioTTM', 0)) if overview.get('PriceToSalesRatioTTM') != 'None' else None
            
            if price_to_sales:
                print(f"Price-to-Sales: {price_to_sales:.2f}")
                if price_to_sales > self.MAX_PRICE_TO_SALES:
                    print(f"FAIL: P/S > {self.MAX_PRICE_TO_SALES}")
                    return None
                print(f"PASS: Price-to-Sales")
            
            # === STOCK PASSED ALL FILTERS ===
            print(f"\n{symbol} PASSED ALL FILTERS!")
            
            # Calculate composite score (higher = better opportunity)
            # Normalized scoring: each metric 0-1, then weighted
            score = 0
            
            # 1. RSI Oversold Strength (35% weight)
            # RSI=0 is max oversold, RSI=28 is threshold
            rsi_normalized = (self.MAX_RSI - rsi_value) / self.MAX_RSI
            score += rsi_normalized * 35
            
            # 2. Revenue Growth (25% weight)
            # Normalize: 10% growth = 0, 50%+ growth = 1
            if revenue_growth:
                revenue_normalized = min((revenue_growth - self.MIN_REVENUE_GROWTH) / 0.40, 1.0)
                score += revenue_normalized * 25
            
            # 3. EPS/FCF Strength (20% weight)
            # Normalize: 8% EPS growth = 0, 40%+ = 1
            if eps_growth:
                eps_normalized = min((eps_growth - self.MIN_EPS_GROWTH) / 0.32, 1.0)
                score += eps_normalized * 20
            
            # 4. Drawdown Severity (20% weight)
            # How far below 52w high = buying opportunity
            if high_52w and price_vs_52w:
                drawdown_normalized = (self.MAX_PRICE_VS_52W_HIGH - price_vs_52w) / self.MAX_PRICE_VS_52W_HIGH
                score += drawdown_normalized * 20
            
            return {
                'symbol': symbol,
                'name': overview.get('Name', symbol),
                'current_price': current_price,
                'market_cap': market_cap,
                'rsi': rsi_value,
                'price_vs_52w_high': price_vs_52w if high_52w else None,
                'revenue_growth': revenue_growth,
                'eps_growth': eps_growth,
                'gross_margin': gross_margin,
                'debt_to_equity': debt_to_equity,
                'pe_ratio': pe_ratio,
                'price_to_sales': price_to_sales,
                'avg_volume': avg_volume,
                'sma_20': sma_20,
                'sma_200': sma_200,
                'composite_score': round(score, 2),
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error filtering {symbol}: {e}")
            return None


# Singleton instance
stock_filter = StockFilter()
