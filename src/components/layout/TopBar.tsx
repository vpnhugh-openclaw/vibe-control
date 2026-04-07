import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, FolderKanban, BookOpen, Layers } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { seedPlatformsLike } from "@/lib/topBarSearch";
import { useProjects, usePrompts } from "@/hooks/useAppData";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [projects] = useProjects();
  const [prompts] = usePrompts();

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const results = useMemo(() => ({
    projects,
    prompts,
    platforms: seedPlatformsLike,
  }), [projects, prompts]);

  return (
    <>
      <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-card shrink-0">
        <h1 className="text-page-title font-semibold text-foreground truncate">
          {title}
        </h1>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-label text-muted-foreground bg-accent hover:bg-bg-active transition-colors duration-150"
            title="Search (⌘K)"
            onClick={() => setOpen(true)}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-background border border-border">
              ⌘K
            </kbd>
          </button>
          <button className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search projects, prompts, platforms..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Projects">
            {results.projects.map((project) => (
              <CommandItem key={project.id} value={`${project.name} ${project.short_description} ${project.blocker_summary ?? ""} ${project.next_action ?? ""}`} onSelect={() => { navigate("/projects"); setOpen(false); }}>
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>{project.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Prompts">
            {results.prompts.map((prompt) => (
              <CommandItem key={prompt.id} value={`${prompt.title} ${prompt.prompt_text} ${prompt.tags.join(" ")}`} onSelect={() => { navigate("/prompts"); setOpen(false); }}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>{prompt.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Platforms">
            {results.platforms.map((platform) => (
              <CommandItem key={platform} value={platform} onSelect={() => { navigate("/platforms"); setOpen(false); }}>
                <Layers className="mr-2 h-4 w-4" />
                <span>{platform}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
