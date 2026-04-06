import Markdown from "react-markdown";

export function MarkdownPanel({ content }: { content: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 card-shadow">
      <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-accent-cyan">
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
}
