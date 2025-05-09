
import { v4 as uuidv4 } from 'uuid';

export const createSessionId = (): string => {
  return uuidv4();
};

export const getInitialQuestion = (role: string, skillLevel: string): string => {
  // In a real implementation, this would be a call to an AI model
  // For now, we'll use predefined questions based on role and skill level
  const questions = {
    "Software Engineer": {
      "Beginner": "Tell me about your experience with programming and what languages you're comfortable with.",
      "Intermediate": "Can you describe a challenging project you worked on and how you approached it?",
      "Advanced": "Tell me about a time when you had to optimize a critical piece of code. What was your approach and what were the results?"
    },
    "Product Manager": {
      "Beginner": "What drew you to product management as a career?",
      "Intermediate": "Describe a product you managed from ideation to launch.",
      "Advanced": "Tell me about a time when you had to make a difficult tradeoff decision for a product. How did you approach it?"
    },
    "Data Scientist": {
      "Beginner": "What statistical methods are you most familiar with?",
      "Intermediate": "Describe a data project you've worked on. What insights did you discover?",
      "Advanced": "Tell me about a time when you built a predictive model that had significant business impact."
    },
    "Designer": {
      "Beginner": "What design tools do you use most frequently?",
      "Intermediate": "Walk me through your design process for a recent project.",
      "Advanced": "Tell me about a time when user research dramatically changed your design approach."
    },
    "Other": {
      "Beginner": "Tell me about yourself and your professional background.",
      "Intermediate": "What achievements are you most proud of in your career so far?",
      "Advanced": "Tell me about a challenging situation in your professional life and how you overcame it."
    }
  };

  // Default to "Other" if role isn't found
  const roleQuestions = questions[role as keyof typeof questions] || questions["Other"];
  
  // Default to "Intermediate" if skill level isn't found
  return roleQuestions[skillLevel as keyof typeof roleQuestions] || roleQuestions["Intermediate"];
};

export const getFollowUpQuestion = (
  role: string, 
  transcript: { question: string; answer: string }[]
): string => {
  // In a real implementation, this would be a call to an AI model
  // For now, we'll use predefined follow-up questions based on role and the interview progress
  
  const softwareQuestions = [
    "What's your approach to solving complex technical problems?",
    "How do you stay updated with the latest technologies in your field?",
    "Describe your experience with agile development methodologies.",
    "Tell me about a time when you had to debug a particularly difficult issue.",
    "How do you approach writing maintainable and scalable code?"
  ];
  
  const productQuestions = [
    "How do you prioritize features in your product roadmap?",
    "Describe how you gather and incorporate user feedback into your products.",
    "How do you measure the success of a product?",
    "Tell me about a product decision you made that was data-driven.",
    "How do you collaborate with engineering and design teams?"
  ];
  
  const dataQuestions = [
    "How do you approach cleaning and preparing data for analysis?",
    "Describe a time when you communicated complex findings to non-technical stakeholders.",
    "What's your approach to feature engineering?",
    "How do you validate the performance of your models?",
    "Tell me about a time when you had to work with incomplete or messy data."
  ];
  
  const designQuestions = [
    "How do you incorporate accessibility in your design process?",
    "Describe your approach to creating a design system.",
    "How do you resolve conflicting feedback from stakeholders?",
    "Tell me about a design choice you made that improved user engagement.",
    "How do you balance aesthetics with usability in your designs?"
  ];
  
  const generalQuestions = [
    "How do you handle tight deadlines or pressure?",
    "Describe your approach to working in a team environment.",
    "Tell me about a time when you had to learn something new quickly.",
    "How do you handle disagreements with colleagues?",
    "What's your greatest professional achievement and why?"
  ];
  
  let questionPool;
  switch (role) {
    case "Software Engineer":
      questionPool = softwareQuestions;
      break;
    case "Product Manager":
      questionPool = productQuestions;
      break;
    case "Data Scientist":
      questionPool = dataQuestions;
      break;
    case "Designer":
      questionPool = designQuestions;
      break;
    default:
      questionPool = generalQuestions;
  }
  
  // Choose a random question from the pool that hasn't been asked yet
  const askedQuestions = transcript.map(item => item.question);
  const availableQuestions = questionPool.filter(q => !askedQuestions.includes(q));
  
  if (availableQuestions.length === 0) {
    return "That covers most of what I wanted to ask. Is there anything else you'd like to share about your experience?";
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

export const generateFeedback = (transcript: { question: string; answer: string }[]): {
  strengths: string[];
  improvements: string[];
  overallScore: number;
} => {
  // In a real implementation, this would be a call to an AI model
  // For now, we'll generate some random feedback
  
  const strengths = [
    "Provided clear and concise answers",
    "Used specific examples to illustrate points",
    "Demonstrated good technical knowledge",
    "Showed enthusiasm and positive attitude",
    "Structured responses in a logical manner",
    "Effectively highlighted relevant experience",
    "Demonstrated good communication skills",
    "Showed problem-solving abilities"
  ];
  
  const improvements = [
    "Could provide more specific examples",
    "Try to be more concise in responses",
    "Focus more on quantifying achievements",
    "Consider using the STAR method for behavioral questions",
    "Avoid technical jargon when explaining concepts",
    "Try to highlight teamwork more in examples",
    "Practice more structured answers",
    "Consider elaborating more on problem-solving approach"
  ];
  
  // Randomly select 3-4 strengths
  const numStrengths = Math.floor(Math.random() * 2) + 3; // 3-4
  const selectedStrengths = [];
  
  for (let i = 0; i < numStrengths; i++) {
    const randomIndex = Math.floor(Math.random() * strengths.length);
    selectedStrengths.push(strengths[randomIndex]);
    strengths.splice(randomIndex, 1); // Remove to avoid duplicates
  }
  
  // Randomly select 2-3 improvements
  const numImprovements = Math.floor(Math.random() * 2) + 2; // 2-3
  const selectedImprovements = [];
  
  for (let i = 0; i < numImprovements; i++) {
    const randomIndex = Math.floor(Math.random() * improvements.length);
    selectedImprovements.push(improvements[randomIndex]);
    improvements.splice(randomIndex, 1); // Remove to avoid duplicates
  }
  
  // Generate a random score between 7.0 and 9.5
  const overallScore = Math.round((7 + Math.random() * 2.5) * 10) / 10;
  
  return {
    strengths: selectedStrengths,
    improvements: selectedImprovements,
    overallScore
  };
};
