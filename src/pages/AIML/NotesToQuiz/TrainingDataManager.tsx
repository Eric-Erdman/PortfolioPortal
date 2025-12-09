import React, { useState, useEffect } from 'react';
import { modelTrainer } from './modelTrainer';

interface TrainingSample {
  id: string;
  imageFile: File;
  ocrResult: string;
  correctText: string;
  timestamp: Date;
  confidence: number;
}

interface TrainingDataManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TrainingDataManager: React.FC<TrainingDataManagerProps> = ({
  isVisible,
  onClose
}) => {
  const [trainingSamples, setTrainingSamples] = useState<TrainingSample[]>([]);
  const [currentSample, setCurrentSample] = useState<TrainingSample | null>(null);
  const [correctionText, setCorrectionText] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  // Load training samples from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('handwriting-training-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTrainingSamples(parsed.map((sample: any) => ({
          ...sample,
          timestamp: new Date(sample.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load training data:', error);
      }
    }
  }, []);

  // Save training samples to localStorage
  const saveTrainingSamples = (samples: TrainingSample[]) => {
    localStorage.setItem('handwriting-training-data', JSON.stringify(samples));
    setTrainingSamples(samples);
  };

  // Submit correction for current sample
  const submitCorrection = () => {
    if (!currentSample || !correctionText.trim()) return;

    const updatedSample = {
      ...currentSample,
      correctText: correctionText.trim()
    };

    const updatedSamples = trainingSamples.map(sample =>
      sample.id === currentSample.id ? updatedSample : sample
    );

    saveTrainingSamples(updatedSamples);
    setCurrentSample(null);
    setCorrectionText('');
  };

  // Start training process
  const startTraining = async () => {
    setIsTraining(true);
    
    try {
      console.log('Starting training with', trainingSamples.length, 'samples');
      
      // Use the model trainer
      await modelTrainer.trainModel(trainingSamples, (epoch, logs) => {
        console.log(`Training progress: Epoch ${epoch + 1}, Loss: ${logs.loss?.toFixed(4)}, Accuracy: ${logs.acc?.toFixed(4)}`);
      });
      
      console.log('Training completed!');
      alert('Training completed! The model has been updated with your handwriting samples.');
    } catch (error) {
      console.error('Training failed:', error);
      alert(`Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTraining(false);
    }
  };

  // Export training data
  const exportTrainingData = () => {
    const dataStr = JSON.stringify(trainingSamples, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'handwriting-training-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Clear all training data
  const clearTrainingData = () => {
    if (confirm('Are you sure you want to clear all training data? This cannot be undone.')) {
      localStorage.removeItem('handwriting-training-data');
      setTrainingSamples([]);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: 0, color: '#000' }}>Handwriting Training Manager</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
              {trainingSamples.length}
            </div>
            <div style={{ color: '#666' }}>Training Samples</div>
          </div>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {trainingSamples.filter(s => s.correctText !== s.ocrResult).length}
            </div>
            <div style={{ color: '#666' }}>Corrected Samples</div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {trainingSamples.length > 0 
                ? Math.round(trainingSamples.reduce((acc, s) => acc + s.confidence, 0) / trainingSamples.length)
                : 0}%
            </div>
            <div style={{ color: '#666' }}>Avg Confidence</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={startTraining}
            disabled={trainingSamples.length < 5 || isTraining}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: trainingSamples.length >= 5 ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: trainingSamples.length >= 5 ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            {isTraining ? 'Training...' : `Train Model (${trainingSamples.length >= 5 ? 'Ready' : `Need ${5 - trainingSamples.length} more`})`}
          </button>

          <button
            onClick={exportTrainingData}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Export Data
          </button>

          <button
            onClick={clearTrainingData}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Clear All Data
          </button>
        </div>

        {/* Correction Interface */}
        {currentSample && (
          <div style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            backgroundColor: '#f8f9ff'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#007bff' }}>Correct OCR Result</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>OCR Result:</strong>
              <div style={{
                padding: '0.5rem',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                marginTop: '0.5rem'
              }}>
                {currentSample.ocrResult}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Correct Text:
              </label>
              <textarea
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                placeholder="Enter the correct text..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={submitCorrection}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Submit Correction
              </button>
              
              <button
                onClick={() => setCurrentSample(null)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Training Samples List */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#000' }}>Training Samples</h3>
          
          {trainingSamples.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#666',
              fontStyle: 'italic'
            }}>
              No training samples yet. Process some handwritten images to start collecting training data!
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {trainingSamples.map((sample, index) => (
                <div
                  key={sample.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: sample.correctText !== sample.ocrResult ? '#f8fff8' : '#fff'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <strong>Sample #{index + 1}</strong>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: sample.confidence > 70 ? '#d4edda' : '#fff3cd',
                        color: sample.confidence > 70 ? '#155724' : '#856404',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {sample.confidence}% confidence
                      </span>
                      
                      {sample.correctText === sample.ocrResult ? (
                        <button
                          onClick={() => {
                            setCurrentSample(sample);
                            setCorrectionText(sample.ocrResult);
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Add Correction
                        </button>
                      ) : (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#d4edda',
                          color: '#155724',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}>
                          ✓ Corrected
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    <strong>OCR:</strong> {sample.ocrResult}
                  </div>
                  
                  {sample.correctText !== sample.ocrResult && (
                    <div style={{ fontSize: '0.9rem', color: '#28a745', marginTop: '0.25rem' }}>
                      <strong>Correct:</strong> {sample.correctText}
                    </div>
                  )}
                  
                  <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                    {sample.timestamp.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook to manage training data
export const useTrainingData = () => {
  const addSample = (imageFile: File, ocrResult: string, confidence: number) => {
    const newSample: TrainingSample = {
      id: Date.now().toString(),
      imageFile,
      ocrResult,
      correctText: ocrResult, // Initially same as OCR result
      timestamp: new Date(),
      confidence
    };

    const existing = JSON.parse(localStorage.getItem('handwriting-training-data') || '[]');
    const updated = [...existing, newSample];
    localStorage.setItem('handwriting-training-data', JSON.stringify(updated));

    return newSample.id;
  };

  return { addSample };
};