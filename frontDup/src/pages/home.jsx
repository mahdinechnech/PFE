import PourquoiNous from "../components/about";
import Footer from "../components/contact";
import Hero from "../components/hero";
import Navbar from "../components/navbar";
import Categories from "../components/services";
import Testimonials from "../components/testimonials";
import ServicesFeed from "../components/ServicesFeed";
import AnnoncesFeed from "../components/AnnoncesFeed";

export default function Home() {
  return (
    <div>
      <Navbar
        showLinks={true}
        showAuth={true}
        showSidebar={true}
        showCreate={true}
      />
      <Hero />
      <ServicesFeed />
      <AnnoncesFeed />
      <Categories />
      <PourquoiNous />
      <Testimonials />
      <Footer />
    </div>
  );
}
