export default function ControlsContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-y-6 sm:flex-row sm:justify-between sm:gap-x-4 sm:gap-y-0">{children}</div>
  );
}
