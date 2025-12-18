export default function ControlsContainer({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-center justify-between gap-4">{children}</div>;
}
