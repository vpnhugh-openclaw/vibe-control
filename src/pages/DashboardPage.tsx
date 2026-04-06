import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards placeholder */}
        {["Total Projects", "Active", "Stalled", "Needing Attention"].map((label) => (
          <div key={label} className="bg-card card-shadow rounded-lg p-5">
            <p className="text-label text-muted-foreground">{label}</p>
            <p className="text-page-title font-semibold tabular-nums mt-1">—</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="bg-card card-shadow rounded-lg p-5 min-h-[200px]">
          <h2 className="text-section-heading font-semibold mb-4">Platform Distribution</h2>
          <p className="text-muted-foreground text-body">Chart loading…</p>
        </div>
        <div className="bg-card card-shadow rounded-lg p-5 min-h-[200px]">
          <h2 className="text-section-heading font-semibold mb-4">Account Distribution</h2>
          <p className="text-muted-foreground text-body">Chart loading…</p>
        </div>
      </div>

      <div className="mt-6 bg-card card-shadow rounded-lg p-5">
        <h2 className="text-section-heading font-semibold mb-4">Rescue Ranking</h2>
        <p className="text-muted-foreground text-body">Projects needing rescue will appear here.</p>
      </div>
    </AppShell>
  );
}
