import React, { useState } from 'react';

export interface SlideData {
  id: string;
  type: 'intro' | 'concept' | 'math' | 'interactive' | 'example' | 'conclusion';
  title: string;
  content: React.ReactNode;
  mathSteps?: MathStep[];
  interactive?: boolean;
}

export interface MathStep {
  id: string;
  description: string;
  formula?: string;
  example?: string;
  result?: string;
}

interface ShowcaseSliderProps {
  slides: SlideData[];
  showcaseTitle: string;
  onExit: () => void;
}

export const ShowcaseSlider: React.FC<ShowcaseSliderProps> = ({
  slides,
  showcaseTitle,
  onExit
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentMathStep, setCurrentMathStep] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setCurrentMathStep(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setCurrentMathStep(0);
    }
  };

  const nextMathStep = () => {
    const slide = slides[currentSlide];
    if (slide.mathSteps && currentMathStep < slide.mathSteps.length - 1) {
      setCurrentMathStep(currentMathStep + 1);
    }
  };

  const prevMathStep = () => {
    if (currentMathStep > 0) {
      setCurrentMathStep(currentMathStep - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setCurrentMathStep(0);
  };

  const slide = slides[currentSlide];
  const hasMathSteps = slide.mathSteps && slide.mathSteps.length > 0;
  const currentMath = hasMathSteps ? slide.mathSteps![currentMathStep] : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0',
        background: '#fafafa'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={onExit}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666666',
                padding: '0.5rem'
              }}
            >
              ←
            </button>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '400',
              color: '#000000',
              margin: '0',
              letterSpacing: '0.02em'
            }}>
              {showcaseTitle}
            </h1>
          </div>
          
          {/* Progress indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.9rem',
              color: '#666666',
              fontWeight: '300'
            }}>
              {currentSlide + 1} of {slides.length}
            </span>
            <div style={{
              width: '100px',
              height: '4px',
              background: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((currentSlide + 1) / slides.length) * 100}%`,
                height: '100%',
                background: '#000000',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div style={{
        padding: '1rem 0',
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        background: '#fafafa',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: index === currentSlide ? '#000000' : '#d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex'
      }}>
        {/* Slide Content */}
        <div style={{
          flex: hasMathSteps ? 1 : 2,
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '300',
              color: '#000000',
              margin: '0 0 2rem 0',
              letterSpacing: '0.03em'
            }}>
              {slide.title}
            </h2>
            
            <div style={{
              fontSize: '1.1rem',
              lineHeight: '1.7',
              color: '#333333',
              fontWeight: '300'
            }}>
              {slide.content}
            </div>
          </div>
        </div>

        {/* Math Steps Panel */}
        {hasMathSteps && (
          <div style={{
            flex: 1,
            background: '#f9fafb',
            borderLeft: '1px solid #e5e7eb',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '400',
              color: '#000000',
              margin: '0 0 2rem 0'
            }}>
              Mathematical Process
            </h3>

            {currentMath && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{
                  background: '#ffffff',
                  padding: '2rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '2rem'
                }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#000000',
                    margin: '0 0 1rem 0'
                  }}>
                    Step {currentMathStep + 1}: {currentMath.description}
                  </h4>
                  
                  {currentMath.formula && (
                    <div style={{
                      background: '#1f2937',
                      padding: '1rem',
                      borderRadius: '4px',
                      margin: '1rem 0',
                      fontFamily: 'monospace',
                      fontSize: '1.1rem',
                      textAlign: 'center',
                      color: '#f9fafb',
                      fontWeight: '600',
                      border: '1px solid #374151'
                    }}>
                      {currentMath.formula}
                    </div>
                  )}

                  {currentMath.example && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#666666',
                      margin: '1rem 0',
                      fontStyle: 'italic'
                    }}>
                      Example: {currentMath.example}
                    </p>
                  )}

                  {currentMath.result && (
                    <div style={{
                      background: '#065f46',
                      border: '1px solid #047857',
                      padding: '1rem',
                      borderRadius: '4px',
                      marginTop: '1rem'
                    }}>
                      <span style={{
                        color: '#d1fae5',
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}>
                        Result: 
                      </span>
                      <span style={{
                        color: '#ecfdf5',
                        fontWeight: '600',
                        marginLeft: '0.5rem',
                        fontFamily: 'monospace',
                        fontSize: '1rem'
                      }}>
                        {currentMath.result}
                      </span>
                    </div>
                  )}
                </div>

                {/* Math Step Navigation */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={prevMathStep}
                    disabled={currentMathStep === 0}
                    style={{
                      background: currentMathStep === 0 ? '#f3f4f6' : '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      cursor: currentMathStep === 0 ? 'not-allowed' : 'pointer',
                      color: currentMathStep === 0 ? '#9ca3af' : '#000000',
                      fontSize: '0.9rem'
                    }}
                  >
                    ← Previous Step
                  </button>

                  <span style={{
                    fontSize: '0.8rem',
                    color: '#666666'
                  }}>
                    {currentMathStep + 1} of {slide.mathSteps?.length}
                  </span>

                  <button
                    onClick={nextMathStep}
                    disabled={!slide.mathSteps || currentMathStep === slide.mathSteps.length - 1}
                    style={{
                      background: (!slide.mathSteps || currentMathStep === slide.mathSteps.length - 1) ? '#f3f4f6' : '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      cursor: (!slide.mathSteps || currentMathStep === slide.mathSteps.length - 1) ? 'not-allowed' : 'pointer',
                      color: (!slide.mathSteps || currentMathStep === slide.mathSteps.length - 1) ? '#9ca3af' : '#000000',
                      fontSize: '0.9rem'
                    }}
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        padding: '1.5rem 0',
        background: '#fafafa'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            style={{
              background: currentSlide === 0 ? '#f3f4f6' : '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
              color: currentSlide === 0 ? '#9ca3af' : '#000000',
              fontSize: '0.9rem',
              fontWeight: '400'
            }}
          >
            ← Previous Slide
          </button>

          <div style={{
            fontSize: '0.9rem',
            color: '#666666',
            fontWeight: '300'
          }}>
            {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)} Slide
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            style={{
              background: currentSlide === slides.length - 1 ? '#f3f4f6' : '#000000',
              border: '1px solid #000000',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
              color: currentSlide === slides.length - 1 ? '#9ca3af' : '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '400'
            }}
          >
            Next Slide →
          </button>
        </div>
      </div>
    </div>
  );
};