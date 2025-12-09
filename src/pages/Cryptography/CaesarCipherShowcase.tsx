import React, { useState } from 'react';
import type { SlideData } from './ShowcaseSlider';

interface CaesarCipherDemoProps {
  onShiftChange?: (shift: number) => void;
  onTextChange?: (text: string) => void;
}

export const CaesarCipherDemo: React.FC<CaesarCipherDemoProps> = ({
  onShiftChange,
  onTextChange
}) => {
  const [plaintext, setPlaintext] = useState('HELLO WORLD');
  const [shift, setShift] = useState(3);

  const encrypt = (text: string, shift: number): string => {
    return text
      .toUpperCase()
      .split('')
      .map(char => {
        if (char >= 'A' && char <= 'Z') {
          const charCode = char.charCodeAt(0) - 65;
          const shiftedCode = (charCode + shift) % 26;
          return String.fromCharCode(shiftedCode + 65);
        }
        return char;
      })
      .join('');
  };

  const handleShiftChange = (newShift: number) => {
    setShift(newShift);
    onShiftChange?.(newShift);
  };

  const handleTextChange = (newText: string) => {
    setPlaintext(newText);
    onTextChange?.(newText);
  };

  const ciphertext = encrypt(plaintext, shift);

  return (
    <div style={{
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '2rem',
      margin: '2rem 0'
    }}>
      <h4 style={{
        fontSize: '1.2rem',
        fontWeight: '500',
        color: '#000000',
        margin: '0 0 1.5rem 0'
      }}>
        Interactive Caesar Cipher
      </h4>

      {/* Input Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Plaintext Message
          </label>
          <input
            type="text"
            value={plaintext}
            onChange={(e) => handleTextChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'monospace'
            }}
            placeholder="Enter your message..."
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Shift Value: {shift}
          </label>
          <input
            type="range"
            min="1"
            max="25"
            value={shift}
            onChange={(e) => handleShiftChange(parseInt(e.target.value))}
            style={{
              width: '100%',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#6b7280'
          }}>
            <span>1</span>
            <span>25</span>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Plaintext
            </div>
            <div style={{
              background: '#f3f4f6',
              padding: '1rem',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {plaintext}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              background: '#000000',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              +{shift}
            </div>
            <div style={{
              marginTop: '0.5rem',
              fontSize: '1.5rem'
            }}>
              →
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Ciphertext
            </div>
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #d1fae5',
              padding: '1rem',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#065f46'
            }}>
              {ciphertext}
            </div>
          </div>
        </div>
      </div>

      {/* Character Mapping */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '4px'
      }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#92400e',
          marginBottom: '0.5rem'
        }}>
          Example Character Mapping (Shift +{shift}):
        </div>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          color: '#78350f'
        }}>
          A→{String.fromCharCode(((0 + shift) % 26) + 65)} | 
          B→{String.fromCharCode(((1 + shift) % 26) + 65)} | 
          C→{String.fromCharCode(((2 + shift) % 26) + 65)} | 
          ... | 
          X→{String.fromCharCode(((23 + shift) % 26) + 65)} | 
          Y→{String.fromCharCode(((24 + shift) % 26) + 65)} | 
          Z→{String.fromCharCode(((25 + shift) % 26) + 65)}
        </div>
      </div>
    </div>
  );
};

export const caesarCipherSlides: SlideData[] = [
  {
    id: 'intro',
    type: 'intro',
    title: 'Welcome to the Caesar Cipher',
    content: (
      <div>
        <p>
          The Caesar Cipher, named after Julius Caesar who used it to protect his military communications, 
          is one of the simplest and most well-known encryption techniques in history.
        </p>
        <p>
          This cipher belongs to the family of <strong>substitution ciphers</strong>, where each letter 
          in the plaintext is replaced by another letter a fixed number of positions down the alphabet.
        </p>
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '1.5rem',
          margin: '2rem 0'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#0c4a6e' }}>Historical Context</h4>
          <p style={{ margin: '0', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Julius Caesar used a shift of 3 in his private correspondence. The cipher was considered 
            secure in ancient times because most people were illiterate and unaware of cryptographic techniques.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'concept',
    type: 'concept',
    title: 'How the Caesar Cipher Works',
    content: (
      <div>
        <p>
          The Caesar Cipher shifts each letter of the alphabet by a fixed number of positions. 
          This shift value is called the <strong>key</strong>.
        </p>
        <ul style={{ fontSize: '1rem', lineHeight: '1.8' }}>
          <li><strong>Encryption:</strong> Move each letter forward by the key value</li>
          <li><strong>Decryption:</strong> Move each letter backward by the key value</li>
          <li><strong>Wrap-around:</strong> If you go past 'Z', continue from 'A'</li>
        </ul>
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.5rem',
          margin: '2rem 0',
          textAlign: 'center'
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', marginBottom: '1rem' }}>
            A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
          </div>
          <div style={{ fontSize: '2rem', margin: '0.5rem 0' }}>↓ (Shift +3) ↓</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: '#dc2626' }}>
            D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'math',
    type: 'math',
    title: 'Mathematical Foundation',
    content: (
      <div>
        <p>
          The Caesar Cipher can be expressed mathematically using modular arithmetic. 
          This mathematical approach helps us understand the cipher systematically.
        </p>
        <p>
          We assign numbers to letters: A=0, B=1, C=2, ..., Z=25. This allows us to 
          perform mathematical operations on text.
        </p>
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '1.5rem',
          margin: '2rem 0'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#0c4a6e' }}>Why Modular Arithmetic?</h4>
          <p style={{ margin: '0', fontSize: '0.95rem' }}>
            Modular arithmetic ensures that when we shift past 'Z', we wrap around to 'A'. 
            This creates the circular nature of the alphabet in our cipher.
          </p>
        </div>
      </div>
    ),
    mathSteps: [
      {
        id: 'step1',
        description: 'Convert letters to numbers',
        formula: 'A=0, B=1, C=2, ..., Z=25',
        example: 'Letter "H" = 7, Letter "E" = 4',
        result: 'Each letter now has a numerical position'
      },
      {
        id: 'step2',
        description: 'Apply the encryption formula',
        formula: 'E(x) = (x + k) mod 26',
        example: 'For "H" (7) with key 3: (7 + 3) mod 26 = 10',
        result: 'Position 10 corresponds to letter "K"'
      },
      {
        id: 'step3',
        description: 'Handle wrap-around with modulo',
        formula: 'For letters near the end: (23 + 3) mod 26 = 0',
        example: 'Letter "X" (23) with key 3 becomes "A" (0)',
        result: 'The alphabet wraps circularly'
      },
      {
        id: 'step4',
        description: 'Decryption formula',
        formula: 'D(y) = (y - k) mod 26',
        example: 'To decrypt "K" (10) with key 3: (10 - 3) mod 26 = 7',
        result: 'Position 7 gives us back "H"'
      }
    ]
  },
  {
    id: 'interactive',
    type: 'interactive',
    title: 'Try It Yourself',
    content: (
      <div>
        <p>
          Now it's your turn! Use the interactive cipher below to encrypt your own messages. 
          Try different shift values and see how they affect the encryption.
        </p>
        <CaesarCipherDemo />
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #d1fae5',
          borderRadius: '8px',
          padding: '1.5rem',
          margin: '2rem 0'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#065f46' }}>Experiment Ideas</h4>
          <ul style={{ margin: '0', fontSize: '0.95rem', color: '#047857' }}>
            <li>Try encrypting your name</li>
            <li>See what happens with a shift of 13 (ROT13)</li>
            <li>Notice how punctuation and spaces remain unchanged</li>
            <li>Observe the pattern with different shift values</li>
          </ul>
        </div>
      </div>
    ),
    interactive: true
  },
  {
    id: 'example',
    type: 'example',
    title: 'Historical Example',
    content: (
      <div>
        <p>
          Let's look at a message that Caesar himself might have sent, using his preferred shift of 3:
        </p>
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '2rem',
          margin: '2rem 0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '2rem',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Original Message</h4>
              <div style={{
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontFamily: 'monospace',
                fontSize: '1.1rem'
              }}>
                ATTACK AT DAWN
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>→</div>
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Encrypted (Shift +3)</h4>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '1rem',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                color: '#dc2626'
              }}>
                DWWDFN DW GDZQ
              </div>
            </div>
          </div>
        </div>
        <p>
          Notice how each letter is shifted exactly 3 positions forward in the alphabet, 
          while spaces remain unchanged. This encrypted message could be safely transmitted, 
          knowing that only those who knew the shift value could decrypt it.
        </p>
      </div>
    )
  },
  {
    id: 'conclusion',
    type: 'conclusion',
    title: 'Security and Modern Perspective',
    content: (
      <div>
        <p>
          While revolutionary for its time, the Caesar Cipher has significant weaknesses by modern standards:
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          margin: '2rem 0'
        }}>
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#dc2626' }}>Weaknesses</h4>
            <ul style={{ margin: '0', fontSize: '0.9rem', color: '#7f1d1d' }}>
              <li>Only 25 possible keys</li>
              <li>Vulnerable to frequency analysis</li>
              <li>Pattern preservation</li>
              <li>Easily broken by brute force</li>
            </ul>
          </div>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#166534' }}>Historical Impact</h4>
            <ul style={{ margin: '0', fontSize: '0.9rem', color: '#15803d' }}>
              <li>Foundation for substitution ciphers</li>
              <li>Introduction to cryptographic thinking</li>
              <li>Still used in ROT13 for text obfuscation</li>
              <li>Educational value for learning crypto</li>
            </ul>
          </div>
        </div>
        <p>
          The Caesar Cipher serves as an excellent introduction to cryptography, teaching fundamental 
          concepts like keys, encryption/decryption, and the importance of key secrecy. While not secure 
          for modern use, understanding it provides a foundation for more complex cryptographic systems.
        </p>
      </div>
    )
  }
];