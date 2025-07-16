import { Switch, Route, useLocation, Redirect } from "wouter";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import LandingPage from "@/pages/landing";
import DarkLandingPage from "@/pages/dark-landing";
import ModernHomePage from "@/pages/modern-home";
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
import AdminSecurityPage from "@/pages/admin-security";
import LeadsPage from "@/pages/leads";
import NotFoundPage from "@/pages/not-found";
import TutoriaisPage from "@/pages/tutoriais";
import PlanosPage from "@/pages/planos";
import CreditsPage from "@/pages/credits";
import TestPage from "@/pages/test-page";

import QuizPublicPage from "@/pages/quiz-public";
import SMSCreditsPage from "@/pages/sms-credits";
import SMSCampaignsAdvanced from "@/pages/sms-campaigns-advanced";


import WhatsAppAutomationPage from "@/pages/whatsapp-automation";
import WhatsAppCampaignsPage from "@/pages/whatsapp-campaigns";
import WhatsAppDualSystem from "@/pages/whatsapp-dual-system";
import TelegramAutomationPage from "@/pages/telegram-automation";
import CloakerPage from "@/pages/cloaker";
import TesteSMSPage from "@/pages/teste-sms";

import EmailMarketingPro from "@/pages/email-marketing-pro";
import EmailMarketingSimplified from "@/pages/email-marketing-simplified";
import EmailMarketingAdvanced from "@/pages/email-marketing";
import AIConversionPage from "@/pages/ai-conversion";
import TesteAbPage from "@/pages/teste-ab";
import ABTestingPage from "@/pages/ab-testing";
import WebhooksPage from "@/pages/webhooks";
import IntegracoesPage from "@/pages/integracoes";
// import TypebotPage from "@/pages/typebot"; // TYPEBOT DESATIVADO
import ExtensoesPage from "@/pages/extensoes";
import VoiceCallingPage from "@/pages/voice-calling";
import ConditionalCampaignsPage from "@/pages/conditional-campaigns";
import FacelessVideosPage from "@/pages/faceless-videos";
import CheckoutSystemPage from "@/pages/checkout-system";
import CheckoutAdminPage from "@/pages/checkout-admin";
import { useAuth } from "@/hooks/useAuth-jwt";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SidebarProvider } from "@/hooks/useSidebar";
import { useTheme } from "@/hooks/useTheme";


function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/dark", "/modern", "/login"];
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
    <SidebarProvider>
      <div className={theme === 'dark' ? 'dark' : ''}>
        <Switch>
        {/* Public routes without sidebar */}
        <Route path="/" component={LandingPage} />
        <Route path="/dark" component={DarkLandingPage} />
        <Route path="/modern" component={ModernHomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/quiz/:id" component={QuizPublicPage} />
        <Route path="/test" component={TestPage} />

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
        <Route path="/admin/security">
          <Layout>
            <AdminSecurityPage />
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
        <Route path="/planos">
          <Layout>
            <PlanosPage />
          </Layout>
        </Route>
        <Route path="/credits">
          <Layout>
            <CreditsPage />
          </Layout>
        </Route>

        <Route path="/sms-credits">
          <Layout>
            <SMSCreditsPage />
          </Layout>
        </Route>
        <Route path="/sms-campaigns-advanced">
          <Layout>
            <SMSCampaignsAdvanced />
          </Layout>
        </Route>
        <Route path="/email-marketing">
          <Layout>
            <EmailMarketingAdvanced />
          </Layout>
        </Route>
        <Route path="/email-marketing-pro">
          <Layout>
            <EmailMarketingPro />
          </Layout>
        </Route>
        <Route path="/ai-conversion">
          <Layout>
            <AIConversionPage />
          </Layout>
        </Route>
        
        <Route path="/teste-ab">
          <Layout>
            <TesteAbPage />
          </Layout>
        </Route>
        
        <Route path="/ab-testing">
          <Layout>
            <ABTestingPage />
          </Layout>
        </Route>
        
        <Route path="/webhooks">
          <Layout>
            <WebhooksPage />
          </Layout>
        </Route>
        
        <Route path="/integracoes">
          <Layout>
            <IntegracoesPage />
          </Layout>
        </Route>

        {/* TYPEBOT DESATIVADO
        <Route path="/typebot">
          <Layout>
            <TypebotPage />
          </Layout>
        </Route>
        */}

        <Route path="/extensoes">
          <Layout>
            <ExtensoesPage />
          </Layout>
        </Route>

        <Route path="/voice-calling">
          <Layout>
            <VoiceCallingPage />
          </Layout>
        </Route>

        <Route path="/conditional-campaigns">
          <Layout>
            <ConditionalCampaignsPage />
          </Layout>
        </Route>

        <Route path="/faceless-videos">
          <Layout>
            <FacelessVideosPage />
          </Layout>
        </Route>

        <Route path="/campanhas-whatsapp">
          <Layout>
            <WhatsAppCampaignsPage />
          </Layout>
        </Route>
        
        <Route path="/telegram-automation">
          <Layout>
            <TelegramAutomationPage />
          </Layout>
        </Route>
        
        <Route path="/whatsapp-dual">
          <Layout>
            <WhatsAppDualSystem />
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
        <Route path="/checkout-system">
          <Layout>
            <CheckoutSystemPage />
          </Layout>
        </Route>
        <Route path="/checkout-admin">
          <Layout>
            <CheckoutAdminPage />
          </Layout>
        </Route>

        <Route component={NotFoundPage} />
        </Switch>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

export default App;