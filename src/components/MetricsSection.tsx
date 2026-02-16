import React, { memo } from 'react';
import { useScrollReveal, useCountUp } from '@/hooks/useScrollReveal';

const metrics = [
  { label: 'Systems Deployed', value: 3, suffix: '+' },
  { label: 'Latency Reduced', value: 40, suffix: '%' },
  { label: 'Production Integrations', value: 10, suffix: '+' },
  { label: 'Models Integrated', value: 5, suffix: '+' },
  { label: 'Performance Gains', value: 2, suffix: 'x' },
];

function MetricItem({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  const countRef = useCountUp(value);

  return (
    <div className="flex flex-col items-center text-center px-4 py-6 md:py-8">
      <div className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-2">
        <span ref={countRef}>0</span>
        <span className="text-racing-red">{suffix}</span>
      </div>
      <div className="w-8 h-px bg-racing-red mb-3" />
      <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

const MetricsSection = memo(() => {
  const sectionRef = useScrollReveal();

  return (
    <section id="metrics" className="py-16 md:py-20 bg-off-white border-y border-silver-light" ref={sectionRef}>
      <div className="container">
        {/* Section marker */}
        <div className="reveal flex items-center gap-3 mb-10">
          <div className="w-8 h-px bg-racing-red" />
          <span className="text-xs font-body uppercase tracking-[0.3em] text-muted-foreground">
            04 — Performance Dashboard
          </span>
        </div>

        {/* Metrics strip */}
        <div className="reveal grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-silver-light">
          {metrics.map((m) => (
            <MetricItem key={m.label} {...m} />
          ))}
        </div>
      </div>
    </section>
  );
});

MetricsSection.displayName = 'MetricsSection';
export default MetricsSection;
