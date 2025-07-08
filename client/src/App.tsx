import { Switch, Route, useLocation, Redirect } from "wouter";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
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
import EncapsuladosPage from "@/pages/encapsulados";
import QuizPublicPage from "@/pages/quiz-public";
import SMSCreditsPage from "@/pages/sms-credits";
import EmailMarketingPage from "@/pages/email-marketing";
import WhatsAppRemarketingPage from "@/pages/whatsapp-remarketing";
import WhatsAppCampaignsPage from "@/pages/whatsapp-campaigns";
import CloakerPage from "@/pages/cloaker";
import TesteSMSPage from "@/pages/teste-sms";
import { useAuth } from "@/hooks/use-auth-hybrid";
import { isUnauthorizedError } from "@/lib/authUtils";
import { lazy } from "react";

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
  const isQuizRoute = location.startsWith("/quiz/");
  const isPublicRoute = publicRoutes.includes(location) || isQuizRoute;

  // Redirect to dashboard if authenticated and on login page
  if (isAuthenticated && location === "/login") {
    return <Redirect to="/dashboard" />;
  }

  // Redirect to login if not authenticated and not on a public route
  if (!isAuthenticated && !isPublicRoute) {
    return <Redirect to="/login" />;
  }

  return (
    <>
      <Switch>
        {/* Public routes without sidebar */}
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/quiz/:id" component={QuizPublicPage} />

        {/* Authenticated routes with sidebar */}
        <Route path="/dashboard">
          <Layout>
            <Dashboard />
          </Layout>
        </Route>

        {/* Quiz builder routes without sidebar for full-screen editing */}
        <Route path="/quiz-builder" component={QuizBuilder} />
        <Route path="/quiz-builder/:id" component={QuizBuilder} />
        <Route path="/quizzes/new" component={QuizBuilder} />
        <Route path="/quizzes/:id/edit" component={QuizBuilder} />

        {/* Other authenticated routes with sidebar */}
        <Route path="/analytics">
          <Layout>
            <AnalyticsPage />
          </Layout>
        </Route>
        <Route path="/super-analytics">
          <Layout>
            <SuperAnalyticsPage />
          </Layout>
        </Route>
        <Route path="/quizzes">
          <Layout>
            <QuizzesPage />
          </Layout>
        </Route>
        <Route path="/templates">
          <Layout>
            <TemplatesPage />
          </Layout>
        </Route>
        <Route path="/subscribe">
          <Layout>
            <SubscribePage />
          </Layout>
        </Route>
        <Route path="/settings">
          <Layout>
            <SettingsPage />
          </Layout>
        </Route>
        <Route path="/admin">
          <Layout>
            <AdminPage />
          </Layout>
        </Route>
        <Route path="/leads">
          <Layout>
            <LeadsPage />
          </Layout>
        </Route>
        <Route path="/tutoriais">
          <Layout>
            <TutoriaisPage />
          </Layout>
        </Route>
        <Route path="/premiacoes">
          <Layout>
            <PremiacoesPage />
          </Layout>
        </Route>
        <Route path="/encapsulados">
          <Layout>
            <EncapsuladosPage />
          </Layout>
        </Route>
        <Route path="/sms-credits">
          <Layout>
            <SMSCreditsPage />
          </Layout>
        </Route>
        <Route path="/email-marketing">
          <Layout>
            <EmailMarketingPage />
          </Layout>
        </Route>
        <Route path="/whatsapp-remarketing">
          <Layout>
            <WhatsAppRemarketingPage />
          </Layout>
        </Route>
        <Route path="/campanhas-whatsapp">
          <Layout>
            <WhatsAppCampaignsPage />
          </Layout>
        </Route>
        <Route path="/cloaker">
          <Layout>
            <CloakerPage />
          </Layout>
        </Route>
        <Route path="/teste-sms">
          <Layout>
            <TesteSMSPage />
          </Layout>
        </Route>
        <Route component={NotFoundPage} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;