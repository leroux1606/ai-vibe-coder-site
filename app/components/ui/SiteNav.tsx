"use client";

import { useId, useState } from "react";
import { profile } from "../../content/profile";
import Container from "./Container";

const links = [
  { href: "#about", label: "About" },
  { href: "#journey", label: "Journey" },
  { href: "#skills", label: "Skills" },
  { href: "#digital-twin", label: "Digital twin" },
  { href: "#contact", label: "Contact" },
];

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const parts = (profile.name ?? "Profile").trim().split(/\s+/);
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
          <button
            type="button"
            className="nav-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((o) => !o)}
          >
            Menu
          </button>
          <div
            id={menuId}
            className={["nav-links", menuOpen ? "nav-links--open" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              CV
            </a>
          </div>
        </div>
      </Container>
    </nav>
  );
}
