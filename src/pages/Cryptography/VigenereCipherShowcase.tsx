import React, { useState } from 'react';
import type { SlideData } from './ShowcaseSlider';

interface VigenereCipherDemoProps {
  onKeyChange?: (key: string) => void;
  onTextChange?: (text: string) => void;
}

export const VigenereCipherDemo: React.FC<VigenereCipherDemoProps> = ({
  onKeyChange,
  onTextChange
}) => {
  const [plaintext, setPlaintext] = useState('HELLO WORLD');
  const [key, setKey] = useState('KEY');

  const vigenereEncrypt = (text: string, keyword: string): string => {
    if (!keyword) return text;
    let result = '';
    const cleanKey = keyword.replace(/[^a-zA-Z]/g, '').toUpperCase();
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char >= 'A' && char <= 'Z') {
        const plainCharCode = char.charCodeAt(0) - 65;
        const keyCharCode = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;
        const cipherCharCode = (plainCharCode + keyCharCode) % 26;
        result += String.fromCharCode(cipherCharCode + 65);
        keyIndex++;
      } else if (char >= 'a' && char <= 'z') {
        const plainCharCode = char.charCodeAt(0) - 97;
        const keyCharCode = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;
        const cipherCharCode = (plainCharCode + keyCharCode) % 26;
        result += String.fromCharCode(cipherCharCode + 97);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  };

  const vigenereDecrypt = (text: string, keyword: string): string => {
    if (!keyword) return text;
    let result = '';
    const cleanKey = keyword.replace(/[^a-zA-Z]/g, '').toUpperCase();
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char >= 'A' && char <= 'Z') {
        const cipherCharCode = char.charCodeAt(0) - 65;
        const keyCharCode = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;
        const plainCharCode = (cipherCharCode - keyCharCode + 26) % 26;
        result += String.fromCharCode(plainCharCode + 65);
        keyIndex++;
      } else if (char >= 'a' && char <= 'z') {
        const cipherCharCode = char.charCodeAt(0) - 97;
        const keyCharCode = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;
        const plainCharCode = (cipherCharCode - keyCharCode + 26) % 26;
        result += String.fromCharCode(plainCharCode + 97);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  };

  const handleKeyChange = (newKey: string) => {
    setKey(newKey);
    onKeyChange?.(newKey);
  };

  const handleTextChange = (newText: string) => {
    setPlaintext(newText);
    onTextChange?.(newText);
  };

  const ciphertext = vigenereEncrypt(plaintext, key);
  const decrypted = vigenereDecrypt(ciphertext, key);

  return (
    <div style={{
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '2rem',
      margin: '2rem 0'
    }}>
      <h4 style={{
        margin: '0 0 1.5rem 0',
        color: '#111827',
        fontSize: '1.1rem',
        fontWeight: '500'
      }}>
        Interactive Vigenère Cipher
      </h4>

      {/* Input Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Message to Encrypt:
          </label>
          <input
            type="text"
            value={plaintext}
            onChange={(e) => handleTextChange(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
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
            Keyword:
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => handleKeyChange(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              fontFamily: 'monospace'
            }}
            placeholder="KEY"
          />
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
              color: '#111827',
              minHeight: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {plaintext || 'Enter text...'}
            </div>
          </div>

          <div style={{
            padding: '0.5rem',
            background: '#1f2937',
            color: '#fff',
            border: '2px solid #000',
            borderRadius: '50%',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            minWidth: '3rem',
            textAlign: 'center'
          }}>
            →
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
              background: '#065f46',
              color: '#ffffff',
              padding: '1rem',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: '600',
              minHeight: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {ciphertext || 'Encrypted text...'}
            </div>
          </div>
        </div>

        {/* Key pattern visualization */}
        {key && plaintext && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Key Pattern
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25rem'
            }}>
              {plaintext.split('').map((char, index) => {
                if (/[a-zA-Z]/.test(char)) {
                  const keyChar = key[(index - (plaintext.substring(0, index).replace(/[^a-zA-Z]/g, '').length)) % key.length];
                  return (
                    <span key={index} style={{
                      padding: '0.25rem 0.5rem',
                      background: '#f59e0b',
                      color: '#ffffff',
                      borderRadius: '3px',
                      fontSize: '0.8rem'
                    }}>
                      {char}+{keyChar}
                    </span>
                  );
                }
                return <span key={index} style={{ padding: '0.25rem' }}>{char}</span>;
              })}
            </div>
          </div>
        )}

        {/* Verification */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          <strong>Verification:</strong> {decrypted === plaintext ? '✓ Decryption matches original' : '✗ Decryption error'}
        </div>
      </div>
    </div>
  );
};

const vigenereSlides: SlideData[] = [
  {
    id: 'vigenere-intro',
    type: 'intro',
    title: 'The Vigenère Cipher',
    content: (
      <>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          The Vigenère cipher is a method of encrypting alphabetic text by using a series of 
          interwoven Caesar ciphers, based on the letters of a keyword. It was considered 
          unbreakable for 300 years until Friedrich Kasiski broke it in 1863.
        </p>
        
        <div style={{
          background: '#1f2937',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          fontSize: '1rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Mathematical Foundation</h4>
          <div style={{ lineHeight: '1.8' }}>
            <strong>Encryption:</strong> C<sub>i</sub> = (P<sub>i</sub> + K<sub>i</sub>) mod 26<br />
            <strong>Decryption:</strong> P<sub>i</sub> = (C<sub>i</sub> - K<sub>i</sub> + 26) mod 26
          </div>
        </div>

        <p style={{ fontStyle: 'italic', color: '#6b7280', fontSize: '0.95rem' }}>
          Where P<sub>i</sub> is the i-th plaintext letter, K<sub>i</sub> is the i-th key letter (repeating), 
          and C<sub>i</sub> is the i-th ciphertext letter.
        </p>
      </>
    )
  },
  {
    id: 'vigenere-mechanism',
    type: 'concept',
    title: 'How the Vigenère Cipher Works',
    content: (
      <>
        <p style={{ marginBottom: '1.5rem' }}>
          Unlike the Caesar cipher which uses a single shift, Vigenère uses a keyword to create 
          multiple shifts. Each letter of the keyword determines the shift for the corresponding 
          position in the plaintext.
        </p>

        <div style={{
          background: '#1f2937',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          fontFamily: 'monospace'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff', fontFamily: 'inherit' }}>Example: Encrypting "HELLO" with key "KEY"</h4>
          <div style={{ lineHeight: '1.8', fontSize: '0.95rem' }}>
            Plaintext:  <span style={{ color: '#10b981' }}>H  E  L  L  O</span><br />
            Key:        <span style={{ color: '#f59e0b' }}>K  E  Y  K  E</span><br />
            Shifts:     <span style={{ color: '#f59e0b' }}>10 4  24 10 4</span><br />
            Result:     <span style={{ color: '#ef4444' }}>R  I  J  V  S</span>
          </div>
        </div>

        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>H (7) + K (10) = R (17)</li>
          <li>E (4) + E (4) = I (8)</li>
          <li>L (11) + Y (24) = J (9) <em>(wraps around)</em></li>
          <li>L (11) + K (10) = V (21)</li>
          <li>O (14) + E (4) = S (18)</li>
        </ul>
      </>
    )
  },
  {
    id: 'vigenere-demo',
    type: 'interactive',
    title: 'Interactive Vigenère Demonstration',
    content: <VigenereCipherDemo />
  },
  {
    id: 'vigenere-security',
    type: 'concept',
    title: 'Security Analysis',
    content: (
      <>
        <p style={{ marginBottom: '1.5rem' }}>
          The Vigenère cipher's security comes from its use of multiple Caesar ciphers. 
          However, it's vulnerable to frequency analysis when the key length is known or can be determined.
        </p>

        <div style={{
          background: '#1f2937',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Key Space Analysis</h4>
          <div style={{ lineHeight: '1.6' }}>
            • Caesar cipher: 25 possible keys<br />
            • Vigenère with length k: 26<sup>k</sup> possible keys<br />
            • Length 3: 17,576 keys<br />
            • Length 10: 141,167,095,653,376 keys
          </div>
        </div>

        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          padding: '1rem'
        }}>
          <strong>Vulnerability:</strong> Repeating key patterns create statistical weaknesses 
          that can be exploited through Kasiski examination and index of coincidence analysis.
        </div>
      </>
    )
  },
  {
    id: 'vigenere-breaking',
    type: 'concept',
    title: 'Breaking the Vigenère Cipher',
    content: (
      <>
        <p style={{ marginBottom: '1.5rem' }}>
          Friedrich Kasiski developed a method to break the Vigenère cipher by finding 
          the key length, then applying frequency analysis to each Caesar cipher component.
        </p>

        <div style={{
          background: '#1f2937',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Kasiski Method</h4>
          <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li>Find repeated trigrams in ciphertext</li>
            <li>Measure distances between repetitions</li>
            <li>Find GCD of distances → likely key length</li>
            <li>Apply frequency analysis to each position</li>
          </ol>
        </div>

        <div style={{
          background: '#065f46',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <strong>Modern Impact:</strong> Vigenère's weaknesses led to the development 
          of stream ciphers and one-time pads for perfect secrecy.
        </div>
      </>
    )
  },
  {
    id: 'vigenere-conclusion',
    type: 'conclusion',
    title: 'Historical Significance',
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          The Vigenère cipher represents a crucial step in cryptographic evolution, 
          bridging simple substitution and modern polyalphabetic systems.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>Strengths</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
              <li>Polyalphabetic substitution</li>
              <li>Large key space</li>
              <li>Resists simple frequency analysis</li>
            </ul>
          </div>
          <div style={{
            background: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            padding: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc2626' }}>Weaknesses</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
              <li>Repeating key pattern</li>
              <li>Vulnerable to Kasiski analysis</li>
              <li>Statistical frequency leaks</li>
            </ul>
          </div>
        </div>

        <blockquote style={{
          borderLeft: '4px solid #6b7280',
          paddingLeft: '1rem',
          margin: '1.5rem 0',
          fontStyle: 'italic',
          color: '#6b7280'
        }}>
          "Le chiffre indéchiffrable" (The indecipherable cipher) — as it was known 
          for three centuries before being broken.
        </blockquote>
      </>
    )
  }
];

export { vigenereSlides };
