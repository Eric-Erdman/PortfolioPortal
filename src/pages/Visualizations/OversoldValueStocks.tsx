import React, { useState, useEffect } from 'react';
import type { VisualizationProps } from './types';

// Backend API response type
interface BackendStockData {
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  rsi: number;
  price_vs_52w_high: number | null;
  revenue_growth: number | null;
  eps_growth: number | null;
  gross_margin: number | null;
  debt_to_equity: number | null;
  pe_ratio: number | null;
  price_to_sales: number | null;
  avg_volume: number;
  composite_score: number;
  last_updated: string;
}

interface APIResponse {
  success: boolean;
  stocks: BackendStockData[];
  count: number;
  last_updated: string;
  filters_applied: Record<string, string>;
  scoring_weights: Record<string, string>;
}

export const OversoldValueStocks: React.FC<VisualizationProps> = () => {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'1D' | '1W' | '1M' | '1Y' | '2Y' | '5Y'>('1M');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [stocks, setStocks] = useState<BackendStockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Progress tracking
  const [progress, setProgress] = useState<{
    status: string;
    stage: string;
    current: number;
    total: number;
    message: string;
    stocks_found: number;
  } | null>(null);

  const timePeriods: Array<'1D' | '1W' | '1M' | '1Y' | '2Y' | '5Y'> = ['1D', '1W', '1M', '1Y', '2Y', '5Y'];

  // Connect to progress stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    if (loading) {
      console.log('Connecting to progress stream...');
      eventSource = new EventSource('/api/screening-progress');
      
      eventSource.onmessage = (event) => {
        const progressData = JSON.parse(event.data);
        console.log('Progress update:', progressData);
        setProgress(progressData);
        
        // Close connection when complete or error
        if (progressData.status === 'complete' || progressData.status === 'error') {
          eventSource?.close();
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('Progress stream error:', error);
        eventSource?.close();
      };
    }
    
    return () => {
      eventSource?.close();
    };
  }, [loading]);

  // Fetch filtered stocks from backend API
  useEffect(() => {
    const loadStockData = async () => {
      setLoading(true);
      setError(null);
      setProgress({ status: 'idle', stage: '', current: 0, total: 0, message: 'Initializing...', stocks_found: 0 });
      try {
        console.log('Fetching filtered stocks from backend...');
        
        // Call our Python backend endpoint
        const response = await fetch('/api/daily-stocks');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data: APIResponse = await response.json();
        
        if (!data.success) {
          throw new Error('API returned unsuccessful response');
        }
        
        console.log(`Loaded ${data.count} filtered stocks:`, data.stocks);
        
        setStocks(data.stocks);
        
        // Auto-select the top-ranked stock
        if (data.stocks.length > 0) {
          setSelectedStock(data.stocks[0].symbol);
        }
      } catch (err) {
        console.error('Error loading stock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stock data');
      } finally {
        setLoading(false);
        setProgress(null);
      }
    };

    loadStockData();
  }, []);

  const selectedStockData = stocks.find(s => s.symbol === selectedStock);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      gap: '2rem',
      padding: '2rem',
      backgroundColor: '#ffffff',
      position: 'relative'
    }}>
      {/* Instructions Overlay */}
      {showInstructions && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Instructions content will go here */}
        </div>
      )}

      {/* Information Button - Top Right */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'transparent',
          color: '#000000',
          border: '1px solid #000000',
          cursor: 'pointer',
          fontWeight: '400',
          fontSize: '0.85rem',
          transition: 'all 0.2s ease',
          zIndex: 1001
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#000000';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#000000';
        }}
      >
        {showInstructions ? 'Back to TrendView' : 'Information Here'}
      </button>

      {/* Left Panel - Stock Selector */}
      <div style={{
        width: '180px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        flexShrink: 0
      }}>
        {loading ? (
          // Loading state with progress
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666666' }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>
              Under Construction
            </div>
            
            {progress && progress.status === 'running' && (
              <>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: '#000' }}>
                  {progress.stage === 'fetching_universe' && 'Fetching stock universe...'}
                  {progress.stage === 'pre_screening' && 'Pre-screening candidates...'}
                  {progress.stage === 'fetching_details' && 'Analyzing stocks...'}
                  {progress.stage === 'filtering' && 'Applying filters...'}
                </div>
                
                {progress.total > 0 && (
                  <>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        width: `${(progress.current / progress.total) * 100}%`,
                        height: '100%',
                        backgroundColor: '#3498db',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
                      {progress.current} / {progress.total}
                    </div>
                  </>
                )}
                
                {progress.stocks_found > 0 && (
                  <div style={{ fontSize: '0.85rem', color: '#2ecc71', fontWeight: '600', marginTop: '0.5rem' }}>
                    {progress.stocks_found} stocks found
                  </div>
                )}
                
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '1rem' }}>
                  {progress.message}
                </div>
              </>
            )}
            
            {progress && progress.status === 'complete' && progress.stocks_found === 0 && (
              <div style={{ fontSize: '0.85rem', color: '#e67e22', marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                {progress.message}
              </div>
            )}
            
            {!progress && (
              <div style={{ fontSize: '0.75rem' }}>This may take 2-4 minutes</div>
            )}
          </div>
        ) : error ? (
          // Error state
          <div style={{ textAlign: 'center', padding: '1rem', color: '#e74c3c', fontSize: '0.85rem' }}>
            {error}
          </div>
        ) : (
          // Stock list
          stocks.map((stock) => {
            // Calculate change percent from current price (we'd need historical data for real change)
            const changePercent = ((stock.price_vs_52w_high || 0) - 1) * 100; // Approximate from 52w positioning
            
            return (
              <div
                key={stock.symbol}
                onClick={() => setSelectedStock(stock.symbol)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: selectedStock === stock.symbol ? 'rgba(52, 152, 219, 0.08)' : 'transparent',
                  color: '#000000',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: `1px solid ${selectedStock === stock.symbol ? '#000000' : '#d0d0d0'}`,
                  borderLeft: selectedStock === stock.symbol ? '3px solid #3498db' : '1px solid #d0d0d0'
                }}
                onMouseEnter={(e) => {
                  if (selectedStock !== stock.symbol) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStock !== stock.symbol) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.15rem', color: '#000000' }}>
                  {stock.symbol}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {stock.name}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: '600',
                  color: changePercent >= 0 ? '#2ecc71' : '#e74c3c' 
                }}>
                  ${stock.current_price.toFixed(2)}
                  <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>
                    {changePercent >= 0 ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#999999', marginTop: '0.25rem' }}>
                  Score: {stock.composite_score.toFixed(1)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Right Panel - Metrics and Chart */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Top Metrics Panel - Floating */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '3rem',
          paddingLeft: '1rem'
        }}>
          {/* RSI (Oversold Indicator) */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#666666', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RSI (14)
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '400', color: '#e74c3c' }}>
              {selectedStockData ? `${selectedStockData.rsi.toFixed(1)}` : 'NA'}
            </div>
          </div>

          {/* Composite Score */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#666666', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Opp. Score
            </div>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#3498db'
            }}>
              {selectedStockData ? `${selectedStockData.composite_score.toFixed(1)}/100` : 'NA'}
            </div>
          </div>

          {/* Revenue Growth */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#666666', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Rev Growth
            </div>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: '400', 
              color: selectedStockData && selectedStockData.revenue_growth && selectedStockData.revenue_growth >= 0 ? '#2ecc71' : '#e74c3c'
            }}>
              {selectedStockData && selectedStockData.revenue_growth ? `${(selectedStockData.revenue_growth * 100).toFixed(1)}%` : 'NA'}
            </div>
          </div>

          {/* Market Cap */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#666666', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Market Cap
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '400', color: '#000000' }}>
              {selectedStockData ? `$${(selectedStockData.market_cap / 1e9).toFixed(1)}B` : 'NA'}
            </div>
          </div>

          {/* P/E Ratio */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#666666', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              P/E Ratio
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '400', color: '#000000' }}>
              {selectedStockData && selectedStockData.pe_ratio ? selectedStockData.pe_ratio.toFixed(1) : 'NA'}
            </div>
          </div>
        </div>

        {/* Main Chart Area with Time Period Filter Inside */}
        <div style={{
          flex: 1,
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          border: '1px solid #d0d0d0',
          position: 'relative'
        }}>
          {/* Time Period Filter - Vertical Column Inside Chart */}
          <div style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            zIndex: 10
          }}>
            {timePeriods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimePeriod(period)}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'transparent',
                  color: selectedTimePeriod === period ? '#000000' : '#999999',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: selectedTimePeriod === period ? '600' : '400',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'right',
                  borderRight: selectedTimePeriod === period ? '2px solid #000000' : 'none',
                  paddingRight: selectedTimePeriod === period ? '0.5rem' : '0.75rem'
                }}
                onMouseEnter={(e) => {
                  if (selectedTimePeriod !== period) {
                    e.currentTarget.style.color = '#000000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTimePeriod !== period) {
                    e.currentTarget.style.color = '#999999';
                  }
                }}
              >
                {period}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{
              textAlign: 'center',
              color: '#666666',
              fontSize: '1rem'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Under Construction</div>
              <div>Loading stock data...</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#999999' }}>
                This may take 1-2 minutes due to API rate limits
              </div>
            </div>
          ) : !selectedStock ? (
            <div style={{
              textAlign: 'center',
              color: '#cccccc',
              fontSize: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600' }}>Stock Trends</div>
              <div>Select a stock to view its trend</div>
            </div>
          ) : selectedStockData ? (
            <div style={{
              textAlign: 'center',
              color: '#666666',
              fontSize: '1rem',
              padding: '2rem'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#000000', marginBottom: '0.5rem' }}>
                {selectedStockData.name}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '600', color: '#000000', marginBottom: '0.5rem' }}>
                ${selectedStockData.current_price.toFixed(2)}
              </div>
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: '600',
                color: selectedStockData.rsi <= 30 ? '#2ecc71' : '#666',
                marginBottom: '1rem'
              }}>
                RSI: {selectedStockData.rsi.toFixed(1)} | Score: {selectedStockData.composite_score.toFixed(1)}/100
              </div>
              <div style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#999999' }}>
                Time Period: {selectedTimePeriod}
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '1rem', fontStyle: 'italic', color: '#999999' }}>
                (Interactive chart visualization coming next)
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#e74c3c',
              fontSize: '1rem'
            }}>
              <div>No data available for this stock</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
