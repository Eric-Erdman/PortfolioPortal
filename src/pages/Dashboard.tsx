import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../contexts/GameContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { enterGame } = useGameContext();
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselItems = [
    { id: 1, title: 'AI Study Assistant', content: 'Transform images and PDFs into interactive quiz cards using ML text analysis' },
    { id: 2, title: 'PRF Cryptography Demo', content: 'Interactive exploration and demo of Pseudorandom Functions' },
    { id: 3, title: 'Matchup', content: 'Multiplayer Interactive Game' },
    { id: 4, title: 'Catan Recreation', content: 'Under Construction' },
    { id: 5, title: 'Coming Soon', content: 'Under Construction' },
    { id: 6, title: 'Coming Soon', content: 'Under Construction' },
  ];

  const closeDropdowns = () => {
    setDropdownOpen(null);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleProjectClick = (project: string) => {
    closeDropdowns();
    switch (project) {
      case 'catan':
        // Set the game context and generate a new game ID for Catan
        enterGame('catan');
        const catanGameId = Math.random().toString(36).substring(2, 8);
        navigate(`/game/${catanGameId}`);
        break;
      case 'matchup':
        // Set the game context and navigate to MatchUp game entry point
        enterGame('matchup');
        navigate('/game/matchup');
        break;
      case 'cryptography':
        // Navigate to cryptography showcase
        navigate('/cryptography');
        break;
      case 'aiml':
        // Navigate to AI/ML showcase
        navigate('/aiml');
        break;
      case 'notes-to-quiz':
        // Navigate directly to Notes to Quiz application
        navigate('/aiml/notes-to-quiz');
        break;
      case 'prf-demo':
        // Navigate directly to PRF demonstration
        navigate('/cryptography/prf-demonstration');
        break;
      default:
        break;
    }
  };

  const handleResumeClick = () => {
    closeDropdowns();
    navigate('/ericerdmanresume');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      position: 'relative',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Animated Glowing Wisps Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        overflow: 'hidden'
      }}>
        {/* Wisp 1 */}
        <div style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(156, 163, 175, 0.3) 0%, rgba(156, 163, 175, 0.1) 30%, transparent 70%)',
          filter: 'blur(8px)',
          animation: 'wisp1 45s infinite linear',
          left: '-120px',
          top: '15%'
        }} />
        
        {/* Wisp 2 */}
        <div style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107, 114, 128, 0.4) 0%, rgba(107, 114, 128, 0.15) 40%, transparent 70%)',
          filter: 'blur(6px)',
          animation: 'wisp2 60s infinite linear',
          right: '-80px',
          top: '70%'
        }} />
        
        {/* Wisp 3 */}
        <div style={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(75, 85, 99, 0.35) 0%, rgba(75, 85, 99, 0.12) 35%, transparent 70%)',
          filter: 'blur(7px)',
          animation: 'wisp3 55s infinite linear',
          left: '60%',
          bottom: '-100px'
        }} />
        
        {/* Wisp 4 */}
        <div style={{
          position: 'absolute',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(156, 163, 175, 0.45) 0%, rgba(156, 163, 175, 0.18) 45%, transparent 70%)',
          filter: 'blur(5px)',
          animation: 'wisp4 40s infinite linear',
          right: '30%',
          top: '-60px'
        }} />
        
        {/* Wisp 5 */}
        <div style={{
          position: 'absolute',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107, 114, 128, 0.3) 0%, rgba(107, 114, 128, 0.1) 30%, transparent 70%)',
          filter: 'blur(6px)',
          animation: 'wisp5 50s infinite linear',
          left: '-90px',
          top: '85%'
        }} />
      </div>

      {/* CSS Animations for Wisps */}
      <style>{`
        @keyframes wisp1 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0; }
          5% { opacity: 0.6; }
          20% { transform: translate(25vw, 10vh) scale(1.1) rotate(15deg); opacity: 0.8; }
          35% { transform: translate(60vw, -5vh) scale(0.9) rotate(45deg); opacity: 0.7; }
          50% { transform: translate(85vw, 15vh) scale(1.2) rotate(80deg); opacity: 0.5; }
          65% { transform: translate(110vw, 35vh) scale(1.0) rotate(120deg); opacity: 0.8; }
          80% { transform: translate(130vw, 60vh) scale(0.8) rotate(180deg); opacity: 0.6; }
          95% { opacity: 0.3; }
          100% { transform: translate(150vw, 85vh) scale(1) rotate(220deg); opacity: 0; }
        }
        
        @keyframes wisp2 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0; }
          8% { opacity: 0.7; }
          25% { transform: translate(-20vw, -15vh) scale(1.3) rotate(-20deg); opacity: 0.9; }
          40% { transform: translate(-45vw, -8vh) scale(0.8) rotate(-60deg); opacity: 0.4; }
          55% { transform: translate(-70vw, 10vh) scale(1.1) rotate(-100deg); opacity: 0.8; }
          70% { transform: translate(-95vw, 25vh) scale(0.9) rotate(-140deg); opacity: 0.6; }
          85% { transform: translate(-120vw, 40vh) scale(1.2) rotate(-180deg); opacity: 0.5; }
          95% { opacity: 0.2; }
          100% { transform: translate(-150vw, 55vh) scale(1) rotate(-220deg); opacity: 0; }
        }
        
        @keyframes wisp3 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0; }
          6% { opacity: 0.5; }
          18% { transform: translate(-15vw, -20vh) scale(1.1) rotate(25deg); opacity: 0.8; }
          32% { transform: translate(-35vw, -45vh) scale(0.9) rotate(60deg); opacity: 0.6; }
          48% { transform: translate(-60vw, -70vh) scale(1.2) rotate(100deg); opacity: 0.7; }
          64% { transform: translate(-85vw, -90vh) scale(0.8) rotate(150deg); opacity: 0.5; }
          80% { transform: translate(-110vw, -110vh) scale(1.0) rotate(200deg); opacity: 0.6; }
          94% { opacity: 0.3; }
          100% { transform: translate(-140vw, -130vh) scale(1) rotate(240deg); opacity: 0; }
        }
        
        @keyframes wisp4 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0; }
          7% { opacity: 0.8; }
          22% { transform: translate(-25vw, 20vh) scale(1.4) rotate(-30deg); opacity: 0.9; }
          38% { transform: translate(-50vw, 45vh) scale(0.7) rotate(-75deg); opacity: 0.4; }
          54% { transform: translate(-75vw, 65vh) scale(1.1) rotate(-120deg); opacity: 0.8; }
          70% { transform: translate(-100vw, 85vh) scale(0.9) rotate(-165deg); opacity: 0.6; }
          86% { transform: translate(-125vw, 105vh) scale(1.3) rotate(-210deg); opacity: 0.5; }
          96% { opacity: 0.2; }
          100% { transform: translate(-150vw, 125vh) scale(1) rotate(-250deg); opacity: 0; }
        }
        
        @keyframes wisp5 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0; }
          4% { opacity: 0.6; }
          16% { transform: translate(20vw, -12vh) scale(1.1) rotate(18deg); opacity: 0.8; }
          30% { transform: translate(45vw, -25vh) scale(0.9) rotate(50deg); opacity: 0.5; }
          46% { transform: translate(70vw, -40vh) scale(1.3) rotate(90deg); opacity: 0.7; }
          62% { transform: translate(95vw, -55vh) scale(0.8) rotate(135deg); opacity: 0.6; }
          78% { transform: translate(120vw, -70vh) scale(1.0) rotate(180deg); opacity: 0.8; }
          92% { opacity: 0.4; }
          100% { transform: translate(150vw, -85vh) scale(1) rotate(225deg); opacity: 0; }
        }
      `}</style>

      {/* Click outside to close dropdowns */}
      {dropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={closeDropdowns}
        />
      )}

      {/* Floating Navigation Elements */}
      <div style={{
        position: 'relative',
        zIndex: 1000,
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Left side - Name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginLeft: '6rem',
          flex: '0 0 auto'
        }}>
          <div style={{
            fontSize: 'clamp(1.8rem, 2.4vw, 2.4rem)',
            fontWeight: '320',
            color: '#000000',
            letterSpacing: '0.08em'
          }}>
            Eric Erdman
          </div>
        </div>

        {/* Right side - LinkedIn and Resume */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0rem',
          marginRight: '3rem',
          flex: '0 0 auto'
        }}>
          <a
            href="https://www.linkedin.com/in/eric-erdman-527765276"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#333333',
              padding: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#666666';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#333333';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <button
            onClick={handleResumeClick}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '300',
              color: '#333333',
              cursor: 'pointer',
              padding: '0.5rem',
              transition: 'all 0.2s ease',
              letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#000000';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#333333';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Full Resume
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        minHeight: 'calc(100vh - 200px)',
        padding: '2rem',
        position: 'relative',
        zIndex: 100
      }}>
        {/* Center section with floating text */}
        <div style={{
          flex: '1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '60vh',
          paddingRight: '2rem',
          paddingTop: '8rem'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: 'clamp(1.1rem, 1.4vw, 1.4rem)',
              fontWeight: '400',
              color: '#000000',
              margin: '0 0 1rem 0',
              letterSpacing: '0.05em'
            }}>
              Why a Website?
            </h3>
            <p style={{
              fontSize: 'clamp(0.9rem, 1vw, 1rem)',
              lineHeight: '1.6',
              color: '#333333',
              margin: '0 0 3rem 0',
              fontWeight: '300',
              letterSpacing: '0.02em'
            }}>
              This website is my way of combining what I've learned in school with my passion for web development. 
              It's both a space to practice and grow, and an interactive resume where I can share my skills in a 
              more direct and personal way.
            </p>

            {/* 3D Perspective Carousel */}
            <div style={{
              position: 'relative',
              width: '100%',
              margin: '0 auto',
              perspective: '1200px',
              perspectiveOrigin: 'center center'
            }}>
              {/* Left Arrow */}
              <button
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  left: '-80px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: '#000000',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '42px',
                  fontWeight: '300',
                  zIndex: 20,
                  transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  padding: '20px',
                  opacity: 0.7
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#666666';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ‹
              </button>

              {/* 3D Carousel Stage */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformStyle: 'preserve-3d'
              }}>
                {carouselItems.map((item, index) => {
                  const getCardPosition = (cardIndex: number) => {
                    let position = cardIndex - currentSlide;
                    if (position < -Math.floor(carouselItems.length / 2)) {
                      position += carouselItems.length;
                    } else if (position > Math.floor(carouselItems.length / 2)) {
                      position -= carouselItems.length;
                    }
                    return position;
                  };

                  const position = getCardPosition(index);
                  const isCenter = position === 0;
                  const isVisible = Math.abs(position) <= 1;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isCenter && item.title === 'Catan Recreation') {
                          handleProjectClick('catan');
                        } else if (isCenter && item.title === 'AI Study Assistant') {
                          handleProjectClick('notes-to-quiz');
                        } else if (isCenter && item.title === 'PRF Cryptography Demo') {
                          handleProjectClick('prf-demo');
                        }
                      }}
                      style={{
                        position: 'absolute',
                        width: '280px',
                        height: '180px',
                        transform: `translateX(${position * 300}px) 
                                   translateZ(${isCenter ? 0 : -100}px) 
                                   rotateY(${position * -15}deg) 
                                   scale(${isCenter ? 1 : 0.85})`,
                        transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                        opacity: isVisible ? (isCenter ? 1 : 0.6) : 0,
                        pointerEvents: isVisible ? 'auto' : 'none',
                        transformStyle: 'preserve-3d',
                        zIndex: isCenter ? 10 : 5 - Math.abs(position)
                      }}
                      onMouseEnter={(e) => {
                        if (!isCenter) return;
                        e.currentTarget.style.transform = `translateX(${position * 300}px) 
                                                          translateZ(20px) 
                                                          rotateY(${position * -15}deg) 
                                                          scale(1.05)`;
                      }}
                      onMouseLeave={(e) => {
                        if (!isCenter) return;
                        e.currentTarget.style.transform = `translateX(${position * 300}px) 
                                                          translateZ(0px) 
                                                          rotateY(${position * -15}deg) 
                                                          scale(1)`;
                      }}
                    >
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: isCenter 
                          ? 'rgba(255, 255, 255, 0.15)' 
                          : 'rgba(255, 255, 255, 0.08)',
                        color: '#000000',
                        border: isCenter 
                          ? '2px solid #000000' 
                          : '1px solid rgba(0, 0, 0, 0.4)',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        backdropFilter: isCenter ? 'blur(12px)' : 'blur(6px)',
                        boxShadow: isCenter 
                          ? '0 20px 40px rgba(0, 0, 0, 0.1)' 
                          : '0 8px 16px rgba(0, 0, 0, 0.05)',
                        transformStyle: 'preserve-3d',
                        cursor: isCenter ? 'pointer' : 'default'
                      }}>
                        <h4 style={{
                          fontSize: isCenter ? '1.1rem' : '0.95rem',
                          fontWeight: isCenter ? '500' : '400',
                          margin: '0 0 0.8rem 0',
                          letterSpacing: '0.02em',
                          transition: 'all 0.3s ease',
                          opacity: isCenter ? 1 : 0.8
                        }}>
                          {item.title}
                        </h4>
                        <p style={{
                          fontSize: isCenter ? '0.9rem' : '0.8rem',
                          margin: '0',
                          opacity: isCenter ? 0.9 : 0.6,
                          fontWeight: '300',
                          lineHeight: 1.4,
                          transition: 'all 0.3s ease'
                        }}>
                          {item.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Arrow */}
              <button
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  right: '-80px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: '#000000',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '42px',
                  fontWeight: '300',
                  zIndex: 20,
                  transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  padding: '20px',
                  opacity: 0.7
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#666666';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ›
              </button>

              {/* Elegant Progress Indicators */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '2rem',
                gap: '0.5rem'
              }}>
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    style={{
                      width: index === currentSlide ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: index === currentSlide 
                        ? '#000000' 
                        : 'rgba(0, 0, 0, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      opacity: index === currentSlide ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (index !== currentSlide) {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                        e.currentTarget.style.opacity = '0.8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== currentSlide) {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.opacity = '0.5';
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right section with projects box */}
        <div style={{
          flex: '0 0 auto',
          paddingRight: '4rem'
        }}>
          {/* Projects Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.4)',
            border: '2px solid #000000',
            borderRadius: '12px',
            padding: '2rem',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            minWidth: 'min(400px, 35vw)',
            maxWidth: 'min(500px, 40vw)'
          }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '300',
            color: '#000000',
            margin: '0 0 0.5rem 0',
            textAlign: 'center',
            letterSpacing: '0.08em'
          }}>
            Projects
          </h2>
          
          {/* Click instruction */}
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <p style={{
              fontSize: '0.85rem',
              color: '#666666',
              margin: '0',
              fontWeight: '300',
              fontStyle: 'italic',
              letterSpacing: '0.02em'
            }}>
              Click on project names to explore
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* AI/ML Showcase Project */}
            <div style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease'
            }}>
              <button
                onClick={() => handleProjectClick('aiml')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '400',
                  color: '#000000',
                  margin: '0 0 0.5rem 0',
                  transition: 'color 0.2s ease',
                  letterSpacing: '0.03em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3dc9c4ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#000000';
                }}
                >
                  AI/ML Showcase
                </h3>
              </button>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: '300',
                color: '#555555',
                margin: '0',
                lineHeight: '1.5',
                letterSpacing: '0.02em'
              }}>
                Collection of machine learning models and AI demonstrations. Features various training algorithms, neural network visualizations, and AI-powered generative tools.
              </p>
            </div>

            {/* Match Up Game Project */}
            <div style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease'
            }}>
              <button
                onClick={() => handleProjectClick('matchup')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '400',
                  color: '#000000',
                  margin: '0 0 0.5rem 0',
                  transition: 'color 0.2s ease',
                  letterSpacing: '0.03em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3dc9c4ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#000000';
                }}
                >
                  Match Up Game
                </h3>
              </button>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: '300',
                color: '#555555',
                margin: '0',
                lineHeight: '1.5',
                letterSpacing: '0.02em'
              }}>
                Multiplayer memory game using React hooks, WebSocket connections, and Firebase. Implements real-time synchronization and player state management.
              </p>
            </div>

            {/* Cryptography Showcase Project */}
            <div style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease'
            }}>
              <button
                onClick={() => handleProjectClick('cryptography')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '400',
                  color: '#000000',
                  margin: '0 0 0.5rem 0',
                  transition: 'color 0.2s ease',
                  letterSpacing: '0.03em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3dc9c4ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#000000';
                }}
                >
                  Cryptography Showcase
                </h3>
              </button>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: '300',
                color: '#555555',
                margin: '0',
                lineHeight: '1.5',
                letterSpacing: '0.02em'
              }}>
                Interactive educational experience exploring cryptographic algorithms. Features step-by-step mathematical breakdowns, security analysis, and live demonstrations of ciphers and cryptographic primitives.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};