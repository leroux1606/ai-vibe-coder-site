import Section from "../ui/Section";
import DigitalTwinChat from "./DigitalTwinChat";

export default function DigitalTwinSection() {
  return (
    <Section
      id="digital-twin"
      eyebrow="Interactive"
      title="Chat with my digital twin"
      subtitle="Ask questions about my career, skills, and experience. Answers are grounded in this portfolio’s profile."
    >
      <DigitalTwinChat />
    </Section>
  );
}
