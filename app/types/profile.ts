export interface Metric {
  value: string;
  label: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  achievements: string[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Contact {
  email: string;
  phone: string;
  linkedin: string;
}

/** Client-facing project / client name + description (avoids fragile string splitting in UI). */
export interface ProjectHighlight {
  client: string;
  description: string;
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  summary: string;
  metrics: Metric[];
  highlights: string[];
  experience: Experience[];
  skills: SkillGroup[];
  education: Education;
  certifications: string[];
  projects: ProjectHighlight[];
  contact: Contact;
  /** Path to downloadable CV (served from /public). */
  cvUrl: string;
}
