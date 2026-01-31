const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface StockOverview {
  symbol: string;
  name: string;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface TimeSeriesData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: string;
  oversoldPercentage: number;
  roi: number;
  companySize: string;
  history: TimeSeriesData[];
}

// List of stocks to track - you can modify this list
export const TRACKED_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' }
];

/**
 * Fetch global quote (current price) for a stock
 */
export async function fetchGlobalQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume'])
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch company overview (fundamental data)
 */
export async function fetchCompanyOverview(symbol: string): Promise<StockOverview | null> {
  try {
    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Symbol) {
      return {
        symbol: data.Symbol,
        name: data.Name,
        marketCap: parseFloat(data.MarketCapitalization) || 0,
        peRatio: parseFloat(data.PERatio) || 0,
        dividendYield: parseFloat(data.DividendYield) || 0,
        fiftyTwoWeekHigh: parseFloat(data['52WeekHigh']) || 0,
        fiftyTwoWeekLow: parseFloat(data['52WeekLow']) || 0
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching overview for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch time series data for charting
 * @param symbol Stock symbol
 * @param interval daily, weekly, or monthly
 */
export async function fetchTimeSeries(
  symbol: string,
  interval: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<TimeSeriesData[]> {
  try {
    const functionMap = {
      daily: 'TIME_SERIES_DAILY',
      weekly: 'TIME_SERIES_WEEKLY',
      monthly: 'TIME_SERIES_MONTHLY'
    };

    const url = `${BASE_URL}?function=${functionMap[interval]}&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
    if (!timeSeriesKey) return [];

    const timeSeries = data[timeSeriesKey];
    const result: TimeSeriesData[] = [];

    for (const [timestamp, values] of Object.entries(timeSeries)) {
      const typedValues = values as Record<string, string>;
      result.push({
        timestamp,
        open: parseFloat(typedValues['1. open']),
        high: parseFloat(typedValues['2. high']),
        low: parseFloat(typedValues['3. low']),
        close: parseFloat(typedValues['4. close']),
        volume: parseInt(typedValues['5. volume'])
      });
    }

    return result;
  } catch (error) {
    console.error(`Error fetching time series for ${symbol}:`, error);
    return [];
  }
}

/**
 * Calculate if stock is oversold (simplified RSI-like calculation)
 * Based on 52-week high/low
 */
function calculateOversoldPercentage(currentPrice: number, high: number, low: number): number {
  if (high === low) return 0;
  const range = high - low;
  const distanceFromHigh = high - currentPrice;
  return (distanceFromHigh / range) * 100;
}

/**
 * Calculate simple ROI based on year-to-date performance
 */
function calculateROI(history: TimeSeriesData[]): number {
  if (history.length < 2) return 0;
  const current = history[0].close;
  const yearAgo = history[Math.min(252, history.length - 1)].close; // ~252 trading days in a year
  return ((current - yearAgo) / yearAgo) * 100;
}

/**
 * Determine company size based on market cap
 */
function getCompanySize(marketCap: number): string {
  if (marketCap > 200000000000) return 'Large Cap'; // > $200B
  if (marketCap > 10000000000) return 'Mid Cap'; // $10B - $200B
  if (marketCap > 2000000000) return 'Small Cap'; // $2B - $10B
  return 'Micro Cap';
}

/**
 * Format market cap to readable string
 */
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toFixed(2)}`;
}

/**
 * Fetch complete stock data with all metrics
 */
export async function fetchCompleteStockData(symbol: string, name: string): Promise<StockData | null> {
  try {
    // Note: Alpha Vantage has rate limits (5 calls/minute for free tier)
    // We'll fetch quote and overview, but you may need to implement caching
    const [quote, overview, history] = await Promise.all([
      fetchGlobalQuote(symbol),
      fetchCompanyOverview(symbol),
      fetchTimeSeries(symbol, 'daily')
    ]);

    if (!quote || !overview) {
      return null;
    }

    const oversoldPercentage = calculateOversoldPercentage(
      quote.price,
      overview.fiftyTwoWeekHigh,
      overview.fiftyTwoWeekLow
    );

    const roi = calculateROI(history);

    return {
      symbol,
      name: overview.name || name,
      currentPrice: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      marketCap: formatMarketCap(overview.marketCap),
      peRatio: overview.peRatio ? overview.peRatio.toFixed(2) : 'N/A',
      oversoldPercentage: Math.round(oversoldPercentage),
      roi: Math.round(roi * 100) / 100,
      companySize: getCompanySize(overview.marketCap),
      history: history.slice(0, 365) // Keep last year of data
    };
  } catch (error) {
    console.error(`Error fetching complete data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch data for multiple stocks with delay to respect rate limits
 */
export async function fetchMultipleStocks(
  stocks: Array<{ symbol: string; name: string }>,
  delayMs: number = 12000 // 12 seconds between calls for free tier (5 calls/min)
): Promise<StockData[]> {
  const results: StockData[] = [];

  for (let i = 0; i < stocks.length; i++) {
    const stock = stocks[i];
    console.log(`Fetching data for ${stock.symbol}... (${i + 1}/${stocks.length})`);
    
    const data = await fetchCompleteStockData(stock.symbol, stock.name);
    if (data) {
      results.push(data);
    }

    // Add delay between requests to respect rate limits (except for last one)
    if (i < stocks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
