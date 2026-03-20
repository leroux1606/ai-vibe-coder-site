import Container from "../ui/Container";

export default function Footer({ profile }) {
  return (
    <footer className="footer">
      <Container>
        <p>
          (c) {new Date().getFullYear()} {profile.name}. Crafted with enterprise
          clarity and a modern edge.
        </p>
      </Container>
    </footer>
  );
}
