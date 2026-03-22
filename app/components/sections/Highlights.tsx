import type { Profile } from "../../types/profile";
import Section from "../ui/Section";

export default function Highlights({ profile }: { profile: Profile }) {
  return (
    <Section
      id="highlights"
      eyebrow="Project Highlights"
      title="Enterprise impact across industries"
      subtitle="A blend of financial insight, ERP reporting, and analytics delivery."
    >
      <div className="highlights-grid">
        {profile.projects.map((project) => (
          <div className="highlight-card" key={project.client}>
            <h3 className="timeline-title">{project.client}</h3>
            <p className="section-subtitle">{project.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
