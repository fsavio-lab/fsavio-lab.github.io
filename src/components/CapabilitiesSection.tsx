import React, { memo } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const columns = [
  {
    title: 'AI / LLM Engineering',
    skills: [
      { name: 'RAG Architecture', desc: 'Designed multi-stage retrieval pipelines with hybrid search scoring and context-aware chunking.' },
      { name: 'Prompt Engineering', desc: 'Built systematic prompt frameworks reducing hallucination rates by 40% in production systems.' },
      { name: 'Agent Orchestration', desc: 'Architected multi-agent systems with hierarchical task decomposition and shared memory.' },
      { name: 'Multi-LLM Systems', desc: 'Implemented intelligent model routing based on cost, latency, and task complexity constraints.' },
      { name: 'Tool Integration', desc: 'Developed extensible tool-calling frameworks with schema validation and error recovery.' },
      { name: 'Memory Design', desc: 'Engineered short/long-term memory systems with semantic compression and relevance decay.' },
    ],
  },
  {
    title: 'Systems Engineering',
    skills: [
      { name: 'Distributed Systems', desc: 'Built fault-tolerant architectures handling 10M+ daily requests with graceful degradation.' },
      { name: 'Performance Optimization', desc: 'Achieved 60% latency reduction through profiling-driven optimization and caching strategies.' },
      { name: 'Async Pipelines', desc: 'Designed event-driven processing with backpressure control and exactly-once delivery.' },
      { name: 'API Architecture', desc: 'Created versioned API platforms with rate limiting, circuit breaking, and request coalescing.' },
      { name: 'Observability', desc: 'Implemented end-to-end tracing, custom metrics, and automated anomaly detection.' },
      { name: 'Scalability Patterns', desc: 'Applied CQRS, event sourcing, and partition-tolerant designs for horizontal scaling.' },
    ],
  },
  {
    title: 'Frontend Engineering',
    skills: [
      { name: 'High-Performance UI', desc: 'Built interfaces rendering 60fps with virtualized lists and optimized re-render paths.' },
      { name: '3D Optimization', desc: 'Implemented lazy-loaded WebGL scenes with demand-driven rendering and LOD management.' },
      { name: 'Microinteraction Design', desc: 'Crafted GPU-accelerated animations with sub-16ms frame budgets.' },
      { name: 'Rendering Performance', desc: 'Reduced bundle sizes by 45% through code splitting, tree shaking, and dynamic imports.' },
    ],
  },
];

const CapabilitiesSection = memo(() => {
  const sectionRef = useScrollReveal();

  return (
    <section id="capabilities" className="py-24 md:py-32" ref={sectionRef}>
      <div className="container">
        {/* Section header */}
        <div className="reveal mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-racing-red" />
            <span className="text-xs font-body uppercase tracking-[0.3em] text-muted-foreground">
              03 — Systems Thinking
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
            Capabilities
          </h2>
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {columns.map((col, colIdx) => (
            <div key={col.title} className="reveal reveal-delay-${colIdx + 1}">
              <h3 className="font-display font-bold text-lg text-foreground mb-6 pb-3 border-b border-silver">
                {col.title}
              </h3>
              <div className="space-y-5">
                {col.skills.map((skill) => (
                  <div key={skill.name} className="group">
                    <h4 className="font-display font-semibold text-sm text-foreground mb-1 red-underline cursor-default">
                      {skill.name}
                    </h4>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">
                      {skill.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

CapabilitiesSection.displayName = 'CapabilitiesSection';
export default CapabilitiesSection;
