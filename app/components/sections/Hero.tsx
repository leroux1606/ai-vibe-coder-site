import type { Profile } from "../../types/profile";
import Container from "../ui/Container";
import Button from "../ui/Button";
import Tag from "../ui/Tag";

export default function Hero({ profile }: { profile: Profile }) {
  return (
    <header className="hero">
      <Container>
        <div className="hero-grid">
          <div>
            <Tag>Enterprise BI | Edgy Narrative</Tag>
            <h1 className="hero-title">
              {profile.name} <span>{profile.title}</span>
            </h1>
            <p className="hero-copy">{profile.summary}</p>
            <div className="hero-actions">
              <Button href="#contact">Start a conversation</Button>
              <Button href="#highlights" variant="secondary">
                Career highlights
              </Button>
              <Button
                href={profile.cvUrl}
                variant="secondary"
                target="_blank"
                rel="noreferrer"
              >
                Download CV (PDF)
              </Button>
            </div>
            <div className="hero-actions">
              <Button
                href={`mailto:${profile.contact.email}`}
                variant="secondary"
              >
                {profile.contact.email}
              </Button>
              <Button
                href={`https://${profile.contact.linkedin}`}
                target="_blank"
                rel="noreferrer"
                variant="secondary"
              >
                LinkedIn
              </Button>
            </div>
          </div>
          <ul className="stat-list" aria-label="Career metrics">
            {profile.metrics.map((metric) => (
              <li key={metric.label}>
                <div
                  className="stat-card"
                  aria-label={`${metric.label}: ${metric.value}`}
                >
                  <div className="stat-value">{metric.value}</div>
                  <div className="stat-label">{metric.label}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </header>
  );
}
