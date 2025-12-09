import React from 'react';
import type { Question } from './types';

interface QuizInterfaceProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: { [key: number]: string };
  showResults: boolean;
  onAnswerSelect: (answer: string) => void;
  onNextQuestion: () => void;
  onBack: () => void;
  onResetQuiz: () => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  questions,
  currentQuestionIndex,
  userAnswers,
  showResults,
  onAnswerSelect,
  onNextQuestion,
  onBack,
  onResetQuiz
}) => {
  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '300',
            color: '#000000',
            margin: '0 0 2rem 0'
          }}>
            Quiz Results
          </h1>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.4)',
            border: '2px solid #000000',
            borderRadius: '12px',
            padding: '3rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '400',
              color: score >= questions.length * 0.8 ? '#10b981' : score >= questions.length * 0.6 ? '#f59e0b' : '#ef4444',
              margin: '0 0 1rem 0'
            }}>
              {score}/{questions.length}
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#555555',
              margin: '0',
              fontWeight: '300'
            }}>
              {score >= questions.length * 0.8 ? 'Excellent work!' : 
               score >= questions.length * 0.6 ? 'Good job!' : 'Keep studying!'}
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={onResetQuiz}
              style={{
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '400'
              }}
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              style={{
                background: 'none',
                color: '#000000',
                border: '2px solid #000000',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '400'
              }}
            >
              Back to Tools
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '300',
            color: '#000000',
            margin: '0'
          }}>
            Quiz Mode
          </h1>
          <span style={{
            fontSize: '1rem',
            color: '#666666',
            fontWeight: '300'
          }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.4)',
          border: '2px solid #000000',
          borderRadius: '12px',
          padding: '3rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '400',
            color: '#000000',
            margin: '0 0 2rem 0',
            lineHeight: '1.4'
          }}>
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === 'multiple-choice' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onAnswerSelect(option)}
                  style={{
                    background: userAnswers[currentQuestion.id] === option ? 
                      'rgba(61, 201, 196, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                    border: userAnswers[currentQuestion.id] === option ? 
                      '2px solid #3dc9c4ff' : '1px solid #cccccc',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '300',
                    color: '#000000',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true-false' && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              {['true', 'false'].map((option) => (
                <button
                  key={option}
                  onClick={() => onAnswerSelect(option)}
                  style={{
                    background: userAnswers[currentQuestion.id] === option ? 
                      'rgba(61, 201, 196, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                    border: userAnswers[currentQuestion.id] === option ? 
                      '2px solid #3dc9c4ff' : '1px solid #cccccc',
                    borderRadius: '8px',
                    padding: '1rem 2rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '400',
                    color: '#000000',
                    textTransform: 'capitalize',
                    minWidth: '100px'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'fill-blank' && (
            <input
              type="text"
              value={userAnswers[currentQuestion.id] || ''}
              onChange={(e) => onAnswerSelect(e.target.value)}
              placeholder="Enter your answer..."
              style={{
                width: '100%',
                padding: '1rem',
                border: '1px solid #cccccc',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              color: '#666666',
              border: '1px solid #cccccc',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '300'
            }}
          >
            Exit Quiz
          </button>

          <button
            onClick={onNextQuestion}
            disabled={!userAnswers[currentQuestion.id]}
            style={{
              background: userAnswers[currentQuestion.id] ? '#000000' : '#cccccc',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: userAnswers[currentQuestion.id] ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
              fontWeight: '400'
            }}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};