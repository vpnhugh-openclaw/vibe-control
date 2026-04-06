import { AppShell } from "@/components/layout/AppShell";
import { MarkdownPanel } from "@/components/content/MarkdownPanel";
import { seedModels, seedProjects } from "@/lib/seedData";
import platformsContent from "../../content/platforms.md?raw";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const platformMeta: Record<string, { category: string; bestFor: string }> = {
  Lovable: { category: "Builder", bestFor: "Fast UI-heavy app builds" },
  "VS Code + Copilot": { category: "Code-first", bestFor: "Detailed implementation and polish" },
  Replit: { category: "Utility", bestFor: "Quick hosted experiments" },
  Base44: { category: "Builder", bestFor: "Rapid database-backed prototypes" },
  Manus: { category: "Research", bestFor: "Research workflows and synthesis" },
  Bolt: { category: "Builder", bestFor: "Fast experiment spikes" },
  v0: { category: "Builder", bestFor: "Layout and component-first starts" },
  Cursor: { category: "Code-first", bestFor: "Refactors and architecture changes" },
};

export default function PlatformsPage() {
  const platforms = [...new Set(seedProjects.map((project) => project.platform_name))];

  return (
    <AppShell title="Platforms">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {platforms.map((platform) => {
            const count = seedProjects.filter((project) => project.platform_name === platform).length;
            const meta = platformMeta[platform] ?? { category: "General", bestFor: "General purpose work" };
            return (
              <div key={platform} className="rounded-xl border border-border bg-card p-5 card-shadow">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-foreground">{platform}</h2>
                    <p className="text-body text-muted-foreground">{meta.category}</p>
                  </div>
                  <span className="rounded-pill bg-accent-violet/10 px-2 py-0.5 text-label text-accent-violet">{count} project{count !== 1 ? "s" : ""}</span>
                </div>
                <p className="mt-3 text-body text-muted-foreground">{meta.bestFor}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <MarkdownPanel content={platformsContent} />
          <div className="rounded-xl border border-border bg-card p-5 card-shadow">
            <h2 className="text-section-heading font-semibold">Models in rotation</h2>
            <div className="mt-4 space-y-3">
              {seedModels.map((model) => (
                <div key={model.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{model.model_name}</p>
                      <p className="text-body text-muted-foreground">{model.provider}</p>
                    </div>
                    <span className={`rounded-pill px-2 py-0.5 text-label ${model.is_free_tier ? "bg-accent-cyan/10 text-accent-cyan" : "bg-accent-amber/15 text-accent-amber"}`}>
                      {model.is_free_tier ? "Free tier" : "Paid"}
                    </span>
                  </div>
                  <p className="mt-2 text-body text-muted-foreground">Best for: {model.best_for.join(", ")}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="outline"><Link to="/accounts">Accounts</Link></Button>
              <Button asChild variant="outline"><Link to="/credits">Credits</Link></Button>
              <Button asChild variant="outline"><Link to="/discovery">Discovery</Link></Button>
              <Button asChild variant="outline"><Link to="/costs">Costs</Link></Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
