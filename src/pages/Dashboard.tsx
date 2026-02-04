import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../contexts/GameContext';
import { CattleSalesVisualization } from './Visualizations';
import { OversoldValueStocks } from './Visualizations/OversoldValueStocks';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { enterGame } = useGameContext();
  const [isBottomView, setIsBottomView] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState<'custom1' | 'custom2' | 'custom3'>('custom1');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleProjectClick = (project: string) => {
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
      case 'audio-visualizer':
        // Navigate to audio visualizer
        navigate('/audio-visualizer');
        break;
      case 'imposter':
        // Navigate to imposter game
        navigate('/imposter');
        break;
      default:
        break;
    }
  };

  const handleResumeClick = () => {
    window.open('/Eric-Erdman-Resume.pdf', '_blank');
  };

  const scrollToBottom = () => {
    setIsBottomView(true);
  };

  const scrollToTop = () => {
    setIsBottomView(false);
  };

  // Handle wheel scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 50 && !isBottomView) {
        e.preventDefault();
        scrollToBottom();
      } else if (e.deltaY < -50 && isBottomView) {
        e.preventDefault();
        scrollToTop();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isBottomView]);

  return (
    <div ref={containerRef} style={{
      minHeight: '100vh',
      background: '#ffffff',
      position: 'relative',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      overflow: 'hidden',
      height: '100vh'
    }}>
      {/* Main Dashboard View - slides up when bottom view is active */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        transform: isBottomView ? 'translateY(-100vh)' : 'translateY(0)',
        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 10
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
          background: selectedVisualization === 'custom1' 
            ? 'radial-gradient(circle, rgba(255, 144, 155, 0.35) 0%, rgba(255, 144, 155, 0.12) 30%, transparent 70%)'
            : selectedVisualization === 'custom2'
            ? 'radial-gradient(circle, rgba(137, 204, 255, 0.35) 0%, rgba(137, 204, 255, 0.12) 30%, transparent 70%)'
            : 'radial-gradient(circle, rgba(131, 252, 155, 0.35) 0%, rgba(131, 252, 155, 0.12) 30%, transparent 70%)',
          filter: 'blur(8px)',
          animation: 'wisp1 45s infinite linear',
          left: '-120px',
          top: '15%',
          transition: 'background 0.5s ease'
        }} />
        
        {/* Wisp 2 */}
        <div style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: selectedVisualization === 'custom1'
            ? 'radial-gradient(circle, rgba(255, 144, 155, 0.4) 0%, rgba(255, 144, 155, 0.15) 40%, transparent 70%)'
            : selectedVisualization === 'custom2'
            ? 'radial-gradient(circle, rgba(137, 204, 255, 0.4) 0%, rgba(137, 204, 255, 0.15) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(131, 252, 155, 0.4) 0%, rgba(131, 252, 155, 0.15) 40%, transparent 70%)',
          filter: 'blur(6px)',
          animation: 'wisp2 60s infinite linear',
          right: '-80px',
          top: '70%',
          transition: 'background 0.5s ease'
        }} />
        
        {/* Wisp 3 */}
        <div style={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: selectedVisualization === 'custom1'
            ? 'radial-gradient(circle, rgba(255, 144, 155, 0.38) 0%, rgba(255, 144, 155, 0.14) 35%, transparent 70%)'
            : selectedVisualization === 'custom2'
            ? 'radial-gradient(circle, rgba(137, 204, 255, 0.38) 0%, rgba(137, 204, 255, 0.14) 35%, transparent 70%)'
            : 'radial-gradient(circle, rgba(131, 252, 155, 0.38) 0%, rgba(131, 252, 155, 0.14) 35%, transparent 70%)',
          filter: 'blur(7px)',
          animation: 'wisp3 55s infinite linear',
          left: '60%',
          bottom: '-100px',
          transition: 'background 0.5s ease'
        }} />
        
        {/* Wisp 4 */}
        <div style={{
          position: 'absolute',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: selectedVisualization === 'custom1'
            ? 'radial-gradient(circle, rgba(255, 144, 155, 0.45) 0%, rgba(255, 144, 155, 0.18) 45%, transparent 70%)'
            : selectedVisualization === 'custom2'
            ? 'radial-gradient(circle, rgba(137, 204, 255, 0.45) 0%, rgba(137, 204, 255, 0.18) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(131, 252, 155, 0.45) 0%, rgba(131, 252, 155, 0.18) 45%, transparent 70%)',
          filter: 'blur(5px)',
          animation: 'wisp4 40s infinite linear',
          right: '30%',
          top: '-60px',
          transition: 'background 0.5s ease'
        }} />
        
        {/* Wisp 5 */}
        <div style={{
          position: 'absolute',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: selectedVisualization === 'custom1'
            ? 'radial-gradient(circle, rgba(255, 144, 155, 0.42) 0%, rgba(255, 144, 155, 0.16) 45%, transparent 70%)'
            : selectedVisualization === 'custom2'
            ? 'radial-gradient(circle, rgba(137, 204, 255, 0.42) 0%, rgba(137, 204, 255, 0.16) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(131, 252, 155, 0.42) 0%, rgba(131, 252, 155, 0.16) 45%, transparent 70%)',
          filter: 'blur(6px)',
          animation: 'wisp5 50s infinite linear', 
          left: '-90px',
          top: '85%',
          transition: 'background 0.5s ease'
        }} />
      </div>

      {/* Large Diagonal Line in Bottom Left */}
      <div style={{
        position: 'absolute',
        top: 'clamp(68vh, 75vh, 82vh)',
        right: 'clamp(68vw, 73vw, 78vw)',
        width: 'clamp(40vw, 52vw, 70vw)',
        height: 'clamp(10vh, 14vh, 18vh)',
        zIndex: 2,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: selectedVisualization === 'custom1'
            ? '#ff909bff'
            : selectedVisualization === 'custom2'
            ? '#89ccffff'
            : '#83fc9bff',
          transform: 'rotate(45deg)',
          transition: 'background 0.5s ease',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }} />
      </div>

      {/* Second Diagonal Line - customize position as needed */}
      <div style={{
        position: 'absolute',
        top: 'clamp(102vh, 111vh, 118vh)',
        right: 'clamp(68vw, 73vw, 78vw)',
        width: 'clamp(40vw, 52vw, 70vw)',
        height: 'clamp(10vh, 14vh, 18vh)',
        zIndex: 2,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: selectedVisualization === 'custom1'
            ? '#ff909bff'
            : selectedVisualization === 'custom2'
            ? '#89ccffff'
            : '#83fc9bff',
          transform: 'rotate(-45deg)',
          transition: 'background 0.5s ease',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }} />
      </div>
      {/*Title Text along Green diagonal Stripe*/}
      <div style={{
        position: 'absolute',
        top: '132vh',
        right: '69vw',
        zIndex: 3,
        pointerEvents: 'none',
        textAlign: 'center'
      }}>
      </div>

      {/* Down Arrow Button */}
      <div 
        onClick={scrollToBottom}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) translateY(5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) translateY(0)';
        }}
      >
        <div style={{
          fontSize: '1.1em',
          fontWeight: '600',
          color: '#000000',
          letterSpacing: '0.05em',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          Data Visualizations
        </div>
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#000000" 
          strokeWidth="2.5"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {/* CSS Animations for Wisps */}
      <style>{`
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .mobile-header-left {
            margin-left: 1rem !important;
          }
          .mobile-header-right {
            margin-right: 1rem !important;
          }
          .mobile-name {
            font-size: 1.5rem !important;
          }
          .mobile-resume-btn {
            font-size: 0.95rem !important;
          }
          .mobile-main-container {
            flex-direction: column !important;
            padding: 1rem !important;
          }
          .mobile-center-section {
            padding-right: 0 !important;
            padding-top: 2rem !important;
            min-height: auto !important;
          }
          .mobile-carousel-container {
            margin: 0 !important;
          }
          .mobile-projects-box {
            padding-right: 0 !important;
            margin-top: 2rem !important;
            width: 100% !important;
          }
          .mobile-projects-inner {
            min-width: 100% !important;
            max-width: 100% !important;
          }
        }

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
        <div className="mobile-header-left" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginLeft: '6rem',
          flex: '0 0 auto'
        }}>
          <div className="mobile-name" style={{
            fontSize: 'clamp(1.8rem, 2.4vw, 2.4rem)',
            fontWeight: '320',
            color: '#000000',
            letterSpacing: '0.08em'
          }}>
            Eric Erdman
          </div>
        </div>

        {/* Right side - GitHub, LinkedIn and Resume */}
        <div className="mobile-header-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0rem',
          marginRight: '3rem',
          flex: '0 0 auto'
        }}>
          <a
            href="https://github.com/Eric-Erdman/PortfolioPortal"
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
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
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
            className="mobile-resume-btn"
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
      <div className="mobile-main-container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        minHeight: 'calc(100vh - 200px)',
        padding: '2rem',
        position: 'relative',
        zIndex: 100
      }}>
        {/* Center section with floating text */}
        <div className="mobile-center-section" style={{
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
              margin: '0',
              fontWeight: '300',
              letterSpacing: '0.02em'
            }}>
              This website is my way of combining what I've learned in school with my passion for web development. 
              It's both a space to practice and grow, and an interactive resume where I can share my skills in a 
              more direct and personal way.
            </p>
          </div>
        </div>

        {/* Right section with projects box */}
        <div className="mobile-projects-box" style={{
          flex: '0 0 auto',
          paddingRight: '4rem'
        }}>
          {/* Projects Box */}
          <div className="mobile-projects-inner" style={{
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
            fontWeight: '600',
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
              fontSize: '0.95rem',
              color: '#504f4fff',
              margin: '0',
              fontWeight: '300',
              fontStyle: 'italic',
              letterSpacing: '0.02em'
            }}>
              Click on project names to explore
            </p>
          </div>
          
          {/* Featured Projects Section */}
          <div style={{
            marginBottom: '1.5rem',
            borderBottom: '2px solid rgba(0, 0, 0, 0.15)',
            paddingBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#000000',
              margin: '0 0 1rem 0',
              textAlign: 'left',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Featured
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {/* AI/ML Showcase - Featured */}
              <button
                onClick={() => handleProjectClick('notes-to-quiz')}
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(61, 201, 196, 0.15)';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#000000',
                  marginBottom: '0.25rem',
                  letterSpacing: '0.02em'
                }}>
                  AI Study Assistant
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '300',
                  color: '#555555',
                  letterSpacing: '0.01em'
                }}>
                  Transform notes into quiz cards using ML
                </div>
              </button>

              {/* Match Up Game - Featured */}
              <button
                onClick={() => handleProjectClick('matchup')}
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(61, 201, 196, 0.15)';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#000000',
                  marginBottom: '0.25rem',
                  letterSpacing: '0.02em'
                }}>
                  Match Up Game
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '300',
                  color: '#555555',
                  letterSpacing: '0.01em'
                }}>
                  Real-time multiplayer memory game
                </div>
              </button>
            </div>
          </div>

          {/* All Projects Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {/* Cryptography Showcase */}
            <button
              onClick={() => handleProjectClick('cryptography')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                padding: '0.6rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <div style={{
                fontSize: '0.95rem',
                fontWeight: '500',
                color: '#000000',
                letterSpacing: '0.01em'
              }}>
                Cryptography Showcase <span style={{ fontSize: '0.8rem', color: '#666666', fontWeight: '300' }}>— Interactive crypto algorithm demos</span>
              </div>
            </button>

            {/* PRF Demo */}
            <button
              onClick={() => handleProjectClick('prf-demo')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                padding: '0.6rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <div style={{
                fontSize: '0.95rem',
                fontWeight: '500',
                color: '#000000',
                letterSpacing: '0.01em'
              }}>
                PRF Demo <span style={{ fontSize: '0.8rem', color: '#666666', fontWeight: '300' }}>— Pseudorandom Function visualization</span>
              </div>
            </button>

            {/* Audio Visualizer */}
            <button
              onClick={() => handleProjectClick('audio-visualizer')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                padding: '0.6rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <div style={{
                fontSize: '0.95rem',
                fontWeight: '500',
                color: '#000000',
                letterSpacing: '0.01em'
              }}>
                Audio Visualizer <span style={{ fontSize: '0.8rem', color: '#666666', fontWeight: '300' }}>— Reactive audio frequency visuals</span>
              </div>
            </button>

            {/* Imposter */}
            <button
              onClick={() => handleProjectClick('imposter')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                padding: '0.6rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <div style={{
                fontSize: '0.95rem',
                fontWeight: '500',
                color: '#000000',
                letterSpacing: '0.01em'
              }}>
                Imposter <span style={{ fontSize: '0.8rem', color: '#666666', fontWeight: '300' }}>— Social deduction multiplayer game</span>
              </div>
            </button>           
          </div>
        </div>
        </div>
      </div>
      </div>
      {/* Close main dashboard view wrapper */}

      {/* Bottom Data Visualizations View - slides in from bottom */}
      <div style={{
        position: 'absolute',
        top: '100vh',
        left: 0,
        width: '100%',
        height: '100vh',
        background: '#ffffffff',
        transform: isBottomView ? 'translateY(-100vh)' : 'translateY(0)',
        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        {/* Diagonal Lines - Bottom View */}
        <div style={{
          position: 'absolute',
          top: 'clamp(68vh, 75vh, 82vh)',
          right: 'clamp(68vw, 73vw, 78vw)',
          width: 'clamp(40vw, 52vw, 70vw)',
          height: 'clamp(10vh, 14vh, 18vh)',
          zIndex: 2,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: selectedVisualization === 'custom1'
              ? '#ff909bff'
              : selectedVisualization === 'custom2'
              ? '#89ccffff'
              : '#83fc9bff',
            transform: 'rotate(45deg)',
            transition: 'background 0.5s ease',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            willChange: 'transform'
          }} />
        </div>

        

        {/* Up Arrow Button */}
        <div 
          onClick={scrollToTop}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) translateY(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) translateY(0)';
          }}
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#000000" 
            strokeWidth="2.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#000000',
            letterSpacing: '0.05em'
          }}>
            Return to Top
          </div>
        </div>

        {/* Left side - Visualization selector buttons */}
        <div style={{
          position: 'absolute',
          left: 'clamp(2rem, 8rem, 10rem)',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(1rem, 1.5rem, 2rem)',
          zIndex: 10
        }}>
          <button
            onClick={() => setSelectedVisualization('custom1')}
            style={{
              width: 'clamp(91px, 9.6vw, 217px)',
              height: 'clamp(33px, 4.35vh, 74px)',
              borderRadius: 'clamp(13px, 1.74vw, 30px)',
              border: selectedVisualization === 'custom1' ? '3px solid #ffffff' : 'none',
              background: '#ff909bff',
              fontSize: 'clamp(0.85rem, 1.1vw, 1.8rem)',
              fontWeight: '700',
              fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive',
              color: '#ffffffff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selectedVisualization === 'custom1'
                ? '0 6px 25px rgba(255, 179, 186, 0.6)'
                : '0 4px 15px rgba(255, 179, 186, 0.4)',
              letterSpacing: '0.05em',
              transform: selectedVisualization === 'custom1' ? 'scale(1.05)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 179, 186, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = selectedVisualization === 'custom1' 
                ? 'translateY(0) scale(1.05)' 
                : 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = selectedVisualization === 'custom1'
                ? '0 6px 25px rgba(255, 179, 186, 0.6)'
                : '0 4px 15px rgba(255, 179, 186, 0.4)';
            }}
          >
            Agriculture
          </button>
          
          <button
            onClick={() => setSelectedVisualization('custom2')}
            style={{
              width: 'clamp(91px, 9.6vw, 217px)',
              height: 'clamp(33px, 4.35vh, 74px)',
              borderRadius: 'clamp(13px, 1.74vw, 30px)',
              border: selectedVisualization === 'custom2' ? '3px solid #ffffff' : 'none',
              background: '#89ccffff',
              fontSize: 'clamp(0.85rem, 1.1vw, 1.8rem)',
              fontWeight: '700',
              fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive',
              color: '#ffffffff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selectedVisualization === 'custom2'
                ? '0 6px 25px rgba(186, 225, 255, 0.6)'
                : '0 4px 15px rgba(186, 225, 255, 0.4)',
              letterSpacing: '0.05em',
              transform: selectedVisualization === 'custom2' ? 'scale(1.05)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(186, 225, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = selectedVisualization === 'custom2'
                ? 'translateY(0) scale(1.05)'
                : 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = selectedVisualization === 'custom2'
                ? '0 6px 25px rgba(186, 225, 255, 0.6)'
                : '0 4px 15px rgba(186, 225, 255, 0.4)';
            }}
          >
            NBA Stats
          </button>
          
          <button
            onClick={() => setSelectedVisualization('custom3')}
            style={{
              width: 'clamp(91px, 9.6vw, 217px)',
              height: 'clamp(33px, 4.35vh, 74px)',
              borderRadius: 'clamp(13px, 1.74vw, 30px)',
              border: selectedVisualization === 'custom3' ? '3px solid #ffffff' : 'none',
              background: '#83fc9bff',
              fontSize: 'clamp(0.85rem, 1.1vw, 1.8rem)',
              fontWeight: '700',
              fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive',
              color: '#ffffffff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selectedVisualization === 'custom3'
                ? '0 6px 25px rgba(191, 255, 204, 0.6)'
                : '0 4px 15px rgba(191, 255, 204, 0.4)',
              letterSpacing: '0.05em',
              transform: selectedVisualization === 'custom3' ? 'scale(1.05)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(191, 255, 204, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = selectedVisualization === 'custom3'
                ? 'translateY(0) scale(1.05)'
                : 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = selectedVisualization === 'custom3'
                ? '0 6px 25px rgba(191, 255, 204, 0.6)'
                : '0 4px 15px rgba(191, 255, 204, 0.4)';
            }}
          >
            In Progress
          </button>
        </div>
        
        {/* Visualization content area */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '90vw',
          padding: '0 clamp(1rem, 2vw, 3rem)'
        }}>
          {/* Visualization Rectangle - Responsive for all screen sizes */}
          <div style={{
            width: 'clamp(360px, 63vw, 1300px)',
            height: 'clamp(414px, 62.1vh, 862px)',
            borderRadius: 'clamp(12px, 20px, 24px)',
            background: selectedVisualization === 'custom1' 
              ? '#ff909bff' 
              : selectedVisualization === 'custom2'
              ? '#89ccffff'
              : '#83fc9bff',
            boxShadow: selectedVisualization === 'custom1'
              ? '0 8px 30px rgba(255, 144, 155, 0.4)'
              : selectedVisualization === 'custom2'
              ? '0 8px 30px rgba(137, 204, 255, 0.4)'
              : '0 8px 30px rgba(131, 252, 155, 0.4)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ffffff',
            fontSize: 'clamp(1rem, 1.5rem, 2rem)',
            fontWeight: '600',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            overflow: 'hidden',
            padding: 'clamp(0.5rem, 1rem, 1.5rem)'
          }}>
            {/* Render visualization based on selection */}
            {selectedVisualization === 'custom1' && (
              <CattleSalesVisualization selectedColor={selectedVisualization} />
            )}
            {selectedVisualization === 'custom2' && (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#ffffff',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Custom 2 Visualization - Under Construction
              </div>
            )}
            {selectedVisualization === 'custom3' && (
              <OversoldValueStocks selectedColor={selectedVisualization} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};