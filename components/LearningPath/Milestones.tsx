"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import { CheckCircle, Circle } from 'lucide-react';

const Milestones = () => {
  const { state } = useAppContext();
  const { milestones } = state;
  
  const achievedCount = milestones.filter(m => m.isAchieved).length;
  const totalCount = milestones.length;

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Milestones</CardTitle>
          <Badge variant="outline">
            {achievedCount}/{totalCount} Achieved
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.id}
              className={`flex items-start p-3 rounded-md ${
                milestone.isAchieved ? 'bg-success/5 border border-success/20' : 'bg-muted/20'
              }`}
            >
              <div className="milestone-badge mr-3 flex-shrink-0">
                {milestone.isAchieved ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className={`font-medium ${milestone.isAchieved ? 'text-success' : ''}`}>
                  {milestone.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {milestone.description}
                </p>
                <div className="mt-1">
                  <span className="text-xs font-medium">Requirements:</span>
                  <ul className="text-xs text-muted-foreground mt-1">
                    {milestone.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="mr-1">•</span> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Milestones;
