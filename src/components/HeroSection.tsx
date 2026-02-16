import React, { Suspense, lazy, memo } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const Scene3D = lazy(() => import('./Scene3D'));

const HeroSection = memo(() => {
  const sectionRef = useScrollReveal();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      ref={sectionRef}
    >
      {/* 3D Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <Suspense fallback={<div className="w-full h-full bg-off-white" />}>
          <Scene3D />
        </Suspense>
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--silver) / 0.08) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--silver) / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="container relative z-10 py-20 md:py-0">
        <div className="max-w-4xl">
          {/* Section marker */}
          <div className="reveal flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-racing-red" />
            <span className="text-xs font-body uppercase tracking-[0.3em] text-muted-foreground">
              Intelligence Engine
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-reveal font-display font-bold text-foreground leading-[0.95] tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            Engineering
            <br />
            Intelligent Systems
            <br />
            <span className="relative inline-block">
              at Scale
              <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-racing-red text-reveal-delay-2" style={{ animation: 'textReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards', opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left' }} />
            </span>
            <span className="text-racing-red">.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-reveal text-reveal-delay-1 font-body text-muted-foreground text-base sm:text-lg md:text-xl mt-8 max-w-2xl leading-relaxed">
            AI Agents · LLM Architectures · Distributed Systems · Performance-Driven Engineering
          </p>

          {/* CTAs */}
          <div className="text-reveal text-reveal-delay-2 flex flex-wrap gap-4 mt-10">
            <button
              onClick={() => scrollToSection('projects')}
              className="group font-display text-sm uppercase tracking-[0.15em] px-6 py-3 bg-foreground text-background hover:bg-racing-red transition-colors duration-200"
            >
              View Systems
              <span className="inline-block ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
            <a
              href="/Savio_Resume_5-12-2025.pdf"
              className="font-display text-sm uppercase tracking-[0.15em] px-6 py-3 border border-silver text-foreground hover:border-racing-red hover:text-racing-red transition-colors duration-200"
            >
              Download Resume
            </a>
            <button
              onClick={() => scrollToSection('contact')}
              className="font-display text-sm uppercase tracking-[0.15em] px-6 py-3 text-muted-foreground hover:text-racing-red transition-colors duration-200"
            >
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-reveal text-reveal-delay-3">
        <span className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground">Scroll</span>
        <div className="w-px h-8 bg-silver scroll-indicator" />
      </div> */}
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;
