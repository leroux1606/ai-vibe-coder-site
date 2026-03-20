import { profile } from "./content/profile";
import SiteNav from "./components/ui/SiteNav";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Journey from "./components/sections/Journey";
import Skills from "./components/sections/Skills";
import Highlights from "./components/sections/Highlights";
import Portfolio from "./components/sections/Portfolio";
import Credentials from "./components/sections/Credentials";
import Contact from "./components/sections/Contact";
import Footer from "./components/sections/Footer";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteNav name={profile.name} />
      <main className="page" id="main">
        <div className="page-inner">
          <Hero profile={profile} />
          <About profile={profile} />
          <Journey profile={profile} />
          <Skills profile={profile} />
          <Highlights profile={profile} />
          <Portfolio profile={profile} />
          <Credentials profile={profile} />
          <Contact profile={profile} />
          <Footer profile={profile} />
        </div>
      </main>
    </>
  );
}
