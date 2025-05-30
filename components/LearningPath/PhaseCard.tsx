"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phase } from '@/types';
import SkillCard from './SkillCard';
import { Lock, BookOpen, CheckCircle } from 'lucide-react';

interface PhaseCardProps {
  phase: Phase;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phase }) => {
  const completedSkills = phase.skills.filter(skill => skill.isCompleted).length;
  const totalSkills = phase.skills.length;
  
  return (
     <Card className={`phase-card ${phase.isCompleted ? 'border-success' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {phase.isCompleted ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : phase.isUnlocked ? (
              <BookOpen className="h-5 w-5 text-primary" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle className="text-xl">{phase.name}</CardTitle>
          </div>
          <Badge variant={phase.isCompleted ? "outline" : "default"}>
            {completedSkills}/{totalSkills} Skills
          </Badge>
        </div>
        <CardDescription>{phase.description}</CardDescription>
        
        <div className="w-full mt-4">
          <div className="flex items-center justify-between mb-1 text-sm">
            <span>Progress</span>
            <span className="font-medium">{phase.progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-value" 
              style={{ width: `${phase.progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {phase.skills.map(skill => (
          <SkillCard 
            key={skill.id} 
            skill={skill} 
            isLocked={!phase.isUnlocked}
          />
        ))}
      </CardContent>
      {phase.isCompleted && (
        <CardFooter className="bg-success/5 border-t border-success/20">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center text-success">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Phase Completed</span>
            </div>
            <Button variant="outline">Take Quiz</Button>
          </div>
        </CardFooter>
      )}
      {!phase.isUnlocked && !phase.isCompleted && (
        <CardFooter className="bg-muted/30">
          <div className="flex items-center text-muted-foreground">
            <Lock className="h-5 w-5 mr-2" />
            <span>Complete previous phase to unlock</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default PhaseCard;
