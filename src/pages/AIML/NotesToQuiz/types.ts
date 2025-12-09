export interface Question {
  id: number;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'pdf';
}

export interface NotesToQuizProps {
  onBack: () => void;
}