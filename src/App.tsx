import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStoreProvider } from "@/hooks/useAppStore";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import AccountsPage from "./pages/AccountsPage";
import PlatformsPage from "./pages/PlatformsPage";
import CreditsPage from "./pages/CreditsPage";
import PromptsPage from "./pages/PromptsPage";
import DiscoveryPage from "./pages/DiscoveryPage";
import CostsPage from "./pages/CostsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppStoreProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/platforms" element={<PlatformsPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/costs" element={<CostsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppStoreProvider>
  </QueryClientProvider>
);

export default App;
