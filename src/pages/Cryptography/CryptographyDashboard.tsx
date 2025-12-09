import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShowcaseSlider } from './ShowcaseSlider';
import { caesarCipherSlides } from './CaesarCipherShowcase';
import { vigenereSlides } from './VigenereCipherShowcase';
import { prfSlides } from './PRFShowcase';

interface CryptoShowcase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Historic' | 'Modern' | 'Hashing' | 'Asymmetric';
  estimatedTime: string;
}

const cryptoShowcases: CryptoShowcase[] = [
  {
    id: 'caesar-cipher',
    title: 'Caesar Cipher',
    subtitle: 'The Foundation of Substitution',
    description: 'Historic beginnings of substitution ciphers with the Caesar Cipher, which shifts letters through the alphabet. Julius Caesar protected his military communications through such methods.',
    difficulty: 'Beginner',
    category: 'Historic',
    estimatedTime: '5 min'
  },
  {
    id: 'vigenere-cipher',
    title: 'Vigenère Cipher',
    subtitle: 'The Unbreakable Cipher',
    description: 'Discover the polyalphabetic substitution that was considered unbreakable for 300 years. Master the art of keyword encryption.',
    difficulty: 'Intermediate',
    category: 'Historic',
    estimatedTime: '8 min'
  },
  {
    id: 'prf-demonstration',
    title: 'Pseudorandom Functions',
    subtitle: 'The Heart of Modern Crypto',
    description: 'Understand how PRFs generate seemingly random outputs from deterministic inputs. Essential for symmetric encryption.',
    difficulty: 'Advanced',
    category: 'Modern',
    estimatedTime: '12 min'
  },
  {
    id: 'hash-functions',
    title: 'Hash Functions',
    subtitle: 'One-Way Mathematical Magic',
    description: 'Learn how hash functions create unique fingerprints for data. Explore SHA-256 and its role in blockchain technology.',
    difficulty: 'Intermediate',
    category: 'Hashing',
    estimatedTime: '10 min'
  },
  {
    id: 'rsa-encryption',
    title: 'RSA Encryption',
    subtitle: 'Public Key Revolution',
    description: 'Discover how two keys can solve the key distribution problem. Dive into modular arithmetic and prime numbers.',
    difficulty: 'Advanced',
    category: 'Asymmetric',
    estimatedTime: '15 min'
  },
  {
    id: 'aes-demonstration',
    title: 'AES Algorithm',
    subtitle: 'The Modern Standard',
    description: 'Step through the Advanced Encryption Standard that secures the modern world. Understand substitution and permutation.',
    difficulty: 'Advanced',
    category: 'Modern',
    estimatedTime: '18 min'
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return '#10b981';
    case 'Intermediate': return '#f59e0b';
    case 'Advanced': return '#ef4444';
    default: return '#6b7280';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Historic': return '';
    case 'Modern': return '';
    case 'Hashing': return '#️';
    case 'Asymmetric': return '';
    default: return '';
  }
};

export const CryptographyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showcaseId } = useParams<{ showcaseId?: string }>();
  const [currentShowcase, setCurrentShowcase] = useState<string | null>(showcaseId || null);

  useEffect(() => {
    if (showcaseId) {
      setCurrentShowcase(showcaseId);
    }
  }, [showcaseId]);

  const handleShowcaseClick = (showcaseId: string) => {
    setCurrentShowcase(showcaseId);
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleExitShowcase = () => {
    setCurrentShowcase(null);
  };

  // Render slideshow if a showcase is selected
  if (currentShowcase) {
    switch (currentShowcase) {
      case 'caesar-cipher':
        return (
          <ShowcaseSlider
            slides={caesarCipherSlides}
            showcaseTitle="Caesar Cipher Explorer"
            onExit={handleExitShowcase}
          />
        );
      case 'vigenere-cipher':
        return (
          <ShowcaseSlider
            slides={vigenereSlides}
            showcaseTitle="Vigenère Cipher Explorer"
            onExit={handleExitShowcase}
          />
        );
      case 'prf-demonstration':
        return (
          <ShowcaseSlider
            slides={prfSlides}
            showcaseTitle="Pseudorandom Functions Explorer"
            onExit={handleExitShowcase}
          />
        );
      default:
        return (
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#ffffff',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 1rem 0', color: '#000000' }}>
                Showcase Coming Soon
              </h2>
              <p style={{ margin: '0 0 2rem 0', color: '#666666' }}>
                This showcase is currently under development.
              </p>
              <button
                onClick={handleExitShowcase}
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '2rem 0',
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
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '300',
              color: '#000000',
              margin: '0 0 0.5rem 0',
              letterSpacing: '0.05em'
            }}>
              Cryptography Museum
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666666',
              margin: '0',
              fontWeight: '300'
            }}>
            </p>
          </div>
          <button
            onClick={handleBackToDashboard}
            style={{
              background: 'none',
              border: '1px solid #000000',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '400',
              color: '#000000',
              transition: 'all 0.2s ease',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#000000';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#000000';
            }}
          >
            ← Back to Portfolio
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {/* Introduction */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '300',
            color: '#000000',
            margin: '0 0 1rem 0',
            letterSpacing: '0.03em'
          }}>
            Cryptography Cases
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#555555',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '300'
          }}>
            This is a showcase of many of the concepts I have learned and found interesting in cryptography. Creating this page 
            allowed me to review and solidify my learnings throughout my semester in CS 435 Cryptography.
          </p>
        </div>

        {/* Showcase Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {cryptoShowcases.map((showcase) => (
            <div
              key={showcase.id}
              onClick={() => handleShowcaseClick(showcase.id)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {/* Header with category icon and difficulty */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {getCategoryIcon(showcase.category)}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    color: '#666666',
                    fontWeight: '400',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {showcase.category}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#666666',
                    fontWeight: '300'
                  }}>
                    {showcase.estimatedTime}
                  </span>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#ffffff',
                    background: getDifficultyColor(showcase.difficulty)
                  }}>
                    {showcase.difficulty}
                  </span>
                </div>
              </div>

              {/* Title and subtitle */}
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '400',
                color: '#000000',
                margin: '0 0 0.5rem 0',
                letterSpacing: '0.02em'
              }}>
                {showcase.title}
              </h3>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '300',
                color: '#888888',
                margin: '0 0 1rem 0',
                fontStyle: 'italic'
              }}>
                {showcase.subtitle}
              </h4>

              {/* Description */}
              <p style={{
                fontSize: '0.9rem',
                color: '#555555',
                lineHeight: '1.5',
                margin: '0',
                fontWeight: '300'
              }}>
                {showcase.description}
              </p>

              {/* Enter arrow indicator */}
              <div style={{
                marginTop: '1.5rem',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#000000',
                  fontWeight: '400',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  Enter Exhibit →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 0',
          borderTop: '1px solid #e5e7eb',
          marginTop: '2rem'
        }}>
          <p style={{
            fontSize: '0.9rem',
            color: '#666666',
            margin: '0',
            fontWeight: '300'
          }}>
            Each exhibit includes interactive demonstrations, mathematical explanations, and historical context.
          </p>
        </div>
      </div>
    </div>
  );
};