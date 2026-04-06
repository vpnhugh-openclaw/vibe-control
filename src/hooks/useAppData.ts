import { useMemo } from "react";
import {
  seedProjects,
  seedPrompts,
  seedUpdates,
  type SeedProject,
  type SeedPrompt,
  type SeedUpdate,
  withDerivedProjectFields,
} from "@/lib/seedData";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const STORAGE_KEYS = {
  projects: "vibe-control.projects",
  prompts: "vibe-control.prompts",
  updates: "vibe-control.updates",
} as const;

export function useProjects() {
  const [projects, setProjects] = useLocalStorage<SeedProject[]>(STORAGE_KEYS.projects, seedProjects);

  const normalizedProjects = useMemo(
    () => projects.map((project) => withDerivedProjectFields(project)),
    [projects]
  );

  const setNormalizedProjects = (value: SeedProject[] | ((prev: SeedProject[]) => SeedProject[])) => {
    setProjects((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      return next.map((project) => withDerivedProjectFields(project));
    });
  };

  return [normalizedProjects, setNormalizedProjects] as const;
}

export function usePrompts() {
  return useLocalStorage<SeedPrompt[]>(STORAGE_KEYS.prompts, seedPrompts);
}

export function useUpdates() {
  return useLocalStorage<SeedUpdate[]>(STORAGE_KEYS.updates, seedUpdates);
}
