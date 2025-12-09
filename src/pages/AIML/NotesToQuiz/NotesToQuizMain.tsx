import React, { useState } from 'react';
import { QuizInterface } from './QuizInterface';
import { FileUpload } from './FileUpload';
import { TrainingDataManager, useTrainingData } from './TrainingDataManager';
import { processImageToText, processPdfToText, isImageFile, isSupportedFile } from './fileProcessing';
import { generateQuestionsFromKeywords } from './questionGeneration';
import type { Question, UploadedFile, NotesToQuizProps } from './types';

export const NotesToQuizMain: React.FC<NotesToQuizProps> = ({ onBack }) => {
  const [notes, setNotes] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showTrainingManager, setShowTrainingManager] = useState(false);

  // Training data collection
  const { addSample } = useTrainingData();

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessingError(null);

    if (!isSupportedFile(file)) {
      setProcessingError('Please upload an image (PNG, JPG, etc.) or PDF file.');
      return;
    }

    const fileType = isImageFile(file) ? 'image' : 'pdf';
    
    if (fileType === 'image') {
      const preview = URL.createObjectURL(file);
      setUploadedFile({ file, preview, type: fileType });
      
      try {
        setIsProcessingImage(true);
        const extractedText = await processImageToText(file);
        setNotes(extractedText);
        
        // Collect training data for handwriting improvement
        const confidence = Math.random() * 40 + 60; // Simulate confidence score 60-100%
        addSample(file, extractedText, confidence);
        
        setIsProcessingImage(false);
      } catch (error) {
        console.error('Error processing image:', error);
        setProcessingError(error instanceof Error ? error.message : 'Failed to process image');
        setIsProcessingImage(false);
      }
    } else if (fileType === 'pdf') {
      setUploadedFile({ file, preview: '', type: fileType });
      
      try {
        setIsProcessingImage(true);
        const extractedText = await processPdfToText(file);
        setNotes(extractedText);
        setIsProcessingImage(false);
      } catch (error) {
        console.error('Error processing PDF:', error);
        setProcessingError(error instanceof Error ? error.message : 'Failed to process PDF');
        setIsProcessingImage(false);
      }
    }
  };

  // Enhanced keyword-based question generation
  const generateQuestions = async () => {
    setIsGenerating(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const keywordQuestions = generateQuestionsFromKeywords(notes);
    setQuestions(keywordQuestions);
    setIsGenerating(false);
  };

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setQuizMode(false);
  };

  const handleBackToMain = () => {
    resetQuiz();
    onBack();
  };

  if (quizMode && questions.length > 0) {
    return (
      <QuizInterface
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        userAnswers={userAnswers}
        showResults={showResults}
        onAnswerSelect={handleAnswerSelect}
        onNextQuestion={nextQuestion}
        onBack={handleBackToMain}
        onResetQuiz={resetQuiz}
      />
    );
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
              Notes to Quiz AI
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666666',
              margin: '0',
              fontWeight: '300'
            }}>
              Transform your study notes into interactive quizzes
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowTrainingManager(true)}
              style={{
                background: 'none',
                border: '1px solid #007bff',
                borderRadius: '6px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '400',
                color: '#007bff',
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#007bff';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#007bff';
              }}
            >
              🧠 Training Manager
            </button>
            <button
              onClick={onBack}
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
              ← Back to Laboratory
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {questions.length === 0 ? (
          <>
            {/* Input Section */}
            <div style={{
              marginBottom: '3rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '400',
                color: '#000000',
                margin: '0 0 1rem 0'
              }}>
                Upload Your Notes
              </h2>
              <p style={{
                fontSize: '1rem',
                color: '#666666',
                margin: '0 0 2rem 0',
                lineHeight: '1.6'
              }}>
                Upload an image of your handwritten or typed notes, a PDF document, or paste text directly. 
                Our AI will analyze them to create personalized quiz questions using advanced OCR and keyword extraction.
              </p>

              <FileUpload
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                isProcessingImage={isProcessingImage}
                processingError={processingError}
              />
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your notes here or upload an image/PDF above...

For example:
- Key concepts and definitions
- Important facts and figures  
- Processes and procedures
- Relationships between ideas

The more detailed your notes, the better questions the AI can generate!"
                style={{
                  width: '100%',
                  minHeight: '300px',
                  padding: '1.5rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  lineHeight: '1.6'
                }}
              />
            </div>

            {/* Generate Button */}
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <button
                onClick={generateQuestions}
                disabled={!notes.trim() || isGenerating}
                style={{
                  background: !notes.trim() || isGenerating ? '#cccccc' : '#000000',
                  color: '#ffffff',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  cursor: !notes.trim() || isGenerating ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '400',
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                {isGenerating ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Analyzing Notes...
                  </>
                ) : (
                  'Generate Quiz Questions'
                )}
              </button>
            </div>

            {/* Features Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '400',
                color: '#000000',
                margin: '0 0 1.5rem 0'
              }}>
                AI Features
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#000000',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Real OCR Processing
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    Upload photos of handwritten or typed notes and automatically extract text using Tesseract.js
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#000000',
                    margin: '0 0 0.5rem 0'
                  }}>
                    PDF Text Extraction
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    Upload PDF documents and extract text from all pages using PDF.js
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#000000',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Smart Keyword Analysis
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    Identifies definitions, bullet points, headers, and key terms for question generation
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#000000',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Pattern Recognition
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    Detects colons, bold text, numbered lists, and comparisons for targeted questions
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#000000',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Multiple Question Types
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    Generates multiple choice, true/false, and fill-in-the-blank questions
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#000000',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Explanations Included
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    Each question comes with detailed explanations to reinforce learning
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Questions Generated */
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '400',
                color: '#000000',
                margin: '0'
              }}>
                Generated Questions ({questions.length})
              </h2>
              <div style={{
                display: 'flex',
                gap: '1rem'
              }}>
                <button
                  onClick={() => setQuizMode(true)}
                  style={{
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '400'
                  }}
                >
                  Start Quiz
                </button>
                <button
                  onClick={() => {
                    setQuestions([]);
                    setNotes('');
                    setUploadedFile(null);
                    setProcessingError(null);
                  }}
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
                  Generate New
                </button>
              </div>
            </div>

            {/* Questions Preview */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.5rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      background: '#000000',
                      color: '#ffffff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      Q{index + 1}
                    </span>
                    <span style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '400',
                      textTransform: 'capitalize'
                    }}>
                      {question.type.replace('-', ' ')}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '400',
                    color: '#000000',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.4'
                  }}>
                    {question.question}
                  </h3>
                  {question.options && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          style={{
                            padding: '0.5rem 1rem',
                            background: option === question.correctAnswer ? 
                              'rgba(16, 185, 129, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                            border: option === question.correctAnswer ? 
                              '1px solid #10b981' : '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            color: '#000000'
                          }}
                        >
                          {option} {option === question.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === 'true-false' && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#666666',
                      margin: '0 0 1rem 0'
                    }}>
                      Correct Answer: <strong>{question.correctAnswer}</strong>
                    </p>
                  )}
                  {question.type === 'fill-blank' && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#666666',
                      margin: '0 0 1rem 0'
                    }}>
                      Answer: <strong>{question.correctAnswer}</strong>
                    </p>
                  )}
                  {question.explanation && (
                    <p style={{
                      fontSize: '0.85rem',
                      color: '#666666',
                      margin: '0',
                      fontStyle: 'italic',
                      lineHeight: '1.4'
                    }}>
                      {question.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Training Data Manager */}
      <TrainingDataManager
        isVisible={showTrainingManager}
        onClose={() => setShowTrainingManager(false)}
      />

      {/* Spinning animation for loading */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};