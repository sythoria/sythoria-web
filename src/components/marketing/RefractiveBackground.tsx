export default function RefractiveBackground() {
  return (
    <div
      className="refractive-background pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-landing-bg"
      aria-hidden="true"
    >
      <div className="dot-grid-bg absolute inset-0" />
      <div
        className="refractive-orb absolute left-1/2 top-1/2 h-[70vh] w-[70vw] rounded-full blur-[120px] transform-gpu will-change-transform"
        style={{
          background:
            "radial-gradient(circle, var(--color-glow-primary), transparent 70%)",
          opacity: 0.35,
        }}
      />
      <div
        className="refractive-orb refractive-orb-secondary absolute bottom-[10%] right-[10%] h-[40vh] w-[40vw] rounded-full blur-[100px] transform-gpu will-change-transform"
        style={{
          background:
            "radial-gradient(circle, var(--color-glow-secondary), transparent 70%)",
          opacity: 0.25,
        }}
      />
      <div className="noise-overlay absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" />
    </div>
  );
}
