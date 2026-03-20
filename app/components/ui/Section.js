import Container from "./Container";

export default function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <section id={id} className={`section ${className}`.trim()}>
      <Container>
        {(eyebrow || title || subtitle) && (
          <div className="section-header">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
