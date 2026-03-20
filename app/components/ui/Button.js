export default function Button({
  children,
  href,
  variant = "primary",
  target,
  rel,
}) {
  const className = `button ${variant === "secondary" ? "secondary" : ""}`.trim();

  if (href) {
    return (
      <a className={className} href={href} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  return <button className={className}>{children}</button>;
}
