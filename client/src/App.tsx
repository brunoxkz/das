import React from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import LandingPage from "@/pages/landing";
import DarkLandingPage from "@/pages/dark-landing";
import ModernHomePage from "@/pages/modern-home";
import LoginPage from "@/pages/login";
import LoginPWAFixed from "@/pages/login-pwa-fixed";
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
import AdminNotifications from "@/pages/admin-notifications";
import BulkPushMessaging from "@/pages/bulk-push-messaging";


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
import TelegramCampaigns from "@/pages/telegram-campaigns";
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
import FunnelImporter from "@/pages/funnel-importer-fixed";
import BuyComments from "@/pages/buy-comments";
import SchedulePosts from "@/pages/schedule-posts";
import Forum from "@/pages/forum";
import VSLToQuiz from "@/pages/vsl-to-quiz";

import CheckoutAdminPage from "@/pages/checkout-admin";
import CheckoutBuilder from "@/pages/checkout-builder";
import CheckoutPublic from "@/pages/checkout-public";
import CheckoutSuccess from "@/pages/checkout-success";
import CheckoutSubscriptionWrapper from "@/pages/checkout-subscription-wrapper";
import CheckoutUnified from "@/pages/checkout-unified";
import CheckoutDashboard from "@/pages/checkout-dashboard";
import CheckoutPage from "@/pages/checkout";
import CheckoutIndividual from "@/pages/checkout-individual";
import CheckoutStripeTrial from "@/pages/checkout-stripe-trial";
import CheckoutGPTSolution from "@/pages/checkout-gpt-solution";
import CheckoutOfficial from "@/pages/checkout-official";

import PublicCheckout from "@/pages/public-checkout";
import StripePlansManager from "@/pages/stripe-plans-manager";
import StripeCheckoutCustom from "@/pages/stripe-checkout-custom";
import StripeElementsCheckout from "@/pages/stripe-elements-checkout";
import StripeCheckoutLink from "@/pages/stripe-checkout-link";
import StripeCheckoutManager from "@/pages/stripe-checkout-manager";
import StripeElements from "@/pages/stripe-elements";
import StripePaymentIntentDemo from "@/pages/stripe-payment-intent-demo";
import PaymentSuccess from "@/pages/payment-success";
import CheckPayment from "@/pages/check-payment";
import TrialAnalysis from "@/pages/trial-analysis";
import TestValidationFlow from "@/pages/test-validation-flow";
import PaymentIntentExplanation from "@/pages/payment-intent-explanation";
import CheckoutTrialSimple from "@/pages/checkout-trial-simple";
import CheckoutTrialFinalSimple from "@/pages/checkout-trial-final-simple";
import CheckoutNoStripe from "@/pages/checkout-no-stripe";

import CheckoutTrialCustom from "@/pages/checkout-trial-custom";


import PlanosPublicos from "@/pages/planos-publicos";
import StripeMonitoring from "@/pages/stripe-monitoring";
import CheckoutStripeFinal from "@/pages/checkout-stripe-final";
import ProductBuilder from "@/pages/product-builder";

import AdminDashboardPlanos from "@/pages/admin-dashboard-planos";
import CheckoutPlan from "@/pages/checkout-plan";
import PaymentVerification from "@/pages/payment-verification";
import MembersAreaNetflix from "@/pages/members-area-netflix";
import MembersArea from "@/pages/members-area";
import AdminDashboard from "@/pages/admin-dashboard";

import PushSimple from "@/pages/push-simple";
import AdminPushSimple from "@/pages/admin-push-simple";
import PushDemo from "@/pages/push-demo";
import AdminPush from "@/pages/admin-push";
import PushAdmin from "@/pages/push-admin";
// BulkPushMessaging já importado anteriormente

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
  const publicRoutes = ["/", "/dark", "/modern", "/login", "/payment-success", "/payment-cancel"];
  const isQuizRoute = location.startsWith("/quiz/");
  const isCheckoutRoute = location.startsWith("/checkout/");
  const isStripeCheckoutLink = location.startsWith("/stripe-checkout-link/");
  const isCheckoutPublic = location.startsWith("/checkout-public/");
  const isPublicRoute = publicRoutes.includes(location) || isQuizRoute || isCheckoutRoute || isStripeCheckoutLink || isCheckoutPublic;

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
        <Route path="/checkout/:planId" component={PublicCheckout} />
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/checkout-public/:planId" component={CheckoutPublic} />

        <Route path="/checkout-individual/:id" component={CheckoutIndividual} />
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/payment-cancel" component={PaymentSuccess} />
        <Route path="/stripe-checkout-link/:linkId" component={StripeCheckoutLink} />
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
        <Route path="/admin/notifications">
          <Layout>
            <AdminNotifications />
          </Layout>
        </Route>
        <Route path="/admin/push-admin">
          <Layout>
            <PushAdmin />
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

        <Route path="/funnel-importer">
          <Layout>
            <FunnelImporter />
          </Layout>
        </Route>

        <Route path="/vsl-to-quiz">
          <Layout>
            <VSLToQuiz />
          </Layout>
        </Route>

        <Route path="/buy-comments">
          <Layout>
            <BuyComments />
          </Layout>
        </Route>

        <Route path="/schedule-posts">
          <Layout>
            <SchedulePosts />
          </Layout>
        </Route>

        <Route path="/forum">
          <Layout>
            <Forum />
          </Layout>
        </Route>

        <Route path="/check-payment">
          <Layout>
            <CheckPayment />
          </Layout>
        </Route>
        
        <Route path="/trial-analysis">
          <Layout>
            <TrialAnalysis />
          </Layout>
        </Route>
        
        <Route path="/test-validation-flow">
          <Layout>
            <TestValidationFlow />
          </Layout>
        </Route>
        
        <Route path="/checkout">
          <Layout>
            <CheckoutBuilder />
          </Layout>
        </Route>
        
        <Route path="/checkout-builder">
          <Layout>
            <CheckoutBuilder />
          </Layout>
        </Route>
        
        <Route path="/product-builder">
          <Layout>
            <ProductBuilder />
          </Layout>
        </Route>
        


        <Route path="/whatsapp">
          <Layout>
            <WhatsAppCampaignsPage />
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
        
        <Route path="/telegram-campaigns">
          <Layout>
            <TelegramCampaigns />
          </Layout>
        </Route>
        <Route path="/members-area">
          <MembersAreaNetflix />
        </Route>
        
        <Route path="/members-admin">
          <Layout>
            <MembersArea />
          </Layout>
        </Route>

        <Route path="/admin-dashboard">
          <Layout>
            <AdminDashboard />
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

        <Route path="/checkout-individual">
          <Layout>
            <CheckoutIndividual />
          </Layout>
        </Route>
        <Route path="/checkout-admin">
          <Layout>
            <CheckoutAdminPage />
          </Layout>
        </Route>
        
        <Route path="/checkout-stripe-trial">
          <Layout>
            <CheckoutStripeTrial />
          </Layout>
        </Route>
        

        
        <Route path="/checkout-trial-custom">
          <Layout>
            <CheckoutTrialCustom />
          </Layout>
        </Route>
        
        <Route path="/checkout-gpt-solution">
          <Layout>
            <CheckoutGPTSolution />
          </Layout>
        </Route>
        
        <Route path="/checkout-official">
          <Layout>
            <CheckoutOfficial />
          </Layout>
        </Route>
        

        
        <Route path="/stripe-plans-manager">
          <Layout>
            <StripePlansManager />
          </Layout>
        </Route>
        
        <Route path="/stripe-checkout-custom">
          <Layout>
            <StripeCheckoutCustom />
          </Layout>
        </Route>
        
        <Route path="/stripe-elements-checkout">
          <Layout>
            <StripeElementsCheckout />
          </Layout>
        </Route>
        
        <Route path="/stripe-checkout-manager">
          <Layout>
            <StripeCheckoutManager />
          </Layout>
        </Route>
        
        <Route path="/stripe-elements">
          <Layout>
            <StripeElements />
          </Layout>
        </Route>
        
        <Route path="/stripe-payment-intent-demo">
          <Layout>
            <StripePaymentIntentDemo />
          </Layout>
        </Route>
        
        <Route path="/payment-intent-explanation">
          <Layout>
            <PaymentIntentExplanation />
          </Layout>
        </Route>
        
        <Route path="/checkout-trial-final">
          <Layout>
            <CheckoutTrialSimple />
          </Layout>
        </Route>
        

        

        

        

        

        

        

        
        <Route path="/planos">
          <PlanosPublicos />
        </Route>
        
        <Route path="/checkout/:planId">
          <CheckoutPlan />
        </Route>
        
        <Route path="/success">
          <CheckoutSuccess />
        </Route>
        
        <Route path="/checkout-trial-final-simple">
          <Layout>
            <CheckoutTrialFinalSimple />
          </Layout>
        </Route>
        
        <Route path="/checkout-stripe-basic">
          <Layout>
            <CheckoutNoStripe />
          </Layout>
        </Route>
        
        <Route path="/checkout-stripe-final">
          <Layout>
            <CheckoutStripeFinal />
          </Layout>
        </Route>
        
        <Route path="/stripe-monitoring">
          <Layout>
            <StripeMonitoring />
          </Layout>
        </Route>
        
        <Route path="/assinatura">
          <Layout>
            <CheckoutSubscriptionWrapper />
          </Layout>
        </Route>
        
        <Route path="/checkout-unificado">
          <Layout>
            <CheckoutUnified />
          </Layout>
        </Route>
        
        <Route path="/checkout-dashboard">
          <Layout>
            <CheckoutDashboard />
          </Layout>
        </Route>
        
        <Route path="/admin-dashboard-planos">
          <Layout>
            <AdminDashboardPlanos />
          </Layout>
        </Route>
        <Route path="/payment-verification">
          <Layout>
            <PaymentVerification />
          </Layout>
        </Route>
        <Route path="/payment-verification">
          <Layout>
            <PaymentVerification />
          </Layout>
        </Route>
        
        <Route path="/push-simple">
          <Layout>
            <PushSimple />
          </Layout>
        </Route>
        
        <Route path="/admin/push-simple">
          <Layout>
            <AdminPushSimple />
          </Layout>
        </Route>
        <Route path="/admin-push">
          <Layout>
            <AdminPush />
          </Layout>
        </Route>
        
        <Route path="/push-admin">
          <Layout>
            <PushAdmin />
          </Layout>
        </Route>

        <Route path="/admin/bulk-push-messaging">
          <Layout>
            <BulkPushMessaging />
          </Layout>
        </Route>
        <Route path="/admin-push-notifications">
          <Layout>
            <BulkPushMessaging />
          </Layout>
        </Route>
        
        <Route path="/push-demo">
          <Layout>
            <PushDemo />
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