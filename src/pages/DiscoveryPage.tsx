import { AppShell } from "@/components/layout/AppShell";
import { MarkdownPanel } from "@/components/content/MarkdownPanel";
import { useDiscovery } from "@/hooks/useAppData";
import discoveryContent from "../../content/discovery.md?raw";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function DiscoveryPage() {
  const discoveryItems = useDiscovery();
  const bookmarked = discoveryItems.filter((item) => item.is_bookmarked).length;
  const highRelevance = discoveryItems.filter((item) => item.relevance_score >= 4).length;

  return (
    <AppShell title="Discovery Feed">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Items" value={discoveryItems.length} />
          <Metric label="High relevance" value={highRelevance} />
          <Metric label="Bookmarked" value={bookmarked} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-xl border border-border bg-card p-5 card-shadow">
            <h2 className="text-section-heading font-semibold">Latest finds</h2>
            <div className="mt-4 space-y-3">
              {discoveryItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-body text-muted-foreground">{item.summary}</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-pill bg-accent-violet/10 px-2 py-0.5 text-label text-accent-violet">{item.category.replace(/_/g, " ")}</span>
                      <p className="mt-2 text-label text-muted-foreground">Relevance {item.relevance_score}/5</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <MarkdownPanel content={discoveryContent} />
            <div className="rounded-xl border border-border bg-card p-5 card-shadow">
              <h2 className="text-section-heading font-semibold">Turn discovery into action</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="outline"><Link to="/platforms">Update platforms</Link></Button>
                <Button asChild variant="outline"><Link to="/credits">Check credits</Link></Button>
                <Button asChild variant="outline"><Link to="/projects">Apply to projects</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 card-shadow">
      <p className="text-label text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
