import type { ReactNode } from "react";
import Container from "./Container";

export default function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={["section", className].filter(Boolean).join(" ")}
    >
      <Container>
        {(eyebrow || title || subtitle) && (
          <div className="section-header">
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            {title ? <h2 className="section-title">{title}</h2> : null}
            {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
