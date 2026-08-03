export default function SpatialCanvas({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="relative z-10 min-h-screen w-full">{children}</div>;
}
