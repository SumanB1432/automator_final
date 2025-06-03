
"use client";
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phase } from '@/types';
import SkillCard from './SkillCard';
import QuizModal from './QuizModal';
import { useAppContext } from '@/context/AppContext';
import { Lock, BookOpen, CheckCircle } from 'lucide-react';

interface PhaseCardProps {
  phase: Phase;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phase }) => {
  const { state } = useAppContext();
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  
  const completedSkills = phase.skills.filter(skill => skill.isCompleted).length;
  const totalSkills = phase.skills.length;
  const quiz = state.quizzes.find(q => q.phaseId === phase.id);

  const handleTakeQuiz = () => {
    if (quiz && !quiz.isCompleted) {
      setIsQuizOpen(true);
    }
  };

  return (
    <div className="flex flex-col bg-[#11011E]">
      <Card className={`phase-card bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] ${phase.isCompleted ? 'border-[#0FAE96]' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {phase.isCompleted ? (
                <CheckCircle className="h-5 w-5 text-[#0FAE96]" />
              ) : phase.isUnlocked ? (
                <BookOpen className="h-5 w-5 text-[#ECF1F0]" />
              ) : (
                <Lock className="h-5 w-5 text-[#B6B6B6]" />
              )}
              <CardTitle className="text-lg sm:text-xl font-raleway font-bold text-[#ECF1F0]">
                {phase.name}
              </CardTitle>
            </div>
            <Badge className={`text-xs font-inter ${phase.isCompleted ? 'border-[rgba(255,255,255,0.05)] text-[#B6B6B6]' : 'bg-[#0FAE96] text-white'}`}>
              {completedSkills}/{totalSkills} Skills
            </Badge>
          </div>
          <CardDescription className="text-[#B6B6B6] font-inter text-sm mt-2">
            {phase.description}
          </CardDescription>

          <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-1 text-sm text-[#ECF1F0] font-inter">
              <span>Progress</span>
              <span className="font-semibold">{phase.progress}%</span>
            </div>
            <div className="progress-bar h-2 bg-[rgba(255,255,255,0.05)] rounded-full">
              <div
                className="progress-value h-2 bg-[#0FAE96] rounded-full transition-all duration-300"
                style={{ width: `${phase.progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {phase.skills.map(skill => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isLocked={!phase.isUnlocked}
            />
          ))}
        </CardContent>
        {phase.isCompleted && quiz && (
          <CardFooter className="bg-[rgba(15,174,150,0.05)] border-t border-[rgba(15,174,150,0.2)]">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center text-[#0FAE96]">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-raleway font-semibold text-[#ECF1F0] text-sm">
                  Phase Completed
                </span>
              </div>
              <Button
                className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-2 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] h-10"
                onClick={handleTakeQuiz}
                disabled={quiz.isCompleted}
              >
                {quiz.isCompleted ? 'Quiz Completed' : 'Take Quiz'}
              </Button>
            </div>
          </CardFooter>
        )}
        {!phase.isUnlocked && !phase.isCompleted && (
          <CardFooter className="bg-[rgba(255,255,255,0.02)] border-t border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center text-[#B6B6B6] font-inter text-sm">
              <Lock className="h-5 w-5 mr-2 text-[#ECF1F0]" />
              <span>Complete previous phase to unlock</span>
            </div>
          </CardFooter>
        )}
      </Card>
      {quiz && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          quiz={quiz}
        />
      )}
    </div>
  );
};

export default PhaseCard;
