/** @format */
"use client";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import aiImg from "../../public/images/autoapply.jpeg";
import emailImg from "../../public/images/email.jpeg";
import resumeImg from "../../public/images/resume.jpeg";
import skillsImg from "../../public/images/skill.jpeg";

interface StepProps {
  id: number;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  imageOnLeft: boolean;
  image: StaticImageData;
}

const Step = ({ id, title, description, buttonText, buttonLink, imageOnLeft, image }: StepProps) => (
  <div
    className={`flex flex-col md:flex-row ${
      imageOnLeft ? "md:flex-row-reverse" : ""
    } rounded-2xl backdrop-blur-3xl bg-[#FFFFFF05] hover:bg-[#FFFFFF08] border-[#ffffff17] border-[1.5px] mx-4 md:mx-20 p-6 md:p-12 items-center gap-8 md:gap-12 transition-all duration-300`}
  >
    <div className="w-full md:w-1/2 h-48 md:h-[60vh] rounded-3xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
      <Image
        src={image}
        alt={`Step ${id} Image`}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="flex flex-col space-y-6 md:space-y-8 md:w-1/2">
      <div className="w-28 rounded-full flex justify-center items-center px-4 py-2 space-x-3 border-[1px] border-[#ffffff17] bg-[#FFFFFF05]">
        <div className="w-3 h-3 md:w-4 md:h-4 bg-[#0FAE96] rounded-full"></div>
        <div className="text-[#0FAE96] text-sm md:text-base">Step {id}</div>
      </div>
      <div className="text-white text-xl md:text-3xl font-semibold">{title}</div>
      <div className="text-[#B6B6B6] text-sm md:text-lg leading-relaxed">{description}</div>
      {buttonText && buttonLink && (
        <Link href={buttonLink}  rel="noopener noreferrer">
          <button className="rounded-xl text-white py-2.5 px-6 w-auto md:w-36 text-center bg-[#0FAE96] hover:bg-[#0c9a85] transition-colors duration-300 text-sm md:text-base font-medium">
            {buttonText}
          </button>
        </Link>
      )}
    </div>
  </div>
);

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "🧠 Apply Smarter with AI",
      description:
        "Apply to hundreds of jobs daily on LinkedIn and Monster. We also auto-fill long, boring forms on company sites so you don’t have to.",
      buttonText: "Add to Chrome",
      buttonLink: "https://chromewebstore.google.com/detail/jobform-automator-ai-auto/lknamgjmcmbfhcjjeicdndokedcmpbaa",
      image: aiImg,
    },
    {
      id: 2,
      title: "📧 Reach Recruiters—Without Lifting a Finger",
      description:
        "Send personalized, AI-written emails directly to recruiters. Stand out in crowded inboxes while you focus on what matters.",
      buttonText: "Send Auto Email",  
      buttonLink: "https://www.jobformautomator.com/send-auto-mail",
      image: emailImg,
    },
    {
      id: 3,
      title: "📄 Create the Perfect Resume in Seconds",
      description:
        "Generate a keyword-optimized ATS resume that gets through filters. No guesswork—just one click to a job-winning document.",
      buttonText:"Create Auto Resume",
      buttonLink:"https://www.jobformautomator.com/atsresume",
      image: resumeImg,
    },
    {
      id: 4,
      title: "💡 Know the Skills. Close the Gaps. Get Hired.",
      description:
        "Discover which skills you're missing—based on real-time job market data. Learn them for free. Improve your chances instantly. Plus: Our ATS checker tells you exactly why your resume may be getting rejected.",
        buttonText:"Skills Suggestion",
        buttonLink:"https://www.jobformautomator.com/atsresume",
      image: skillsImg,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-8 md:space-y-12 flex flex-col justify-center items-center text-center px-4 md:px-0">
        <div className="px-5 py-2.5 space-x-3 border-[1.5px] border-[#ffffff17] justify-center rounded-full flex items-center bg-[#FFFFFF05] hover:bg-[#FFFFFF08] transition-all duration-300">
          <div className="w-4 h-4 bg-[#0FAE96] rounded-full animate-pulse"></div>
          <div className="text-[#0FAE96] text-sm md:text-base font-medium">How it works?</div>
        </div>
        <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight">
          6 Features. 1 Goal. Your Job.
        </h1>
        <p className="text-[#B6B6B6] max-w-3xl text-sm md:text-lg leading-relaxed">
          See how our extension automates form-filling, matches you with jobs,
          and saves you time on every application.
        </p>
      </div>

      <div className="space-y-12 md:space-y-24 py-8">
        {steps.map((step, index) => (
          <Step key={step.id} {...step} imageOnLeft={index % 2 === 0} />
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
