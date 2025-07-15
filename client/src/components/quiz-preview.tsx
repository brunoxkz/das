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

interface QuizPreviewProps {
  quiz: any;
  onClose: () => void;
  onSave?: (responses: any) => void;
}

export default function QuizPreview({ quiz, onClose, onSave }: QuizPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
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
  
  const { toast } = useToast();

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

  const handleAnswer = (elementId: string, answer: any, element?: any) => {
    setResponses(prev => ({
      ...prev,
      [elementId]: answer
    }));
    
    setIsDirty(true);
    
    // Auto-save if enabled
    if (autoSave) {
      saveToLocalStorage();
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
      const saved = localStorage.getItem(`quiz_${quiz.id}_progress`);
      if (saved) {
        const data = JSON.parse(saved);
        setResponses(data.responses || {});
        setLeadData(data.leadData || { name: '', email: '', phone: '' });
        setCurrentStep(data.currentStep || 0);
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

  const renderContentElement = (element: any) => {
    switch (element.type) {
      case 'heading':
        return (
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {processVariables(element.content || 'Título')}
            </h1>
          </div>
        );

      case 'paragraph':
        return (
          <div className="mb-4">
            <p className="text-gray-700">
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {processVariables(element.question)}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
            )}
            <div className="space-y-3">
              {element.options?.map((option: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    responses[element.id] === option.text
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAnswer(element.id, option.text, element)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      responses[element.id] === option.text
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`} />
                    <span className="text-gray-700">{option.text}</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {processVariables(element.question)}
                {element.required && <span className="text-red-500 ml-1">*</span>}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {processVariables(element.question)}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                placeholder={element.placeholder || "seu@email.com"}
                value={responses[element.id] || ''}
                onChange={(e) => handleAnswer(element.id, e.target.value, element)}
                className="pl-10"
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {processVariables(element.question)}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="tel"
                placeholder={element.placeholder || "(11) 99999-9999"}
                value={responses[element.id] || ''}
                onChange={(e) => handleAnswer(element.id, e.target.value, element)}
                className="pl-10"
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {processVariables(element.question)}
                {element.required && <span className="text-red-500 ml-1">*</span>}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {processVariables(element.question)}
                {element.required && <span className="text-red-500 ml-1">*</span>}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {processVariables(element.question)}
                {element.required && <span className="text-red-500 ml-1">*</span>}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {processVariables(element.question)}
                {element.required && <span className="text-red-500 ml-1">*</span>}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {processVariables(element.question)}
                {element.required && <span className="text-red-500 ml-1">*</span>}
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
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              {element.buttonText || 'Continuar'}
            </Button>
          </div>
        );

      case 'chart':
        return (
          <div className="mb-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle style={{ color: element.chartTitleColor || '#1F2937' }}>
                  {element.chartTitle || 'Gráfico de Resultados'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  {element.chartType === 'bar' && (
                    <div className="flex items-end space-x-3 h-32">
                      <div className="w-8 bg-blue-500 rounded-t" style={{ height: '60%' }}></div>
                      <div className="w-8 bg-green-500 rounded-t" style={{ height: '80%' }}></div>
                      <div className="w-8 bg-purple-500 rounded-t" style={{ height: '40%' }}></div>
                      <div className="w-8 bg-orange-500 rounded-t" style={{ height: '95%' }}></div>
                    </div>
                  )}
                  {element.chartType === 'line' && (
                    <div className="relative w-48 h-32">
                      <svg className="w-full h-full" viewBox="0 0 200 120">
                        <polyline
                          points="20,80 60,40 100,60 140,20 180,30"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3"
                        />
                        <circle cx="20" cy="80" r="4" fill="#3B82F6" />
                        <circle cx="60" cy="40" r="4" fill="#3B82F6" />
                        <circle cx="100" cy="60" r="4" fill="#3B82F6" />
                        <circle cx="140" cy="20" r="4" fill="#3B82F6" />
                        <circle cx="180" cy="30" r="4" fill="#3B82F6" />
                      </svg>
                    </div>
                  )}
                  {element.chartType === 'pie' && (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full"></div>
                    </div>
                  )}
                  {element.chartType === 'before_after' && (
                    <div className="flex items-end space-x-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                          {element.beforeAfterData?.before?.value || 25}
                        </div>
                        <span className="text-sm text-gray-600">Antes</span>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                          {element.beforeAfterData?.after?.value || 85}
                        </div>
                        <span className="text-sm text-gray-600">Depois</span>
                      </div>
                    </div>
                  )}
                </div>
                {element.chartShowLegend && (
                  <div className="mt-4 flex justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-600">Dados 1</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">Dados 2</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'metrics':
        return (
          <div className="mb-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>
                  {element.metricsTitle || 'Métricas de Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {element.metric1Name && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {element.metricsShowValue ? element.metric1Value || 0 : '—'}
                        {element.metricsShowPercentage && '%'}
                      </div>
                      <div className="text-sm text-gray-600">{element.metric1Name}</div>
                      <Progress 
                        value={((element.metric1Value || 0) / (element.metric1Max || 100)) * 100} 
                        className="mt-2"
                      />
                    </div>
                  )}
                  {element.metric2Name && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {element.metricsShowValue ? element.metric2Value || 0 : '—'}
                        {element.metricsShowPercentage && '%'}
                      </div>
                      <div className="text-sm text-gray-600">{element.metric2Name}</div>
                      <Progress 
                        value={((element.metric2Value || 0) / (element.metric2Max || 100)) * 100} 
                        className="mt-2"
                      />
                    </div>
                  )}
                  {element.metric3Name && (
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {element.metricsShowValue ? element.metric3Value || 0 : '—'}
                        {element.metricsShowPercentage && '%'}
                      </div>
                      <div className="text-sm text-gray-600">{element.metric3Name}</div>
                      <Progress 
                        value={((element.metric3Value || 0) / (element.metric3Max || 100)) * 100} 
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
                {element.weeklyData && (
                  <div className="mt-6">
                    <div className="text-sm text-gray-600 mb-3">
                      {element.timePeriod || 'Últimos 7 dias'}
                    </div>
                    <div className="flex items-end space-x-2 h-16">
                      {element.weeklyData.map((value: number, index: number) => (
                        <div
                          key={index}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t opacity-80"
                          style={{ height: `${(value / Math.max(...element.weeklyData)) * 100}%` }}
                        />
                      ))}
                    </div>
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
    <div className="w-full max-w-4xl mx-auto">
      {/* Quiz Card */}
      <Card className="shadow-lg border-gray-200">
        <CardContent className="p-6">
          {/* Progress Bar inside card */}
          {showProgress && !showLeadCapture && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Pergunta {currentStep + 1} de {totalSteps}</span>
                <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
              </div>
              <Progress 
                value={((currentStep + 1) / totalSteps) * 100} 
                className="h-2"
              />
            </div>
          )}
          
          <div className="overflow-y-auto" style={{ minHeight: '300px' }}>
            {renderPage()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}