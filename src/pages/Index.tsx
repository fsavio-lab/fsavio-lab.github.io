import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ProjectsSection from '@/components/ProjectsSection';
import CapabilitiesSection from '@/components/CapabilitiesSection';
import MetricsSection from '@/components/MetricsSection';
import ContactSection from '@/components/ContactSection';

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProjectsSection />
      <CapabilitiesSection />
      <MetricsSection />
      <ContactSection />

      {/* Footer */}
      <footer className="py-8 border-t border-silver-light">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-body text-xs text-muted-foreground">
            © 2026 — Engineered with precision
          </span>
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-grey-300">
            Performance · Systems · Intelligence
          </span>
        </div>
      </footer>
    </main>
  );
};

export default Index;
