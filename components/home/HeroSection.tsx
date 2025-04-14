/** @format */
"use client";
import Image from "next/image";

const HeroSection = () => {
  return (
    <div className="relative bg-[#11011E] pt-32 pb-[3.6rem] px-6 md:px-16 lg:px-20 text-center overflow-hidden">
      {/* Blurred Accent Elements */}
      <div className="absolute top-[-150px] left-[-150px] w-96 h-96 bg-[#90e6d959] opacity-40 blur-[200px]"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-96 h-96 bg-[#90e6d959] opacity-40 blur-[200px]"></div>

      {/* Star Rating */}
      <div className="relative z-10 flex justify-center items-center mb-4 animate-fadeIn">
        <span className="flex items-center bg-[#FFFFFF05] border border-[#ffffff17] px-3 py-1 rounded-full">
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <Image
                key={index}
                src="/images/star.png"
                alt="Star"
                className="w-3 h-3 mr-1"
                width={12}
                height={12}
              />
            ))}
          <span className="font-roboto text-[#B6B6B6] text-xs">5 star rated</span>
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="relative z-10 font-raleway font-bold text-[#ECF1F0] text-[1.65rem] sm:text-3xl md:text-4xl lg:text-[3.9rem] mb-4 leading-normal animate-slideInUp">
        <span className="block">Stop Wasting Time,</span>
        <span className="block mt-2 sm:mt-6">Get Hired.</span>

      </h1>

      {/* Subheading */}
      <p className="relative z-10 font-roboto text-[#B6B6B6] text-base sm:text-lg md:text-xl lg:text-xl mb-8 animate-fadeIn">
        ⏱ Apply 10x faster <br /> 📈 Get 3x more interviews <br /> 💼 Spend time growing skills, not applying jobs
      </p>


      {/* CTA Button */}
      <div className="relative z-10 flex justify-center mb-8 px-4">
        <a
          href="https://chromewebstore.google.com/detail/jobform-automator-ai-auto/lknamgjmcmbfhcjjeicdndokedcmpbaa"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-[220px] sm:max-w-sm md:max-w-md lg:max-w-fit bg-[#0FAE96] hover:bg-[#0FAE96]/90 text-white font-roboto font-semibold text-sm sm:text-base px-3 sm:px-5 py-2 sm:py-3 rounded-md shadow-md transition text-center"
        >
          Get started - Try it for free
        </a>
      </div>


      {/* Trust Indicators */}
      <div className="relative z-10 flex flex-col items-center animate-fadeIn">
        <div className="flex -space-x-4 mb-2">
          {["Img1.png", "Img2.png", "Img3.png", "Img4.png"].map((img, index) => (
            <Image
              key={index}
              src={`/images/${img}`}
              alt={`Avatar ${index + 1}`}
              className="w-10 h-10 rounded-full border border-[#FFFFFF]"
              width={40}
              height={40}
            />
          ))}
        </div>
        <p className="font-roboto text-[#B6B6B6] text-sm">
          <span className="text-[#0FAE96] font-bold">350+</span> JobSeeker using JobFrom Automator
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
