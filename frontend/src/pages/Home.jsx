import Hero from "../sections/Hero";
import FeaturedProperties from "../sections/FeaturedProperties";
import PropertyCategories from "../sections/PropertyCategories";
import WhyXevoprop from "../sections/WhyXevoprop";
import HowItWorks from "../sections/HowItWorks";
import IntelligentDiscovery from "../sections/IntelligentDiscovery";
import ForDevelopers from "../sections/ForDevelopers";
import FinalCTA from "../sections/FinalCTA";

function Home() {
  return (
    <>
      <Hero />
      <FeaturedProperties />
      <PropertyCategories />
      <WhyXevoprop />
      <HowItWorks />
      <IntelligentDiscovery />
      <ForDevelopers />
      <FinalCTA />
    </>
  );
}

export default Home;