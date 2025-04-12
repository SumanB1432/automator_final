
"use client";
import React from "react";
import {
  usePersonalDataStore,
  useCertificateStore,
  useAchievementStore,
  useExperienceStore,
  useEducationStore,
  useProjectStore,
  useLanguageStore,
  useSkillStore,
} from "@/app/store";

export default function Modern() {
  const { personalData } = usePersonalDataStore();
  const { certificates } = useCertificateStore();
  const { achievements } = useAchievementStore();
  const { experiences } = useExperienceStore();
  const { educations } = useEducationStore();
  const { projects } = useProjectStore();
  const { languages } = useLanguageStore();
  const { skills } = useSkillStore();

  return (
    <div className="bg-white text-gray-900 max-w-2xl mx-auto p-6 font-sans">
      {/* 1. Header: Name & Title */}
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-wide">{personalData.name}</h1>
        <h2 className="text-sm text-gray-500 mt-1">{personalData.headline}</h2>
      </header>

      {/* 2. Contact & Links */}
      {(personalData.address ||
        personalData.phone ||
        personalData.github ||
        personalData.email ||
        personalData.twitter ||
        personalData.linkedin) && (
        <section className="mt-4 text-sm text-gray-700 flex flex-wrap justify-center gap-3">
          {/* Address */}
          {personalData.address && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2C8.13 2 5 5.11 5 8.99c0 4.87 5.45 10.22 6.78 11.4a1 1 0 0 0 1.44 0C13.55 19.2 19 13.86 19 8.99 19 5.11 15.87 2 12 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span>{personalData.address}</span>
            </div>
          )}

          {/* Phone */}
          {personalData.phone && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 5l4-1 2 3-3 4 5 5 4-3 3 2-1 4H5L3 5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{personalData.phone}</span>
            </div>
          )}

          {/* Email */}
          {personalData.email && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 4h16v16H4V4zm0 4l8 5 8-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{personalData.email}</span>
            </div>
          )}

          {/* GitHub */}
          {personalData.github && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2a10 10 0 00-3 19.5V19a3.5 3.5 0 00-1-2.5c1.5 0 2.5 1.5 2.5 2 0 1 1 1 2 1s2 0 2-1c0-0.5 1-2 2.5-2a3.5 3.5 0 00-1 2.5v2.5a10 10 0 00-3-19.5z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span>{personalData.github}</span>
            </div>
          )}

          {/* Twitter */}
          {personalData.twitter && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M22 4.5a9 9 0 01-2.6.7 4.5 4.5 0 00-7.7 4c-4 0-7.5-2-10-5a4.5 4.5 0 001.5 6c-1 0-2-.3-2.5-1v.1a4.5 4.5 0 003.5 4.4 4.5 4.5 0 01-2 .1 4.5 4.5 0 004.2 3A9 9 0 012 19c2 1 4 1.5 6.5 1.5 7.5 0 12-6 12-12v-.5a8.5 8.5 0 002-2.5z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span>{personalData.twitter}</span>
            </div>
          )}

          {/* LinkedIn */}
          {personalData.linkedin && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 3a1 1 0 011-1h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1V3zm4 4a2 2 0 100 4 2 2 0 000-4zm0 5v7h4v-7H8zm6 0v7h4v-4a2 2 0 00-4 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span>{personalData.linkedin}</span>
            </div>
          )}
        </section>
      )}



      {/* MAIN Content */}
      <main className="mt-6 space-y-6">

        
        {/* 3. Projects */}
        {!!projects.length && (
          <section className="border-t border-dotted border-gray-300 pt-4">
            <h3 className="text-sm font-semibold tracking-wide mb-2">
              PROJECTS
            </h3>
            <div className="space-y-4 text-sm">
              {projects.map((proj, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">
                      {proj.website ? (
                        <a
                          href={proj.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {proj.name}
                        </a>
                      ) : (
                        proj.name
                      )}
                    </span>
                    <span className="text-gray-500">{proj.date}</span>
                  </div>
                  <p>{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Work Experience */}
        {!!experiences.length && (
          <section className="border-t border-dotted border-gray-300 pt-4">
            <h3 className="text-sm font-semibold tracking-wide mb-2">
              WORK EXPERIENCE
            </h3>
            <div className="space-y-4 text-sm">
              {experiences.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {exp.company}, {exp.location}
                    </span>
                    <span className="text-gray-500">{exp.dateRange}</span>
                  </div>
                  <p className="italic text-gray-800 mb-2">{exp.position}</p>
                  {exp.description && (
                    <ul className="list-disc list-inside space-y-1">
                      {exp.description.split(",").map((detail, i) => (
                        <li key={i}>{detail.trim()}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Skills */}
        {!!skills.length && (
          <section className="border-t border-dotted border-gray-300 pt-4">
            <h3 className="text-sm font-semibold tracking-wide mb-2">SKILLS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="font-medium mb-1">{skill.heading}</div>
                  {/* Display all items in one line, separated by commas */}
                  {skill.items && (
                    <p>
                      {skill.items
                        .split(",")
                        .map((item) => item.trim())
                        .join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {/* 6. Education */}
        {!!educations.length && (
          <section className="border-t border-dotted border-gray-300 pt-4">
            <h3 className="text-sm font-semibold tracking-wide mb-2">
              EDUCATION
            </h3>
            <div className="space-y-3 text-sm">
              {educations.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{edu.institute}</div>
                      <p>
                        {edu.typeofstudy} in {edu.areaofstudy}
                      </p>
                    </div>
                    <div className="text-right text-gray-500">
                      <span className="block">{edu.dateRange}</span>
                      {edu.score && (
                        <span className="block text-gray-700">
                          {edu.score}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        
        {/* 7. Awards */}
        {!!achievements.length && (
          <section className="border-t border-dotted border-gray-300 pt-4">
            <h3 className="text-sm font-semibold tracking-wide mb-2">AWARDS</h3>
            <div className="space-y-2 text-sm">
              {achievements.map((achievement, index) => (
                <div key={index}>
                  <div className="font-medium">{achievement.name}</div>
                  <p className="text-gray-700">{achievement.details}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Certifications & Languages */}
        {(!!certificates.length || !!languages.length) && (
          <section className="border-t border-dotted border-gray-300 pt-4">
            <h3 className="text-sm font-semibold tracking-wide mb-2">
              CERTIFICATIONS & LANGUAGES
            </h3>

            {/* CERTIFICATIONS */}
            {!!certificates.length && (
              <div className="space-y-2 text-sm mb-6">
                <h4 className="font-medium mb-2">Certifications</h4>
                {certificates.map((certificate, index) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span className="font-medium">{certificate.title}</span>
                      <span className="text-gray-500">{certificate.date}</span>
                    </div>
                    <p>{certificate.awarder}</p>
                  </div>
                ))}
              </div>
            )}

            {/* LANGUAGES */}
            {!!languages.length && (
              <div className="space-y-2 text-sm">
                <h4 className="font-medium mb-2">Languages</h4>
                {languages.map((language, index) => (
                  <div key={index}>
                    <div className="font-medium">{language.heading}</div>
                    <p>{language.option}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
