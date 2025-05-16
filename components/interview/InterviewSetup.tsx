import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { hasGeminiApiKey, setGeminiApiKey, validateApiKey } from "@/lib/gemini-utils";
import type { SessionType } from "@/app/interview/interview_dashboard/page";

interface InterviewSetupProps {
  onStart: (role: string, skillLevel: string, jobDescription: string) => void;
  session: SessionType | null;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart, session }) => {
  const [selectedRole, setSelectedRole] = useState<string>(session?.role || "Software Engineer");
  const [customRole, setCustomRole] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<string>(session?.skillLevel || "Intermediate");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>("");
  const [needsApiKey, setNeedsApiKey] = useState<boolean>(!hasGeminiApiKey());
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    setNeedsApiKey(!hasGeminiApiKey());
  }, []);

  const handleStart = async () => {
    if (needsApiKey && geminiApiKey.trim()) {
      setIsValidating(true);
      const isValid = await validateApiKey(geminiApiKey.trim());
      setIsValidating(false);

      if (!isValid) {
        return;
      }

      const success = setGeminiApiKey(geminiApiKey.trim());
      if (success) {
        setNeedsApiKey(false);
        toast({
          title: "API Key Saved",
          description: "Your Gemini API key has been saved for this session.",
        });
      } else {
        toast({
          title: "Error Saving API Key",
          description: "Failed to save the API key. Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else if (needsApiKey) {
      toast({
        title: "API Key Required",
        description: "Please provide a Gemini API key or add it to your environment variables.",
        variant: "destructive",
      });
      return;
    }

    const role = selectedRole === "Other" ? customRole : selectedRole;
    if (!role.trim()) {
      toast({
        title: "Role Required",
        description: "Please select or specify a role for the interview.",
        variant: "destructive",
      });
      return;
    }

    onStart(role, skillLevel, jobDescription);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative w-full mx-auto px-4 py-8 md:py-12">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#7000FF] blur-[180px] opacity-25 rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#FF00C7] blur-[180px] opacity-25 rounded-full pointer-events-none"></div>

        <h2 className="text-2xl md:text-3xl font-bold font-raleway text-[#ECF1F0] mb-8">Interview Setup</h2>

        <div className="space-y-8 relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-6">
          <div>
            <Label className="text-lg font-medium font-raleway text-[#ECF1F0] mb-3 block">Select your target role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full h-12 bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-[#B6B6B6] font-inter focus:ring-[#0FAE96] focus:border-[#0FAE96]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-[#11011E] border-[rgba(255,255,255,0.05)] text-[#B6B6B6]">
                <SelectItem value="Software Engineer" className="focus:bg-[rgba(255,255,255,0.05)] focus:text-[#ECF1F0]">Software Engineer</SelectItem>
                <SelectItem value="Product Manager" className="focus:bg-[rgba(255,255,255,0.05)] focus:text-[#ECF1F0]">Product Manager</SelectItem>
                <SelectItem value="Data Scientist" className="focus:bg-[rgba(255,255,255,0.05)] focus:text-[#ECF1F0]">Data Scientist</SelectItem>
                <SelectItem value="Designer" className="focus:bg-[rgba(255,255,255,0.05)] focus:text-[#ECF1F0]">Designer</SelectItem>
                <SelectItem value="Other" className="focus:bg-[rgba(255,255,255,0.05)] focus:text-[#ECF1F0]">Other (Custom)</SelectItem>
              </SelectContent>
            </Select>

            {selectedRole === "Other" && (
              <div className="mt-4">
                <Label htmlFor="custom-role" className="text-sm font-inter text-[#B6B6B6]">Specify your role</Label>
                <Input
                  id="custom-role"
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="mt-1 w-full h-12 bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-[#B6B6B6] focus:ring-[#0FAE96] focus:border-[#0FAE96]"
                  placeholder="e.g. Marketing Manager"
                />
              </div>
            )}
          </div>

          <div>
            <Label className="text-lg font-medium font-raleway text-[#ECF1F0] mb-3 block">Experience level</Label>
            <RadioGroup value={skillLevel} onValueChange={setSkillLevel} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: "Beginner", label: "Beginner", description: "0-2 years experience" },
                { value: "Intermediate", label: "Intermediate", description: "3-5 years experience" },
                { value: "Advanced", label: "Advanced", description: "6+ years experience" },
              ].map((level) => (
                <div key={level.value} className="relative">
                  <RadioGroupItem value={level.value} id={level.value} className="peer sr-only" />
                  <Label
                    htmlFor={level.value}
                    className="flex flex-col h-full p-4 border border-[rgba(255,255,255,0.05)] rounded-md cursor-pointer bg-[rgba(255,255,255,0.02)] hover:border-[#0FAE96] transition duration-200 peer-data-[state=checked]:border-[#0FAE96] peer-data-[state=checked]:bg-[rgba(15,174,150,0.1)]"
                  >
                    <span className="text-lg font-medium font-raleway text-[#ECF1F0]">{level.label}</span>
                    <span className="text-sm font-inter text-[#B6B6B6]">{level.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="job-description" className="text-lg font-medium font-raleway text-[#ECF1F0] mb-3 block">
              Job Description (for tailored questions)
            </Label>
            <Textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to get tailored interview questions..."
              className="min-h-[150px] resize-none w-full bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-[#B6B6B6] font-inter focus:ring-[#0FAE96] focus:border-[#0FAE96]"
            />
          </div>

          {needsApiKey && (
            <div className="border-t border-[rgba(255,255,255,0.05)] pt-6">
              <Label htmlFor="gemini-api-key" className="text-lg font-medium font-raleway text-[#ECF1F0] mb-3 block">
                Gemini API Key Required
              </Label>
              <div className="text-sm font-inter text-[#B6B6B6] mb-4">
                <p>Enter a valid Gemini API key to enable AI-generated questions and feedback.</p>
                <p className="mt-1">Your key will be stored in this browser session only.</p>
                <p className="mt-1">Get a key from <a href="https://ai.google.dev" target="_blank" className="text-[#0FAE96] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] transition duration-200">Google AI Studio</a>.</p>
              </div>
              <Input
                id="gemini-api-key"
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKeyState(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="w-full h-12 bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-[#B6B6B6] font-inter focus:ring-[#0FAE96] focus:border-[#0FAE96]"
              />
            </div>
          )}

          <div className="pt-4 text-right">
            <div className="pt-4 text-right">
              <Button
                onClick={handleStart}
                disabled={(selectedRole === "Other" && !customRole.trim()) || isValidating}
                className="inline-flex items-center whitespace-nowrap bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isValidating ? "Validating API Key..." : "Start Interview"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;