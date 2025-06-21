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
  <div className="flex flex-col bg-[#11011E]">
      <Card className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl ml-7 mt-7 font-raleway font-bold text-[#ECF1F0]">
              Milestones
            </CardTitle>
            <Badge className="border-[rgba(255,255,255,0.05)] mr-7 text-[#B6B6B6] font-inter text-xs">
              {achievedCount}/{totalCount} Achieved
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`flex items-start p-4 rounded-lg ${
                  milestone.isAchieved
                    ? 'bg-[rgba(15,174,150,0.05)] border border-[rgba(15,174,150,0.2)]'
                    : 'bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                <div className="milestone-badge mr-3 flex-shrink-0">
                  {milestone.isAchieved ? (
                    <CheckCircle className="h-5 w-5 text-[#0FAE96]" />
                  ) : (
                    <Circle className="h-5 w-5 text-[#B6B6B6]" />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-raleway font-semibold text-sm sm:text-base ${
                      milestone.isAchieved ? 'text-[#0FAE96]' : 'text-[#ECF1F0]'
                    }`}
                  >
                    {milestone.name}
                  </h3>
                  <p className="text-[#B6B6B6] font-inter text-sm mt-1">
                    {milestone.description}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs font-raleway font-semibold text-[#ECF1F0]">
                      Requirements:
                    </span>
                    <ul className="text-[#B6B6B6] font-inter text-xs mt-1 space-y-1">
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
    </div>
  );
};

export default Milestones;
