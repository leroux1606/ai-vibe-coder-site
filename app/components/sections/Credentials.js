import Section from "../ui/Section";
import Tag from "../ui/Tag";

export default function Credentials({ profile }) {
  return (
    <Section
      id="credentials"
      eyebrow="Training & Certifications"
      title="Continuously sharpened expertise"
      subtitle="Hands-on learning across cloud, AI, and analytics."
    >
      <div className="skills-list">
        {profile.certifications.map((item) => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </Section>
  );
}
