import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ApplicationsPage,
  DashboardPage,
  Home,
  NotificationsPage,
  ProfilePage,
  RecommendationsPage,
  SavedPage,
  SearchPage,
  SettingsPage,
  ScholarshipDetailPage,
} from '@/pages/scholarship-pages';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
         <Route path="/" component={Home} />
         <Route path="/search" component={SearchPage} />
         <Route path="/scholarships/:id" component={ScholarshipDetailPage} />
         <Route path="/dashboard" component={DashboardPage} />
         <Route path="/profile" component={ProfilePage} />
         <Route path="/recommendations" component={RecommendationsPage} />
         <Route path="/saved" component={SavedPage} />
         <Route path="/applications" component={ApplicationsPage} />
         <Route path="/notifications" component={NotificationsPage} />
         <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
