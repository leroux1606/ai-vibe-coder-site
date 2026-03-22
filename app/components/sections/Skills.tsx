import type { Profile } from "../../types/profile";
import Section from "../ui/Section";
import Tag from "../ui/Tag";

export default function Skills({ profile }: { profile: Profile }) {
  return (
    <Section
      id="skills"
      eyebrow="Capability Stack"
      title="BI, data, and financial intelligence"
      subtitle="A toolkit tuned for enterprise-grade decisioning."
    >
      <div className="skills-grid">
        {profile.skills.map((group) => (
          <div className="skills-group" key={group.category}>
            <div className="skills-title">{group.category}</div>
            <div className="skills-list">
              {group.items.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
