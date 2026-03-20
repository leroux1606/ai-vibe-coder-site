import Container from "../ui/Container";
import Button from "../ui/Button";
import Tag from "../ui/Tag";

export default function Hero({ profile }) {
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
              <Button href="#portfolio" variant="secondary">
                View portfolio preview
              </Button>
              <Button href="/CVJan.pdf" variant="secondary" target="_blank" rel="noreferrer">
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
          <div className="hero-stats">
            {profile.metrics.map((metric) => (
              <div className="stat-card" key={metric.label}>
                <div className="stat-value">{metric.value}</div>
                <div className="stat-label">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </header>
  );
}
