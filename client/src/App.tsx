import { Switch, Route, useLocation } from "wouter";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import QuizBuilder from "@/pages/quiz-builder";
import AnalyticsPage from "@/pages/analytics";
import SuperAnalyticsPage from "@/pages/super-analytics";
import QuizzesPage from "@/pages/quizzes";
import TemplatesPage from "@/pages/templates";
import SubscribePage from "@/pages/subscribe";
import SettingsPage from "@/pages/settings";
import AdminPage from "@/pages/admin";
import LeadsPage from "@/pages/leads";
import NotFoundPage from "@/pages/not-found";
import TutoriaisPage from "@/pages/tutoriais";
import PremiacoesPage from "@/pages/premiacoes";
import { useAuth } from "@/hooks/useAuth-jwt";
import { isUnauthorizedError } from "@/lib/authUtils";

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.includes(location);

  if (!isAuthenticated && !isPublicRoute) {
    return <LoginPage />;
  }

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/quiz-builder" component={QuizBuilder} />
      <Route path="/quiz-builder/:id" component={QuizBuilder} />
      <Route path="/quizzes/new" component={QuizBuilder} />
      <Route path="/quizzes/:id/edit" component={QuizBuilder} />
      <Route path="/analytics/:id" component={AnalyticsPage} />
      <Route path="/super-analytics" component={SuperAnalyticsPage} />
      <Route path="/quizzes" component={QuizzesPage} />
      <Route path="/templates" component={TemplatesPage} />
      <Route path="/subscribe" component={SubscribePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/leads" component={LeadsPage} />
      <Route path="/tutoriais" component={TutoriaisPage} />
      <Route path="/premiacoes" component={PremiacoesPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default App;