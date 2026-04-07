import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <AppShell title="Page not found">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center card-shadow">
          <p className="text-label uppercase tracking-wide text-muted-foreground">404</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">That page doesn’t exist</h1>
          <p className="mt-3 text-body text-muted-foreground">
            The route <span className="font-mono text-foreground">{location.pathname}</span> couldn’t be found.
          </p>
          <Button asChild className="mt-5 bg-accent-violet text-primary-foreground hover:bg-accent-violet/90">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default NotFound;
