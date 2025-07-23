import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import Chart from './Chart';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  ExternalLink,
  Mail,
  Phone,
  User,
  Calendar,
  MessageSquare,
  ArrowUpDown,
  Scale,
  Target,
  FileText,
  Image,
  Video,
  Music,
  Minus,
  Check,
  X,
  Shield,
  ChevronDown,
  Share2,
  Crown,
  Medal,
  Award,
  Trophy,
  Users,
  TrendingUp,
  Gift,
  Heart,
  ThumbsUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Play as PlayIcon,
  Pause as PauseIcon,
  RotateCcw as RotateIcon,
  BarChart3,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Copy,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  Headphones,
  Mic,
  Camera,
  PenTool,
  Paintbrush,
  Palette,
  Layers,
  Grid,
  List,
  BarChart,
  PieChart,
  LineChart,
  TrendingDown,
  Zap,
  Flash,
  Sparkles,
  Flame,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Mountain,
  Trees,
  Waves,
  Anchor,
  Plane,
  Car,
  Bike,
  Train,
  Ship,
  Rocket,
  Satellite,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Gamepad2,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Puzzle,
  Target as TargetIcon,
  Crosshair,
  Bullseye,
  Scope,
  MousePointer,
  TouchPadOff,
  Fingerprint,
  Eye,
  EyeOff,
  Ear,
  Nose,
  Mouth,
  Brain,
  Lightbulb,
  Idea,
  Bulb,
  Lamp,
  Candle,
  Fire,
  Snowflake,
  Leaf,
  Flower,
  Tree,
  Seedling,
  Sprout,
  Cactus,
  Cherry,
  Apple,
  Banana,
  Orange,
  Grape,
  Strawberry,
  Watermelon,
  Pineapple,
  Coconut,
  Avocado,
  Carrot,
  Corn,
  Potato,
  Tomato,
  Pepper,
  Onion,
  Garlic,
  Mushroom,
  Bread,
  Cake,
  Cookie,
  Donut,
  Pizza,
  Burger,
  Fries,
  Hotdog,
  Taco,
  Salad,
  Soup,
  Stew,
  Noodles,
  Pasta,
  Rice,
  Meat,
  Poultry,
  Fish,
  Shrimp,
  Crab,
  Lobster,
  Oyster,
  Clam,
  Egg,
  Milk,
  Cheese,
  Butter,
  Yogurt,
  IceCream,
  Honey,
  Sugar,
  Salt,
  Pepper as PepperIcon,
  Spice,
  Herb,
  Oil,
  Vinegar,
  Sauce,
  Ketchup,
  Mustard,
  Mayo,
  Relish,
  Pickle,
  Olive,
  Capers,
  Nuts,
  Seeds,
  Beans,
  Lentils,
  Chickpeas,
  Tofu,
  Tempeh,
  Seitan,
  Quinoa,
  Oats,
  Barley,
  Wheat,
  Rye,
  Corn as CornIcon,
  Buckwheat,
  Millet,
  Amaranth,
  Chia,
  Flax,
  Hemp,
  Sunflower,
  Pumpkin,
  Sesame,
  Poppy,
  Cardamom,
  Cinnamon,
  Cloves,
  Nutmeg,
  Ginger,
  Turmeric,
  Paprika,
  Chili,
  Cayenne,
  Cumin,
  Coriander,
  Fennel,
  Anise,
  Dill,
  Parsley,
  Cilantro,
  Basil,
  Mint,
  Rosemary,
  Thyme,
  Sage,
  Oregano,
  Marjoram,
  Tarragon,
  Chives,
  Scallions,
  Leeks,
  Shallots,
  Celery,
  Lettuce,
  Spinach,
  Kale,
  Arugula,
  Watercress,
  Endive,
  Radicchio,
  Cabbage,
  Cauliflower,
  Broccoli,
  Brussels,
  Asparagus,
  Artichoke,
  Zucchini,
  Squash,
  Cucumber,
  Radish,
  Turnip,
  Beet,
  Parsnip,
  Rutabaga,
  Kohlrabi,
  Fennel as FennelIcon,
  Bok,
  Napa,
  Collard,
  Mustard as MustardIcon,
  Dandelion,
  Purslane,
  Lamb,
  Mache,
  Frisee,
  Escarole,
  Romaine,
  Iceberg,
  Butter as ButterIcon,
  Red,
  Green,
  Yellow,
  Orange as OrangeIcon,
  Purple,
  Pink,
  Blue,
  Teal,
  Cyan,
  Lime,
  Emerald,
  Mint as MintIcon,
  Sky,
  Indigo,
  Violet,
  Fuchsia,
  Rose,
  Amber,
  Slate,
  Gray,
  Neutral,
  Stone,
  Zinc,
  Black,
  White
} from 'lucide-react';

// Componente para loading_question no preview
const LoadingQuestionElementPreview = ({ element }: { element: any }) => {
  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const properties = element.properties || {};
  
  useEffect(() => {
    const duration = (properties.loadingDuration || 4) * 1000;
    const steps = 100;
    const interval = duration / steps;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setShowPopup(true);
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [properties.loadingDuration]);
  
  const handleQuestionAnswer = (value: string) => {
    setAnswer(value);
    setShowPopup(false);
  };
  
  const showProgressPercentage = element.showPercentage !== false;
  const enableShineEffect = element.enableShine || false;
  const enableStripesEffect = element.enableStripes || false;
  const showRemainingTimeText = element.showRemainingTime || false;
  const progressBarText = element.progressText || "Carregando...";
  const popupQuestionColor = element.popupQuestionColor || "#1F2937";
  const remainingTime = Math.max(0, ((element.loadingDuration || 4) * (100 - progress)) / 100);
  
  return (
    <>
      {/* Barra de carregamento aprimorada */}
      <div className="w-full space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">
              {element.loadingText || "Processando..."}
            </h4>
            {showProgressPercentage && (
              <span className="text-sm font-mono text-gray-600">{progress}%</span>
            )}
          </div>
          
          <div className="text-center text-sm text-gray-600 mb-2">
            {progressBarText}
          </div>
          
          <div 
            className="w-full rounded-full relative overflow-hidden" 
            style={{ 
              height: element.loadingBarHeight || 8,
              backgroundColor: element.loadingBarBackgroundColor || "#E5E7EB"
            }}
          >
            <div 
              className={`h-full rounded-full transition-all duration-100 relative ${
                enableShineEffect ? 'animate-pulse' : ''
              }`}
              style={{ 
                width: `${progress}%`,
                backgroundColor: element.loadingBarColor || "#10B981",
                backgroundImage: enableStripesEffect ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' : 'none'
              }}
            >
              {enableShineEffect && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>
          
          {showRemainingTimeText && (
            <div className="text-center text-xs text-gray-500">
              Tempo restante: {remainingTime.toFixed(1)}s
            </div>
          )}
        </div>
        
        {answer && (
          <div className="text-center text-gray-600 text-sm mt-2">
            Resposta registrada: {answer === 'yes' ? (element.popupYesText || 'Sim') : (element.popupNoText || 'Não')}
          </div>
        )}
      </div>
      
      {/* Popup Modal com cor customizada */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="text-center">
              <h3 
                className="text-lg font-bold mb-4"
                style={{ color: popupQuestionColor }}
              >
                {element.popupQuestion || "Você gostaria de continuar?"}
              </h3>
              
              <div className="flex gap-3 justify-center">
                <button 
                  className="px-6 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: element.yesButtonBgColor || "transparent",
                    color: element.yesButtonTextColor || "#000000",
                    borderColor: element.yesButtonTextColor || "#000000"
                  }}
                  onClick={() => handleQuestionAnswer('yes')}
                >
                  {element.popupYesText || "Sim"}
                </button>
                <button 
                  className="px-6 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: element.noButtonBgColor || "transparent",
                    color: element.noButtonTextColor || "#000000",
                    borderColor: element.noButtonTextColor || "#000000"
                  }}
                  onClick={() => handleQuestionAnswer('no')}
                >
                  {element.popupNoText || "Não"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface QuizPreviewProps {
  quiz: any;
  onClose: () => void;
  onSave?: (responses: any) => void;
  initialPage?: number;
}

export default function QuizPreview({ quiz, onClose, onSave, initialPage = 0 }: QuizPreviewProps) {
  // Garantir que o initialPage seja válido
  const allPagesForInit = quiz?.structure?.pages || quiz?.pages || [];
  const validInitialPage = Math.max(0, Math.min(initialPage, allPagesForInit.length - 1));
  
  const [currentStep, setCurrentStep] = useState(validInitialPage);
  const [responses, setResponses] = useState<any>({});
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [gameStates, setGameStates] = useState<any>({});
  const [audioStates, setAudioStates] = useState<any>({});
  const [videoStates, setVideoStates] = useState<any>({});
  const [loadingStates, setLoadingStates] = useState<any>({});
  const [counterStates, setCounterStates] = useState<any>({});
  const [redirectStates, setRedirectStates] = useState<any>({});
  const [animationStates, setAnimationStates] = useState<any>({});
  const [formStates, setFormStates] = useState<any>({});
  const [imageStates, setImageStates] = useState<any>({});
  const [textStates, setTextStates] = useState<any>({});
  const [progressStates, setProgressStates] = useState<any>({});
  const [customStates, setCustomStates] = useState<any>({});
  const [interactionStates, setInteractionStates] = useState<any>({});
  const [validationStates, setValidationStates] = useState<any>({});
  const [persistenceStates, setPersistenceStates] = useState<any>({});
  const [cacheStates, setCacheStates] = useState<any>({});
  const [networkStates, setNetworkStates] = useState<any>({});
  const [errorStates, setErrorStates] = useState<any>({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [allowBack, setAllowBack] = useState(true);
  const [allowSkip, setAllowSkip] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpText, setHelpText] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [hintText, setHintText] = useState('');
  const [showTimer, setShowTimer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerCallback, setTimerCallback] = useState<(() => void) | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);
  const [showRanking, setShowRanking] = useState(false);
  const [currentRank, setCurrentRank] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [showBadges, setShowBadges] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [availableBadges, setAvailableBadges] = useState<string[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<string[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [statisticsData, setStatisticsData] = useState<any>({});
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [showReports, setShowReports] = useState(false);
  const [reportsData, setReportsData] = useState<any>({});
  const [showExports, setShowExports] = useState(false);
  const [exportsData, setExportsData] = useState<any>({});
  const [showImports, setShowImports] = useState(false);
  const [importsData, setImportsData] = useState<any>({});
  const [showBackups, setShowBackups] = useState(false);
  const [backupsData, setBackupsData] = useState<any>({});
  const [showVersions, setShowVersions] = useState(false);
  const [versionsData, setVersionsData] = useState<any>({});
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<any>({});
  const [showLogs, setShowLogs] = useState(false);
  const [logsData, setLogsData] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);
  const [debugData, setDebugData] = useState<any>({});
  const [showConsole, setShowConsole] = useState(false);
  const [consoleData, setConsoleData] = useState<any>({});
  const [showSettings, setShowSettings] = useState(false);
  const [settingsData, setSettingsData] = useState<any>({});
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferencesData, setPreferencesData] = useState<any>({});
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [showAccount, setShowAccount] = useState(false);
  const [accountData, setAccountData] = useState<any>({});
  const [showBilling, setShowBilling] = useState(false);
  const [billingData, setBillingData] = useState<any>({});
  const [showSubscription, setShowSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>({});
  const [showPlan, setShowPlan] = useState(false);
  const [planData, setPlanData] = useState<any>({});
  const [showFeatures, setShowFeatures] = useState(false);
  const [featuresData, setFeaturesData] = useState<any>({});
  const [showLimits, setShowLimits] = useState(false);
  const [limitsData, setLimitsData] = useState<any>({});
  const [showQuota, setShowQuota] = useState(false);
  const [quotaData, setQuotaData] = useState<any>({});
  const [showUsage, setShowUsage] = useState(false);
  const [usageData, setUsageData] = useState<any>({});
  const [showMetrics, setShowMetrics] = useState(false);
  const [metricsData, setMetricsData] = useState<any>({});
  const [showKpis, setShowKpis] = useState(false);
  const [kpisData, setKpisData] = useState<any>({});
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [showOverview, setShowOverview] = useState(false);
  const [overviewData, setOverviewData] = useState<any>({});
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>({});
  const [showDetails, setShowDetails] = useState(false);
  const [detailsData, setDetailsData] = useState<any>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedData, setAdvancedData] = useState<any>({});
  const [showExpert, setShowExpert] = useState(false);
  const [expertData, setExpertData] = useState<any>({});
  const [showProfessional, setShowProfessional] = useState(false);
  const [professionalData, setProfessionalData] = useState<any>({});
  const [showEnterprise, setShowEnterprise] = useState(false);
  const [enterpriseData, setEnterpriseData] = useState<any>({});
  const [showCustom, setShowCustom] = useState(false);
  const [customData, setCustomData] = useState<any>({});
  
  // Estados para controle de responsividade
  const [viewportType, setViewportType] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');
  
  const { toast } = useToast();

  // Configurações de viewport para diferentes dispositivos
  const viewportConfig = {
    desktop: {
      width: '1200px',
      height: '800px',
      label: 'Desktop',
      icon: Monitor,
      description: '1200x800'
    },
    laptop: {
      width: '1024px',
      height: '768px',
      label: 'Laptop',
      icon: Laptop,
      description: '1024x768'
    },
    tablet: {
      width: '768px',
      height: '1024px',
      label: 'Tablet',
      icon: Tablet,
      description: '768x1024'
    },
    mobile: {
      width: '375px',
      height: '667px',
      label: 'Mobile',
      icon: Smartphone,
      description: '375x667'
    }
  };

  // Função para obter estilos do viewport
  const getViewportStyles = () => {
    const config = viewportConfig[viewportType];
    return {
      width: config.width,
      height: config.height,
      maxWidth: config.width,
      maxHeight: config.height,
      overflow: 'auto',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      margin: '0 auto',
      transition: 'all 0.3s ease'
    };
  };

  // Componente de controle de responsividade
  const ResponsiveControls = () => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Visualização:</span>
        </div>
        <div className="flex items-center space-x-2">
          {Object.entries(viewportConfig).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <Button
                key={key}
                variant={viewportType === key ? "default" : "outline"}
                size="sm"
                onClick={() => setViewportType(key as any)}
                className="flex items-center space-x-2 text-xs"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        {viewportConfig[viewportType].description}
      </div>
    </div>
  );

  const allPages = quiz?.structure?.pages || quiz?.pages || [];
  const totalSteps = allPages.length;
  const currentPage = allPages[currentStep];
  const isTransitionPage = currentPage?.isTransition || currentPage?.type === 'transition';
  const isGamePage = currentPage?.isGame || currentPage?.type === 'game';
  const isLastStep = currentStep === totalSteps - 1;
  const settings = quiz?.settings || {};
  const theme = quiz?.theme || 'default';

  // Variáveis para processamento dinâmico
  const processVariables = (text: string) => {
    if (!text) return text;
    
    let processedText = text;
    
    // Processar variáveis das respostas
    Object.entries(responses).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processedText = processedText.replace(regex, String(value));
    });
    
    // Processar variáveis de lead
    Object.entries(leadData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processedText = processedText.replace(regex, String(value));
    });
    
    return processedText;
  };

  // Função para gerar ID único estruturado para remarketing
  const generateUniqueId = (pageIndex: number, elementId: string) => {
    const quizName = quiz?.name || quiz?.title || 'quiz';
    const cleanQuizName = quizName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 10); // máximo 10 caracteres
    
    return `p${pageIndex + 1}_r_${cleanQuizName}`;
  };

  const handleAnswer = (elementId: string, answer: any, element?: any) => {
    // Gerar ID único para remarketing baseado na página atual
    const remarkingId = generateUniqueId(currentStep, elementId);
    
    setResponses(prev => ({
      ...prev,
      [remarkingId]: answer, // Usar ID estruturado para remarketing
      [elementId]: answer    // Manter ID original para funcionamento interno
    }));
    
    setIsDirty(true);
    
    // Auto-save if enabled
    if (autoSave) {
      saveToLocalStorage();
    }

    // Log para debug do sistema de remarketing
    console.log('🎯 REMARKETING ID:', remarkingId, '| RESPOSTA:', answer);

    // Navegação automática para múltipla escolha
    if (element?.type === 'multiple_choice' && !element?.requireContinueButton) {
      // Adicionar delay pequeno para feedback visual
      setTimeout(() => {
        if (currentStep < totalSteps - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // Última página - mostrar lead capture se habilitado
          if (settings.collectLeads && !showLeadCapture) {
            setShowLeadCapture(true);
          } else {
            handleComplete();
          }
        }
      }, 300); // 300ms para feedback visual da seleção
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Última página - mostrar lead capture se habilitado
      if (settings.collectLeads && !showLeadCapture) {
        setShowLeadCapture(true);
      } else {
        handleComplete();
      }
    }
  };

  // Função para aplicar estilos visuais baseados nas propriedades
  const getElementStyles = (element: any) => {
    const styles: any = {};
    
    // Debug: log das propriedades
    if (element?.fontSize || element?.textColor || element?.fontWeight || element?.textAlign) {
      console.log('Element with visual properties:', element);
    }
    
    // Tamanho do texto - usar element.fontSize
    if (element?.fontSize) {
      switch (element.fontSize) {
        case 'sm':
          styles.fontSize = '14px';
          break;
        case 'base':
          styles.fontSize = '16px';
          break;
        case 'lg':
          styles.fontSize = '18px';
          break;
        case 'xl':
          styles.fontSize = '20px';
          break;
        case '2xl':
          styles.fontSize = '24px';
          break;
        case '3xl':
          styles.fontSize = '30px';
          break;
        case '4xl':
          styles.fontSize = '36px';
          break;
        default:
          styles.fontSize = '16px';
      }
    }
    
    // Cor do texto
    if (element?.textColor) {
      styles.color = element.textColor;
    }
    
    // Peso da fonte
    if (element?.fontWeight) {
      styles.fontWeight = element.fontWeight;
    }
    
    // Alinhamento
    if (element?.textAlign) {
      styles.textAlign = element.textAlign;
    }
    
    // Estilo da fonte
    if (element?.fontStyle) {
      styles.fontStyle = element.fontStyle;
    }
    
    // Decoração do texto (sublinhado)
    if (element?.textDecoration) {
      styles.textDecoration = element.textDecoration;
    }
    
    // Cor de fundo
    if (element?.backgroundColor) {
      styles.backgroundColor = element.backgroundColor;
    }
    
    // Padding para cor de fundo
    if (element?.backgroundColor) {
      styles.padding = '8px 12px';
      styles.borderRadius = '4px';
    }
    
    return styles;
  };

  // Função para obter classes CSS baseadas nas propriedades
  const getElementClasses = (element: any) => {
    let classes = '';
    
    // Tamanho do texto
    if (element?.fontSize) {
      switch (element.fontSize) {
        case 'sm':
          classes += ' text-sm';
          break;
        case 'base':
          classes += ' text-base';
          break;
        case 'lg':
          classes += ' text-lg';
          break;
        case 'xl':
          classes += ' text-xl';
          break;
        case '2xl':
          classes += ' text-2xl';
          break;
        case '3xl':
          classes += ' text-3xl';
          break;
        case '4xl':
          classes += ' text-4xl';
          break;
      }
    }
    
    // Peso da fonte
    if (element?.fontWeight) {
      switch (element.fontWeight) {
        case 'light':
          classes += ' font-light';
          break;
        case 'normal':
          classes += ' font-normal';
          break;
        case 'medium':
          classes += ' font-medium';
          break;
        case 'bold':
          classes += ' font-bold';
          break;
      }
    }
    
    // Alinhamento
    if (element?.textAlign) {
      switch (element.textAlign) {
        case 'left':
          classes += ' text-left';
          break;
        case 'center':
          classes += ' text-center';
          break;
        case 'right':
          classes += ' text-right';
          break;
      }
    }
    
    // Estilo da fonte
    if (element?.fontStyle) {
      if (element.fontStyle === 'italic') {
        classes += ' italic';
      }
    }
    
    // Decoração do texto (sublinhado)
    if (element?.textDecoration) {
      if (element.textDecoration === 'underline') {
        classes += ' underline';
      }
    }
    
    return classes;
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      const finalResponses = {
        ...responses,
        leadData: settings.collectLeads ? leadData : null,
        completedAt: new Date().toISOString(),
        totalTime: Date.now() - (Date.now() - totalTime)
      };
      
      if (onSave) {
        await onSave(finalResponses);
      }
      
      toast({
        title: "Quiz concluído!",
        description: "Suas respostas foram enviadas com sucesso.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar suas respostas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveToLocalStorage = () => {
    try {
      const data = {
        responses,
        leadData,
        currentStep,
        timestamp: Date.now()
      };
      localStorage.setItem(`quiz_${quiz.id}_progress`, JSON.stringify(data));
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      // Para modo de preview, não carregar do localStorage - sempre usar initialPage
      if (typeof initialPage === 'number' && initialPage >= 0) {
        return;
      }
      
      const saved = localStorage.getItem(`quiz_${quiz.id}_progress`);
      if (saved) {
        const data = JSON.parse(saved);
        setResponses(data.responses || {});
        setLeadData(data.leadData || { name: '', email: '', phone: '' });
        const savedStep = data.currentStep || 0;
        setCurrentStep(Math.max(0, Math.min(savedStep, allPages.length - 1)));
        setLastSaved(new Date(data.timestamp));
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
  };

  // Efeitos
  useEffect(() => {
    loadFromLocalStorage();
  }, [quiz.id]);

  // Sincronizar currentStep com initialPage quando ele mudar (modo preview)
  useEffect(() => {
    if (typeof initialPage === 'number' && initialPage >= 0 && initialPage < allPages.length) {
      setCurrentStep(initialPage);
    }
  }, [initialPage, allPages.length]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (autoSave && isDirty) {
      const timer = setTimeout(() => {
        saveToLocalStorage();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [responses, leadData, currentStep, isDirty, autoSave]);

  // Componente para barra de progresso
  const ProgressBarElement = ({ element }: { element: any }) => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    
    useEffect(() => {
      const duration = (element.progressDuration || 5) * 1000;
      const steps = 100;
      const interval = duration / steps;
      
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsComplete(true);
            clearInterval(timer);
            return 100;
          }
          return prev + 1;
        });
      }, interval);
      
      return () => clearInterval(timer);
    }, [element.progressDuration]);
    
    return (
      <div className="w-full space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">
            {element.progressText || "Carregando..."}
          </h4>
          {element.progressShowPercentage && (
            <span className="text-sm font-mono text-gray-600">{progress}%</span>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full" style={{ height: element.progressHeight || 8 }}>
          <div 
            className="h-full rounded-full transition-all duration-100"
            style={{ 
              width: `${progress}%`,
              backgroundColor: element.progressColor || "#3b82f6",
              borderRadius: element.progressStyle === "squared" ? "0" : 
                           element.progressStyle === "pill" ? "50px" : "4px"
            }}
          />
        </div>
        
        {isComplete && (
          <div className="text-center text-green-600 font-medium">
            ✓ Completo!
          </div>
        )}
      </div>
    );
  };

  // Componente para netflix_intro (versão preview)
  const NetflixIntroElementPreview = ({ element }: { element: any }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentLetter, setCurrentLetter] = useState(0);
    
    const letters = (element.netflixLetters || "N-E-T-F-L-I-X").split("-");
    const speed = element.netflixAnimationSpeed || "normal";
    const animationDelay = speed === "slow" ? 400 : speed === "fast" ? 200 : 300;
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
      if (isVisible && currentLetter < letters.length) {
        const timer = setTimeout(() => {
          setCurrentLetter(prev => prev + 1);
        }, animationDelay);
        
        return () => clearTimeout(timer);
      }
    }, [isVisible, currentLetter, letters.length, animationDelay]);
    
    if (!isVisible) return null;
    
    return (
      <div className={`netflix-intro-container ${element.netflixFullscreen ? 'netflix-fullscreen' : ''}`}>
        <div className="netflix-intro-content">
          {element.netflixShowTitle && (
            <h1 className="netflix-intro-title">
              {element.netflixTitle || "NETFLIX"}
            </h1>
          )}
          
          <div className="netflix-intro-letters">
            {letters.map((letter, index) => (
              <span
                key={index}
                className={`netflix-intro-letter ${index < currentLetter ? 'netflix-intro-letter-visible' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </div>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            Preview: Netflix intro animation
          </div>
        </div>
      </div>
    );
  };

  // Componente para carregamento + pergunta
  const LoadingWithQuestionElement = ({ element }: { element: any }) => {
    const [progress, setProgress] = useState(0);
    const [showQuestion, setShowQuestion] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    
    useEffect(() => {
      const duration = (element.loadingDuration || 3) * 1000;
      const steps = 100;
      const interval = duration / steps;
      
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setShowQuestion(true);
            clearInterval(timer);
            return 100;
          }
          return prev + 1;
        });
      }, interval);
      
      return () => clearInterval(timer);
    }, [element.loadingDuration]);
    
    const handleAnswer = (value: string) => {
      setAnswer(value);
      if (element.fieldId) {
        setResponses(prev => ({
          ...prev,
          [element.fieldId]: value
        }));
      }
      // 🔥 SILENT RESPONSE - Não mostrar "resposta registrada"
    };
    
    return (
      <div className="w-full space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
        {!showQuestion && (
          <div className="space-y-3">
            {element.loadingText && (
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">
                  {element.loadingText}
                </h4>
              </div>
            )}
            <div className="flex items-center justify-between">
              {element.loadingShowPercentage && (
                <span className="text-sm font-mono text-gray-600">{progress}%</span>
              )}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full" style={{ height: element.loadingHeight || 8 }}>
              <div 
                className="h-full rounded-full transition-all duration-100"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: element.loadingColor || "#3b82f6",
                  borderRadius: element.loadingStyle === "squared" ? "0" : 
                               element.loadingStyle === "pill" ? "50px" : "4px"
                }}
              />
            </div>
          </div>
        )}
        
        {showQuestion && (
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {element.questionTitle || "Pergunta Personalizada"}
              </h3>
              {element.questionDescription && (
                <p className="text-sm text-gray-600 mb-4">
                  {element.questionDescription}
                </p>
              )}
            </div>
            
            <div className="flex gap-3 justify-center">
              <button 
                className={`px-6 py-2 rounded-lg transition-colors ${
                  answer === 'yes' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                onClick={() => handleAnswer('yes')}
              >
                {element.yesButtonText || "Sim"}
              </button>
              <button 
                className={`px-6 py-2 rounded-lg transition-colors ${
                  answer === 'no' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
                onClick={() => handleAnswer('no')}
              >
                {element.noButtonText || "Não"}
              </button>
            </div>
            
            {answer && (
              <div className="text-center text-gray-600 text-sm mt-2">
                Resposta registrada: {answer === 'yes' ? 'Sim' : 'Não'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContentElement = (element: any) => {
    switch (element.type) {
      case 'heading':
        return (
          <div className="mb-4">
            <h1 
              className={`text-2xl font-bold text-gray-900${getElementClasses(element)}`}
              style={getElementStyles(element)}
            >
              {processVariables(element.content || 'Título')}
            </h1>
          </div>
        );

      case 'paragraph':
        return (
          <div className="mb-4">
            <p 
              className={`text-gray-700 ${getElementClasses(element)}`}
              style={getElementStyles(element)}
            >
              {processVariables(element.content || 'Parágrafo de texto')}
            </p>
          </div>
        );

      case 'image':
        return (
          <div className="mb-4">
            {element.imageUrl ? (
              <img 
                src={element.imageUrl} 
                alt={element.altText || "Imagem"}
                className="w-full rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <Image className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="mb-4">
            <video controls className="w-full rounded-lg">
              <source src={element.videoUrl || element.content} type="video/mp4" />
              <source src={element.videoUrl || element.content} type="video/ogg" />
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="mb-4">
            <audio controls className="w-full">
              <source src={element.audioUrl || element.content} type="audio/mpeg" />
              <source src={element.audioUrl || element.content} type="audio/ogg" />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        );

      case 'divider':
        return (
          <div className="mb-4">
            <hr className="border-gray-300" />
          </div>
        );

      case 'spacer':
        return (
          <div 
            className="mb-4" 
            style={{ height: `${element.height || 20}px` }}
          />
        );

      case 'multiple_choice':
        return (
          <div className="mb-6">
            {element.question && (
              <h3 
                className={`text-lg font-medium text-gray-900 mb-4 ${getElementClasses(element)}`}
                style={getElementStyles(element)}
              >
                {processVariables(element.question)}
                
              </h3>
            )}
            <div className="space-y-3">
              {element.options?.map((option: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    responses[element.id] === option.text
                      ? 'border-gray-400 bg-white'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  style={{
                    borderColor: responses[element.id] === option.text 
                      ? (element.textColor || '#6B7280') 
                      : 'rgba(156, 163, 175, 0.5)',
                    backgroundColor: 'white'
                  }}
                  onClick={() => handleAnswer(element.id, option.text, element)}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 ${
                        responses[element.id] === option.text
                          ? ''
                          : 'border-gray-300'
                      }`}
                      style={{
                        borderColor: responses[element.id] === option.text 
                          ? (element.checkboxColor || '#6B7280') 
                          : 'rgba(156, 163, 175, 0.5)',
                        backgroundColor: responses[element.id] === option.text 
                          ? (element.checkboxColor || '#6B7280') 
                          : 'transparent'
                      }}
                    />
                    <span 
                      className="text-gray-700"
                      style={{ 
                        color: element.optionTextColor || '#374151',
                        fontSize: element.optionFontSize === 'xs' ? '0.75rem' :
                                element.optionFontSize === 'sm' ? '0.875rem' :
                                element.optionFontSize === 'lg' ? '1.125rem' :
                                element.optionFontSize === 'xl' ? '1.25rem' : '1rem',
                        fontWeight: element.optionFontWeight === 'light' ? '300' :
                                   element.optionFontWeight === 'medium' ? '500' :
                                   element.optionFontWeight === 'semibold' ? '600' :
                                   element.optionFontWeight === 'bold' ? '700' : '400'
                      }}
                    >
                      {typeof option === 'string' ? option : option?.text || `Opção ${index + 1}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="mb-6">
            {element.question && (
              <label 
                className={`block text-sm font-medium text-gray-700 mb-2 ${getElementClasses(element)}`}
                style={getElementStyles(element)}
              >
                {processVariables(element.question)}
                
              </label>
            )}
            <Input
              type="text"
              placeholder={element.placeholder || "Digite sua resposta"}
              value={responses[element.id] || ''}
              onChange={(e) => handleAnswer(element.id, e.target.value, element)}
              className="w-full"
            />
          </div>
        );

      case 'email':
        return (
          <div className="mb-6">
            {element.question && (
              <label 
                className={`block text-sm font-medium text-gray-700 mb-2 ${getElementClasses(element)}`}
                style={getElementStyles(element)}
              >
                {processVariables(element.question)}
                
              </label>
            )}
            <div className={`${
              element.fieldWidth === 'small' ? 'max-w-xs' :
              element.fieldWidth === 'medium' ? 'max-w-sm' :
              element.fieldWidth === 'large' ? 'max-w-md' :
              'max-w-full'
            } ${
              element.fieldAlign === 'left' ? 'mr-auto' :
              element.fieldAlign === 'right' ? 'ml-auto' :
              'mx-auto'
            }`}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                <Input
                  type="email"
                  placeholder={element.placeholder || "seu@email.com"}
                  value={responses[element.id] || ''}
                  onChange={(e) => handleAnswer(element.id, e.target.value, element)}
                  className={`pl-10 ${
                    element.fieldStyle === 'rounded' ? 'rounded-full' :
                    element.fieldStyle === 'square' ? 'rounded-none' :
                    'rounded-md'
                  } ${
                    element.textAlign === 'center' ? 'text-center' :
                    element.textAlign === 'right' ? 'text-right' :
                    'text-left'
                  }`}
                />
              </div>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {processVariables(element.question)}
                
              </label>
            )}
            <div className={`${
              element.fieldWidth === 'small' ? 'max-w-xs' :
              element.fieldWidth === 'medium' ? 'max-w-sm' :
              element.fieldWidth === 'large' ? 'max-w-md' :
              'max-w-full'
            } ${
              element.fieldAlign === 'left' ? 'mr-auto' :
              element.fieldAlign === 'right' ? 'ml-auto' :
              'mx-auto'
            }`}>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
                <Input
                  type="tel"
                  placeholder={element.placeholder || "(11) 99999-9999"}
                  value={responses[element.id] || ''}
                  onChange={(e) => handleAnswer(element.id, e.target.value, element)}
                  className={`pl-10 ${
                    element.fieldStyle === 'rounded' ? 'rounded-full' :
                    element.fieldStyle === 'square' ? 'rounded-none' :
                    'rounded-md'
                  } ${
                    element.textAlign === 'center' ? 'text-center' :
                    element.textAlign === 'right' ? 'text-right' :
                    'text-left'
                  }`}
                />
              </div>
            </div>
          </div>
        );

      case 'height':
      case 'altura':
        return (
          <div className="mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-3">
                <ArrowUpDown className="w-6 h-6 text-purple-600" />
                <h3 
                  className={`text-lg font-semibold text-purple-800 ${getElementClasses(element)}`}
                  style={getElementStyles(element)}
                >
                  {element.question || element.content || 'Qual é a sua altura?'}
                  
                </h3>
              </div>
              
              <div className={`${
                element.fieldWidth === 'small' ? 'max-w-xs' :
                element.fieldWidth === 'medium' ? 'max-w-sm' :
                element.fieldWidth === 'large' ? 'max-w-md' :
                'max-w-full'
              } ${
                element.fieldAlign === 'left' ? 'mr-auto' :
                element.fieldAlign === 'right' ? 'ml-auto' :
                'mx-auto'
              }`}>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={element.placeholder || '170'}
                    value={responses[element.id] || ''}
                    onChange={(e) => handleAnswer(element.id, Number(e.target.value), element)}
                    className={`pr-12 text-center text-lg font-medium ${
                      element.fieldStyle === 'rounded' ? 'rounded-full' :
                      element.fieldStyle === 'square' ? 'rounded-none' :
                      'rounded-md'
                    }`}
                    min={element.min || 100}
                    max={element.max || 250}
                    required={element.required}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    {element.unit || 'cm'}
                  </div>
                </div>
              </div>
              
              {element.showBMICalculation && (
                <div className="text-xs text-purple-700 bg-purple-100 p-3 rounded mt-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>IMC será calculado automaticamente quando peso for informado</span>
                </div>
              )}
              
              {element.showHeightRange && (
                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Mínimo: {element.min || 100}cm</span>
                    <span>Máximo: {element.max || 250}cm</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((responses[element.id] || 0) - (element.min || 100)) / ((element.max || 250) - (element.min || 100)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {processVariables(element.question)}
                
              </label>
            )}
            <Input
              type="number"
              min={element.min}
              max={element.max}
              step={element.step}
              placeholder={element.placeholder || "0"}
              value={responses[element.id] || ''}
              onChange={(e) => handleAnswer(element.id, e.target.value, element)}
              className="w-full"
            />
          </div>
        );

      case 'rating':
        return (
          <div className="mb-6">
            {element.question && (
              <h3 
                className={`text-lg font-medium text-gray-900 mb-4${getElementClasses(element)}`}
                style={getElementStyles(element)}
              >
                {processVariables(element.question)}
                
              </h3>
            )}
            <div className="flex space-x-1">
              {Array.from({ length: element.maxRating || 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 cursor-pointer ${
                    i < (responses[element.id] || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  onClick={() => handleAnswer(element.id, i + 1, element)}
                />
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="mb-6">
            {element.question && (
              <label 
                className={`block text-sm font-medium text-gray-700 mb-2 ${getElementClasses(element)}`}
                style={getElementStyles(element)}
              >
                {processVariables(element.question)}
                
              </label>
            )}
            <Input
              type="date"
              value={responses[element.id] || ''}
              onChange={(e) => handleAnswer(element.id, e.target.value, element)}
              className="w-full"
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="mb-6">
            {element.question && (
              <label 
                className={`block text-sm font-medium text-gray-700 mb-2 ${getElementClasses(element)}`}
                style={getElementStyles(element)}
              >
                {processVariables(element.question)}
                
              </label>
            )}
            <Textarea
              placeholder={element.placeholder || "Digite sua resposta..."}
              value={responses[element.id] || ''}
              onChange={(e) => handleAnswer(element.id, e.target.value, element)}
              rows={4}
              className="w-full"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="mb-6">
            {element.question && (
              <h3 
                className={`text-lg font-medium text-gray-900 mb-4${getElementClasses(element)}`}
                style={getElementStyles(element)}
              >
                {processVariables(element.question)}
                
              </h3>
            )}
            <div className="space-y-3">
              {element.options?.map((option: any, index: number) => (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox
                    id={`${element.id}-${index}`}
                    checked={responses[element.id]?.includes(option.text) || false}
                    onCheckedChange={(checked) => {
                      const currentAnswers = responses[element.id] || [];
                      const newAnswers = checked
                        ? [...currentAnswers, option.text]
                        : currentAnswers.filter((a: string) => a !== option.text);
                      handleAnswer(element.id, newAnswers, element);
                    }}
                  />
                  <label 
                    htmlFor={`${element.id}-${index}`}
                    className="text-gray-700 cursor-pointer"
                  >
                    {option.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'continue_button':
        return (
          <div className="flex justify-center mb-6">
            <Button
              onClick={handleNext}
              className="px-8 py-3 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: quiz.design?.buttonColor || '#3B82F6',
                borderRadius: quiz.design?.buttonCorners === 'square' ? '0px' :
                           quiz.design?.buttonCorners === 'rounded' ? '12px' : '8px'
              }}
            >
              {element.buttonText || element.content || 'Continuar'}
            </Button>
          </div>
        );

      case 'select':
        return (
          <div className="mb-6">
            {element.question && (
              <label 
                className={`block text-sm font-medium text-gray-700 mb-2 ${getElementClasses(element)}`}
                style={getElementStyles(element)}
              >
                {processVariables(element.question)}
                
              </label>
            )}
            <select
              value={responses[element.id] || ''}
              onChange={(e) => handleAnswer(element.id, e.target.value, element)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={element.required}
            >
              <option value="">{element.placeholder || 'Selecione uma opção'}</option>
              {element.options?.map((option: any, index: number) => (
                <option key={index} value={option.text || option}>
                  {option.text || option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'birth_date':
        return (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h3 
                className={`text-lg font-semibold text-gray-900 ${getElementClasses(element)}`}
                style={getElementStyles(element)}
              >
                {element.question || element.content || 'Data de Nascimento'}
                
              </h3>
            </div>
            <input
              type="date"
              value={responses[element.id] || ''}
              onChange={(e) => handleAnswer(element.id, e.target.value, element)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={element.required}
            />
            {element.showAgeCalculation && (
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded mt-2">
                💡 Idade será calculada automaticamente
              </div>
            )}
          </div>
        );

      case 'loading_question':
        return (
          <div className="mb-6">
            <LoadingQuestionElementPreview element={element} />
          </div>
        );

      case 'guarantee':
        return (
          <div className="mb-6">
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 
                    className={`text-lg font-semibold text-green-800 ${getElementClasses(element)}`}
                    style={getElementStyles(element)}
                  >
                    {element.guaranteeTitle || element.content || 'Garantia de 30 dias'}
                  </h3>
                  <p className="text-green-700 mt-1">
                    {element.guaranteeDescription || 'Se você não ficar satisfeito, devolvemos seu dinheiro'}
                  </p>
                  {element.guaranteeFeatures && (
                    <ul className="mt-3 space-y-1">
                      {element.guaranteeFeatures.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'faq':
        const faqData = element.faqData || [
          {
            id: "faq-1",
            question: "Como funciona o sistema?",
            answer: "O sistema é muito simples de usar. Você cria seus quizzes, compartilha com sua audiência e acompanha os resultados em tempo real através do dashboard."
          },
          {
            id: "faq-2", 
            question: "Posso cancelar a qualquer momento?",
            answer: "Sim, você pode cancelar sua assinatura a qualquer momento. Não há taxas de cancelamento ou multas."
          },
          {
            id: "faq-3",
            question: "Há limite de respostas?",
            answer: "Depende do seu plano. O plano básico tem 1000 respostas/mês, o profissional tem 10000 e o enterprise é ilimitado."
          }
        ];
        
        return (
          <div className="mb-6">
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
              <div className="space-y-3">
                {faqData.map((faq: any, index: number) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button 
                      className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 ${getElementClasses(element)}`}
                      style={getElementStyles(element)}
                    >
                      <span className="font-medium text-gray-800">{faq.question}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'chart':
        const chartData = element.chartData || [
          { label: "Semana 1", value: 45, color: "#ef4444" },
          { label: "Semana 2", value: 65, color: "#f59e0b" },
          { label: "Semana 3", value: 85, color: "#10b981" },
          { label: "Semana 4", value: 92, color: "#3b82f6" }
        ];
        
        return (
          <div className="mb-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle style={{ color: element.chartTitleColor || '#1F2937' }}>
                  {element.chartTitle || 'Gráfico de Resultados'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64">
                  <Chart
                    type={element.chartType || 'bar'}
                    data={chartData}
                    title={element.chartTitle}
                    showLegend={element.chartShowLegend !== false}
                    backgroundColor={element.chartBackgroundColor || '#3b82f6'}
                    borderColor={element.chartBorderColor || '#1d4ed8'}
                    height={250}
                  />
                </div>
                {element.chartDescription && (
                  <p className="mt-4 text-sm text-gray-600 text-center">
                    {element.chartDescription}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'metrics':
        const metricsData = element.metricsData || [
          { label: element.metric1Name || "Visualizações", value: element.metric1Value || 1250, color: "#3b82f6" },
          { label: element.metric2Name || "Conversões", value: element.metric2Value || 89, color: "#10b981" },
          { label: element.metric3Name || "Taxa", value: element.metric3Value || 7.1, color: "#f59e0b" }
        ];

        return (
          <div className="mb-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>
                  {element.metricsTitle || 'Métricas de Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64">
                  <Chart
                    type={element.metricsChartType || 'bar'}
                    data={metricsData}
                    title={element.metricsTitle}
                    showLegend={element.metricsShowLegend !== false}
                    backgroundColor={element.metricsBackgroundColor || '#3b82f6'}
                    borderColor={element.metricsBorderColor || '#1d4ed8'}
                    height={250}
                  />
                </div>
                {element.metricsDescription && (
                  <p className="mt-4 text-sm text-gray-600 text-center">
                    {element.metricsDescription}
                  </p>
                )}
                {element.metricsShowValues && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {metricsData.map((metric, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold" style={{ color: metric.color }}>
                          {metric.value}
                          {element.metricsShowPercentage && '%'}
                        </div>
                        <div className="text-sm text-gray-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'loader':
        return (
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium">
                {element.content || 'Carregando...'}
              </span>
            </div>
          </div>
        );

      case 'counter':
        return (
          <div className="mb-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {element.content || '10'}
            </div>
            <div className="text-sm text-gray-600">
              {element.description || 'Aguarde...'}
            </div>
          </div>
        );

      case 'redirect':
        return (
          <div className="mb-6 text-center">
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-lg font-medium mb-2">
                {element.content || 'Redirecionando...'}
              </div>
              <div className="text-sm text-gray-600">
                {element.description || 'Você será redirecionado em breve.'}
              </div>
            </div>
          </div>
        );

      case 'before_after':
        // Dados para gráfico antes/depois
        const beforeAfterData = element.beforeAfterData || [
          { label: "Antes", value: element.beforeValue || 25, color: element.beforeColor || "#ef4444" },
          { label: "Depois", value: element.afterValue || 85, color: element.afterColor || "#10b981" }
        ];

        return (
          <div className="mb-4 space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            {element.beforeAfterTitle && (
              <h3 className="text-lg font-bold text-center mb-4" style={{ color: element.titleColor || '#1f2937' }}>
                {element.beforeAfterTitle}
              </h3>
            )}
            
            {element.beforeAfterDisplayType === 'chart' ? (
              <div className="w-full h-64">
                <Chart
                  type={element.beforeAfterChartType || 'bar'}
                  data={beforeAfterData}
                  title={element.beforeAfterTitle}
                  showLegend={element.beforeAfterShowLegend !== false}
                  backgroundColor={element.beforeAfterChartBg || '#3b82f6'}
                  borderColor={element.beforeAfterChartBorder || '#1d4ed8'}
                  height={250}
                />
              </div>
            ) : element.beforeAfterDisplayType === 'metrics' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 rounded-lg" style={{ backgroundColor: element.beforeColor || '#fef2f2' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: element.beforeColor || '#dc2626' }}>
                    {element.beforeValue || 25}
                    {element.beforeAfterShowPercent && '%'}
                  </div>
                  <h4 className="text-lg font-semibold mb-1" style={{ color: element.beforeColor || '#dc2626' }}>
                    {element.beforeAfterLabels?.before || "ANTES"}
                  </h4>
                  <p className="text-sm opacity-80">{element.beforeDescription || "Situação anterior"}</p>
                </div>
                
                <div className="text-center p-6 rounded-lg" style={{ backgroundColor: element.afterColor || '#f0fdf4' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: element.afterColor || '#16a34a' }}>
                    {element.afterValue || 85}
                    {element.beforeAfterShowPercent && '%'}
                  </div>
                  <h4 className="text-lg font-semibold mb-1" style={{ color: element.afterColor || '#16a34a' }}>
                    {element.beforeAfterLabels?.after || "DEPOIS"}
                  </h4>
                  <p className="text-sm opacity-80">{element.afterDescription || "Resultado alcançado"}</p>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-lg" style={{
                width: element.beforeAfterWidth || "100%", 
                height: element.beforeAfterHeight || "400px"
              }}>
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-2">😔</div>
                      <h3 className="text-xl font-bold">
                        {element.beforeAfterLabels?.before || "ANTES"}
                      </h3>
                      <p className="text-sm opacity-90">{element.beforeDescription || "Situação anterior"}</p>
                    </div>
                  </div>
                  
                  <div className="w-1/2 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-2">😊</div>
                      <h3 className="text-xl font-bold">
                        {element.beforeAfterLabels?.after || "DEPOIS"}
                      </h3>
                      <p className="text-sm opacity-90">{element.afterDescription || "Resultado alcançado"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-white shadow-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-300">
                    <ArrowUpDown className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            )}
            
            {element.beforeAfterDisplayType !== 'visual' && (
              <div className="text-center text-sm text-gray-600">
                {element.beforeAfterDescription || "Comparação entre antes e depois"}
              </div>
            )}
          </div>
        );

      case 'progress_bar':
        return (
          <div className="mb-4">
            <ProgressBarElement element={element} />
          </div>
        );

      case 'loading_with_question':
        return (
          <div className="mb-4">
            <LoadingWithQuestionElement element={element} />
          </div>
        );

      case 'netflix_intro':
        return (
          <div className="mb-4">
            <NetflixIntroElementPreview element={element} />
          </div>
        );

      default:
        return (
          <div className="mb-4 p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-600 font-medium">⚠️ Elemento não suportado:</span>
              <code className="text-orange-800 bg-orange-100 px-2 py-1 rounded text-sm">{element.type}</code>
            </div>
            <p className="text-orange-700 text-sm">
              Este elemento será renderizado corretamente no quiz publicado.
            </p>
          </div>
        );
    }
  };

  const renderLeadCapture = () => {
    if (!showLeadCapture) return null;

    return (
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quase lá!
          </h2>
          <p className="text-gray-600">
            Para ver seus resultados personalizados, precisamos de algumas informações:
          </p>
        </div>

        <div className="space-y-4">
          {settings?.collectName && (
            <div>
              <Label htmlFor="name">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={leadData.name}
                  onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {settings?.collectEmail && (
            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={leadData.email}
                  onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {settings?.collectPhone && (
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={leadData.phone}
                  onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Ver Meus Resultados'
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderTransitionPage = () => {
    return (
      <div className="space-y-6 text-center">
        {currentPage.elements?.map((element: any, index: number) => (
          <div key={index}>
            {renderContentElement(element)}
          </div>
        ))}
        
        {/* Auto-avançar para próxima página se não houver elemento redirect */}
        {currentPage.elements?.length > 0 && !currentPage.elements.some((el: any) => el.type === 'redirect' || el.type === 'transition_redirect') && (
          <div className="mt-8">
            <Button
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Continuar
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderGamePage = () => {
    return (
      <div className="space-y-6 text-center">
        {currentPage.elements?.map((element: any, index: number) => (
          <div key={index}>
            {renderContentElement(element)}
          </div>
        ))}
        
        {/* Botão para continuar após completar o jogo */}
        <div className="mt-8">
          <Button
            onClick={handleNext}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    if (showLeadCapture) {
      return renderLeadCapture();
    }

    if (!currentPage) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Finalizado!</h2>
          <p className="text-gray-600">Obrigado por participar do nosso quiz.</p>
        </div>
      );
    }

    // Verificar se é página de transição
    const isTransitionPage = currentPage.isTransition || currentPage.type === 'transition' || 
      currentPage.elements?.some((el: any) => 
        ['transition_background', 'transition_text', 'transition_counter', 'transition_loader', 'transition_redirect', 'loader', 'counter', 'redirect'].includes(el.type)
      );

    // Verificar se é página de jogo
    const isGamePage = currentPage.isGame || currentPage.type === 'game' || 
      currentPage.elements?.some((el: any) => 
        ['game_wheel', 'game_scratch', 'game_color_pick', 'game_brick_break', 'game_memory_cards', 'game_slot_machine'].includes(el.type)
      );

    // Se é página de transição, renderizar com lógica específica
    if (isTransitionPage) {
      return renderTransitionPage();
    }

    // Se é página de jogo, renderizar com lógica específica
    if (isGamePage) {
      return renderGamePage();
    }

    // Renderizar página normal
    return (
      <div className="space-y-6">
        {currentPage.elements?.map((element: any, index: number) => (
          <div key={index}>
            {renderContentElement(element)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Controles de responsividade */}
      <ResponsiveControls />
      
      {/* Container com viewport responsivo */}
      <div className="flex justify-center bg-gray-100 p-8 rounded-lg">
        <div style={getViewportStyles()}>
          {/* Quiz Card */}
          <Card className="shadow-lg border-gray-200 h-full">
            <CardContent className="p-6 h-full flex flex-col">
              {/* Progress Bar inside card */}
              {showProgress && !showLeadCapture && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Pergunta {currentStep + 1} de {totalSteps}</span>
                    <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
                  </div>
                  <div 
                    className={`w-full overflow-hidden ${
                      quiz.design?.progressBarStyle === 'square' ? 'rounded-none' :
                      quiz.design?.progressBarStyle === 'thin' ? 'rounded-sm' :
                      quiz.design?.progressBarStyle === 'thick' ? 'rounded-lg' :
                      'rounded-full'
                    }`}
                    style={{ 
                      height: `${quiz.design?.progressBarHeight || 8}px`,
                      backgroundColor: '#e5e7eb'
                    }}
                  >
                    <div
                      className={`h-full transition-all duration-300 ${
                        quiz.design?.progressBarStyle === 'square' ? 'rounded-none' :
                        quiz.design?.progressBarStyle === 'thin' ? 'rounded-sm' :
                        quiz.design?.progressBarStyle === 'thick' ? 'rounded-lg' :
                        'rounded-full'
                      }`}
                      style={{ 
                        width: `${((currentStep + 1) / totalSteps) * 100}%`,
                        backgroundColor: quiz.design?.progressBarColor || '#3B82F6'
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto" style={{ minHeight: '300px' }}>
                {renderPage()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}