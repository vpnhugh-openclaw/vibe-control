import { AppShell } from "@/components/layout/AppShell";
import { MarkdownPanel } from "@/components/content/MarkdownPanel";
import { useModels, usePromotions } from "@/hooks/useAppData";
import creditsContent from "../../content/credits.md?raw";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CreditsPage() {
  const promotions = usePromotions();
  const models = useModels();
  const confirmed = promotions.filter((promo) => promo.freshness === "confirmed").length;
  const freeModels = models.filter((model) => model.is_free_tier).length;

  return (
    <AppShell title="Credits & Models">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Promotions" value={promotions.length} />
          <StatCard label="Confirmed" value={confirmed} />
          <StatCard label="Models" value={models.length} />
          <StatCard label="Free-tier models" value={freeModels} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-5 card-shadow">
            <h2 className="text-section-heading font-semibold">Credit opportunities</h2>
            <div className="mt-4 space-y-3">
              {promotions.map((promo) => (
                <div key={promo.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{promo.provider}</p>
                      <p className="text-body text-muted-foreground">{promo.amount} {promo.unit}</p>
                    </div>
                    <span className={`rounded-pill px-2 py-0.5 text-label ${promo.freshness === "confirmed" ? "bg-accent-cyan/10 text-accent-cyan" : promo.freshness === "expired" ? "bg-accent-red/10 text-accent-red" : "bg-muted text-muted-foreground"}`}>
                      {promo.freshness}
                    </span>
                  </div>
                  <p className="mt-2 text-body text-muted-foreground">Type: {promo.credit_type}{promo.expiry_date ? `, expires ${promo.expiry_date}` : ""}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <MarkdownPanel content={creditsContent} />
            <div className="rounded-xl border border-border bg-card p-5 card-shadow">
              <h2 className="text-section-heading font-semibold">Model recommendations</h2>
              <div className="mt-4 space-y-3">
                {models.map((model) => (
                  <div key={model.id} className="rounded-lg border border-border p-4">
                    <p className="font-medium text-foreground">{model.model_name}</p>
                    <p className="text-body text-muted-foreground">{model.provider} · {model.best_for.join(", ")}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="outline"><Link to="/platforms">Platforms</Link></Button>
                <Button asChild variant="outline"><Link to="/accounts">Accounts</Link></Button>
                <Button asChild variant="outline"><Link to="/costs">Costs</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 card-shadow">
      <p className="text-label text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
