/**
 * A labelled diagram, not a screenshot: how a change ships on infrastructure
 * we set up. Each step is a cloud deliverable from site.ts `pricing`
 * ("Basic CI/CD pipeline configuration", "Staging, production, and preview
 * environments", "Uptime monitoring & alerting") and services.ts ("Automated
 * build, test, and deploy pipelines"; "Know exactly what's happening in your
 * infrastructure before your clients do"). Same visual language as the layer
 * stack: a hairline window, window chrome, one red request path.
 */
const STEPS = [
  { label: 'Commit', x: 40, y: 110 },
  { label: 'Build and test', x: 230, y: 110 },
  { label: 'Staging or preview', x: 420, y: 110 },
  { label: 'Production', x: 420, y: 250 },
  { label: 'Monitoring', x: 230, y: 250 },
] as const;

const BOX = { w: 150, h: 50 };
const FONT = 'var(--font-dm-sans), sans-serif';

export default function PipelineDiagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 610 380" role="img" aria-labelledby="pipeline-title">
      <title id="pipeline-title">
        Diagram: how a change ships on infrastructure we set up. A commit is built and tested automatically, goes to
        staging or a preview environment, then to production, where uptime monitoring and alerts watch it. What
        monitoring finds feeds the next change.
      </title>
      <rect x="0" y="0" width="610" height="380" fill="#121114" />
      {/* Window chrome */}
      <path d="M0 44.5H610" stroke="rgba(245,242,238,0.1)" />
      <g fill="rgba(245,242,238,0.3)">
        <circle cx="26" cy="22" r="4" />
        <circle cx="40" cy="22" r="4" />
        <circle cx="54" cy="22" r="4" />
      </g>
      <text x="74" y="26.5" fill="#ff5c73" fontSize="12" letterSpacing="1" fontFamily={FONT}>
        PIPELINE
      </text>
      <text
        x="584"
        y="26.5"
        textAnchor="end"
        fill="rgba(245,242,238,0.66)"
        fontSize="12"
        letterSpacing="1"
        fontFamily={FONT}
      >
        EVERY CHANGE
      </text>
      {/* The path a change travels */}
      <g stroke="#F03350" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M190 135H230M380 135H420M495 160V250M420 275H380" />
        <path d="M222 129l8 6-8 6M412 129l8 6-8 6M489 242l6 8 6-8M388 269l-8 6 8 6" />
      </g>
      <path d="M230 275H115V160" fill="none" stroke="rgba(245,242,238,0.42)" strokeWidth="1.5" strokeDasharray="5 6" />
      {STEPS.map((step) => (
        <g key={step.label}>
          <rect
            x={step.x}
            y={step.y}
            width={BOX.w}
            height={BOX.h}
            rx="8"
            fill="#1a171c"
            stroke="rgba(245,242,238,0.26)"
          />
          <text
            x={step.x + BOX.w / 2}
            y={step.y + 30}
            textAnchor="middle"
            fill="#F5F2EE"
            fontSize="15"
            fontFamily={FONT}
          >
            {step.label}
          </text>
        </g>
      ))}
      <text x="40" y="350" fill="rgba(245,242,238,0.7)" fontSize="13" fontFamily={FONT}>
        Deployed by the pipeline, then monitored: you know before your client does.
      </text>
    </svg>
  );
}
