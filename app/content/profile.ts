import type { Profile } from "../types/profile";

export const profile: Profile = {
  name: "Jan Le Roux",
  title: "Data Analyst & BI Developer",
  location: "Centurion, South Africa",
  summary:
    "Enterprise-scale analytics leader with 23 years in BI development and 12 years in financial roles. Specializes in Power BI, DAX, semantic modeling, and financial dashboards that translate complex data into decisive narratives.",
  metrics: [
    { value: "23+ Years", label: "BI & Reporting" },
    { value: "12+ Years", label: "Finance Experience" },
    { value: "6 Years", label: "Power BI Delivery" },
  ],
  highlights: [
    "Databricks Certified Generative AI Engineer (Associate): lakehouse and generative AI on platform.",
    "Built executive-grade financial statements, KPIs, and profitability views in Power BI.",
    "Designed Azure Analysis Services tabular models and semantic layers.",
    "Optimized reporting pipelines using Databricks-backed datasets.",
    "Bridged finance and technology across public and private sector programs.",
  ],
  experience: [
    {
      company: "Decision Inc",
      role: "Data Analyst & Power BI Developer",
      period: "Jan 2022 - Present",
      achievements: [
        "Developed project management and financial reporting suites.",
        "Created Azure Analysis Services tabular models and semantic layers.",
        "Delivered advanced DAX measures and executive dashboards.",
        "Collaborated on Databricks-powered reporting initiatives.",
      ],
    },
    {
      company: "PBT Group",
      role: "BI Developer",
      period: "Jul 2021 - Dec 2021",
      achievements: [
        "Conducted SQL and Power BI analysis for customer usage insights.",
        "Partnered with stakeholders to align reporting requirements.",
        "Built transformation scripts and reusable reporting assets.",
      ],
    },
    {
      company: "Supply Chain Partner",
      role: "BI Developer & Data Analyst",
      period: "Nov 2017 - Jun 2021",
      achievements: [
        "Delivered KPI dashboards spanning finance, HR, and integration.",
        "Built Azure Data Factory pipelines within existing data estates.",
        "Supported NetSuite ERP implementation and analytics.",
      ],
    },
    {
      company: "Cutting Edge Commerce",
      role: "BI Developer",
      period: "Nov 2005 - Sep 2017",
      achievements: [
        "Maintained WebFOCUS platforms and application servers.",
        "Designed demo sites and data validation environments.",
        "Prepared ERP data for reporting and stakeholder demos.",
      ],
    },
    {
      company: "SITA",
      role: "Systems Analyst & Senior Analyst Programmer",
      period: "Aug 1990 - Oct 2005",
      achievements: [
        "Delivered procurement, finance, and HR reporting systems.",
        "Built extraction and load routines from Oracle platforms.",
        "Supported software configuration and cost analysis.",
      ],
    },
    {
      company: "South African Police Service",
      role: "Accountant",
      period: "Nov 1985 - Jul 1990",
      achievements: [
        "Managed salary, HR processing, and payroll adjustments.",
        "Oversaw promotions, increases, and staff movement tracking.",
      ],
    },
  ],
  skills: [
    {
      category: "Analytics & BI",
      items: [
        "Power BI Reporting",
        "DAX Measures",
        "Paginated Reports",
        "Semantic Models",
        "KPI Dashboards",
      ],
    },
    {
      category: "Data Engineering",
      items: [
        "Data Warehousing",
        "SQL Scripting",
        "ETL Processes",
        "Azure Data Factory",
        "Databricks (Lakehouse & Gen AI certified)",
      ],
    },
    {
      category: "Platforms & ERP",
      items: ["WebFOCUS", "SAP Reporting", "NetSuite ERP"],
    },
    {
      category: "Finance & Strategy",
      items: [
        "Financial Statements",
        "Cost Analysis",
        "Business Analysis",
        "Stakeholder Alignment",
      ],
    },
  ],
  education: {
    degree: "B Compt (Accountancy & Auditing)",
    school: "University of South Africa",
    year: "1996",
  },
  certifications: [
    "Databricks Certified Generative AI Engineer (Associate)",
    "AWS Certified Cloud Practitioner",
    "Databricks Fundamentals (Badge)",
    "Python PCEP (Entry-Level)",
    "AI Automation & Agents with n8n",
    "AI Agents Fundamentals (Hugging Face)",
    "Power BI Up & Running",
    "DAX Power Pivot",
    "Microsoft SQL from A to Z",
    "Project Management Principles & Practices",
    "Python for Finance",
  ],
  projects: [
    {
      client: "Anglo Gold",
      description: "Project management reporting from Dataverse.",
    },
    {
      client: "Old Mutual",
      description: "Financial dashboards and executive reporting.",
    },
    {
      client: "MTN",
      description: "Customer usage analytics and dashboards.",
    },
    {
      client: "Eskom & Sasol",
      description: "Procurement, HR, and finance reporting.",
    },
    {
      client: "South African Airways",
      description: "Procurement reporting optimizations.",
    },
    {
      client: "Anglo American Platinum",
      description: "Supply chain analytics from SAP.",
    },
  ],
  portfolio: [
    {
      title: "Executive Dashboards",
      description: "Coming soon - curated analytics packs for leaders.",
    },
    {
      title: "Financial Storytelling",
      description:
        "Coming soon - income statement and balance sheet narratives.",
    },
    {
      title: "Data Platform Playbooks",
      description: "Coming soon - repeatable BI delivery frameworks.",
    },
  ],
  // Contact fields are public in the client bundle (portfolio). Phone is linked as "Call" in Contact.tsx
  // with full number in aria-label / tel: href; adjust if you want stricter anti-scraping.
  contact: {
    email: "jan.leroux0@gmail.com",
    phone: "+27 (0) 82 927 6153",
    linkedin: "www.linkedin.com/in/jan-le-roux",
  },
  cvUrl: "/CV.pdf",
};
