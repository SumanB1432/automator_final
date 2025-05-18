import { FaBuilding, FaMapMarkerAlt, FaCode, FaPaperPlane, FaCheck, FaSpinner } from 'react-icons/fa';

interface CompanyCardProps {
  company: string;
  email: string;
  location: string;
  title: string;
  isSending: boolean;
  isSent: boolean;
}

const CompanyCard = ({ company, email, location, title, isSending, isSent }: CompanyCardProps) => {
  // Don't render the card if email is "Not found"
  if (email === "Not found") {
    return null;
  }

  return (
    <div className="bg-[rgba(255,255,255,0.02)] rounded-[18px] p-[30px] border border-[rgba(255,255,255,0.1)] hover:border-[#0FAE96] transition-all backdrop-blur-sm">
      <div className="flex items-center gap-[16px] mb-[20px]">
        <div className="w-[40px] h-[40px] bg-[#0FAE96] rounded-[10px] flex items-center justify-center">
          <FaBuilding className="text-[#FFFFFF] text-[20px]" />
        </div>
        <div>
          <h3 className="text-[28px] font-semibold text-[#ECF1F0]">{company}</h3>
          <p className="text-[#B6B6B6] text-[16px] flex items-center gap-[8px]">
            <FaMapMarkerAlt className="text-[#0FAE96]" />
            {location}
          </p>
        </div>
      </div>

      <div className="space-y-[12px] mb-[24px]">
        <div className="flex items-center gap-[12px] text-[#B6B6B6]">
          <FaCode className="text-[#0FAE96]" />
          <div className="flex flex-wrap gap-[8px]">
       
              <span
             
                className="text-[14px] bg-[rgba(255,255,255,0.05)] px-[10px] py-[6px] rounded-[10px]"
              >
                {title}
              </span>
        
          </div>
        </div>
      </div>

      <div
        className={`w-full px-[16px] py-[12px] rounded-[10px] flex items-center justify-center gap-[8px] transition-all backdrop-blur-sm text-[16px] text-[#FFFFFF] ${
          isSent
            ? 'bg-[#0FAE96]/90 hover:bg-[#0FAE96]'
            : 'bg-[#0FAE96]/90 hover:bg-[#0FAE96]'
        }`}
      >
        {isSending ? (
          <>
            <FaSpinner className="animate-spin" />
            <span>Sending to {email}...</span>
          </>
        ) : isSent ? (
          <>
            <FaCheck />
            <span>Email Sent Successfully!</span>
          </>
        ) : (
          <>
            <FaPaperPlane />
            <span>Processing...</span>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;