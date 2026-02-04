import React, { useState, useEffect } from 'react';
import type { CattleData, PropertyTaxData, OperationsData, VisualizationProps } from './types';

export const CattleSalesVisualization: React.FC<VisualizationProps> = ({ selectedColor }) => {
  const [data, setData] = useState<CattleData[]>([]);
  const [propertyTaxData, setPropertyTaxData] = useState<PropertyTaxData[]>([]);
  const [operationsData, setOperationsData] = useState<OperationsData[]>([]);
  const [selectedAcreage, setSelectedAcreage] = useState<'small' | 'medium' | 'large'>('small');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredTax, setHoveredTax] = useState<{ year: number; cattleSales: number; propertyTax: number } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Load data from pre-processed JSON files in public folder
      const [cattleResponse, taxResponse, operationsResponse] = await Promise.all([
        fetch('/data/processed/cattle_sales.json'),
        fetch('/data/processed/property_taxes.json'),
        fetch('/data/processed/number_of_operations.json')
      ]);
      
      if (!cattleResponse.ok || !taxResponse.ok || !operationsResponse.ok) {
        throw new Error('Failed to load data');
      }
      
      const cattleData: CattleData[] = await cattleResponse.json();
      const taxData: PropertyTaxData[] = await taxResponse.json();
      const opsData: OperationsData[] = await operationsResponse.json();
      
      // Parse VALUE field if it's a string with commas
      const parsedCattleData = cattleData.map(item => ({
        ...item,
        VALUE: typeof item.VALUE === 'string' 
          ? parseInt((item.VALUE as string).replace(/,/g, ''), 10) 
          : item.VALUE
      }));
      
      const parsedTaxData = taxData.map(item => ({
        ...item,
        VALUE: typeof item.VALUE === 'string' 
          ? parseInt((item.VALUE as string).replace(/,/g, ''), 10) 
          : item.VALUE
      }));
      
      const parsedOpsData = opsData.map(item => ({
        ...item,
        VALUE: typeof item.VALUE === 'string' 
          ? parseInt((item.VALUE as string).replace(/,/g, ''), 10) 
          : item.VALUE
      }));
      
      setData(parsedCattleData);
      setPropertyTaxData(parsedTaxData);
      setOperationsData(parsedOpsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Make sure to run the export script first.');
      setLoading(false);
    }
  };

  const getColorForBar = () => {
    if (selectedColor === 'custom1') return '#ff909bff';
    if (selectedColor === 'custom2') return '#89ccffff';
    return '#83fc9bff';
  };

  const filteredData = data.filter(item => {
    if (selectedAcreage === 'small') {
      return item.DOMAINCAT_DESC.includes('1.0 TO 9.9');
    } else if (selectedAcreage === 'medium') {
      return item.DOMAINCAT_DESC.includes('10.0 TO 49.9');
    } else {
      return item.DOMAINCAT_DESC.includes('2,000 OR MORE');
    }
  });

  const filteredTaxData = propertyTaxData.filter(item => {
    if (selectedAcreage === 'small') {
      return item.DOMAINCAT_DESC.includes('1.0 TO 9.9');
    } else if (selectedAcreage === 'medium') {
      return item.DOMAINCAT_DESC.includes('10.0 TO 49.9');
    } else {
      return item.DOMAINCAT_DESC.includes('2,000 OR MORE');
    }
  });

  const filteredOpsData = operationsData.filter(item => {
    if (selectedAcreage === 'small') {
      return item.DOMAINCAT_DESC.includes('1.0 TO 9.9');
    } else if (selectedAcreage === 'medium') {
      return item.DOMAINCAT_DESC.includes('10.0 TO 49.9');
    } else {
      return item.DOMAINCAT_DESC.includes('2,000 OR MORE');
    }
  });

  const sortedData = [...filteredData].sort(
    (a, b) => Number(a.YEAR) - Number(b.YEAR)
);

  const sortedTaxData = [...filteredTaxData].sort(
    (a, b) => Number(a.YEAR) - Number(b.YEAR)
);

  const sortedOpsData = [...filteredOpsData].sort(
    (a, b) => Number(a.YEAR) - Number(b.YEAR)
);

  // Normalize data by dividing by number of operations
  const normalizedCattleData = sortedData.map(item => {
    const opsItem = sortedOpsData.find(o => o.YEAR === item.YEAR);
    return {
      ...item,
      VALUE: opsItem ? item.VALUE / opsItem.VALUE : item.VALUE
    };
  });

  const normalizedTaxData = sortedTaxData.map(item => {
    const opsItem = sortedOpsData.find(o => o.YEAR === item.YEAR);
    return {
      ...item,
      VALUE: opsItem ? item.VALUE / opsItem.VALUE : item.VALUE
    };
  });

  const maxValue = Math.max(
    ...normalizedCattleData.map(d => d.VALUE),
    ...normalizedTaxData.map(d => d.VALUE),
    0
  );

  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffffff',
        fontSize: '1.5rem'
      }}>
        Loading data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffffff',
        fontSize: '1.2rem'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(0.5rem, 2%, 1.5rem)',
      color: '#ffffff',
      boxSizing: 'border-box',
      overflow: 'auto'
    }}>
      {/* Title */}
      <div style={{
        fontSize: 'clamp(0.75rem, 1.5vw, 1.5rem)',
        fontWeight: '700',
        marginBottom: 'clamp(0.25rem, 0.84%, 0.8rem)',
        textAlign: 'center',
        flexShrink: 0
      }}>
        Wisconsin Average Cattle Sales & Property Tax per Farm
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 'clamp(0.42rem, 1.25%, 1.2rem)',
        justifyContent: 'center',
        marginBottom: 'clamp(0.25rem, 0.84%, 0.8rem)',
        flexShrink: 0,
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '4px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
              background: getColorForBar(),
              opacity: 0.3,
              borderRadius: '4px'
            }} />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Cattle Sales</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'rgba(255, 255, 255, 0.6)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '4px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1))',
              borderRadius: '4px'
            }} />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Property Tax</span>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div style={{
        display: 'flex',
        gap: 'clamp(0.25rem, 0.84%, 0.8rem)',
        justifyContent: 'center',
        marginBottom: 'clamp(0.42rem, 1.25%, 1.2rem)',
        flexShrink: 0,
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setSelectedAcreage('small')}
          style={{
            padding: 'clamp(0.33rem, 0.84%, 0.6rem) clamp(0.5rem, 1.25%, 1.2rem)',
            borderRadius: 'clamp(3.3px, 6.7px, 10px)',
            border: selectedAcreage === 'small' ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.5)',
            background: selectedAcreage === 'small' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            fontSize: 'clamp(0.59rem, 0.75vw, 0.95rem)',
            fontWeight: selectedAcreage === 'small' ? '700' : '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          1.0 - 9.9 Acres
        </button>
        <button
          onClick={() => setSelectedAcreage('medium')}
          style={{
            padding: 'clamp(0.33rem, 0.84%, 0.6rem) clamp(0.5rem, 1.25%, 1.2rem)',
            borderRadius: 'clamp(3.3px, 6.7px, 10px)',
            border: selectedAcreage === 'medium' ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.5)',
            background: selectedAcreage === 'medium' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            fontSize: 'clamp(0.59rem, 0.75vw, 0.95rem)',
            fontWeight: selectedAcreage === 'medium' ? '700' : '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          10.0 - 49.9 Acres
        </button>
        <button
          onClick={() => setSelectedAcreage('large')}
          style={{
            padding: 'clamp(0.33rem, 0.84%, 0.6rem) clamp(0.5rem, 1.25%, 1.2rem)',
            borderRadius: 'clamp(3.3px, 6.7px, 10px)',
            border: selectedAcreage === 'large' ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.5)',
            background: selectedAcreage === 'large' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            fontSize: 'clamp(0.59rem, 0.75vw, 0.95rem)',
            fontWeight: selectedAcreage === 'large' ? '700' : '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          2,000+ Acres
        </button>
      </div>

      {/* Main Content: Three Columns */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: 'clamp(0.42rem, 1.67%, 1.5rem)',
        alignItems: 'stretch',
        minHeight: 0,
        overflow: 'auto'
      }}>
        {/* Left Column - Why */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(0.25rem, 0.84%, 0.8rem)',
          minWidth: 0
        }}>
          <h3 style={{
            fontSize: 'clamp(0.75rem, 1.08vw, 1.2rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            marginTop: '0',
            opacity: 0.95,
          }}>
            Question
          </h3>
          <p style={{
            fontSize: 'clamp(0.74rem, 0.84vw, 0.9rem)',
            lineHeight: '1.6',
            opacity: 0.85
          }}>
            How does farm scale influence profitability in Wisconsin’s cattle industry in regards to property tax?
          </p>
          <h3 style={{
            fontSize: 'clamp(0.75rem, 1.08vw, 1.2rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            marginTop: '2rem',
            opacity: 0.95,
          }}>
            Result
          </h3>
          <p style={{
            fontSize: 'clamp(0.74rem, 0.84vw, 0.9rem)',
            lineHeight: '1.6',
            opacity: 0.85
          }}>
            Smaller farms tend to pay higher property taxes per dollar of cattle sales compared to larger operations, indicating economies of scale in tax efficiency.
          </p>
        </div>

        {/* Middle Column - Bar Chart */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 'clamp(0.56rem, 0.84vw, 1rem)',
            padding: 'clamp(0.56rem, 0.84vw, 1rem)',
            borderBottom: '2px solid rgba(255, 255, 255, 0.5)',
            minHeight: 'clamp(186px, 209px, 250px)',
            position: 'relative'
          }}>
            {normalizedCattleData.map((item, index) => {
              const chartHeight = 220; // px
              const cattleBarHeight = (item.VALUE / maxValue) * chartHeight;
              const taxItem = normalizedTaxData.find(t => t.YEAR === item.YEAR);
              const taxBarHeight = taxItem ? (taxItem.VALUE / maxValue) * chartHeight : 0;
              
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    maxWidth: '120px'
                  }}
                >
                  {/* Bars Container */}
                  <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    alignItems: 'flex-end',
                    width: '100%',
                    height: `${chartHeight}px`
                  }}>
                    {/* Cattle Sales Bar */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        fontSize: 'clamp(0.55rem, 0.63vw, 0.7rem)',
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                        opacity: 0.9,
                        whiteSpace: 'nowrap'
                      }}>
                        ${item.VALUE >= 1000 ? (item.VALUE / 1000).toFixed(0) + 'K' : item.VALUE.toFixed(0)}
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: `${cattleBarHeight}px`,
                          minHeight: '20px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'all 0.5s ease',
                          boxShadow: '0 -4px 15px rgba(255, 255, 255, 0.3)',
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '100%',
                          background: getColorForBar(),
                          opacity: 0.3,
                          borderRadius: '6px 6px 0 0'
                        }} />
                      </div>
                    </div>
                    
                    {/* Property Tax Bar */}
                    {taxItem && (
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          fontSize: 'clamp(0.55rem, 0.63vw, 0.7rem)',
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          opacity: 0.9,
                          whiteSpace: 'nowrap'
                        }}>
                          ${taxItem.VALUE >= 1000 ? (taxItem.VALUE / 1000).toFixed(0) + 'K' : taxItem.VALUE.toFixed(0)}
                        </div>
                        <div
                          onMouseEnter={() => setHoveredTax({
                            year: item.YEAR,
                            cattleSales: item.VALUE,
                            propertyTax: taxItem.VALUE
                          })}
                          onMouseLeave={() => setHoveredTax(null)}
                          style={{
                            width: '100%',
                            height: `${taxBarHeight}px`,
                            minHeight: '20px',
                            background: 'rgba(255, 255, 255, 0.6)',
                            borderRadius: '6px 6px 0 0',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 -4px 12px rgba(255, 255, 255, 0.2)',
                            position: 'relative',
                            cursor: 'pointer',
                            border: '2px solid rgba(255, 255, 255, 0.4)'
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '100%',
                            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1))',
                            borderRadius: '6px 6px 0 0'
                          }} />
                        </div>
                        
                        {/* Tooltip */}
                        {hoveredTax && hoveredTax.year === item.YEAR && (
                          <div style={{
                            position: 'absolute',
                            bottom: `${taxBarHeight + 23}px`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0, 0, 0, 0.9)',
                            color: '#ffffff',
                            padding: 'clamp(0.5rem, 0.68vw, 0.75rem)',
                            borderRadius: '8px',
                            fontSize: 'clamp(0.6rem, 0.68vw, 0.75rem)',
                            whiteSpace: 'nowrap',
                            zIndex: 1000,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                            pointerEvents: 'none'
                          }}>
                            <div>
                              <strong>${((hoveredTax.propertyTax / hoveredTax.cattleSales)).toFixed(2)}</strong> tax per $1 cattle sales
                            </div>
                            {/* Tooltip arrow */}
                            <div style={{
                              position: 'absolute',
                              bottom: '-6px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 0,
                              height: 0,
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                              borderTop: '6px solid rgba(0, 0, 0, 0.9)'
                            }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Year Label */}
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: 'clamp(0.75rem, 0.86vw, 0.95rem)',
                    fontWeight: '600'
                  }}>
                    {item.YEAR}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Actionable Insights */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <h3 style={{
            fontSize: 'clamp(0.75rem, 1.08vw, 1.2rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            opacity: 0.95,
            textAlign: 'center'
          }}>
            Insights
          </h3>
          <p style={{
            fontSize: 'clamp(0.74rem, 0.84vw, 0.9rem)',
            lineHeight: '1.6',
            opacity: 0.85
          }}>
            Wisconsin Use-Value Assessment Law (Act 27, 1995) provides property tax relief for farmland based on its agricultural use rather than market value. This benefits larger farms more significantly, as they can spread fixed costs over greater production, leading to lower effective tax rates per dollar of sales. Policymakers should consider these dynamics when designing tax policies to ensure equitable treatment across farm sizes.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: '1.5rem',
        textAlign: 'center',
        fontSize: '0.9rem',
        opacity: 0.8
      }}>
        Data: Average cattle sales and property tax per farm operation in Wisconsin
      </div>
    </div>
  );
};
