import React, { memo } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ContactSection = memo(() => {
  const sectionRef = useScrollReveal();

  return (
    <section id="contact" className="py-24 md:py-32" ref={sectionRef}>
      <div className="container max-w-3xl">
        {/* Section marker */}
        <div className="reveal flex items-center gap-3 mb-10">
          <div className="w-8 h-px bg-racing-red" />
          <span className="text-xs font-body uppercase tracking-[0.3em] text-muted-foreground">
            05 — Let's Build
          </span>
        </div>

        <h2 className="reveal font-display font-bold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight mb-6">
          Ready to engineer
          <br />
          something exceptional<span className="text-racing-red">?</span>
        </h2>

        <p className="reveal reveal-delay-1 font-body text-muted-foreground text-base md:text-lg leading-relaxed mb-10 max-w-xl">
          I'm open to roles in AI/LLM engineering, systems architecture, and high-performance full-stack development. Let's talk.
        </p>

        <div className="reveal reveal-delay-2 flex flex-wrap gap-4 mb-12">
          <a
            href="mailto:fsavio27@gmail.com"
            className="group font-display text-sm uppercase tracking-[0.15em] px-6 py-3 bg-foreground text-background hover:bg-racing-red transition-colors duration-200"
          >
            Get in Touch
            <span className="inline-block ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
          <a
            href="/Savio_Resume_5-12-2025.pdf"
            className="font-display text-sm uppercase tracking-[0.15em] px-6 py-3 border border-silver text-foreground hover:border-racing-red hover:text-racing-red transition-colors duration-200"
          >
            Download Resume
          </a>
        </div>

        {/* Social links */}
        <div className="reveal reveal-delay-3 flex items-center gap-6 border-t border-silver-light pt-8">
          {[
            { label: 'GitHub', href: 'https://github.com/fsavio-lab' },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/savio-fernando/' },
            // { label: 'Twitter', href: '#' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-racing-red transition-colors duration-200 red-underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
});

ContactSection.displayName = 'ContactSection';
export default ContactSection;
