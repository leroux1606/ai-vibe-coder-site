import type { Profile } from "../../types/profile";
import Container from "../ui/Container";

export default function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="footer">
      <Container>
        <p>
          © {new Date().getFullYear()} {profile.name}. Crafted with enterprise
          clarity and a modern edge.
        </p>
      </Container>
    </footer>
  );
}
