import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotesToQuizMain } from './NotesToQuiz/NotesToQuizMain';

export const AimlDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleToolClick = (toolId: number) => {
    if (toolId === 1) {
      setCurrentTool('notes-to-quiz');
    }
  };

  const handleBackToMain = () => {
    setCurrentTool(null);
  };

  // Show specific tool if selected
  if (currentTool === 'notes-to-quiz') {
    return <NotesToQuizMain onBack={handleBackToMain} />;
  }

  // Placeholder for future ML projects
  const mlProjects = [
    { id: 1, title: 'Notes to Quiz AI', description: 'AI-powered study tool that converts notes into interactive quizzes', clickable: true },
    { id: 2, title: 'Linear Regression Demo', description: 'Coming Soon', clickable: false },
    { id: 3, title: 'Decision Tree Classifier', description: 'Coming Soon', clickable: false },
    { id: 4, title: 'Clustering Algorithms', description: 'Coming Soon', clickable: false },
    { id: 5, title: 'Deep Learning Models', description: 'Coming Soon', clickable: false },
    { id: 6, title: 'AI Text Generation', description: 'Coming Soon', clickable: false },
  ];

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
              AI/ML Laboratory
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
        {/* Introduction Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '400',
            color: '#000000',
            margin: '0 0 1.5rem 0',
            letterSpacing: '0.03em'
          }}>
            Machine Learning & AI Demonstrations
          </h2>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.6',
            color: '#555555',
            margin: '0 auto',
            maxWidth: '700px',
            fontWeight: '300',
            letterSpacing: '0.02em'
          }}>
            Explore interactive demonstrations of machine learning algorithms, neural network architectures, 
            and AI-powered tools. Each project showcases different aspects of modern artificial intelligence 
            and provides hands-on learning experiences.
          </p>
        </div>

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {mlProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => project.clickable ? handleToolClick(project.id) : null}
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                border: '2px solid #000000',
                borderRadius: '12px',
                padding: '2.5rem',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: project.clickable ? 'pointer' : 'default',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: project.clickable ? 1 : 0.7
              }}
              onMouseEnter={(e) => {
                if (project.clickable) {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.borderColor = '#3dc9c4ff';
                }
              }}
              onMouseLeave={(e) => {
                if (project.clickable) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = '#000000';
                }
              }}
            >
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '400',
                color: '#000000',
                margin: '0 0 1rem 0',
                letterSpacing: '0.02em'
              }}>
                {project.title}
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: '#666666',
                margin: '0',
                fontWeight: '300',
                fontStyle: 'italic',
                letterSpacing: '0.02em'
              }}>
                {project.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div style={{
          textAlign: 'center',
          marginTop: '4rem'
        }}>
          <p style={{
            fontSize: '0.9rem',
            color: '#888888',
            margin: '0',
            fontWeight: '300',
            letterSpacing: '0.02em'
          }}>
            More interactive demonstrations coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};