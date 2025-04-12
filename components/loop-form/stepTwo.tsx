"use client";
import { ChangeEvent } from 'react';
import { FaEnvelope, FaPhone, FaFileAlt } from 'react-icons/fa';

interface FormData {
  recruiterEmailTemplate?: string;
  phoneNumber?: string;
  coverLetter?: string;
}

interface StepTwoProps {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const StepTwo = ({ formData, handleChange }: StepTwoProps) => {
  const validatePhoneNumber = (value: string): string | null => {
    if (!value) return "Phone number is required";
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10) return "Phone number must be 10 digits";
    if (/^[01]/.test(digits)) return "Phone number must start with a valid digit";
    if (/^(\d)\1+$/.test(digits)) return "Please enter a valid phone number";
    return null;
  };

  const validateEmail = (value: string): string | null => {
    if (!value) return "Email template is required";
    if (value.length > 2000) return "Email template cannot exceed 2000 characters";
    return null;
  };

  const validateCoverLetter = (value: string): string | null => {
    if (!value) return "Cover letter is required";
    if (value.length > 4000) return "Cover letter cannot exceed 4000 characters";
    return null;
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^[\d\s()-]*$/.test(value)) return;
    const formattedValue = formatPhoneNumber(value);
    handleChange({ 
      target: { 
        name: 'phoneNumber', 
        value: formattedValue 
      }
    } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
        <FaFileAlt className="text-blue-500" />
        Step 2: Job Application Details
      </h2>

      <div className="space-y-8">
        <div className="relative group">
          <label className="text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
            <FaEnvelope className="text-blue-500" />
            Email Template
            <span className="text-xs text-gray-400">({formData.recruiterEmailTemplate?.length || 0}/2000)</span>
          </label>
          <div className="relative">
            <textarea
              name="recruiterEmailTemplate"
              placeholder="Write a professional email template to the recruiter..."
              className="w-full h-40 p-4 border border-gray-600 rounded-lg bg-transparent/10 
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 resize-none backdrop-blur-sm
                       transition-all duration-300 ease-in-out"
              onChange={handleChange}
              value={formData.recruiterEmailTemplate}
              maxLength={2000}
              data-tooltip-id="email-tip"
            />
            <div id="email-tip" content="Keep it professional and concise" />
            {formData.recruiterEmailTemplate && 
              validateEmail(formData.recruiterEmailTemplate) && (
              <p className="text-red-500 text-sm mt-1">
                {validateEmail(formData.recruiterEmailTemplate)}
              </p>
            )}
          </div>
        </div>

        <div className="relative group">
          <label className="text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
            <FaPhone className="text-blue-500" />
            Phone Number
          </label>
          <input
            name="phoneNumber"
            type="tel"
            placeholder="(XXX) XXX-XXXX"
            className={`w-full p-4 border ${
              validatePhoneNumber(formData.phoneNumber) ? 'border-red-500' : 'border-gray-600'
            } rounded-lg bg-transparent/10 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-blue-500 backdrop-blur-sm
            transition-all duration-300 ease-in-out`}
            onChange={handlePhoneChange}
            value={formData.phoneNumber}
          />
          {formData.phoneNumber && 
            validatePhoneNumber(formData.phoneNumber) && (
            <p className="text-red-500 text-sm mt-1">
              {validatePhoneNumber(formData.phoneNumber)}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-1">
            Format: (XXX) XXX-XXXX
          </p>
        </div>

        <div className="relative group">
          <label className="text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
            <FaFileAlt className="text-blue-500" />
            Cover Letter
            <span className="text-xs text-gray-400">({formData.coverLetter?.length || 0}/4000)</span>
          </label>
          <textarea
            name="coverLetter"
            placeholder="Write a compelling cover letter that highlights your relevant experience and skills..."
            className="w-full h-64 p-4 border border-gray-600 rounded-lg bg-transparent/10 
                     text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 resize-none backdrop-blur-sm
                     transition-all duration-300 ease-in-out"
            onChange={handleChange}
            value={formData.coverLetter}
            maxLength={4000}
            data-tooltip-id="cover-tip"
          />
          <div id="cover-tip" content="Highlight your relevant experience and skills" />
          {formData.coverLetter && 
            validateCoverLetter(formData.coverLetter) && (
            <p className="text-red-500 text-sm mt-1">
              {validateCoverLetter(formData.coverLetter)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepTwo;