import Image from 'next/image';

interface TeamCardProps {
  name: string;
  role: string;
  linkedin: string;
  img : string;

}

const TeamCard = ({ name, role, linkedin,img }: TeamCardProps) => (
  <div className="rounded-[24px] text-center pb-8 border border-white/10 bg-white/5 animate-fade-in-up p-6">
    <div className="relative w-32 h-32 mx-auto">
      <Image
        src={img} 
        alt={linkedin} 
        fill
        sizes="(max-width: 768px) 100px, 128px"
        className="rounded-full object-cover"
        priority
      />
    </div>
    <h3 className="mt-4 text-lg sm:text-xl font-raleway font-semibold text-[#ECF1F0]">{name}</h3>
    <p className="text-sm sm:text-base text-[#B6B6B6] font-roboto">{role}</p>
    <div className="flex justify-center gap-4 mt-4">
      <a 
        href={linkedin} 
        target="_blank" 
        rel="noreferrer"
        className="relative w-8 h-8 sm:w-10 sm:h-10"
      >
        <Image 
          src="/images/linkedin-icon.png" 
          alt="LinkedIn" 
          fill
          sizes="(max-width: 768px) 32px, 40px"
          className="object-contain"
        />
      </a>

    </div>
  </div>
);

export default function OurTeam() {
  return (
    <main className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center py-[60px] px-6 lg:px-[90px] text-white bg-gradient-to-b from-[#11011E] via-[#35013e] to-[#11011E]">
      {/* Accent Blur Elements */}
      <div className="absolute top-[-150px] left-[-150px] w-96 h-96 bg-[#90e6d9a9] opacity-40 blur-[200px]"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-96 h-96 bg-[#90e6d9a9] opacity-40 blur-[200px]"></div>

      <section className="text-center max-w-5xl mb-16 animate-fade-in-up">
        <h1 className="text-2xl lg:text-4xl font-bold font-raleway text-[#ECF1F0]">Jobform Automator’s Mission</h1>
        <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#B6B6B6] font-roboto">
          Job Form Automator revolutionizes job applications with AI-powered automation. We empower job seekers to apply to thousands
          of positions on platforms like LinkedIn, Indeed, and Monster efficiently. Our tool auto-fills forms, reduces errors, and saves
          time, providing a seamless experience. Committed to innovation, we help users achieve their career goals faster and more
          effectively.
        </p>
      </section>

      <section className="w-full max-w-6xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-8 animate-fade-in-up font-raleway text-[#ECF1F0]">Meet our team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
          <TeamCard
            name="Saurabh Belote"
            role="CEO & Founder"
            linkedin="https://www.linkedin.com/in/saurabh-belote/" 
            img="/images/team1.jpg"        />
          <TeamCard
            name="Suman Bera"
            role="Lead Product Engineer"
            linkedin="https://www.linkedin.com/in/suman-bera-816642191/"
            img="/images/team2.jpg"
          />
          <TeamCard
            name="Pawan Kumar"
            role="Software Developer"
            linkedin="https://www.linkedin.com/in/pawan-yadav-022b76266/"
            img="/images/team3.jpg"
           
          />
        </div>
      </section>
    </main>
  );
}
