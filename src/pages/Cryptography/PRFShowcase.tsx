import React, { useState } from 'react';
import type { SlideData } from './ShowcaseSlider';

interface PRFDemoProps {
  onKeyChange?: (key: string) => void;
  onInputChange?: (input: string) => void;
}

export const PRFDemo: React.FC<PRFDemoProps> = ({
  onKeyChange,
  onInputChange
}) => {
  const [key, setKey] = useState('SECRET123');
  const [input, setInput] = useState('message1');
  const [rounds, setRounds] = useState(3);

  // Simple PRF implementation for demonstration (NOT cryptographically secure)
  const simplePRF = (keyStr: string, inputStr: string, numRounds: number): string => {
    let state = 0;
    // Initialize state with key
    for (let i = 0; i < keyStr.length; i++) {
      state = (state + keyStr.charCodeAt(i) * (i + 1)) % 0xFFFFFFFF;
    }
    
    // Process input through rounds
    for (let round = 0; round < numRounds; round++) {
      for (let i = 0; i < inputStr.length; i++) {
        const inputByte = inputStr.charCodeAt(i);
        state = ((state * 1664525) + 1013904223 + inputByte + round) % 0xFFFFFFFF;
        state = ((state << 13) | (state >>> 19)) % 0xFFFFFFFF; // Bit rotation
      }
    }
    
    return state.toString(16).padStart(8, '0').toUpperCase();
  };

  const handleKeyChange = (newKey: string) => {
    setKey(newKey);
    onKeyChange?.(newKey);
  };

  const handleInputChange = (newInput: string) => {
    setInput(newInput);
    onInputChange?.(newInput);
  };

  const output = simplePRF(key, input, rounds);
  const output2 = simplePRF(key, input + '1', rounds); // Different input
  const outputDiffKey = simplePRF(key + 'X', input, rounds); // Different key

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
        Interactive PRF Demonstration
      </h4>

      {/* Input Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 2fr 1fr',
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
            Secret Key:
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => handleKeyChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              fontFamily: 'monospace'
            }}
            placeholder="Enter secret key..."
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
            Input Message:
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              fontFamily: 'monospace'
            }}
            placeholder="message1"
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
            Rounds: {rounds}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Output Display */}
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
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              PRF Input
            </div>
            <div style={{
              background: '#f3f4f6',
              padding: '1rem',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#111827'
            }}>
              {`F_${key}(${input})`}
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
              PRF Output
            </div>
            <div style={{
              background: '#065f46',
              color: '#ffffff',
              padding: '1rem',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              {output}
            </div>
          </div>
        </div>

        {/* Comparison outputs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '4px'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Different Input:</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
              F_{key}({input}1) = {output2}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            background: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: '4px'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Different Key:</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
              F_{key}X({input}) = {outputDiffKey}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const prfSlides: SlideData[] = [
  {
    id: 'prf-intro',
    type: 'intro',
    title: 'Pseudorandom Functions (PRFs)',
    content: (
      <>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          A Pseudorandom Function (PRF) is a fundamental cryptographic primitive that takes 
          a secret key and an input, producing output that appears random to any computationally 
          bounded adversary who doesn't know the key.
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
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Formal Definition</h4>
          <div style={{ lineHeight: '1.8', fontFamily: 'monospace' }}>
            F: {'{0,1}'}^k × {'{0,1}'}^n → {'{0,1}'}^m<br />
            <br />
            F(k, x) = y
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', fontFamily: 'inherit' }}>
            Where k is a k-bit key, x is an n-bit input, and y is an m-bit output.
          </div>
        </div>

        <p style={{ fontStyle: 'italic', color: '#6b7280', fontSize: '0.95rem' }}>
          PRFs are the backbone of symmetric cryptography, used in encryption, authentication, 
          and key derivation.
        </p>
      </>
    )
  },
  {
    id: 'prf-security-definition',
    type: 'math',
    title: 'Mathematical Security Definition',
    content: (
      <>
        <p style={{ marginBottom: '1.5rem' }}>
          A function F is a secure PRF if no efficient algorithm can distinguish between 
          F(k,·) for a random key k and a truly random function with non-negligible probability.
        </p>

        <div style={{
          background: '#1f2937',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Security Game</h4>
          <div style={{ lineHeight: '1.8', fontSize: '0.95rem' }}>
            <strong>Experiment PRF-Real:</strong><br />
            1. Choose random key k ← {'{0,1}'}^κ<br />
            2. Adversary A makes queries x₁, x₂, ..., xₛ<br />
            3. Oracle returns F(k, xᵢ) for each query<br />
            4. A outputs bit b<br />
            <br />
            <strong>Experiment PRF-Random:</strong><br />
            1. Choose random function R: {'{0,1}'}^n → {'{0,1}'}^m<br />
            2. Adversary A makes queries x₁, x₂, ..., xₛ<br />
            3. Oracle returns R(xᵢ) for each query<br />
            4. A outputs bit b
          </div>
        </div>

        <div style={{
          background: '#065f46',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <strong>PRF Advantage:</strong> Adv^PRF_F(A) = |Pr[PRF-Real_A = 1] - Pr[PRF-Random_A = 1]|
        </div>
      </>
    )
  },
  {
    id: 'prf-demo',
    type: 'interactive',
    title: 'Interactive PRF Demonstration',
    content: <PRFDemo />
  },
  {
    id: 'prf-perfect-secrecy',
    type: 'math',
    title: 'Perfect Secrecy Analysis',
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          <strong>Question:</strong> Can a PRF provide perfect secrecy like a one-time pad?
        </p>

        <div style={{
          background: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#dc2626' }}>Answer: NO</h4>
          <p style={{ margin: 0, lineHeight: '1.6' }}>
            PRFs cannot achieve perfect secrecy because they are deterministic functions 
            with finite key spaces, while perfect secrecy requires truly random, infinite key material.
          </p>
        </div>

        <div style={{
          background: '#1f2937',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Perfect Secrecy Requirements</h4>
          <div style={{ lineHeight: '1.8' }}>
            For perfect secrecy: H(M|C) = H(M)<br />
            <br />
            This requires:<br />
            • |Key Space| ≥ |Message Space|<br />
            • Keys used only once<br />
            • Keys chosen uniformly at random
          </div>
        </div>

        <div style={{
          background: '#f0fdf4',
          border: '1px solid #10b981',
          borderRadius: '6px',
          padding: '1rem'
        }}>
          <strong>PRF Reality:</strong> Finite key space (typically 2^128 or 2^256) means 
          computational security, not information-theoretic security.
        </div>
      </>
    )
  },
  {
    id: 'prf-computational-security',
    type: 'math',
    title: 'Computational vs Information-Theoretic Security',
    content: (
      <>
        <p style={{ marginBottom: '1.5rem' }}>
          PRFs provide <em>computational security</em> - security against polynomial-time 
          adversaries - rather than the information-theoretic security of perfect ciphers.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#059669' }}>Perfect Secrecy (OTP)</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <li>Information-theoretic security</li>
              <li>Secure against unbounded adversaries</li>
              <li>Key size = message size</li>
              <li>Keys used once</li>
              <li>H(M|C) = H(M)</li>
            </ul>
          </div>
          <div style={{
            background: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#d97706' }}>PRF Security</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <li>Computational security</li>
              <li>Secure against polynomial-time adversaries</li>
              <li>Fixed key size (128/256 bits)</li>
              <li>Keys can be reused</li>
              <li>Advantage negligible in security parameter</li>
            </ul>
          </div>
        </div>

        <div style={{
          background: '#1f2937',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Security Reduction</h4>
          <div style={{ lineHeight: '1.8', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            If distinguisher D has advantage ε against PRF F:<br />
            <br />
            Time(D) ≤ t and Queries(D) ≤ q<br />
            ⟹ ε ≤ negl(κ) for security parameter κ
          </div>
        </div>
      </>
    )
  },
  {
    id: 'prf-constructions',
    type: 'concept',
    title: 'PRF Constructions',
    content: (
      <>
        <p style={{ marginBottom: '1.5rem' }}>
          PRFs can be constructed from various cryptographic primitives, each with different 
          security assumptions and performance characteristics.
        </p>

        <div style={{
          background: '#1f2937',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Common Constructions</h4>
          <div style={{ lineHeight: '1.8' }}>
            <strong>1. HMAC Construction:</strong><br />
            HMAC(k, m) = H((k ⊕ opad) || H((k ⊕ ipad) || m))<br />
            <br />
            <strong>2. Block Cipher (AES in CTR mode):</strong><br />
            F_k(x) = AES_k(x)<br />
            <br />
            <strong>3. GGM Tree Construction:</strong><br />
            Uses pseudorandom generator to build PRF from any length-doubling PRG
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1rem'
        }}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>HMAC-SHA256</h5>
            <div style={{ fontSize: '0.8rem', color: '#065f46' }}>Hash-based</div>
          </div>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: '#2563eb' }}>AES-128</h5>
            <div style={{ fontSize: '0.8rem', color: '#1d4ed8' }}>Block cipher</div>
          </div>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: '#d97706' }}>ChaCha20</h5>
            <div style={{ fontSize: '0.8rem', color: '#92400e' }}>Stream cipher</div>
          </div>
        </div>
      </>
    )
  },
  {
    id: 'prf-applications',
    type: 'concept',
    title: 'Applications and Importance',
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          PRFs are foundational to modern cryptography, enabling secure communication 
          protocols and cryptographic systems we use daily.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#111827' }}>Encryption</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <li>Stream ciphers (ChaCha20)</li>
              <li>Block cipher modes (CTR, GCM)</li>
              <li>Authenticated encryption</li>
            </ul>
          </div>
          <div style={{
            background: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#111827' }}>Authentication</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <li>Message Authentication Codes</li>
              <li>Digital signatures</li>
              <li>Password-based authentication</li>
            </ul>
          </div>
        </div>

        <div style={{
          background: '#1f2937',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Key Derivation Functions</h4>
          <div style={{ lineHeight: '1.6' }}>
            PRFs enable secure key derivation from master secrets:<br />
            <br />
            <code style={{ background: '#374151', padding: '0.25rem 0.5rem', borderRadius: '3px' }}>
              k₁ = PRF(master_key, "encryption")<br />
              k₂ = PRF(master_key, "authentication")<br />
              k₃ = PRF(master_key, "key_derivation")
            </code>
          </div>
        </div>

        <div style={{
          background: '#065f46',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <strong>Modern Impact:</strong> PRFs enable practical cryptography with manageable 
          key sizes while maintaining strong security guarantees against realistic adversaries.
        </div>
      </>
    )
  },
  {
    id: 'prf-conclusion',
    type: 'conclusion',
    title: 'PRFs: The Heart of Modern Cryptography',
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Pseudorandom Functions represent the perfect balance between theoretical security 
          and practical implementation in modern cryptographic systems.
        </p>

        <div style={{
          background: '#1f2937',
          color: '#fff',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Key Insights</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>PRFs provide computational, not perfect, secrecy</li>
            <li>Security relies on distinguishing advantage being negligible</li>
            <li>Finite key spaces make brute force theoretically possible</li>
            <li>Practical security against polynomial-time adversaries</li>
            <li>Foundation for symmetric cryptography</li>
          </ul>
        </div>

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
              <li>Practical key sizes</li>
              <li>Efficient computation</li>
              <li>Provable security</li>
              <li>Versatile applications</li>
            </ul>
          </div>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#d97706' }}>Limitations</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
              <li>Not perfectly secure</li>
              <li>Vulnerable to quantum attacks</li>
              <li>Requires strong assumptions</li>
              <li>Computational bounds</li>
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
          "PRFs bridge the gap between the theoretical ideal of perfect secrecy and 
          the practical requirements of real-world cryptographic systems."
        </blockquote>
      </>
    )
  }
];

export { prfSlides };