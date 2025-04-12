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

export default function Pikachu() {
  const { personalData } = usePersonalDataStore();
  const { certificates } = useCertificateStore();
  const { achievements } = useAchievementStore();
  const { experiences } = useExperienceStore();
  const { educations } = useEducationStore();
  const { projects } = useProjectStore();
  const { languages } = useLanguageStore();
  const { skills } = useSkillStore();

  return (
    <div className="bg-white text-gray-800 max-w-4xl mx-auto p-8 font-serif">
      {/* Header */}
      <header className="text-center mb-8 space-y-1">
        <h1 className="text-4xl font-bold text-gray-900">{personalData.name}</h1>
        <h2 className="text-sm text-gray-600">{personalData.headline}</h2>

        {(personalData.address ||
          personalData.phone ||
          personalData.github ||
          personalData.email ||
          personalData.twitter ||
          personalData.linkedin) && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm mt-3">
            {personalData.address && (
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 text-indigo-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zm0 18v-8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>{personalData.address}</p>
              </div>
            )}
            {personalData.phone && (
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 text-indigo-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 5l4-1 2 3-3 4 5 5 4-3 3 2-1 4H5L3 5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>{personalData.phone}</p>
              </div>
            )}
            {personalData.github && (
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 text-indigo-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 2a10 10 0 00-3 19.5V19a3.5 3.5 0 00-1-2.5c1.5 0 2.5 1.5 2.5 2 0 1 1 1 2 1s2 0 2-1c0-0.5 1-2 2.5-2a3.5 3.5 0 00-1 2.5v2.5a10 10 0 00-3-19.5z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <p>{personalData.github}</p>
              </div>
            )}
            {personalData.email && (
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 text-indigo-500"
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
                <p>{personalData.email}</p>
              </div>
            )}
            {personalData.twitter && (
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 text-indigo-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M22 4.5a9 9 0 01-2.6.7 4.5 4.5 0 00-7.7 4c-4 0-7.5-2-10-5a4.5 4.5 0 001.5 6c-1 0-2-.3-2.5-1v.1a4.5 4.5 0 003.5 4.4 4.5 4.5 0 01-2 .1 4.5 4.5 0 004.2 3A9 9 0 012 19c2 1 4 1.5 6.5 1.5 7.5 0 12-6 12-12v-.5a8.5 8.5 0 002-2.5z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <p>{personalData.twitter}</p>
              </div>
            )}
            {personalData.linkedin && (
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 text-indigo-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M4 3a1 1 0 011-1h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1V3zm4 4a2 2 0 100 4 2 2 0 000-4zm0 5v7h4v-7H8zm6 0v7h4v-4a2 2 0 00-4 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <p>{personalData.linkedin}</p>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="space-y-10 text-sm">
        {/* EDUCATION FIRST */}
        {!!educations.length && (
          <section>
            <h3 className="text-xs text-gray-700 font-bold uppercase border-b border-indigo-100 tracking-widest pb-1 mb-4">
              Education
            </h3>
            <div className="space-y-4">
              {educations.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <div>
                      <div className="font-semibold">{edu.institute}</div>
                      <div>
                        {edu.typeofstudy} in {edu.areaofstudy}
                      </div>
                    </div>
                    <div className="text-gray-500 text-right">
                      <span className="block">{edu.dateRange}</span>
                      {edu.score && (
                        <span className="block text-gray-700">{edu.score}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WORK EXPERIENCE SECOND */}
        {!!experiences.length && (
          <section>
            <h3 className="text-xs text-gray-700 font-bold uppercase border-b border-indigo-100 tracking-widest pb-1 mb-4">
              Work Experience
            </h3>
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {exp.company}, {exp.location}
                    </span>
                    <span className="text-gray-500">{exp.dateRange}</span>
                  </div>
                  <p className="italic text-gray-700 mb-2">{exp.position}</p>
                  {exp.description && (
                    <ul className="list-disc list-inside text-gray-700 space-y-1 pl-4">
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

        {/* AWARDS */}
        {!!achievements.length && (
          <section>
            <h3 className="text-xs text-gray-700 font-bold uppercase border-b border-indigo-100 tracking-widest pb-1 mb-4">
              Awards
            </h3>
            <div className="space-y-2">
              {achievements.map((achievement, index) => (
                <div key={index}>
                  <div className="font-semibold">{achievement.name}</div>
                  <p className="text-gray-700">{achievement.details}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {!!certificates.length && (
          <section>
            <h3 className="text-xs text-gray-700 font-bold uppercase border-b border-indigo-100 tracking-widest pb-1 mb-4">
              Certifications
            </h3>
            <div className="space-y-2">
              {certificates.map((certificate, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <span className="font-semibold">{certificate.title}</span>
                    <span className="text-gray-500">{certificate.date}</span>
                  </div>
                  <p className="text-gray-700">{certificate.awarder}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LANGUAGES */}
        {!!languages.length && (
          <section>
            <h3 className="text-xs text-gray-700 font-bold uppercase border-b border-indigo-100 tracking-widest pb-1 mb-4">
              Languages
            </h3>
            <div className="space-y-2">
              {languages.map((language, index) => (
                <div key={index}>
                  <div className="font-semibold">{language.heading}</div>
                  <p className="text-gray-700">{language.option}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SKILLS */}
        {!!skills.length && (
          <section>
            <h3 className="text-xs text-gray-700 font-bold uppercase border-b border-indigo-100 tracking-widest pb-1 mb-4">
              Skills
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="font-semibold mb-1">{skill.heading}</div>
                  {skill.items &&
                    skill.items.split(",").map((detail, i) => (
                      <p key={i} className="text-gray-700">
                        {detail.trim()}
                      </p>
                    ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS */}
        {!!projects.length && (
          <section>
            <h3 className="text-xs text-gray-700 font-bold uppercase border-b border-indigo-100 tracking-widest pb-1 mb-4">
              Projects
            </h3>
            <div className="space-y-4">
              {projects.map((proj, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">
                      {proj.website ? (
                        <a
                          href={proj.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-gray-800 hover:text-gray-600"
                        >
                          {proj.name}
                        </a>
                      ) : (
                        proj.name
                      )}
                    </span>
                    <span className="text-gray-500">{proj.date}</span>
                  </div>
                  <p className="text-gray-700">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
