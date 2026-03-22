import type { Profile } from "../../types/profile";
import Section from "../ui/Section";

export default function Journey({ profile }: { profile: Profile }) {
  return (
    <Section
      id="journey"
      eyebrow="Career Journey"
      title="A track record built on momentum"
      subtitle="From finance to enterprise BI, each role sharpened the craft."
    >
      <div className="timeline">
        {profile.experience.map((role) => (
          <div className="timeline-item" key={`${role.company}-${role.period}`}>
            <div className="timeline-meta">
              <span>{role.period}</span>
              <span>{role.company}</span>
            </div>
            <div className="timeline-title">{role.role}</div>
            <ul className="timeline-list">
              {role.achievements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
