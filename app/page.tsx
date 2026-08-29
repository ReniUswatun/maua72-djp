import { Footer } from "@/components/landing/Footer";
import { CtaAkhir, ForWho, Testimoni, YangDidapat } from "@/components/landing/ForWho";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks, Statistik } from "@/components/landing/HowItWorks";
import { PillarsGrid } from "@/components/landing/PillarsGrid";
import { Navbar } from "@/components/shared/Navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="konten-utama">
        <Hero />
        <Statistik />
        <HowItWorks />
        <PillarsGrid />
        <ForWho />
        <YangDidapat />
        <Testimoni />
        <CtaAkhir />
      </main>
      <Footer />
    </>
  );
}
