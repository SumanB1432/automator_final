"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  usePersonalDataStore,
  useCertificateStore,
  useAchievementStore,
  useExperienceStore,
  useEducationStore,
  useProjectStore,
  useLanguageStore,
  useSkillStore,
  useThemeStore,
} from "@/app/store";

export default function Luxary() {
  // Access data from Zustand stores
  const { personalData } = usePersonalDataStore();
  const { certificates } = useCertificateStore();
  const { achievements } = useAchievementStore();
  const { experiences } = useExperienceStore();
  const { educations } = useEducationStore();
  const { projects } = useProjectStore();
  const { languages } = useLanguageStore();
  const { skills } = useSkillStore();

  const {
    primaryColor,
    backgroundColor,
    selectedFont,
    fontSubset,
    fontWeight,
    fontStyle,
    fontSize,
    lineHeight,
    underlineLinks,
    hideIcons,
  } = useThemeStore();

  // A4 dimensions in pixels (at 96 DPI for screen, adjusted for print)
  const basePageWidth = 794; // 210mm
  const basePageHeight = 1124; // 297mm
  const paddingTopBottom = 24; // Reduced for smaller screens
  const paddingLeftRight = 24;
  const availableContentHeight = basePageHeight - 2 * paddingTopBottom;

  // Responsive state
  const [isMounted, setIsMounted] = useState(false);
  const [pageGroups, setPageGroups] = useState<unknown[]>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Dynamic font size based on screen size
  const responsiveFontSize = Math.max(fontSize * (window.innerWidth < 640 ? 0.8 : 1), 12);
  const headerFontSize = Math.max(responsiveFontSize - 5, 12);

  // Ensure component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate all resume elements in the desired order
  const generateElements = () => {
    const elements = [];

    // 1. Contact Information - Personal Header
    elements.push({
      id: "personal-header",
      type: "personal-header",
      data: personalData,
    });

    // 1. Contact Information - Personal Contact
    if (personalData.address || personalData.phone || personalData.email) {
      elements.push({
        id: "personal-contact",
        type: "personal-contact",
        data: personalData,
      });
    }

    // 2. Work Experience
    if (experiences.length) {
      elements.push({
        id: "experience-header",
        type: "section-header",
        section: "WORK EXPERIENCE",
      });
      experiences.forEach((exp, index) => {
        elements.push({
          id: `experience-${index}-header`,
          type: "experience-header",
          data: exp,
          section: "WORK EXPERIENCE",
        });
        if (exp.description) {
          const descriptionItems = exp.description
            .split(",")
            .map((detail) => detail.trim());
          descriptionItems.forEach((detail, i) =>
            elements.push({
              id: `experience-${index}-desc-${i}`,
              type: "experience-desc",
              data: { text: detail, parentId: index },
              section: "WORK EXPERIENCE",
            })
          );
        }
      });
    }

    // 3. Projects
    if (projects.length) {
      elements.push({
        id: "projects-header",
        type: "section-header",
        section: "PROJECTS",
      });
      projects.forEach((proj, index) => {
        elements.push({
          id: `project-${index}-header`,
          type: "project-header",
          data: proj,
          section: "PROJECTS",
        });
        if (proj.description) {
          elements.push({
            id: `project-${index}-desc`,
            type: "project-desc",
            data: { text: proj.description, parentId: index },
            section: "PROJECTS",
          });
        }
      });
    }

    // 4. Skills
    if (skills.length) {
      elements.push({
        id: "skills-header",
        type: "section-header",
        section: "SKILLS",
      });
      skills.forEach((skill, index) =>
        elements.push({
          id: `skill-${index}`,
          type: "skill",
          data: skill,
          section: "SKILLS",
        })
      );
    }

    // 5. Education
    if (educations.length) {
      elements.push({
        id: "education-header",
        type: "section-header",
        section: "EDUCATION",
      });
      educations.forEach((edu, index) =>
        elements.push({
          id: `education-${index}`,
          type: "education",
          data: edu,
          section: "EDUCATION",
        })
      );
    }

    // 6. Certifications
    if (certificates.length) {
      elements.push({
        id: "certifications-header",
        type: "section-header",
        section: "CERTIFICATIONS",
      });
      certificates.forEach((certificate, index) =>
        elements.push({
          id: `certificate-${index}`,
          type: "certificate",
          data: certificate,
          section: "CERTIFICATIONS",
        })
      );
    }

    // 7. Awards & Achievements
    if (achievements.length) {
      elements.push({
        id: "awards-header",
        type: "section-header",
        section: "AWARDS",
      });
      achievements.forEach((achievement, index) =>
        elements.push({
          id: `achievement-${index}`,
          type: "achievement",
          data: achievement,
          section: "AWARDS",
        })
      );
    }

    // 8. Languages & Interests (only Languages in current data)
    if (languages.length) {
      elements.push({
        id: "languages-header",
        type: "section-header",
        section: "LANGUAGES",
      });
      languages.forEach((language, index) =>
        elements.push({
          id: `language-${index}`,
          type: "language",
          data: language,
          section: "LANGUAGES",
        })
      );
    }

    return elements;
  };

  // Memoized elements to optimize performance
  const elements = useMemo(() => generateElements(), [
    personalData,
    certificates,
    achievements,
    experiences,
    educations,
    projects,
    languages,
    skills,
  ]);

  // Pagination logic
  useEffect(() => {
    if (!isMounted || !contentRef.current) return;

    const pageHeight = availableContentHeight;
    const pageGroupsTemp: any[] = [];
    let currentPage: any[] = [];
    let currentHeight = 0;
    let i = 0;

    const measureElementHeight = (element: any) => {
      const elementNode = contentRef.current?.querySelector(`#${element.id}`);
      return elementNode?.scrollHeight || 50; // Default to 50px if height is 0
    };

    while (i < elements.length) {
      const element = elements[i];
      const elementHeight = measureElementHeight(element);

      if (elementHeight === 0) {
        console.warn(`Element ${element.id} has zero height, skipping`);
        i++;
        continue;
      }

      if (element.type === "experience-header") {
        let totalHeight = elementHeight;
        let descIndex = i + 1;
        const descriptions: any[] = [];

        while (
          descIndex < elements.length &&
          elements[descIndex].type === "experience-desc"
        ) {
          const descHeight = measureElementHeight(elements[descIndex]);
          descriptions.push(elements[descIndex]);
          totalHeight += descHeight;
          descIndex++;
        }

        if (currentHeight + totalHeight > pageHeight && currentPage.length > 0) {
          pageGroupsTemp.push([...currentPage]);
          currentPage = [];
          currentHeight = 0;
        }

        currentPage.push(element);
        currentHeight += elementHeight;

        descriptions.forEach((desc) => {
          const descHeight = measureElementHeight(desc);
          if (currentHeight + descHeight <= pageHeight) {
            currentPage.push(desc);
            currentHeight += descHeight;
          } else {
            pageGroupsTemp.push([...currentPage]);
            currentPage = [desc];
            currentHeight = descHeight;
          }
        });

        i = descIndex;
      } else {
        if (currentHeight + elementHeight > pageHeight && currentPage.length > 0) {
          pageGroupsTemp.push([...currentPage]);
          currentPage = [];
          currentHeight = 0;
        }

        currentPage.push(element);
        currentHeight += elementHeight;
        i++;
      }
    }

    if (currentPage.length > 0) {
      pageGroupsTemp.push([...currentPage]);
    }

    setPageGroups(pageGroupsTemp);
  }, [elements, isMounted]);

  // Render individual resume elements
  const renderElement = (element: any) => {
    const linkStyle = underlineLinks ? "underline" : "no-underline";
    const iconDisplay = hideIcons ? "hidden" : "block";
    const nameFontSize = responsiveFontSize + 4; // Slightly larger for name
    const headerFontSizeLocal = headerFontSize;

    // Heading typography style
    const headingStyle = {
      fontFamily: selectedFont,
      fontWeight,
      fontStyle,
      fontSize: `${headerFontSizeLocal}px`,
      lineHeight,
      color: primaryColor,
    };

    // Adjust color for gradient
    const adjustColor = (color: string, amount: number) => {
      let usePound = false;

      if (color[0] === "#") {
        color = color.slice(1);
        usePound = true;
      }

      const num = parseInt(color, 16);
      let r = (num >> 16) + amount;
      let g = ((num >> 8) & 0x00ff) + amount;
      let b = (num & 0x0000ff) + amount;

      r = Math.max(Math.min(255, r), 0);
      g = Math.max(Math.min(255, g), 0);
      b = Math.max(Math.min(255, b), 0);

      const newColor = (r << 16) | (g << 8) | b;
      return (usePound ? "#" : "") + newColor.toString(16).padStart(6, "0");
    };

    // Description typography style
    const descriptionStyle = {
      fontFamily: fontSubset,
      lineHeight,
    };

    switch (element.type) {
      case "personal-header":
        return (
          <div
            className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 sm:p-6 rounded-t-lg shadow-md"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
            }}
          >
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{
                fontFamily: selectedFont,
                fontWeight,
                fontStyle,
                fontSize: `${nameFontSize}px`,
                lineHeight,
              }}
            >
              {element.data.name || "Your Name"}
            </h1>
            <h2 className="text-sm sm:text-base md:text-lg mt-1 opacity-90">
              {element.data.headline || "Your Professional Headline"}
            </h2>
          </div>
        );
      case "personal-contact":
        return (
          <section
            className="bg-gray-50 p-3 sm:p-4 border-b border-gray-200"
            style={{ backgroundColor }}
          >
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-800">
              {element.data.email && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-700 ${iconDisplay}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16v16H4V4zm0 4l8 5 8-5" />
                  </svg>
                  <a
                    href={`mailto:${element.data.email}`}
                    className={`text-blue-700 hover:underline ${linkStyle}`}
                  >
                    {element.data.email}
                  </a>
                </div>
              )}
              {element.data.phone && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-700 ${iconDisplay}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 5l4-1 2 3-3 4 5 5 4-3 3 2-1 4H5L3 5z" />
                  </svg>
                  <a
                    href={`tel:${element.data.phone}`}
                    className={`text-blue-700 hover:underline ${linkStyle}`}
                  >
                    {element.data.phone}
                  </a>
                </div>
              )}
              {element.data.address && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg
                    className={`w-3 h-3 sm:w-4 sm:h-4 text-blue-700 flex-shrink-0 ${iconDisplay}`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="9"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <p>{element.data.address}</p>
                </div>
              )}
              {element.data.twitter && (
                <div className="flex items-center space-x-1 sm:space-x-2 print:hidden">
                  <svg
                    className={`w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0 ${iconDisplay}`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M22 4.5a9 9 0 01-2.6.7 4.5 4.5 0 00-7.7 4c-4 0-7.5-2-10-5a4.5 4.5 0 001.5 6c-1 0-2-.3-2.5-1v.1a4.5 4.5 0 003.5 4.4 4.5 4.5 0 01-2 .1 4.5 4.5 0 004.2 3A9 9 0 012 19c2 1 4 1.5 6.5 1.5 7.5 0 12-6 12-12v-.5a8.5 8.5 0 002-2.5z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <a
                    href={`${element.data.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-blue-700 hover:underline ${linkStyle}`}
                  >
                    Twitter
                  </a>
                </div>
              )}
              {element.data.website && (
                <div className="flex items-center space-x-1 sm:space-x-2 print:hidden">
                  <svg
                    className={`w-3 h-3 sm:w-4 sm:h-4 text-blue-700 flex-shrink-0 ${iconDisplay}`}
                    viewBox="0 0 64 64"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                  >
                    <path d="M39.93,55.72A24.86,24.86,0,1,1,56.86,32.15a37.24,37.24,0,0,1-.73,6" />
                    <path d="M37.86,51.1A47,47,0,0,1,32,56.7" />
                    <path d="M32,7A34.14,34.14,0,0,1,43.57,30a34.07,34.07,0,0,1,.09,4.85" />
                    <path d="M32,7A34.09,34.09,0,0,0,20.31,32.46c0,16.2,7.28,21,11.66,24.24" />
                    <line x1="10.37" y1="19.9" x2="53.75" y2="19.9" />
                    <line x1="32" y1="6.99" x2="32" y2="56.7" />
                    <line x1="11.05" y1="45.48" x2="37.04" y2="45.48" />
                    <line x1="7.14" y1="32.46" x2="56.86" y2="31.85" />
                    <path d="M53.57,57,58,52.56l-8-8,4.55-2.91a.38.38,0,0,0-.12-.7L39.14,37.37a.39.39,0,0,0-.46.46L42,53.41a.39.39,0,0,0,.71.13L45.57,49Z" />
                  </svg>
                  <a
                    href={`${element.data.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-blue-700 hover:underline ${linkStyle}`}
                  >
                    Portfolio
                  </a>
                </div>
              )}
              {element.data.linkedin && (
                <div className="flex items-center space-x-1 sm:space-x-2 print:hidden">
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-700 ${iconDisplay}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <a
                    href={`${element.data.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-blue-700 hover:underline ${linkStyle}`}
                  >
                    LinkedIn
                  </a>
                </div>
              )}
              {element.data.github && (
                <div className="flex items-center space-x-1 sm:space-x-2 print:hidden">
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-700 ${iconDisplay}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.415-4.033-1.415-.546-1.388-1.333-1.758-1.333-1.758-1.089-.745.082-.729.082-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.996.108-.775.418-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.933 0-1.311.467-2.382 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.513 11.513 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.119 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.807 5.625-5.48 5.922.43.372.814 1.102.814 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  <a
                    href={`${element.data.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-blue-700 hover:underline ${linkStyle}`}
                  >
                    GitHub
                  </a>
                </div>
              )}
            </div>
          </section>
        );
      case "section-header":
        return (
          <div className="mt-4 sm:mt-6 mb-2 sm:mb-3">
            <h3
              className="text-base sm:text-xl font-bold text-blue-800 bg-blue-100 inline-block px-3 sm:px-4 py-1 rounded-md shadow-sm"
              style={headingStyle}
            >
              {element.section}
            </h3>
          </div>
        );
      case "experience-header":
        return (
          <div className="mb-2 sm:mb-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <span className="text-sm sm:text-lg font-semibold text-gray-900">
                {element.data.position}
              </span>
              <span className="text-xs sm:text-sm text-gray-600">
                {element.data.dateRange}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-700">
              {element.data.company}, {element.data.location}
            </div>
          </div>
        );
      case "experience-desc":
        return (
          <ul
            className="list-disc ml-4 sm:ml-6 text-xs sm:text-sm text-gray-800 mb-3 sm:mb-4"
            style={descriptionStyle}
          >
            <li>{element.data.text}</li>
          </ul>
        );
      case "project-header":
        return (
          <div className="mb-2 sm:mb-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <a
                href={element.data.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm sm:text-lg font-semibold text-blue-700 hover:underline ${linkStyle}`}
              >
                {element.data.name}
              </a>
              <span className="text-xs sm:text-sm text-gray-600">
                {element.data.date}
              </span>
            </div>
          </div>
        );
      case "project-desc":
        return (
          <p className="text-xs sm:text-sm text-gray-800 mb-3 sm:mb-4">
            {element.data.text}
          </p>
        );
      case "skill":
        return (
          <div className="mb-2 sm:mb-3">
            <span
              className="text-sm sm:text-base font-semibold text-gray-900"
              style={headingStyle}
            >
              {element.data.heading}:
            </span>
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
              {element.data.items.split(",").map((item: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-200 text-blue-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-xs shadow-sm"
                >
                  {item.trim()}
                </span>
              ))}
            </div>
          </div>
        );
      case "education":
        return (
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <div>
                <div className="text-sm sm:text-lg font-semibold text-gray-900">
                  {element.data.institute}
                </div>
                <p className="text-xs sm:text-sm text-gray-700">
                  {element.data.typeofstudy} in {element.data.areaofstudy}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs sm:text-sm text-gray-600">
                  {element.data.dateRange}
                </span>
                {element.data.score && (
                  <span className="text-xs sm:text-sm text-gray-800 block font-medium">
                    {element.data.score}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      case "certificate":
        return (
          <div className="mb-2 sm:mb-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <span className="text-sm sm:text-lg font-semibold text-gray-900">
                {element.data.title}
              </span>
              <span className="text-xs sm:text-sm text-gray-600">
                {element.data.date}
              </span>
            </div>
            <a
              href={element.data.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs sm:text-sm text-blue-700 hover:underline ${linkStyle}`}
            >
              {element.data.awarder}
            </a>
          </div>
        );
      case "achievement":
        return (
          <div className="mb-2 sm:mb-3">
            <div className="text-sm sm:text-lg font-semibold text-gray-900">
              {element.data.name}
            </div>
            <p className="text-xs sm:text-sm text-gray-700">
              {element.data.details}
            </p>
          </div>
        );
      case "language":
        return (
          <div className="mb-2 sm:mb-3">
            <span className="text-sm sm:text-base font-semibold text-gray-900">
              {element.data.heading}:
            </span>
            <span className="ml-1 sm:ml-2 text-gray-800 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-xs">
              {element.data.option}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="resume-container font-sans print:p-0 w-full">
      {/* Hidden content for measuring element heights */}
      <div
        ref={contentRef}
        className="absolute -top-[9999px] -left-[9999px] w-[210mm] pointer-events-none"
      >
        {elements.map((element) => (
          <div key={element.id} id={element.id} className="break-words">
            {renderElement(element)}
          </div>
        ))}
      </div>

      {/* Visible paginated content */}
      {pageGroups.length > 0 ? (
        pageGroups.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className={`page print-page bg-white text-gray-800 w-full max-w-[210mm] mx-auto h-[${basePageHeight}px] mb-4 sm:mb-5 shadow-lg print:h-auto print:shadow-none print:page-break-after-always print:mt-0 print:mb-0`}
          >
            <div
              className={`content-wrapper px-4 sm:px-6 md:px-8 py-6 sm:py-8 h-auto overflow-y-auto print:p-0 print:h-auto`}
              style={{ backgroundColor }}
            >
              {page.map((element: any) => (
                <div key={element.id}>{renderElement(element)}</div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div
          className={`page print-page bg-white text-gray-800 w-full max-w-[210mm] mx-auto h-[${basePageHeight}px] mb-4 sm:mb-5 shadow-lg print:h-auto print:shadow-none print:page-break-after-always print:mt-0 print:mb-0`}
        >
          <div
            className={`content-wrapper px-4 sm:px-6 md:px-8 py-6 sm:py-8 h-auto print:p-0 print:h-auto`}
            style={{ backgroundColor }}
          >
            <p className="text-center text-gray-500">Loading content...</p>
          </div>
        </div>
      )}
    </div>
  );
}