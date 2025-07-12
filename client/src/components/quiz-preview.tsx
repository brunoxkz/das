import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Star, 
  Heart, 
  ThumbsUp, 
  Mail, 
  Phone, 
  User, 
  Calendar,
  Camera,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  ChevronDown,
  ChevronUp,
  Clock,
  Crown,
  Award,
  Medal,
  Trophy,
  Zap,
  Shield,
  Gift,
  Target,
  Scale,
  ArrowUpDown,
  Copy,
  QrCode,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Hand
} from 'lucide-react';

interface QuizPreviewProps {
  quiz: any;
  onClose: () => void;
  onSave?: (responses: any) => void;
  currentUser?: any;
}

export default function QuizPreview({ quiz, onClose, onSave, currentUser }: QuizPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgressDisplay, setShowProgressDisplay] = useState(false);
  const [alternatingTextIndex, setAlternatingTextIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioData, setAudioData] = useState<any>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Função para inicializar câmera
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Erro ao acessar câmera. Verifique as permissões.');
    }
  };

  // Função para capturar foto
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      context?.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      
      // Parar stream da câmera
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  };

  // Função para simular análise
  const simulateAnalysis = async (analysisType: 'facial' | 'hands', customMessage: string) => {
    setIsAnalyzing(true);
    
    // Simular carregamento por 3-5 segundos
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
    
    setAnalysisResult(customMessage);
    setIsAnalyzing(false);
  };

  // Função para resetar análise
  const resetAnalysis = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setIsCapturing(false);
  };

  // Função para renderizar elementos básicos
  const renderBasicElement = (element: any) => {
    switch (element.type) {
      case 'heading':
        return (
          <h1 className="text-2xl font-bold mb-4" style={{ color: element.color }}>
            {element.text || 'Título'}
          </h1>
        );
      case 'paragraph':
        return (
          <p className="text-gray-700 mb-4" style={{ color: element.color }}>
            {element.text || 'Parágrafo'}
          </p>
        );
      case 'pix_payment':
        return (
          <div className="bg-white rounded-lg p-6 border-2 border-green-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">PIX Direto</h3>
            <p className="text-gray-600 mb-4">Pagamento via PIX</p>
            <div className="bg-green-50 p-4 rounded-lg">
              <span className="text-2xl font-bold text-green-600">
                R$ {element.pixAmount || "0,00"}
              </span>
            </div>
          </div>
        );
        
      case 'facial_reading':
        return (
          <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {element.facialTitle || "Leitura Facial"}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {element.facialDescription || "Vamos analisar suas características faciais para revelar insights únicos sobre sua personalidade"}
              </p>
              
              {!isCapturing && !capturedImage && !analysisResult && (
                <Button 
                  onClick={() => {
                    setIsCapturing(true);
                    initCamera();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Iniciar Leitura Facial
                </Button>
              )}
              
              {isCapturing && !capturedImage && (
                <div className="space-y-4">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full max-w-md mx-auto rounded-lg"
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={capturePhoto}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capturar Foto
                    </Button>
                    
                    <Button 
                      onClick={resetAnalysis}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Posicione seu rosto no centro da câmera e clique em "Capturar Foto"
                  </p>
                </div>
              )}
              
              {capturedImage && !analysisResult && !isAnalyzing && (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <img 
                      src={capturedImage} 
                      alt="Foto capturada" 
                      className="max-w-sm mx-auto rounded-lg"
                    />
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => simulateAnalysis('facial', element.facialMessage || "Sua análise facial revelou traços de liderança e criatividade únicos!")}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Analisar Face
                    </Button>
                    
                    <Button 
                      onClick={resetAnalysis}
                      variant="outline"
                    >
                      Tirar Nova Foto
                    </Button>
                  </div>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <img 
                      src={capturedImage} 
                      alt="Foto capturada" 
                      className="max-w-sm mx-auto rounded-lg opacity-50"
                    />
                  </div>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-blue-600 font-medium">
                      Analisando características faciais...
                    </p>
                    <p className="text-sm text-gray-500">
                      Isso pode levar alguns segundos
                    </p>
                  </div>
                </div>
              )}
              
              {analysisResult && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">
                      🔮 Resultado da Leitura Facial
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {analysisResult}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={resetAnalysis}
                    variant="outline"
                    className="w-full"
                  >
                    Fazer Nova Análise
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'palm_reading':
        return (
          <div className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hand className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {element.palmTitle || "Leitura de Mãos"}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {element.palmDescription || "Vamos analisar as linhas da sua mão para revelar seu destino e características únicas"}
              </p>
              
              {!isCapturing && !capturedImage && !analysisResult && (
                <Button 
                  onClick={() => {
                    setIsCapturing(true);
                    initCamera();
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg"
                >
                  <Hand className="w-5 h-5 mr-2" />
                  Iniciar Leitura de Mãos
                </Button>
              )}
              
              {isCapturing && !capturedImage && (
                <div className="space-y-4">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full max-w-md mx-auto rounded-lg"
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={capturePhoto}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capturar Foto
                    </Button>
                    
                    <Button 
                      onClick={resetAnalysis}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Posicione sua mão aberta na frente da câmera e clique em "Capturar Foto"
                  </p>
                </div>
              )}
              
              {capturedImage && !analysisResult && !isAnalyzing && (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <img 
                      src={capturedImage} 
                      alt="Foto capturada" 
                      className="max-w-sm mx-auto rounded-lg"
                    />
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => simulateAnalysis('hands', element.palmMessage || "As linhas da sua mão revelam uma vida longa e próspera com grandes oportunidades!")}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <Hand className="w-4 h-4 mr-2" />
                      Analisar Mão
                    </Button>
                    
                    <Button 
                      onClick={resetAnalysis}
                      variant="outline"
                    >
                      Tirar Nova Foto
                    </Button>
                  </div>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <img 
                      src={capturedImage} 
                      alt="Foto capturada" 
                      className="max-w-sm mx-auto rounded-lg opacity-50"
                    />
                  </div>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    <p className="text-purple-600 font-medium">
                      Analisando linhas da mão...
                    </p>
                    <p className="text-sm text-gray-500">
                      Isso pode levar alguns segundos
                    </p>
                  </div>
                </div>
              )}
              
              {analysisResult && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-purple-900 mb-3">
                      🔮 Resultado da Leitura de Mãos
                    </h4>
                    <p className="text-purple-800 text-sm leading-relaxed">
                      {analysisResult}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={resetAnalysis}
                    variant="outline"
                    className="w-full"
                  >
                    Fazer Nova Análise
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'transition_loader':
        const loaderColor = element.loaderColor || '#0F172A';
        const loaderSize = element.loaderSize === 'small' ? 'w-6 h-6' : 
                          element.loaderSize === 'large' ? 'w-12 h-12' : 'w-8 h-8';
        const loaderType = element.loaderType || 'spinner';
        
        const renderSpinner = () => {
          switch (loaderType) {
            case "spinner":
              return (
                <div className={`${loaderSize} border-2 border-gray-200 border-t-current rounded-full animate-spin`} style={{ borderTopColor: loaderColor }}></div>
              );
            case "dots":
              return (
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: loaderColor }}></div>
                  <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: loaderColor, animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: loaderColor, animationDelay: '0.2s' }}></div>
                </div>
              );
            case "bars":
              return (
                <div className="flex space-x-1">
                  <div className="w-1 h-8 animate-pulse" style={{ backgroundColor: loaderColor }}></div>
                  <div className="w-1 h-8 animate-pulse" style={{ backgroundColor: loaderColor, animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-8 animate-pulse" style={{ backgroundColor: loaderColor, animationDelay: '0.2s' }}></div>
                </div>
              );
            case "pulse":
              return (
                <div className={`${loaderSize} rounded-full animate-pulse`} style={{ backgroundColor: loaderColor }}></div>
              );
            case "ring":
              return (
                <div className={`${loaderSize} border-4 border-gray-200 border-t-current rounded-full animate-spin`} style={{ borderTopColor: loaderColor }}></div>
              );
            case "ripple":
              return (
                <div className="relative inline-block">
                  <div className={`${loaderSize} border-2 border-current rounded-full animate-ping absolute`} style={{ borderColor: loaderColor }}></div>
                  <div className={`${loaderSize} border-2 border-current rounded-full animate-ping absolute`} style={{ borderColor: loaderColor, animationDelay: "0.5s" }}></div>
                </div>
              );
            case "rotating-plane":
              return (
                <div className={`${loaderSize} sk-rotating-plane`} style={{ backgroundColor: loaderColor }}></div>
              );
            case "double-bounce":
              return (
                <div className={`${loaderSize} sk-double-bounce`}>
                  <div className="sk-child sk-double-bounce-1" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-child sk-double-bounce-2" style={{ backgroundColor: loaderColor }}></div>
                </div>
              );
            case "wave":
              return (
                <div className={`${loaderSize} sk-wave`} style={{ width: "auto" }}>
                  <div className="sk-rect sk-rect-1" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-rect sk-rect-2" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-rect sk-rect-3" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-rect sk-rect-4" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-rect sk-rect-5" style={{ backgroundColor: loaderColor }}></div>
                </div>
              );
            case "wandering-cubes":
              return (
                <div className={`${loaderSize} sk-wandering-cubes`}>
                  <div className="sk-cube sk-cube-1" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-cube sk-cube-2" style={{ backgroundColor: loaderColor }}></div>
                </div>
              );
            case "spinner-pulse":
              return (
                <div className={`${loaderSize} sk-spinner-pulse`} style={{ backgroundColor: loaderColor }}></div>
              );
            case "chasing-dots":
              return (
                <div className={`${loaderSize} sk-chasing-dots`}>
                  <div className="sk-child sk-dot-1" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-child sk-dot-2" style={{ backgroundColor: loaderColor }}></div>
                </div>
              );
            case "three-bounce":
              return (
                <div className={`${loaderSize} sk-three-bounce`} style={{ width: "auto" }}>
                  <div className="sk-child sk-bounce-1" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-child sk-bounce-2" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-child sk-bounce-3" style={{ backgroundColor: loaderColor }}></div>
                </div>
              );
            case "circle-bounce":
              return (
                <div className={`${loaderSize} sk-circle-bounce`}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`sk-child sk-circle-${i + 1}`}>
                      <div style={{ backgroundColor: loaderColor }}></div>
                    </div>
                  ))}
                </div>
              );
            case "cube-grid":
              return (
                <div className={`${loaderSize} sk-cube-grid`}>
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className={`sk-cube sk-cube-${i + 1}`} style={{ backgroundColor: loaderColor }}></div>
                  ))}
                </div>
              );
            case "fading-circle":
              return (
                <div className={`${loaderSize} sk-fading-circle`}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`sk-circle sk-circle-${i + 1}`}>
                      <div style={{ backgroundColor: loaderColor }}></div>
                    </div>
                  ))}
                </div>
              );
            case "folding-cube":
              return (
                <div className={`${loaderSize} sk-folding-cube`}>
                  <div className="sk-cube sk-cube-1" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-cube sk-cube-2" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-cube sk-cube-3" style={{ backgroundColor: loaderColor }}></div>
                  <div className="sk-cube sk-cube-4" style={{ backgroundColor: loaderColor }}></div>
                </div>
              );
            default:
              return (
                <div className={`${loaderSize} border-2 border-gray-200 border-t-current rounded-full animate-spin`} style={{ borderTopColor: loaderColor }}></div>
              );
          }
        };
        
        return (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            {renderSpinner()}
            {element.loaderText && element.loaderText.length > 0 && (
              <div className="text-center">
                <p className="text-gray-600 font-medium">
                  {element.loaderText[alternatingTextIndex % element.loaderText.length]}
                </p>
              </div>
            )}
          </div>
        );

      case 'snake_game':
        // Usando useEffect para inicializar o jogo depois que o componente é renderizado
        useEffect(() => {
          if (element.id) {
            initializeSnakeGame(element.id);
          }
        }, [element.id]);
        
        return (
          <div className="snake-game-container">
            <div className="snake-game-header">
              {element.snakeTitle || "SNAKE"}
            </div>
            
            <div className="snake-table" id={`snake-table-${element.id}`}></div>
            
            <div className="snake-modal" id={`snake-modal-${element.id}`}>
              <div className="snake-modal-content">
                <div 
                  className="snake-start-btn" 
                  id={`snake-start-${element.id}`}
                  onClick={() => startSnakeGame(element.id)}
                >
                  <span>Jogar Snake</span>
                </div>
                <div className="snake-controls">
                  <p>Use as setas do teclado ou WASD</p>
                  <p>Colete comida roxa e cresça!</p>
                  <p>Não bata nas paredes ou em você mesmo</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Funções do Snake Game
  const initializeSnakeGame = (elementId: number) => {
    const gameState = {
      direction: "right",
      position: [[6,10], [7,10], [8,10], [9,10], [10,10]],
      interval: 200,
      food: 0,
      score: 0,
      time: 0,
      canTurn: 0,
      rowsCols: 21,
      foodPos: [0, 0],
      gameInterval: null as NodeJS.Timeout | null,
      boxes: [] as HTMLElement[]
    };
    
    // Armazenar estado do jogo
    (window as any)[`snakeGame_${elementId}`] = gameState;
    
    // Criar tabuleiro
    createSnakeTable(elementId);
    
    // Adicionar event listeners
    setupSnakeControls(elementId);
  };

  const createSnakeTable = (elementId: number) => {
    const snakeTable = document.getElementById(`snake-table-${elementId}`);
    if (!snakeTable) return;
    
    const gameState = (window as any)[`snakeGame_${elementId}`];
    if (!gameState) return;
    
    snakeTable.innerHTML = "";
    
    // Criar boxes do tabuleiro
    for (let i = 0; i < gameState.rowsCols * gameState.rowsCols; i++) {
      const box = document.createElement("div");
      box.classList.add("snake-box");
      snakeTable.appendChild(box);
    }
    
    // Criar barra de status
    const statusBar = document.createElement("div");
    statusBar.classList.add("snake-status");
    statusBar.innerHTML = `
      <span>Score: <span class="snake-score" id="snake-score-${elementId}">0</span></span>
      <span>Snake Game</span>
    `;
    snakeTable.appendChild(statusBar);
    
    // Atualizar boxes
    gameState.boxes = Array.from(snakeTable.getElementsByClassName("snake-box"));
  };

  const setupSnakeControls = (elementId: number) => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const gameState = (window as any)[`snakeGame_${elementId}`];
      if (!gameState || !gameState.canTurn || gameState.time === 0) return;
      
      switch (e.keyCode) {
        case 37: // left
        case 65: // A
          if (gameState.direction === "right") return;
          gameState.direction = "left";
          break;
        case 38: // up  
        case 87: // W
          if (gameState.direction === "down") return;
          gameState.direction = "up";
          break;
        case 39: // right
        case 68: // D
          if (gameState.direction === "left") return;
          gameState.direction = "right";
          break;
        case 40: // down
        case 83: // S
          if (gameState.direction === "up") return;
          gameState.direction = "down";
          break;
        default:
          return;
      }
      gameState.canTurn = 0;
    };
    
    document.addEventListener("keydown", handleKeyPress);
    
    // Armazenar função para limpeza posterior
    (window as any)[`snakeKeyHandler_${elementId}`] = handleKeyPress;
  };

  const startSnakeGame = (elementId: number) => {
    const gameState = (window as any)[`snakeGame_${elementId}`];
    if (!gameState) return;
    
    const modal = document.getElementById(`snake-modal-${elementId}`);
    if (modal) {
      modal.classList.add("snake-hidden");
    }
    
    // Resetar estado do jogo
    gameState.direction = "right";
    gameState.position = [[6,10], [7,10], [8,10], [9,10], [10,10]];
    gameState.interval = 200;
    gameState.food = 0;
    gameState.score = 0;
    gameState.time = 1;
    gameState.canTurn = 0;
    
    // Iniciar jogo
    renderSnake(elementId);
    generateFood(elementId);
    
    // Iniciar loop do jogo
    gameState.gameInterval = setInterval(() => {
      moveSnake(elementId);
    }, gameState.interval);
  };

  const moveSnake = (elementId: number) => {
    const gameState = (window as any)[`snakeGame_${elementId}`];
    if (!gameState) return;
    
    // Verificar colisões
    if (checkFoodCollision(elementId)) {
      gameState.position.unshift(gameState.position[0]);
      generateFood(elementId);
      gameState.food++;
      gameState.score += gameState.food;
      
      // Atualizar score
      const scoreElement = document.getElementById(`snake-score-${elementId}`);
      if (scoreElement) {
        scoreElement.textContent = gameState.score.toString();
      }
      
      // Aumentar velocidade
      clearInterval(gameState.gameInterval);
      gameState.interval = Math.max(gameState.interval - gameState.interval/40, 50);
      gameState.gameInterval = setInterval(() => {
        moveSnake(elementId);
      }, gameState.interval);
    }
    
    if (checkBorderCollision(elementId) || checkSelfCollision(elementId)) {
      endSnakeGame(elementId);
      return;
    }
    
    // Atualizar posições
    updateSnakePosition(elementId);
    renderSnake(elementId);
    gameState.canTurn = 1;
  };

  const updateSnakePosition = (elementId: number) => {
    const gameState = (window as any)[`snakeGame_${elementId}`];
    if (!gameState) return;
    
    // Remover cauda
    const tailIndex = gameState.position[0][0] + gameState.position[0][1] * gameState.rowsCols;
    if (gameState.boxes[tailIndex]) {
      gameState.boxes[tailIndex].classList.remove("snake-body");
    }
    gameState.position.shift();
    
    // Adicionar nova cabeça
    const head = gameState.position[gameState.position.length - 1];
    let newHead = [head[0], head[1]];
    
    switch (gameState.direction) {
      case "left":
        newHead = [head[0] - 1, head[1]];
        break;
      case "up":
        newHead = [head[0], head[1] - 1];
        break;
      case "right":
        newHead = [head[0] + 1, head[1]];
        break;
      case "down":
        newHead = [head[0], head[1] + 1];
        break;
    }
    
    gameState.position.push(newHead);
  };

  const checkBorderCollision = (elementId: number) => {
    const gameState = (window as any)[`snakeGame_${elementId}`];
    if (!gameState) return false;
    
    const head = gameState.position[gameState.position.length - 1];
    return (
      ((head[0] === gameState.rowsCols - 1) && (gameState.direction === "right")) ||
      ((head[0] === 0) && (gameState.direction === "left")) ||
      ((head[1] === gameState.rowsCols - 1) && (gameState.direction === "down")) ||
      ((head[1] === 0) && (gameState.direction === "up"))
    );
  };

  const checkSelfCollision = (elementId: number) => {
    const gameState = (window as any)[`snakeGame_${elementId}`];
    if (!gameState) return false;
    
    const head = gameState.position[gameState.position.length - 1];
    for (let i = 0; i < gameState.position.length - 1; i++) {
      if (head[0] === gameState.position[i][0] && head[1] === gameState.position[i][1]) {
        return true;
      }
    }
    return false;
  };

  const checkFoodCollision = (elementId: number) => {
    const gameState = (window as any)[`snakeGame_${elementId}`];
    if (!gameState) return false;
    
    const head = gameState.position[gameState.position.length - 1];
    return (head[0] === gameState.foodPos[0] && head[1] === gameState.foodPos[1]);
  };

  const generateFood = (elementId: number) => {
    const gameState = (window as any)[`snakeGame_${elementId}`];
    if (!gameState) return;
    
    let randomX, randomY, randomIndex;
    
    do {
      randomX = Math.floor(Math.random() * gameState.rowsCols);
      randomY = Math.floor(Math.random() * gameState.rowsCols);
      randomIndex = randomX + randomY * gameState.rowsCols;
    } while (gameState.boxes[randomIndex] && gameState.boxes[randomIndex].classList.contains("snake-body"));
    
    // Remover comida anterior
    gameState.boxes.forEach(box => box.classList.remove("snake-food"));
    
    // Adicionar nova comida
    if (gameState.boxes[randomIndex]) {
      gameState.boxes[randomIndex].classList.add("snake-food");
      gameState.foodPos = [randomX, randomY];
    }
  };

  const renderSnake = (elementId: number) => {
    const gameState = (window as any)[`snakeGame_${elementId}`];
    if (!gameState) return;
    
    // Limpar snake anterior
    gameState.boxes.forEach(box => box.classList.remove("snake-body"));
    
    // Renderizar snake atual
    gameState.position.forEach(pos => {
      const index = pos[0] + pos[1] * gameState.rowsCols;
      if (gameState.boxes[index]) {
        gameState.boxes[index].classList.add("snake-body");
      }
    });
  };

  const endSnakeGame = (elementId: number) => {
    const gameState = (window as any)[`snakeGame_${elementId}`];
    if (!gameState) return;
    
    clearInterval(gameState.gameInterval);
    
    const modal = document.getElementById(`snake-modal-${elementId}`);
    const startBtn = document.getElementById(`snake-start-${elementId}`);
    
    if (modal && startBtn) {
      modal.classList.remove("snake-hidden");
      startBtn.innerHTML = `<span>${gameState.score} Pontos!</span>`;
      
      setTimeout(() => {
        startBtn.innerHTML = `<span>Jogar Snake</span>`;
      }, 2000);
    }
    
    // Resetar estado
    gameState.time = 0;
    gameState.canTurn = 0;
  };

  // Função principal de renderização
  const renderContent = () => {
    if (!quiz || !quiz.structure) return null;

    const currentPage = quiz.structure[currentStep];
    if (!currentPage) return null;

    return (
      <div className="space-y-6">
        {currentPage.elements?.map((element: any, index: number) => (
          <div key={index}>
            {renderBasicElement(element)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
          
          {renderContent()}
          
          <div className="mt-8 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <Button 
              onClick={() => setCurrentStep(Math.min(quiz.structure?.length - 1, currentStep + 1))}
              disabled={currentStep >= (quiz.structure?.length - 1)}
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}