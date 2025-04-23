import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/Welcome";
import Home from "@/pages/Home";
import ProfileSetup from "@/pages/ProfileSetup";
import { useUser } from "@/hooks/use-user";

function Router() {
  const { user, isLoading, profileComplete } = useUser();
  
  // Show loading state while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  return (
    <Switch>
      {!user && <Route path="/" component={Welcome} />}
      {user && !profileComplete && <Route path="/" component={ProfileSetup} />}
      {user && profileComplete && <Route path="/" component={Home} />}
      
      {/* Always ensure redirects to appropriate page based on auth state */}
      <Route path="/welcome">
        {user ? (profileComplete ? <Home /> : <ProfileSetup />) : <Welcome />}
      </Route>
      
      <Route path="/profile-setup">
        {!user ? <Welcome /> : (profileComplete ? <Home /> : <ProfileSetup />)}
      </Route>
      
      <Route path="/home">
        {!user ? <Welcome /> : (profileComplete ? <Home /> : <ProfileSetup />)}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground font-montserrat">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
