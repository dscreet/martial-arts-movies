export default function ControlsContainer({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-4 mb-6">{children}</div>;
}
