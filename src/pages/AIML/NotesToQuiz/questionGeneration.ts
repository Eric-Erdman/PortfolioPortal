import type { Question } from './types';

export const generateQuestionsFromKeywords = (text: string): Question[] => {
  const generatedQuestions: Question[] = [];
  let questionId = 1;

  // Split text into lines and analyze patterns
  const lines = text.split('\n').filter(line => line.trim());
  
  // Pattern 1: Lines with colons (definitions)
  lines.forEach(line => {
    const colonMatch = line.match(/^(.+?):\s*(.+)$/);
    if (colonMatch && generatedQuestions.length < 15) {
      const [, term, definition] = colonMatch;
      
      // Create fill-in-the-blank question
      generatedQuestions.push({
        id: questionId++,
        type: 'fill-blank',
        question: `What is the definition of ${term.trim()}?`,
        correctAnswer: definition.trim(),
        explanation: `This definition comes directly from your notes.`
      });

      // Create multiple choice question
      const incorrectOptions = [
        'A method used in data preprocessing',
        'A type of neural network architecture', 
        'A statistical measurement technique',
        'A data visualization method'
      ];
      
      generatedQuestions.push({
        id: questionId++,
        type: 'multiple-choice',
        question: `Which best describes ${term.trim()}?`,
        options: [definition.trim(), ...incorrectOptions.slice(0, 3)].sort(() => Math.random() - 0.5),
        correctAnswer: definition.trim(),
        explanation: `According to your notes, this is the correct definition.`
      });
    }
  });

  // Pattern 2: Bullet points with specific content analysis
  lines.forEach(line => {
    // Look for bullet points with advantages/benefits
    const bulletMatch = line.match(/^[•\-*+»]\s*(.+)$/);
    if (bulletMatch && generatedQuestions.length < 15) {
      const content = bulletMatch[1].trim();
      
      // Check if this is a benefit/advantage/feature
      if (content.length > 10 && !content.includes('?')) {
        // Find the main topic from context (look at previous lines)
        const lineIndex = lines.indexOf(line);
        let contextTopic = 'this concept';
        
        // Look backwards for a topic or header
        for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 3); i--) {
          const prevLine = lines[i].trim();
          if (prevLine && !prevLine.startsWith('•') && !prevLine.startsWith('-') && 
              !prevLine.startsWith('*') && !prevLine.startsWith('+') && !prevLine.startsWith('»')) {
            // Clean up the topic
            contextTopic = prevLine.replace(/[?!:]/g, '').trim();
            break;
          }
        }
        
        // Create a true/false question
        generatedQuestions.push({
          id: questionId++,
          type: 'true-false',
          question: `Is "${content}" a benefit or characteristic of ${contextTopic}?`,
          correctAnswer: 'true',
          explanation: `This is listed as a point about ${contextTopic} in your notes.`
        });
      }
    }
  });

  // Pattern 3: Important terms (words in ALL CAPS or with specific formatting)
  const importantTerms = text.match(/\b[A-Z]{2,}[A-Z\s]*\b/g) || [];
  importantTerms.slice(0, 3).forEach(term => {
    if (generatedQuestions.length < 15) {
      generatedQuestions.push({
        id: questionId++,
        type: 'fill-blank',
        question: `Fill in the blank: _______ is an important concept mentioned prominently in the notes.`,
        correctAnswer: term.trim(),
        explanation: `This term appears prominently in your notes, suggesting its importance.`
      });
    }
  });

  // Pattern 4: Questions and answers in the text
  lines.forEach(line => {
    const questionMatch = line.match(/^(.+\?)\s*$/);
    if (questionMatch && generatedQuestions.length < 15) {
      const question = questionMatch[1].trim();
      const lineIndex = lines.indexOf(line);
      
      // Look for answer in following lines
      for (let i = lineIndex + 1; i < Math.min(lines.length, lineIndex + 5); i++) {
        const nextLine = lines[i].trim();
        if (nextLine && nextLine.startsWith('*') || nextLine.startsWith('•') || 
            nextLine.startsWith('-') || nextLine.startsWith('+') || nextLine.startsWith('»')) {
          const answer = nextLine.replace(/^[*•\-+»]\s*/, '').trim();
          if (answer.length > 5) {
            generatedQuestions.push({
              id: questionId++,
              type: 'multiple-choice',
              question: question,
              options: [
                answer,
                'Market timing strategies',
                'Traditional asset allocation',
                'Risk management protocols'
              ].sort(() => Math.random() - 0.5),
              correctAnswer: answer,
              explanation: `This answer is provided directly in your notes.`
            });
            break;
          }
        }
      }
    }
  });

  // Pattern 5: Look for comparison indicators (vs, versus, compared to)
  lines.forEach(line => {
    const comparisonMatch = line.match(/(.+?)\s+(vs\.?|versus|compared to)\s+(.+)/i);
    if (comparisonMatch && generatedQuestions.length < 15) {
      const [, item1, , item2] = comparisonMatch;
      
      generatedQuestions.push({
        id: questionId++,
        type: 'multiple-choice',
        question: `According to your notes, what is being compared?`,
        options: [
          `${item1.trim()} and ${item2.trim()}`,
          'Different algorithms',
          'Various data types',
          'Multiple frameworks'
        ].sort(() => Math.random() - 0.5),
        correctAnswer: `${item1.trim()} and ${item2.trim()}`,
        explanation: `Your notes mention a comparison between these concepts.`
      });
    }
  });

  // Pattern 6: Bold text indicators (text between ** or __ markers)
  const boldMatches = text.match(/(\*\*|__)(.*?)\1/g) || [];
  boldMatches.slice(0, 3).forEach(match => {
    const cleanMatch = match.replace(/(\*\*|__)/g, '').trim();
    if (generatedQuestions.length < 15 && cleanMatch.length > 3) {
      generatedQuestions.push({
        id: questionId++,
        type: 'fill-blank',
        question: `Complete this important concept from your notes: _______`,
        correctAnswer: cleanMatch,
        explanation: `This was highlighted as important in your notes.`
      });
    }
  });

  // Pattern 7: Protection/Benefits pattern (specifically for financial/investment content)
  lines.forEach(line => {
    const protectionMatch = line.match(/[•\-*+»]\s*(Protection against|Low|High|Better|Improved|Enhanced|Provides?)\s+(.+)/i);
    if (protectionMatch && generatedQuestions.length < 15) {
      const [, descriptor, benefit] = protectionMatch;
      
      generatedQuestions.push({
        id: questionId++,
        type: 'true-false',
        question: `True or False: ${descriptor.trim()} ${benefit.trim()} is mentioned as a characteristic in your notes.`,
        correctAnswer: 'true',
        explanation: `This benefit is specifically listed in your notes.`
      });
    }
  });

  // Remove any questions that ask about "section covers" or are too vague
  const filteredQuestions = generatedQuestions.filter(q => 
    !q.question.toLowerCase().includes('section of your notes covers') &&
    !q.question.toLowerCase().includes('which section') &&
    q.question.length > 10
  );

  return filteredQuestions.slice(0, 12); // Limit to 12 questions
};