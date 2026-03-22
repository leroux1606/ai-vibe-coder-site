import type { Profile } from "../../types/profile";
import Section from "../ui/Section";
import Button from "../ui/Button";

function telHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export default function Contact({ profile }: { profile: Profile }) {
  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let's design your next analytics narrative"
      subtitle="Ready to translate data into enterprise-ready decisions."
    >
      <dl className="contact-details">
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${profile.contact.email}`}>
              {profile.contact.email}
            </a>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            <a
              href={telHref(profile.contact.phone)}
              aria-label={`Phone number ${profile.contact.phone}`}
            >
              Call
            </a>
          </dd>
        </div>
        <div>
          <dt>LinkedIn</dt>
          <dd>
            <a
              href={`https://${profile.contact.linkedin}`}
              target="_blank"
              rel="noreferrer"
            >
              Profile link
            </a>
          </dd>
        </div>
      </dl>
      <div className="hero-actions u-mt-24">
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
