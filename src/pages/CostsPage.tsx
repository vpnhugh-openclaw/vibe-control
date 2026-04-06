import { AppShell } from "@/components/layout/AppShell";
import { MarkdownPanel } from "@/components/content/MarkdownPanel";
import { seedCosts } from "@/lib/seedData";
import costsContent from "../../content/costs.md?raw";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CostsPage() {
  const totalSpend = seedCosts.reduce((sum, item) => sum + item.amount, 0);
  const subscriptions = seedCosts.filter((item) => item.entry_type === "subscription").length;
  const oneOff = seedCosts.filter((item) => item.entry_type === "one_off").length;

  return (
    <AppShell title="Cost Tracker">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CostCard label="Tracked entries" value={seedCosts.length.toString()} />
          <CostCard label="Total spend" value={`$${totalSpend.toFixed(0)}`} />
          <CostCard label="Subscriptions" value={subscriptions.toString()} />
          <CostCard label="One-off costs" value={oneOff.toString()} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-xl border border-border bg-card p-5 card-shadow">
            <h2 className="text-section-heading font-semibold">Spend log</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-body">
                <thead>
                  <tr className="border-b border-border text-left text-label text-muted-foreground">
                    <th className="pb-2 pr-4">Platform</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2 pr-4">Account</th>
                    <th className="pb-2 pr-4">Project</th>
                    <th className="pb-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {seedCosts.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{item.platform}</td>
                      <td className="py-3 pr-4 text-foreground">{item.currency} {item.amount}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{item.account_label}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{item.project_name ?? "—"}</td>
                      <td className="py-3 text-muted-foreground">{item.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <MarkdownPanel content={costsContent} />
            <div className="rounded-xl border border-border bg-card p-5 card-shadow">
              <h2 className="text-section-heading font-semibold">Follow-up links</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="outline"><Link to="/credits">Credits</Link></Button>
                <Button asChild variant="outline"><Link to="/platforms">Platforms</Link></Button>
                <Button asChild variant="outline"><Link to="/accounts">Accounts</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CostCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 card-shadow">
      <p className="text-label text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
