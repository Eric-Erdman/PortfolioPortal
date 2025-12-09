/**
 * Advanced Handwriting Recognition System
 * This is a foundation for future ML-based handwriting recognition
 */

// Types for advanced processing
export interface HandwritingModel {
  characterRecognition: (imageData: ImageData, boundingBox: BoundingBox) => Promise<CharacterPrediction[]>;
  contextualCorrection: (text: string) => Promise<string>;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CharacterPrediction {
  character: string;
  confidence: number;
  alternatives: { char: string; confidence: number; }[];
}

// Language model for contextual predictions
export class LanguageModel {
  private ngramFrequencies: Map<string, Map<string, number>>;
  private characterFrequencies: Map<string, number>;

  constructor() {
    this.ngramFrequencies = new Map();
    this.characterFrequencies = new Map();
    this.initializeBaseModel();
  }

  private initializeBaseModel() {
    // Initialize with common English patterns
    const commonBigrams: [string, number][] = [
      ['th', 0.271], ['he', 0.233], ['in', 0.203], ['er', 0.178], ['an', 0.161],
      ['ed', 0.130], ['nd', 0.120], ['to', 0.111], ['en', 0.108], ['ti', 0.104],
      ['es', 0.103], ['or', 0.101], ['te', 0.098], ['of', 0.097], ['be', 0.094],
      ['ha', 0.093], ['as', 0.092], ['his', 0.091], ['on', 0.089], ['is', 0.088]
    ];

    const bigramMap = new Map<string, number>();
    commonBigrams.forEach(([bigram, freq]) => {
      bigramMap.set(bigram, freq);
    });
    this.ngramFrequencies.set('2', bigramMap);

    // Character frequencies in English
    const charFreqs: [string, number][] = [
      ['e', 12.70], ['t', 9.06], ['a', 8.17], ['o', 7.51], ['i', 6.97],
      ['n', 6.75], ['s', 6.33], ['h', 6.09], ['r', 5.99], ['d', 4.25],
      ['l', 4.03], ['c', 2.78], ['u', 2.76], ['m', 2.41], ['w', 2.36],
      ['f', 2.23], ['g', 2.02], ['y', 1.97], ['p', 1.93], ['b', 1.29],
      ['v', 0.98], ['k', 0.77], ['j', 0.15], ['x', 0.15], ['q', 0.10], ['z', 0.07]
    ];

    charFreqs.forEach(([char, freq]) => {
      this.characterFrequencies.set(char, freq / 100);
    });
  }

  // Calculate probability of character sequence
  public calculateSequenceProbability(text: string): number {
    let probability = 1.0;
    
    for (let i = 0; i < text.length - 1; i++) {
      const bigram = text.substring(i, i + 2).toLowerCase();
      const bigramFreq = this.ngramFrequencies.get('2')?.get(bigram) || 0.001;
      probability *= bigramFreq;
    }
    
    return probability;
  }

  // Suggest corrections based on language model
  public suggestCorrections(text: string, maxSuggestions: number = 5): string[] {
    const suggestions: { text: string; score: number; }[] = [];
    
    // Generate variations
    const variations = this.generateVariations(text);
    
    for (const variation of variations) {
      const score = this.calculateSequenceProbability(variation);
      suggestions.push({ text: variation, score });
    }
    
    // Sort by score and return top suggestions
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map(s => s.text);
  }

  private generateVariations(text: string): string[] {
    const variations = new Set<string>();
    variations.add(text);
    
    // Character substitutions
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toLowerCase();
      const similarChars = this.getSimilarCharacters(char);
      
      for (const similar of similarChars) {
        const variation = text.substring(0, i) + similar + text.substring(i + 1);
        variations.add(variation);
      }
    }
    
    // Character insertions (common missing characters)
    for (let i = 0; i <= text.length; i++) {
      ['e', 'a', 'i', 'o', 'u', 'n', 't', 's'].forEach(char => {
        const variation = text.substring(0, i) + char + text.substring(i);
        variations.add(variation);
      });
    }
    
    // Character deletions
    for (let i = 0; i < text.length; i++) {
      const variation = text.substring(0, i) + text.substring(i + 1);
      variations.add(variation);
    }
    
    return Array.from(variations);
  }

  private getSimilarCharacters(char: string): string[] {
    const similarityMap: { [key: string]: string[] } = {
      'a': ['o', 'e', 'u'],
      'e': ['a', 'i', 'o'],
      'i': ['e', 'l', '1'],
      'o': ['a', '0', 'u'],
      'u': ['a', 'o', 'v'],
      'l': ['i', '1', 'I'],
      '1': ['l', 'I', 'i'],
      'I': ['l', '1', 'i'],
      '0': ['o', 'O'],
      'O': ['0', 'o'],
      's': ['5', 'S'],
      '5': ['s', 'S'],
      'g': ['q', '9'],
      'q': ['g', '9'],
      'rn': ['m'],
      'm': ['rn', 'n'],
      'cl': ['d'],
      'd': ['cl', 'o'],
      'vv': ['w'],
      'w': ['vv', 'u']
    };
    
    return similarityMap[char] || [];
  }
}

// Advanced image processing for handwriting
export class HandwritingImageProcessor {
  
  // Apply multiple enhancement techniques
  public static async enhanceForHandwriting(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (!ctx) {
          resolve(file);
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Apply multiple enhancement steps
        imageData = this.applyGaussianBlur(imageData, 1); // Slight blur to reduce noise
        imageData = this.enhanceContrast(imageData, 1.5); // Increase contrast
        imageData = this.applyAdaptiveThreshold(imageData); // Better binarization
        imageData = this.applyMorphology(imageData); // Clean up artifacts
        
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const enhancedFile = new File([blob], file.name, { type: file.type });
            resolve(enhancedFile);
          } else {
            resolve(file);
          }
        }, file.type);
      };
      
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  // Gaussian blur for noise reduction
  private static applyGaussianBlur(imageData: ImageData, radius: number): ImageData {
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data);
    
    const kernel = this.generateGaussianKernel(radius);
    const kernelSize = kernel.length;
    const half = Math.floor(kernelSize / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const pixelY = Math.min(height - 1, Math.max(0, y + ky - half));
            const pixelX = Math.min(width - 1, Math.max(0, x + kx - half));
            const pixelIndex = (pixelY * width + pixelX) * 4;
            const weight = kernel[ky][kx];
            
            r += data[pixelIndex] * weight;
            g += data[pixelIndex + 1] * weight;
            b += data[pixelIndex + 2] * weight;
            a += data[pixelIndex + 3] * weight;
          }
        }
        
        const outputIndex = (y * width + x) * 4;
        output[outputIndex] = r;
        output[outputIndex + 1] = g;
        output[outputIndex + 2] = b;
        output[outputIndex + 3] = a;
      }
    }
    
    return new ImageData(output, width, height);
  }

  // Generate Gaussian kernel
  private static generateGaussianKernel(radius: number): number[][] {
    const size = 2 * radius + 1;
    const kernel: number[][] = [];
    let sum = 0;
    
    for (let y = 0; y < size; y++) {
      kernel[y] = [];
      for (let x = 0; x < size; x++) {
        const distance = Math.sqrt((x - radius) ** 2 + (y - radius) ** 2);
        const value = Math.exp(-(distance ** 2) / (2 * radius ** 2));
        kernel[y][x] = value;
        sum += value;
      }
    }
    
    // Normalize kernel
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        kernel[y][x] /= sum;
      }
    }
    
    return kernel;
  }

  // Enhance contrast
  private static enhanceContrast(imageData: ImageData, factor: number): ImageData {
    const { data } = imageData;
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Apply contrast enhancement
      const enhanced = Math.min(255, Math.max(0, (gray - 128) * factor + 128));
      
      data[i] = enhanced;
      data[i + 1] = enhanced;
      data[i + 2] = enhanced;
    }
    
    return imageData;
  }

  // Adaptive threshold for better binarization
  private static applyAdaptiveThreshold(imageData: ImageData): ImageData {
    const { data, width, height } = imageData;
    const windowSize = 15;
    const c = 10; // Constant subtracted from mean
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        // Calculate local mean
        let sum = 0;
        let count = 0;
        
        for (let wy = Math.max(0, y - windowSize); wy <= Math.min(height - 1, y + windowSize); wy++) {
          for (let wx = Math.max(0, x - windowSize); wx <= Math.min(width - 1, x + windowSize); wx++) {
            const localIndex = (wy * width + wx) * 4;
            const gray = 0.299 * data[localIndex] + 0.587 * data[localIndex + 1] + 0.114 * data[localIndex + 2];
            sum += gray;
            count++;
          }
        }
        
        const localMean = sum / count;
        const currentGray = 0.299 * data[pixelIndex] + 0.587 * data[pixelIndex + 1] + 0.114 * data[pixelIndex + 2];
        
        const threshold = localMean - c;
        const binaryValue = currentGray > threshold ? 255 : 0;
        
        data[pixelIndex] = binaryValue;
        data[pixelIndex + 1] = binaryValue;
        data[pixelIndex + 2] = binaryValue;
      }
    }
    
    return imageData;
  }

  // Basic morphological operations
  private static applyMorphology(imageData: ImageData): ImageData {
    // Apply opening (erosion followed by dilation) to remove noise
    let processed = this.erode(imageData);
    processed = this.dilate(processed);
    return processed;
  }

  private static erode(imageData: ImageData): ImageData {
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        let minValue = 255;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const neighborIndex = ((y + dy) * width + (x + dx)) * 4;
            const gray = data[neighborIndex];
            minValue = Math.min(minValue, gray);
          }
        }
        
        output[pixelIndex] = minValue;
        output[pixelIndex + 1] = minValue;
        output[pixelIndex + 2] = minValue;
      }
    }
    
    return new ImageData(output, width, height);
  }

  private static dilate(imageData: ImageData): ImageData {
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        let maxValue = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const neighborIndex = ((y + dy) * width + (x + dx)) * 4;
            const gray = data[neighborIndex];
            maxValue = Math.max(maxValue, gray);
          }
        }
        
        output[pixelIndex] = maxValue;
        output[pixelIndex + 1] = maxValue;
        output[pixelIndex + 2] = maxValue;
      }
    }
    
    return new ImageData(output, width, height);
  }
}

// Future: ML-based character recognition
export class MLCharacterRecognizer {
  // TODO: Initialize TensorFlow.js model
  // private model: any;
  
  constructor() {
    // TODO: Initialize TensorFlow.js model
    // this.model = await tf.loadLayersModel('/path/to/handwriting-model.json');
  }

  // Placeholder for future ML implementation
  public async recognizeCharacter(_imageData: ImageData, _boundingBox: BoundingBox): Promise<CharacterPrediction[]> {
    // TODO: Implement actual ML prediction
    // For now, return placeholder
    return [
      { character: 'a', confidence: 0.8, alternatives: [{ char: 'o', confidence: 0.2 }] }
    ];
  }

  // Train model on custom handwriting data
  public async trainOnUserData(samples: { image: ImageData; label: string; }[]): Promise<void> {
    // TODO: Implement transfer learning
    console.log('Training on', samples.length, 'samples');
  }
}

// Integration helper
export const createAdvancedHandwritingProcessor = () => {
  const languageModel = new LanguageModel();
  const imageProcessor = HandwritingImageProcessor;
  const mlRecognizer = new MLCharacterRecognizer();

  return {
    processHandwriting: async (file: File): Promise<string> => {
      // Step 1: Enhance image
      const enhancedFile = await imageProcessor.enhanceForHandwriting(file);
      
      // Step 2: Use existing OCR (Tesseract) with enhancements
      // This would integrate with your existing processImageToText function
      
      // Step 3: Apply language model corrections
      // This would use the languageModel to improve results
      
      // For now, delegate to existing function
      const { processImageToText } = await import('./fileProcessing');
      return processImageToText(enhancedFile);
    },
    
    languageModel,
    imageProcessor,
    mlRecognizer
  };
};