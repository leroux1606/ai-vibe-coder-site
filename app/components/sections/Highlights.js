import Section from "../ui/Section";

export default function Highlights({ profile }) {
  return (
    <Section
      id="highlights"
      eyebrow="Project Highlights"
      title="Enterprise impact across industries"
      subtitle="A blend of financial insight, ERP reporting, and analytics delivery."
    >
      <div className="highlights-grid">
        {profile.projects.map((project) => (
          <div className="highlight-card" key={project}>
            <h3 className="timeline-title">{project.split(" - ")[0]?.trim()}</h3>
            <p className="section-subtitle">
              {project.split(" - ").slice(1).join(" - ").trim()}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
