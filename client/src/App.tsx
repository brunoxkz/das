import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import QuizBuilder from "@/pages/quiz-builder";
import Quizzes from "@/pages/quizzes";
import Templates from "@/pages/templates";
import Analytics from "@/pages/analytics";
import Subscribe from "@/pages/subscribe";
import Settings from "@/pages/settings";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-y-auto">
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/quizzes" component={Quizzes} />
                  <Route path="/quizzes/new" component={QuizBuilder} />
                  <Route path="/quizzes/:id/edit" component={QuizBuilder} />
                  <Route path="/templates" component={Templates} />
                  <Route path="/analytics" component={Analytics} />
                  <Route path="/subscribe" component={Subscribe} />
                  <Route path="/settings" component={Settings} />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
          </div>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
