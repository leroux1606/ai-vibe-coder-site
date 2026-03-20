import Section from "../ui/Section";
import Button from "../ui/Button";

export default function Contact({ profile }) {
  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let's design your next analytics narrative"
      subtitle="Ready to translate data into enterprise-ready decisions."
    >
      <div className="contact-grid">
        <div className="contact-item">
          <span>Email</span>
          <strong>{profile.contact.email}</strong>
        </div>
        <div className="contact-item">
          <span>Phone</span>
          <strong>{profile.contact.phone}</strong>
        </div>
        <div className="contact-item">
          <span>LinkedIn</span>
          <strong>{profile.contact.linkedin}</strong>
        </div>
      </div>
      <div className="hero-actions" style={{ marginTop: "24px" }}>
        <Button href={`mailto:${profile.contact.email}`}>
          Start a conversation
        </Button>
        <Button
          href={`https://${profile.contact.linkedin}`}
          target="_blank"
          rel="noreferrer"
          variant="secondary"
        >
          Connect on LinkedIn
        </Button>
      </div>
    </Section>
  );
}
