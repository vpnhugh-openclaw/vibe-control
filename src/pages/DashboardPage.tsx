import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { AccountBadge } from "@/components/AccountBadge";
import { RescueScoreArc } from "@/components/RescueScoreArc";
import { seedProjects, seedUpdates } from "@/lib/seedData";
import { timeAgo } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const ACCENT_COLORS = ["#7c5cfc", "#22d3ee", "#f59e0b", "#4ade80", "#f87171", "#8a8680"];

export default function DashboardPage() {
  const total = seedProjects.length;
  const active = seedProjects.filter((p) => ["building", "testing", "launched"].includes(p.status)).length;
  const stalled = seedProjects.filter((p) => p.is_stalled).length;
  const needingAttention = seedProjects.filter(
    (p) => p.is_stalled && new Date(p.last_active_date) < new Date(Date.now() - 14 * 86400000) && !p.next_action
  ).length;

  const kpis = [
    { label: "Total Projects", value: total },
    { label: "Active", value: active },
    { label: "Stalled", value: stalled },
    { label: "Needing Attention", value: needingAttention },
  ];

  // Sparkline data (mock 7 days)
  const sparkline = [3, 5, 4, 6, 5, 7, 4].map((v, i) => ({ day: i, value: v }));

  // Platform distribution
  const platformCounts: Record<string, number> = {};
  seedProjects.forEach((p) => { platformCounts[p.platform_name] = (platformCounts[p.platform_name] || 0) + 1; });
  const platformData = Object.entries(platformCounts).map(([name, value]) => ({ name, value }));

  // Account distribution
  const accountCounts: Record<string, number> = {};
  seedProjects.forEach((p) => { accountCounts[p.account_label] = (accountCounts[p.account_label] || 0) + 1; });
  const accountData = Object.entries(accountCounts).map(([name, value]) => ({ name, value }));

  // Rescue ranking
  const rescueProjects = seedProjects
    .filter((p) => ["stalled", "paused"].includes(p.status))
    .sort((a, b) => b.rescue_score - a.rescue_score)
    .slice(0, 5);

  // Attention list
  const attentionProjects = seedProjects
    .filter((p) => new Date(p.last_active_date) < new Date(Date.now() - 14 * 86400000))
    .sort((a, b) => new Date(a.last_active_date).getTime() - new Date(b.last_active_date).getTime());

  return (
    <AppShell title="Dashboard">
      {/* Row 1: KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card card-shadow rounded-lg p-5">
            <p className="text-label text-muted-foreground">{kpi.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-semibold tabular-nums">{kpi.value}</p>
              <ResponsiveContainer width={60} height={24}>
                <AreaChart data={sparkline}>
                  <Area type="monotone" dataKey="value" stroke="#7c5cfc" fill="#7c5cfc" fillOpacity={0.15} strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Charts */}
      <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="bg-card card-shadow rounded-lg p-5">
          <h2 className="text-section-heading font-semibold mb-4">Platform Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={platformData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {platformData.map((_, i) => (
                  <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(24, 8%, 8%)", border: "1px solid hsl(0 0% 100% / 0.07)", borderRadius: 6, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {platformData.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1.5 text-label text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: ACCENT_COLORS[i % ACCENT_COLORS.length] }} />
                {p.name} ({p.value})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card card-shadow rounded-lg p-5">
          <h2 className="text-section-heading font-semibold mb-4">Account Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={accountData} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(30, 7%, 94%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {accountData.map((_, i) => (
                  <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                ))}
              </Bar>
              <Tooltip contentStyle={{ background: "hsl(24, 8%, 8%)", border: "1px solid hsl(0 0% 100% / 0.07)", borderRadius: 6, fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Rescue Ranking */}
      <div className="mt-6 bg-card card-shadow rounded-lg p-5">
        <h2 className="text-section-heading font-semibold mb-4">Rescue Ranking</h2>
        {rescueProjects.length === 0 ? (
          <p className="text-muted-foreground text-body">No projects need rescuing right now. Nice work.</p>
        ) : (
          <div className="space-y-3">
            {rescueProjects.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-md bg-background hover:bg-bg-active transition-colors duration-150">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{p.name}</span>
                    <StatusBadge status={p.status} />
                    <PlatformBadge name={p.platform_name} logoSlug={p.platform_logo_slug} />
                    <AccountBadge label={p.account_label} />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 h-2 rounded-full bg-bg-active overflow-hidden">
                    <div className="h-full rounded-full bg-accent-violet transition-all duration-500" style={{ width: `${p.rescue_score}%` }} />
                  </div>
                  <span className="text-label tabular-nums font-semibold w-8 text-right">{p.rescue_score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 4: Recent Activity */}
      <div className="mt-6 bg-card card-shadow rounded-lg p-5">
        <h2 className="text-section-heading font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {seedUpdates.slice(0, 8).map((u) => (
            <div key={u.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <span className="text-label text-accent-violet font-medium shrink-0 capitalize">{u.type.replace("_", " ")}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-body">{u.project_name}</span>
                <p className="text-muted-foreground text-body truncate">{u.content}</p>
              </div>
              <span className="text-label text-muted-foreground shrink-0 tabular-nums">{timeAgo(u.created_at)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 5: Attention List */}
      {attentionProjects.length > 0 && (
        <div className="mt-6 bg-card card-shadow rounded-lg p-5">
          <h2 className="text-section-heading font-semibold mb-4">Needs Attention</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead>
                <tr className="text-left text-label text-muted-foreground border-b border-border">
                  <th className="pb-2 pr-4">Project</th>
                  <th className="pb-2 pr-4">Platform</th>
                  <th className="pb-2 pr-4">Last Active</th>
                  <th className="pb-2">Next Action</th>
                </tr>
              </thead>
              <tbody>
                {attentionProjects.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 font-medium">{p.name}</td>
                    <td className="py-2 pr-4"><PlatformBadge name={p.platform_name} logoSlug={p.platform_logo_slug} /></td>
                    <td className="py-2 pr-4 text-accent-amber tabular-nums">{timeAgo(p.last_active_date)}</td>
                    <td className="py-2 text-muted-foreground truncate max-w-[200px]">{p.next_action || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
