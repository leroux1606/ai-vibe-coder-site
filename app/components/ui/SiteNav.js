import Container from "./Container";

const links = [
  { href: "#about", label: "About" },
  { href: "#journey", label: "Journey" },
  { href: "#skills", label: "Skills" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#contact", label: "Contact" },
];

export default function SiteNav({ name }) {
  const parts = (name ?? "Profile").trim().split(/\s+/);
  const first = parts[0] ?? "Profile";
  const rest = parts.slice(1).join(" ");

  return (
    <nav className="site-nav" aria-label="Primary">
      <Container>
        <div className="site-nav-inner">
          <a href="#" className="nav-brand">
            {first}
            {rest ? (
              <>
                {" "}
                <span>{rest}</span>
              </>
            ) : null}
          </a>
          <div className="nav-links">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
            <a href="/CVJan.pdf" target="_blank" rel="noreferrer">
              CV
            </a>
          </div>
        </div>
      </Container>
    </nav>
  );
}
