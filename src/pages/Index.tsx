import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Programs from "@/components/Programs";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Programs />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;