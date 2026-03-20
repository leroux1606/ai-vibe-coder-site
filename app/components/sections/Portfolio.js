import Section from "../ui/Section";

export default function Portfolio({ profile }) {
  return (
    <Section
      id="portfolio"
      eyebrow="Portfolio"
      title="Future-facing case studies"
      subtitle="Placeholders ready for upcoming work and showcase-ready dashboards."
    >
      <div className="portfolio-grid">
        {profile.portfolio.map((item) => (
          <div className="portfolio-card" key={item.title}>
            <h3 className="timeline-title">{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
