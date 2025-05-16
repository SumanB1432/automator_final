// utils/emailCheck.js

export function checkEmailType(email) {
    if (!email || typeof email !== 'string') {
      return { type: 'invalid', message: false };
    }
  
    const trimmedEmail = email.trim().toLowerCase();
    const [localPart, domain] = trimmedEmail.split('@');
  
    const publicDomains = [
       "gmail.com",'yahoo.com', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'protonmail.com', 'rediffmail.com'
    ];
  
    const hrKeywords = ['hr', 'recruit', 'hiring', 'talent', 'careers'];
  
    if (publicDomains.includes(domain)) {
      return { type: 'public', message: false };
    }
  
    if (hrKeywords.some(keyword => localPart.includes(keyword))) {
      return { type: 'hr', message: true };
    }
  
    return { type: 'company', message: true };
  }
  