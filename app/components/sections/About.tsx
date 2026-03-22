import type { Profile } from "../../types/profile";
import Section from "../ui/Section";
import Card from "../ui/Card";
import Tag from "../ui/Tag";

export default function About({ profile }: { profile: Profile }) {
  return (
    <Section
      id="about"
      eyebrow="About"
      title="Precision analytics with an edge"
      subtitle="A finance-rooted BI leader translating complex data into decisions."
    >
      <div className="split-grid">
        <Card>
          <p>{profile.summary}</p>
          <div className="u-mt-20 u-flex-gap-12">
            <Tag>{profile.location}</Tag>
            <Tag>{profile.education.degree}</Tag>
          </div>
        </Card>
        <Card>
          <h3 className="timeline-title">Education</h3>
          <p>{profile.education.degree}</p>
          <p className="section-subtitle">
            {profile.education.school} | {profile.education.year}
          </p>
          <div className="u-mt-16">
            <h4 className="timeline-title">Core Focus</h4>
            <p className="section-subtitle">
              Financial dashboards, semantic modeling, and high-stakes reporting
              environments across public and private sectors.
            </p>
          </div>
          <ul className="timeline-list u-mt-20">
            {profile.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </Section>
  );
}
