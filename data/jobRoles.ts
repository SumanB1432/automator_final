export const commonJobRoles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "Project Manager",
    "Quality Assurance Engineer",
    "Business Analyst",
    "System Administrator",
    "Cloud Architect",
    "Machine Learning Engineer",
    "Mobile Developer"
  ];
  
  export const validateJobTitle = (title: string): string | null => {
    if (title.length < 3) {
      return "Job title must be at least 3 characters long";
    }
    if (!/^[a-zA-Z\s\-]+$/.test(title)) {
      return "Job title should only contain letters, spaces, and hyphens";
    }
    return null;
  };