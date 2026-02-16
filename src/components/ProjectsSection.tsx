import React, { memo } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const projects = [
  {
    name: 'RAG Engine',
    impact: 'Reduced inference latency by 35% through optimized embedding retrieval pipeline.',
    architecture: 'Hybrid vector search with cascading reranker, streaming response generation, and adaptive chunking strategies for multi-modal document ingestion.',
    stack: ['Python', 'LangChain', 'Mongo', 'FastAPI', 'Redis', "AWS", "Langgraph"],
    metric: '30% latency reduction',
  },
  {
    name: 'PlayVersus',
    impact: 'Developed a high-performance sports matchmaking engine enabling athletes to connect across football, cricket, and more, handling community interaction',
    architecture: 'Engineered a real-time connectivity layer using distributed tracing and async processing to sync player matchmaking, supported by custom auto-scaling triggers to handle peak athlete traffic.',
    stack: ['Flutter', 'FastAPI', 'Python', 'Redis', 'Async Processing'],
    metric: 'GAME CHANGER',
  },
  {
    name: 'India Fine Art',
    impact: 'Built an enterprise-grade online marketplace to showcase fine art pieces, providing an exquisite digital gallery snapshot through artworks.',
    architecture: 'Engineered a high-capacity catalog system using Frappe and Python to manage artwork data, integrated with Three.js for immersive, high-fidelity gallery previews.',
    stack: ['Python', 'Frappe', 'Payment Integration', 'React', 'Three.Js'],
    metric: '2M+ documents indexed',
  },
  {
    name: 'Enterprise Backoffice E-commerce Orchestration Platform',
    impact: 'Implemented a scalable backoffice commerce system powering multi-channel marketplace operations, streamlining order processing, delivery orchestration, and accounting workflows across high-volume marketplaces.',
    architecture: 'Architected a cloud-native workflow engine on AWS using Python and Frappe to centralize order ingestion from Amazon, Walmart, and Shopify. Designed event-driven processing pipelines for order lifecycle management, integrated 3PL warehouse systems for inventory sync and fulfillment tracking, and automated accounting reconciliation with real-time financial reporting.',
    stack: ['Python', 'Frappe', 'AWS (EC2, S3, RDS, SQS)', 'REST APIs', 'Marketplace Integrations', '3PL Integrations', 'Accounting Automation'],
    metric: '100K+ orders processed annually with 99.9% workflow reliability',
  },
];

const ProjectsSection = memo(() => {
  const sectionRef = useScrollReveal();

  return (
    <section id="projects" className="py-24 md:py-32 bg-off-white" ref={sectionRef}>
      <div className="container">
        {/* Section header */}
        <div className="reveal mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-racing-red" />
            <span className="text-xs font-body uppercase tracking-[0.3em] text-muted-foreground">
              02 — Architected Solutions
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
            Systems & AI Projects
          </h2>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, i) => (
            <div
              key={project.name}
              className={`reveal reveal-delay-${Math.min(i + 1, 4)} card-tilt shimmer-border group bg-background p-6 md:p-8`}
            >
              {/* Metric badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-racing-red" />
                <span className="text-xs font-body font-medium text-racing-red uppercase tracking-wider">
                  {project.metric}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-display font-bold text-xl md:text-2xl text-foreground mb-3 red-underline">
                {project.name}
              </h3>

              {/* Impact */}
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                {project.impact}
              </p>

              {/* Architecture */}
              <p className="font-body text-xs text-grey-400 leading-relaxed mb-6">
                {project.architecture}
              </p>

              {/* Stack */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-body uppercase tracking-wider px-2 py-1 border border-silver-light text-grey-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

ProjectsSection.displayName = 'ProjectsSection';
export default ProjectsSection;
