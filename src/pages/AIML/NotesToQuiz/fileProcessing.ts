import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { HandwritingImageProcessor } from './advancedHandwritingProcessor';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Phonetic and context-based text correction
const applyLanguageCorrections = async (rawText: string): Promise<string> => {
  let correctedText = rawText;
  
  // Common OCR misreads for handwriting
  const corrections = new Map([
    // Common letter confusions
    ['rn', 'm'], ['cl', 'd'], ['vv', 'w'], ['ii', 'll'], ['oo', '00'],
    ['5', 'S'], ['0', 'O'], ['1', 'l'], ['8', 'B'], ['6', 'G'],
    // Word-level corrections
    ['teh', 'the'], ['adn', 'and'], ['taht', 'that'], ['hte', 'the'],
    ['recieve', 'receive'], ['seperate', 'separate'], ['definately', 'definitely']
  ]);
  
  // Apply basic corrections
  corrections.forEach((correct, incorrect) => {
    const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
    correctedText = correctedText.replace(regex, correct);
  });
  
  // Apply probabilistic context corrections
  correctedText = await applyContextualCorrections(correctedText);
  
  return correctedText;
};

// Context-aware probabilistic corrections
const applyContextualCorrections = async (text: string): Promise<string> => {
  const words = text.split(/\s+/);
  const correctedWords: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const nextWord = i < words.length - 1 ? words[i + 1] : '';
    
    // Apply context-based corrections
    const correctedWord = await correctWordInContext(word, prevWord, nextWord);
    correctedWords.push(correctedWord);
  }
  
  return correctedWords.join(' ');
};

// Advanced word correction with context
const correctWordInContext = async (word: string, prevWord: string, nextWord: string): Promise<string> => {
  // If word is already valid, return as-is
  if (isValidWord(word)) {
    return word;
  }
  
  // Generate possible corrections based on common errors
  const candidates = generateCandidates(word);
  
  // Score candidates based on context
  let bestCandidate = word;
  let bestScore = 0;
  
  for (const candidate of candidates) {
    const score = calculateContextScore(candidate, prevWord, nextWord);
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }
  
  return bestCandidate;
};

// Simple word validation (could be enhanced with dictionary API)
const isValidWord = (word: string): boolean => {
  // Basic validation - could integrate with dictionary API
  const commonWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'among', 'this', 'that', 'these', 'those', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'can', 'will', 'just', 'should', 'now', 'may', 'also', 'back',
    'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other',
    'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early',
    'young', 'important', 'few', 'public', 'bad', 'same', 'able'
  ]);
  
  return commonWords.has(word.toLowerCase()) || word.length >= 3;
};

// Generate correction candidates for a word
const generateCandidates = (word: string): string[] => {
  const candidates: Set<string> = new Set();
  
  // Add original word
  candidates.add(word);
  
  // Character substitutions (common OCR errors)
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const substitutions = getCharacterSubstitutions(char);
    
    for (const sub of substitutions) {
      const candidate = word.substring(0, i) + sub + word.substring(i + 1);
      candidates.add(candidate);
    }
  }
  
  // Character insertions and deletions
  for (let i = 0; i <= word.length; i++) {
    // Try common insertions
    ['a', 'e', 'i', 'o', 'u', 'n', 't', 's'].forEach(char => {
      const candidate = word.substring(0, i) + char + word.substring(i);
      candidates.add(candidate);
    });
    
    // Try deletions
    if (i < word.length) {
      const candidate = word.substring(0, i) + word.substring(i + 1);
      candidates.add(candidate);
    }
  }
  
  return Array.from(candidates);
};

// Get common OCR substitutions for a character
const getCharacterSubstitutions = (char: string): string[] => {
  const substitutions: { [key: string]: string[] } = {
    'o': ['0', 'O', 'Q', 'a'],
    '0': ['o', 'O', 'Q'],
    'l': ['1', 'I', '|', 'i'],
    '1': ['l', 'I', '|', 'i'],
    'I': ['l', '1', '|', 'i'],
    'i': ['l', '1', 'I', '|'],
    'S': ['5', '8'],
    '5': ['S', '8'],
    '8': ['B', 'S', '5'],
    'B': ['8', 'P', 'R'],
    'rn': ['m'],
    'm': ['rn', 'nn'],
    'cl': ['d'],
    'd': ['cl', 'o'],
    'vv': ['w'],
    'w': ['vv', 'uu'],
    'nn': ['m', 'u']
  };
  
  return substitutions[char] || [];
};

// Calculate context score for word placement
const calculateContextScore = (word: string, prevWord: string, nextWord: string): number => {
  let score = 0;
  
  // Basic word frequency (higher score for common words)
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'];
  if (commonWords.includes(word.toLowerCase())) {
    score += 10;
  }
  
  // Bigram probabilities (simplified)
  const commonBigrams = new Map([
    ['the', ['cat', 'dog', 'book', 'house', 'car', 'way', 'time', 'day']],
    ['in', ['the', 'a', 'an', 'order', 'time', 'place']],
    ['and', ['the', 'then', 'also', 'now', 'so']],
    ['to', ['the', 'be', 'have', 'do', 'go', 'see', 'get', 'make']]
  ]);
  
  if (prevWord && commonBigrams.has(prevWord.toLowerCase())) {
    const followingWords = commonBigrams.get(prevWord.toLowerCase()) || [];
    if (followingWords.includes(word.toLowerCase())) {
      score += 15;
    }
  }
  
  // Future context (trigram-like scoring)
  if (nextWord) {
    const trigrams = new Map([
      ['in_the', ['house', 'car', 'book', 'room', 'world', 'end']],
      ['of_the', ['book', 'car', 'house', 'world', 'day', 'time']],
      ['and_the', ['cat', 'dog', 'book', 'car', 'house']]
    ]);
    
    const trigramKey = `${word.toLowerCase()}_${nextWord.toLowerCase()}`;
    if (prevWord && trigrams.has(trigramKey)) {
      score += 5;
    }
  }
  
  // Vowel/consonant pattern scoring
  if (word.length > 1) {
    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    
    for (let i = 0; i < word.length - 1; i++) {
      const current = word[i].toLowerCase();
      const next = word[i + 1].toLowerCase();
      
      // Reward consonant-vowel patterns
      if (consonants.includes(current) && vowels.includes(next)) {
        score += 2;
      }
      // Penalize unusual patterns
      if (consonants.includes(current) && consonants.includes(next) && 
          !['th', 'ch', 'sh', 'st', 'nd', 'ng'].includes(current + next)) {
        score -= 1;
      }
    }
  }
  
  return score;
};

export const processImageToText = async (file: File): Promise<string> => {
  try {
    console.log('Starting advanced OCR processing for:', file.name);
    
    // Use advanced image preprocessing for better handwriting recognition
    console.log('Applying advanced image enhancements...');
    const enhancedFile = await HandwritingImageProcessor.enhanceForHandwriting(file);
    
    // Enhanced Tesseract configuration for handwriting
    const result = await Tesseract.recognize(enhancedFile, 'eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    let extractedText = result.data.text.trim();
    console.log('Raw OCR completed, applying post-processing...');
    
    // Apply language-based corrections
    extractedText = await applyLanguageCorrections(extractedText);
    console.log('Language corrections applied successfully');
    
    if (!extractedText) {
      throw new Error('No text could be extracted from the image');
    }
    
    return extractedText;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const processPdfToText = async (file: File): Promise<string> => {
  try {
    console.log('Starting PDF processing for:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += `\n\nPage ${pageNum}:\n${pageText}`;
    }
    
    const cleanedText = fullText.trim();
    console.log('PDF processing completed successfully');
    
    if (!cleanedText) {
      throw new Error('No text could be extracted from the PDF');
    }
    
    return cleanedText;
  } catch (error) {
    console.error('PDF Processing Error:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const isPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};

export const isSupportedFile = (file: File): boolean => {
  return isImageFile(file) || isPdfFile(file);
};