// Re-mounts on every route change so each page gets a soft entrance.
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
