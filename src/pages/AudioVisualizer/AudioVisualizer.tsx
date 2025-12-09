import React, { useState, useRef, useEffect } from 'react';

interface ColorScheme {
  primary: string;
  secondary: string;
  name: string;
}

const COLOR_SCHEMES: ColorScheme[] = [
  { primary: '#FF6B35', secondary: '#F7931E', name: 'Sunset' }, // Orange/Yellow
  { primary: '#4ECDC4', secondary: '#C7F0DB', name: 'Mint' }, // Blue/Green
  { primary: '#FF6B9D', secondary: '#C3B1E1', name: 'Candy' }, // Pink/Purple
  { primary: '#95E1D3', secondary: '#9B59B6', name: 'Aurora' }, // Green/Purple
];

export const AudioVisualizer: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(COLOR_SCHEMES[0]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const waveHistoryRef = useRef<number[][]>([]);
  const bassHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setIsAnalyzed(false);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Select random color scheme for new song
      const randomScheme = COLOR_SCHEMES[Math.floor(Math.random() * COLOR_SCHEMES.length)];
      setColorScheme(randomScheme);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const analyzeAudio = () => {
    if (!audioFile || !audioRef.current) return;

    const url = URL.createObjectURL(audioFile);
    audioRef.current.src = url;

    // Create audio context and analyser
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.85;
    }

    if (!sourceRef.current && audioRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    audioRef.current.addEventListener('loadedmetadata', () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    });

    setIsAnalyzed(true);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !isAnalyzed) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioRef.current.play();
      visualize();
    }
    setIsPlaying(!isPlaying);
  };

  const visualize = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying && audioRef.current?.paused) return;

      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Update current time
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear canvas with slight fade for trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      // Calculate bass frequency (0-100Hz range)
      const bassRange = dataArray.slice(0, 8);
      const bassLevel = bassRange.reduce((a, b) => a + b) / bassRange.length / 255;
      
      // Store bass history for breathing effect
      bassHistoryRef.current.push(bassLevel);
      if (bassHistoryRef.current.length > 60) {
        bassHistoryRef.current.shift();
      }
      
      // Calculate average bass for breathing amplitude
      const avgBass = bassHistoryRef.current.reduce((a, b) => a + b, 0) / bassHistoryRef.current.length;
      const breatheAmplitude = avgBass * 30 + 20; // Breathing intensity

      // Detect heavy bass hits for split effect
      const isBassHit = bassLevel > 0.7;
      const splitAmount = isBassHit ? bassLevel * 120 : 0;

      // Sample points for the waveform
      const numPoints = 180;
      const spacing = width / numPoints;
      
      // Build waveform data from frequency spectrum
      const wavePoints: number[] = [];
      for (let i = 0; i < numPoints; i++) {
        const freqIndex = Math.floor((i / numPoints) * (bufferLength * 0.4)); // Use first 40% of spectrum
        const amplitude = (dataArray[freqIndex] / 255) * 150; // Scale amplitude
        wavePoints.push(amplitude);
      }

      // Store wave history for trailing effect
      waveHistoryRef.current.push([...wavePoints]);
      if (waveHistoryRef.current.length > 8) {
        waveHistoryRef.current.shift();
      }

      // Parse colors from hex
      const parseHex = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
      };

      const color1 = parseHex(colorScheme.primary);
      const color2 = parseHex(colorScheme.secondary);

      // Draw trailing waves (older = more transparent)
      waveHistoryRef.current.forEach((historicalWave, historyIndex) => {
        const opacity = (historyIndex + 1) / waveHistoryRef.current.length * 0.3;
        const trailOffset = (waveHistoryRef.current.length - historyIndex - 1) * 2;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${color1.r}, ${color1.g}, ${color1.b}, ${opacity})`;
        ctx.lineWidth = 2;

        for (let i = 0; i < historicalWave.length; i++) {
          const x = i * spacing;
          const baseY = centerY + Math.sin(i * 0.05 + Date.now() * 0.001) * breatheAmplitude;
          const y = baseY - historicalWave[i] + trailOffset;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Draw main upper waveform
      ctx.beginPath();
      ctx.strokeStyle = colorScheme.primary;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = colorScheme.primary;

      for (let i = 0; i < wavePoints.length; i++) {
        const x = i * spacing;
        const breatheOffset = Math.sin(i * 0.05 + Date.now() * 0.001) * breatheAmplitude;
        const y = centerY - wavePoints[i] + breatheOffset - splitAmount;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw bass-split lower waveform (mirror effect on heavy bass)
      if (splitAmount > 10) {
        ctx.beginPath();
        ctx.strokeStyle = colorScheme.secondary;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = colorScheme.secondary;

        for (let i = 0; i < wavePoints.length; i++) {
          const x = i * spacing;
          const breatheOffset = Math.sin(i * 0.05 + Date.now() * 0.001) * breatheAmplitude;
          const y = centerY + wavePoints[i] - breatheOffset + splitAmount;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw center line (subtle reference line)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw bass pulse particles on heavy hits
      if (isBassHit) {
        const numParticles = Math.floor(bassLevel * 20);
        for (let i = 0; i < numParticles; i++) {
          const x = Math.random() * width;
          const y = centerY + (Math.random() - 0.5) * splitAmount * 2;
          const size = Math.random() * 3 + 1;
          
          const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
          particleGradient.addColorStop(0, colorScheme.secondary);
          particleGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = particleGradient;
          ctx.beginPath();
          ctx.arc(x, y, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw frequency intensity glow at edges
      const edgeGlowIntensity = (dataArray.reduce((a, b) => a + b) / bufferLength / 255) * 0.3;
      const leftGradient = ctx.createLinearGradient(0, 0, width * 0.3, 0);
      leftGradient.addColorStop(0, `rgba(${color1.r}, ${color1.g}, ${color1.b}, ${edgeGlowIntensity})`);
      leftGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = leftGradient;
      ctx.fillRect(0, 0, width * 0.3, height);

      const rightGradient = ctx.createLinearGradient(width, 0, width * 0.7, 0);
      rightGradient.addColorStop(0, `rgba(${color2.r}, ${color2.g}, ${color2.b}, ${edgeGlowIntensity})`);
      rightGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = rightGradient;
      ctx.fillRect(width * 0.7, 0, width * 0.3, height);
    };

    draw();
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(event.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, #000000 0%, #0a0a0a 50%, ${colorScheme.primary}15 100%)`,
      color: '#ffffff',
      padding: '2rem',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      transition: 'background 0.5s ease'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '300',
          margin: '0 0 0.5rem 0',
          letterSpacing: '0.05em',
          textAlign: 'center',
          background: 'linear-gradient(90deg, #3dc9c4 0%, #66d9d5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Audio Visualizer
        </h1>
        <p style={{
          textAlign: 'center',
          fontSize: '1.1rem',
          color: '#999',
          fontWeight: '300',
          margin: '0 0 0.5rem 0'
        }}>
          Upload an audio file and watch it come to life
        </p>
        {isAnalyzed && (
          <p style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: '300',
            margin: '0',
            background: `linear-gradient(90deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Color Scheme: {colorScheme.name}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* File Upload Section */}
        {!audioFile && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `2px dashed ${COLOR_SCHEMES[0].primary}`,
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="audio-upload"
            />
            <label
              htmlFor="audio-upload"
              style={{
                cursor: 'pointer',
                display: 'inline-block'
              }}
            >
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}>
                🎵
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '400',
                marginBottom: '0.5rem',
                color: COLOR_SCHEMES[0].primary
              }}>
                Click to Upload Audio File
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#666'
              }}>
                Supports MP3, WAV, OGG, and other audio formats
              </div>
            </label>
          </div>
        )}

        {/* Audio File Info and Analysis */}
        {audioFile && !isAnalyzed && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(61, 201, 196, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.3rem',
              marginBottom: '1rem',
              color: '#fff'
            }}>
              📁 {audioFile.name}
            </div>
            <button
              onClick={analyzeAudio}
              style={{
                background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.secondary} 100%)`,
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem 3rem',
                fontSize: '1.1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 20px ${colorScheme.primary}50`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 30px ${colorScheme.primary}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 20px ${colorScheme.primary}50`;
              }}
            >
              Analyze Audio
            </button>
          </div>
        )}

        {/* Visualizer Canvas */}
        {isAnalyzed && (
          <>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${colorScheme.primary}50`,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: `0 8px 40px ${colorScheme.primary}30`
            }}>
              <canvas
                ref={canvasRef}
                width={1400}
                height={600}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>

            {/* Controls */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(61, 201, 196, 0.3)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              {/* Play/Pause Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2rem'
              }}>
                <button
                  onClick={togglePlayPause}
                  style={{
                    background: isPlaying 
                      ? 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)'
                      : `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.secondary} 100%)`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isPlaying
                      ? '0 4px 20px rgba(255, 107, 107, 0.4)'
                      : `0 4px 20px ${colorScheme.primary}60`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#999',
                  minWidth: '50px'
                }}>
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    background: `linear-gradient(to right, ${colorScheme.primary} 0%, ${colorScheme.primary} ${(currentTime / duration) * 100}%, rgba(255, 255, 255, 0.1) ${(currentTime / duration) * 100}%, rgba(255, 255, 255, 0.1) 100%)`,
                    outline: 'none',
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                />
                <span style={{
                  fontSize: '0.9rem',
                  color: '#999',
                  minWidth: '50px',
                  textAlign: 'right'
                }}>
                  {formatTime(duration)}
                </span>
              </div>

              {/* File Name */}
              <div style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                fontSize: '1rem',
                color: '#666'
              }}>
                {audioFile?.name || ''}
              </div>
            </div>

            {/* Change File Button */}
            <div style={{
              textAlign: 'center'
            }}>
              <button
                onClick={() => {
                  setAudioFile(null);
                  setIsAnalyzed(false);
                  setIsPlaying(false);
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = '';
                  }
                  if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#3dc9c4',
                  border: '1px solid rgba(61, 201, 196, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(61, 201, 196, 0.1)';
                  e.currentTarget.style.borderColor = '#3dc9c4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(61, 201, 196, 0.3)';
                }}
              >
                Upload Different File
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
      />

      {/* Custom Range Slider Styles */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${colorScheme.primary};
          cursor: pointer;
          box-shadow: 0 2px 8px ${colorScheme.primary}80;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${colorScheme.primary};
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px ${colorScheme.primary}80;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          background: ${colorScheme.secondary};
          transform: scale(1.2);
        }

        input[type="range"]::-moz-range-thumb:hover {
          background: ${colorScheme.secondary};
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};
