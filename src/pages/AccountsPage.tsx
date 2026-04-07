import { AppShell } from "@/components/layout/AppShell";
import { MarkdownPanel } from "@/components/content/MarkdownPanel";
import { useAccounts, useProjects } from "@/hooks/useAppData";
import accountsContent from "../../content/accounts.md?raw";
import { Mail, ShieldCheck, Layers, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AccountsPage() {
  const [projects] = useProjects();
  const accounts = useAccounts();
  const activeAccounts = accounts.filter((account) => account.is_active).length;
  const platformsCovered = new Set(projects.map((project) => project.platform_name)).size;

  return (
    <AppShell title="Accounts">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Accounts" value={accounts.length} icon={Mail} />
          <SummaryCard label="Active" value={activeAccounts} icon={ShieldCheck} />
          <SummaryCard label="Platforms in use" value={platformsCovered} icon={Layers} />
          <SummaryCard label="Linked spend lanes" value={3} icon={DollarSign} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-border bg-card p-5 card-shadow">
            <h2 className="text-section-heading font-semibold">Account roster</h2>
            <div className="mt-4 space-y-3">
              {accounts.map((account) => {
                const projectCount = projects.filter((project) => project.account_label === account.label).length;
                return (
                  <div key={account.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{account.label}</p>
                        <p className="text-body text-muted-foreground">{account.email_address}</p>
                      </div>
                      <span className={`rounded-pill px-2 py-0.5 text-label ${account.is_active ? "bg-accent-cyan/10 text-accent-cyan" : "bg-muted text-muted-foreground"}`}>
                        {account.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-body text-muted-foreground md:grid-cols-2">
                      <p><span className="text-foreground">Login:</span> {account.login_method}</p>
                      <p><span className="text-foreground">Best platform:</span> {account.best_for_platform}</p>
                      <p><span className="text-foreground">Use case:</span> {account.preferred_use_case}</p>
                      <p><span className="text-foreground">Projects:</span> {projectCount}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <MarkdownPanel content={accountsContent} />
            <QuickLinks />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 card-shadow">
      <div className="flex items-center justify-between">
        <p className="text-label text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-accent-violet" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function QuickLinks() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 card-shadow">
      <h2 className="text-section-heading font-semibold">Next steps</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild variant="outline"><Link to="/platforms">Review platforms</Link></Button>
        <Button asChild variant="outline"><Link to="/credits">Check credits</Link></Button>
        <Button asChild variant="outline"><Link to="/costs">Audit costs</Link></Button>
      </div>
    </div>
  );
}
