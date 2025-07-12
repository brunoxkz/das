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

      case 'multiple_choice':
        return (
          <div className="space-y-4">
            {element.question && (
              <div 
                className="text-lg font-medium"
                style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  fontWeight: element.fontWeight || 'normal',
                  color: element.textColor || '#000',
                  backgroundColor: element.backgroundColor || 'transparent'
                }}
              >
                {element.question}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            )}
            {element.description && (
              <p className="text-gray-600 text-sm">{element.description}</p>
            )}
            <div className={`grid gap-3 ${element.optionLayout === 'horizontal' ? 'grid-cols-2' : 'grid-cols-1'} ${element.optionLayout === 'grid' ? 'grid-cols-2 md:grid-cols-3' : ''}`}>
              {element.options?.map((option: string, index: number) => (
                <button
                  key={index}
                  className={`p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                    element.buttonStyle === 'rounded' ? 'rounded-full' : 
                    element.buttonStyle === 'pills' ? 'rounded-2xl' : 'rounded-lg'
                  }`}
                  style={{
                    borderColor: element.borderColor || '#e5e7eb',
                    backgroundColor: element.optionBackgroundColor || 'white'
                  }}
                >
                  {element.showImages && element.optionImages?.[index] && (
                    <img 
                      src={element.optionImages[index]} 
                      alt={option}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                  )}
                  {element.showIcons && element.optionIcons?.[index] && (
                    <span className="text-xl mr-2">{element.optionIcons[index]}</span>
                  )}
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="space-y-4">
            {element.question && (
              <div 
                className="text-lg font-medium"
                style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  fontWeight: element.fontWeight || 'normal',
                  color: element.textColor || '#000'
                }}
              >
                {element.question}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            )}
            {element.description && (
              <p className="text-gray-600 text-sm">{element.description}</p>
            )}
            <input
              type={element.type === 'email' ? 'email' : element.type === 'phone' ? 'tel' : element.type === 'number' ? 'number' : 'text'}
              placeholder={element.placeholder || `Digite seu ${element.type === 'email' ? 'email' : element.type === 'phone' ? 'telefone' : element.type === 'number' ? 'número' : 'texto'}`}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: element.borderColor || '#e5e7eb',
                backgroundColor: element.backgroundColor || 'white',
                color: element.textColor || '#000'
              }}
              min={element.min}
              max={element.max}
              required={element.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-4">
            {element.question && (
              <div 
                className="text-lg font-medium"
                style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  fontWeight: element.fontWeight || 'normal',
                  color: element.textColor || '#000'
                }}
              >
                {element.question}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            )}
            {element.description && (
              <p className="text-gray-600 text-sm">{element.description}</p>
            )}
            <textarea
              placeholder={element.placeholder || "Digite sua resposta aqui..."}
              rows={4}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: element.borderColor || '#e5e7eb',
                backgroundColor: element.backgroundColor || 'white',
                color: element.textColor || '#000'
              }}
              required={element.required}
            />
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            {element.question && (
              <div 
                className="text-lg font-medium"
                style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  fontWeight: element.fontWeight || 'normal',
                  color: element.textColor || '#000'
                }}
              >
                {element.question}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            )}
            {element.description && (
              <p className="text-gray-600 text-sm">{element.description}</p>
            )}
            <div className="flex gap-2 justify-center">
              {Array.from({ length: element.max || 5 }, (_, index) => (
                <button
                  key={index}
                  className="text-3xl hover:scale-110 transition-transform"
                  style={{ color: element.color || '#fbbf24' }}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-4">
            {element.question && (
              <div 
                className="text-lg font-medium"
                style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  fontWeight: element.fontWeight || 'normal',
                  color: element.textColor || '#000'
                }}
              >
                {element.question}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            )}
            {element.description && (
              <p className="text-gray-600 text-sm">{element.description}</p>
            )}
            <div className="space-y-3">
              {element.options?.map((option: string, index: number) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-4">
            {element.question && (
              <div 
                className="text-lg font-medium"
                style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  fontWeight: element.fontWeight || 'normal',
                  color: element.textColor || '#000'
                }}
              >
                {element.question}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            )}
            {element.description && (
              <p className="text-gray-600 text-sm">{element.description}</p>
            )}
            <input
              type="date"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: element.borderColor || '#e5e7eb',
                backgroundColor: element.backgroundColor || 'white',
                color: element.textColor || '#000'
              }}
              required={element.required}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            {element.content && (
              <div 
                className="text-lg font-medium mb-2"
                style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  fontWeight: element.fontWeight || 'normal',
                  color: element.textColor || '#000'
                }}
              >
                {element.content}
              </div>
            )}
            {element.imageUrl && (
              <img
                src={element.imageUrl}
                alt={element.content || "Imagem"}
                className={`max-w-full h-auto rounded-lg ${
                  element.imageAlignment === 'center' ? 'mx-auto' :
                  element.imageAlignment === 'right' ? 'ml-auto' : ''
                }`}
                style={{
                  maxWidth: element.imageWidth || '100%',
                  height: element.imageHeight || 'auto'
                }}
              />
            )}
            {element.description && (
              <p 
                className="text-gray-600 text-sm"
                style={{
                  textAlign: element.textAlign || 'left',
                  color: element.descriptionColor || '#6b7280'
                }}
              >
                {element.description}
              </p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            {element.content && (
              <div 
                className="text-lg font-medium mb-2"
                style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  fontWeight: element.fontWeight || 'normal',
                  color: element.textColor || '#000'
                }}
              >
                {element.content}
              </div>
            )}
            {element.videoUrl && (
              <div className="aspect-video">
                <iframe
                  src={element.videoUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  style={{
                    width: element.videoWidth || '100%',
                    height: element.videoHeight || 'auto'
                  }}
                />
              </div>
            )}
            {element.description && (
              <p 
                className="text-gray-600 text-sm"
                style={{
                  textAlign: element.textAlign || 'left',
                  color: element.descriptionColor || '#6b7280'
                }}
              >
                {element.description}
              </p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            {element.content && (
              <div 
                className="text-lg font-medium mb-2"
                style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  fontWeight: element.fontWeight || 'normal',
                  color: element.textColor || '#000'
                }}
              >
                {element.content}
              </div>
            )}
            {element.audioUrl && (
              <audio
                controls
                className="w-full"
                style={{
                  backgroundColor: element.backgroundColor || 'white'
                }}
              >
                <source src={element.audioUrl} type="audio/mpeg" />
                Seu navegador não suporta o elemento de áudio.
              </audio>
            )}
            {element.description && (
              <p 
                className="text-gray-600 text-sm"
                style={{
                  textAlign: element.textAlign || 'left',
                  color: element.descriptionColor || '#6b7280'
                }}
              >
                {element.description}
              </p>
            )}
          </div>
        );

      case 'divider':
        return (
          <div className="my-8">
            <hr 
              className="border-gray-300"
              style={{
                borderColor: element.color || '#e5e7eb',
                borderWidth: element.thickness || '1px',
                marginTop: element.spacing || '2rem',
                marginBottom: element.spacing || '2rem'
              }}
            />
          </div>
        );

      case 'continue_button':
        return (
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              style={{
                backgroundColor: element.backgroundColor || '#2563eb',
                color: element.textColor || 'white',
                fontSize: element.fontSize || '16px',
                padding: element.padding || '12px 24px',
                borderRadius: element.borderRadius || '8px'
              }}
            >
              {element.content || "Continuar"}
            </button>
          </div>
        );

      case 'game_wheel':
        return (
          <div className="space-y-4 p-6 border-2 border-dashed border-yellow-200 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="font-bold text-yellow-300 text-lg">🎡 Roda da Fortuna</span>
            </div>
            <div className="flex flex-col items-center space-y-6">
              <div className="flex justify-between w-full max-w-md text-white font-mono text-2xl">
                <div>Score: <span className="text-yellow-400">0</span></div>
                <div>Round: <span className="text-green-400">10</span></div>
              </div>
              <div className="casing relative">
                <div className="wheel-container">
                  <div className="wheel" id={`wheel-${element.id}`}>
                    <div className="inner-wheel">
                      {(element.wheelSegments || ["5000", "10", "500", "100", "2500", "50", "250", "x2", "100", ":2", "1000", "50", "250", "20", "*"]).map((segment: string, index: number) => (
                        <div key={index} className="segment" style={{
                          transform: `rotate(${index * 24}deg)`,
                          backgroundColor: (element.wheelColors || ["#FF0000", "#0000FF", "#FFDD00", "#FFA500", "#4B0082", "#00CC00", "#EE82EE", "#FF0000", "#FFA500", "#FFDD00", "#00CC00", "#0000FF", "#4B0082", "#EE82EE", "#222222"])[index] || '#FF0000'
                        }}>
                          <span className="segment-text">{segment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="wheel-pointer"></div>
                </div>
              </div>
              <button className="spin-button bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                GIRAR RODA
              </button>
            </div>
          </div>
        );

      case 'game_scratch':
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2">
              <span className="font-medium text-yellow-800">🎫 Raspadinha</span>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-green-600"
                  style={{ backgroundColor: element.scratchCoverColor || "#e5e7eb" }}
                >
                  {element.scratchRevealText || "PARABÉNS!"}
                </div>
                <div className="absolute top-2 left-2 w-16 h-8 bg-transparent border-2 border-dashed border-white opacity-50"></div>
                <div className="absolute bottom-2 right-2 w-12 h-6 bg-transparent border-2 border-dashed border-white opacity-50"></div>
              </div>
              <div className="text-sm text-gray-600 text-center">
                <p>Clique e arraste para raspar</p>
                <p>Descubra seu prêmio!</p>
              </div>
            </div>
          </div>
        );

      case 'game_color_pick':
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center gap-2">
              <span className="font-medium text-purple-800">🎨 Escolha de Cor</span>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <h4 className="font-medium text-gray-800 mb-2">
                  {element.colorInstruction || "Escolha a cor da sorte!"}
                </h4>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(element.colorOptions || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"]).map((color: string, index: number) => (
                  <button
                    key={index}
                    className="w-16 h-16 rounded-lg border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="text-sm text-purple-600 text-center">
                <p>Clique na cor para selecionar</p>
              </div>
            </div>
          </div>
        );

      case 'game_memory_cards':
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-800">🧠 Jogo da Memória</span>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: (element.memoryCardPairs || 4) * 2 }, (_, index) => (
                  <div
                    key={index}
                    className="w-12 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  >
                    {index < 2 ? (
                      element.memoryCardTheme === "numbers" ? Math.floor(index / 2) + 1 :
                      element.memoryCardTheme === "colors" ? "🔴" :
                      element.memoryCardTheme === "icons" ? "⭐" : "?"
                    ) : "?"}
                  </div>
                ))}
              </div>
              <div className="text-xs text-green-600 text-center">
                {element.memoryCardPairs || 4} pares • Tema: {element.memoryCardTheme || "numbers"} • Clique para virar
              </div>
            </div>
          </div>
        );

      case 'game_slot_machine':
        return (
          <div className="space-y-4 p-6 border-2 border-dashed border-yellow-200 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="font-bold text-yellow-800">🎰 Slot Machine</span>
            </div>
            <div className="flex flex-col items-center space-y-6">
              <div className="relative bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 p-6 rounded-2xl border-4 border-gray-500 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-2xl"></div>
                <div className="relative flex justify-center items-center space-x-4">
                  {Array.from({ length: element.slotReels || 3 }, (_, index) => (
                    <div key={index} className="bg-white border-4 border-gray-600 rounded-xl p-4 shadow-inner">
                      <div className="text-4xl font-bold text-center w-16 h-16 flex items-center justify-center">
                        {(element.slotSymbols || ["🍌", "7️⃣", "🍒", "🍇", "🍊", "🔔", "❌", "🍋", "🍈"])[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105">
                🎰 GIRAR
              </button>
            </div>
          </div>
        );

      case 'game_brick_break':
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-800">🧱 Quebre o Muro</span>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-black p-4 rounded-lg" style={{ width: '200px', height: '160px' }}>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${element.brickColumns || 6}, 1fr)` }}>
                  {Array.from({ length: (element.brickRows || 3) * (element.brickColumns || 6) }, (_, index) => (
                    <div
                      key={index}
                      className="h-4 rounded-sm"
                      style={{ 
                        backgroundColor: element.brickColors?.[index % (element.brickColors?.length || 3)] || 
                        (index % 3 === 0 ? '#FF6B6B' : index % 3 === 1 ? '#4ECDC4' : '#45B7D1')
                      }}
                    />
                  ))}
                </div>
                <div 
                  className="mx-auto mt-4 h-2 w-12 rounded-full"
                  style={{ backgroundColor: element.paddleColor || '#FFFFFF' }}
                />
                <div 
                  className="w-2 h-2 rounded-full mx-auto mt-2"
                  style={{ backgroundColor: element.ballColor || '#FECA57' }}
                />
              </div>
              <div className="text-xs text-blue-600 text-center">
                {element.brickRows || 3}x{element.brickColumns || 6} blocos • Use as setas ← → para mover
              </div>
            </div>
          </div>
        );

      case 'birth_date':
        return (
          <div className="space-y-4 p-4 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-800">🎂 Data de Nascimento</span>
            </div>
            <div className="space-y-4">
              {element.question && (
                <div className="text-lg font-medium" style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  color: element.textColor || '#000'
                }}>
                  {element.question}
                  {element.required && <span className="text-red-500 ml-1">*</span>}
                </div>
              )}
              <input
                type="date"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  borderColor: element.borderColor || '#e5e7eb',
                  backgroundColor: element.backgroundColor || 'white'
                }}
                required={element.required}
              />
              {element.showAgeCalculation && (
                <div className="text-sm text-green-600 bg-green-100 p-2 rounded">
                  <p>💡 Sua idade será calculada automaticamente</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'height':
        return (
          <div className="space-y-4 p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center gap-2">
              <span className="font-medium text-purple-800">📏 Altura</span>
            </div>
            <div className="space-y-4">
              {element.question && (
                <div className="text-lg font-medium" style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  color: element.textColor || '#000'
                }}>
                  {element.question}
                  {element.required && <span className="text-red-500 ml-1">*</span>}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Ex: 170"
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: element.borderColor || '#e5e7eb',
                    backgroundColor: element.backgroundColor || 'white'
                  }}
                  min={element.min || 50}
                  max={element.max || 250}
                  required={element.required}
                />
                <select className="px-3 py-2 border rounded-lg" style={{
                  borderColor: element.borderColor || '#e5e7eb'
                }}>
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
              {element.showBMICalculation && (
                <div className="text-sm text-purple-600 bg-purple-100 p-2 rounded">
                  <p>💡 Será usado para calcular seu IMC junto com o peso</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'current_weight':
        return (
          <div className="space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-800">⚖️ Peso Atual</span>
            </div>
            <div className="space-y-4">
              {element.question && (
                <div className="text-lg font-medium" style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  color: element.textColor || '#000'
                }}>
                  {element.question}
                  {element.required && <span className="text-red-500 ml-1">*</span>}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Ex: 70"
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: element.borderColor || '#e5e7eb',
                    backgroundColor: element.backgroundColor || 'white'
                  }}
                  min={element.min || 30}
                  max={element.max || 300}
                  required={element.required}
                />
                <select className="px-3 py-2 border rounded-lg" style={{
                  borderColor: element.borderColor || '#e5e7eb'
                }}>
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
              {element.showBMICalculation && (
                <div className="text-sm text-blue-600 bg-blue-100 p-2 rounded">
                  <p>💡 Será usado para calcular seu IMC junto com a altura</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'target_weight':
        return (
          <div className="space-y-4 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2">
              <span className="font-medium text-orange-800">🎯 Peso Meta</span>
            </div>
            <div className="space-y-4">
              {element.question && (
                <div className="text-lg font-medium" style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  color: element.textColor || '#000'
                }}>
                  {element.question}
                  {element.required && <span className="text-red-500 ml-1">*</span>}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Ex: 65"
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{
                    borderColor: element.borderColor || '#e5e7eb',
                    backgroundColor: element.backgroundColor || 'white'
                  }}
                  min={element.min || 30}
                  max={element.max || 300}
                  required={element.required}
                />
                <select className="px-3 py-2 border rounded-lg" style={{
                  borderColor: element.borderColor || '#e5e7eb'
                }}>
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
              <div className="text-sm text-orange-600 bg-orange-100 p-2 rounded">
                <p>💡 Diferença será calculada automaticamente</p>
              </div>
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-6 p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-800">💬 Depoimentos</span>
            </div>
            <div className={`grid gap-4 ${element.layout === 'carousel' ? 'grid-cols-1' : element.layout === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {(element.testimonials || [
                {
                  name: "Maria Silva",
                  role: "Cliente Satisfeita",
                  content: "Excelente produto! Recomendo para todos!",
                  rating: 5,
                  avatar: ""
                },
                {
                  name: "João Santos",
                  role: "Usuário Premium",
                  content: "Mudou minha vida completamente, muito obrigado!",
                  rating: 5,
                  avatar: ""
                }
              ]).map((testimonial: any, index: number) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        testimonial.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                        <div className="flex text-yellow-400">
                          {Array.from({ length: testimonial.rating || 5 }, (_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{testimonial.role}</p>
                      <p className="text-gray-700">{testimonial.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'guarantee':
        return (
          <div className="space-y-4 p-6 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-800">🛡️ Garantia</span>
            </div>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto">
                🛡️
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800" style={{
                  color: element.titleColor || '#1f2937'
                }}>
                  {element.guaranteeTitle || "Garantia de 30 Dias"}
                </h3>
                <p className="text-gray-600 mt-2" style={{
                  color: element.textColor || '#4b5563'
                }}>
                  {element.guaranteeText || "Se não ficar satisfeito, devolvemos 100% do seu dinheiro"}
                </p>
              </div>
              {element.showBadge && (
                <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
                  {element.badgeText || "SATISFAÇÃO GARANTIDA"}
                </div>
              )}
            </div>
          </div>
        );

      case 'notification':
        return (
          <div className="space-y-4 p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-800">🔔 Notificação</span>
            </div>
            <div className={`p-4 rounded-lg border-l-4 ${
              element.notificationType === 'success' ? 'bg-green-100 border-green-500' :
              element.notificationType === 'warning' ? 'bg-yellow-100 border-yellow-500' :
              element.notificationType === 'error' ? 'bg-red-100 border-red-500' :
              'bg-blue-100 border-blue-500'
            }`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {element.notificationType === 'success' ? '✅' :
                   element.notificationType === 'warning' ? '⚠️' :
                   element.notificationType === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {element.notificationTitle || "Título da Notificação"}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {element.notificationMessage || "Mensagem da notificação aqui"}
                  </p>
                  {element.showTimer && (
                    <div className="text-xs text-gray-500 mt-2">
                      Exibindo por {element.displayDuration || 5} segundos
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4 p-6 border-2 border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">❓ Perguntas Frequentes</span>
            </div>
            <div className="space-y-3">
              {(element.faqItems || [
                {
                  question: "Como funciona o produto?",
                  answer: "O produto funciona de forma simples e intuitiva, basta seguir as instruções."
                },
                {
                  question: "Posso cancelar a qualquer momento?",
                  answer: "Sim, você pode cancelar a qualquer momento sem nenhuma penalidade."
                }
              ]).map((faq: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'image_upload':
        return (
          <div className="space-y-4 p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-800">📤 Upload de Imagem</span>
            </div>
            <div className="space-y-4">
              {element.question && (
                <div className="text-lg font-medium" style={{
                  fontSize: element.fontSize || '18px',
                  textAlign: element.textAlign || 'left',
                  color: element.textColor || '#000'
                }}>
                  {element.question}
                  {element.required && <span className="text-red-500 ml-1">*</span>}
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📷</div>
                <p className="text-gray-600 mb-4">
                  {element.uploadText || "Clique para fazer upload ou arraste uma imagem aqui"}
                </p>
                <div className="text-sm text-gray-500">
                  <p>Formatos aceitos: JPG, PNG, GIF</p>
                  <p>Tamanho máximo: {element.maxSize || 5}MB</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'icon_list':
        return (
          <div className="space-y-4 p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-yellow-800">⭐ Lista de Ícones</span>
            </div>
            <div className="space-y-3">
              {(element.listItems || [
                { icon: "✅", text: "Primeira vantagem do produto" },
                { icon: "🚀", text: "Segunda vantagem importante" },
                { icon: "💎", text: "Terceira característica premium" }
              ]).map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'image_with_text':
        return (
          <div className="space-y-4 p-4 border-2 border-cyan-200 rounded-lg bg-cyan-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-800">🖼️ Imagem com Texto</span>
            </div>
            <div className={`flex gap-6 ${element.layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center`}>
              {element.imageUrl && (
                <div className="flex-shrink-0">
                  <img 
                    src={element.imageUrl} 
                    alt={element.imageAlt || "Imagem"} 
                    className="rounded-lg"
                    style={{
                      maxWidth: element.imageWidth || '200px',
                      height: element.imageHeight || 'auto'
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                {element.title && (
                  <h3 className="text-xl font-bold mb-3" style={{
                    color: element.titleColor || '#1f2937'
                  }}>
                    {element.title}
                  </h3>
                )}
                {element.description && (
                  <p className="text-gray-600" style={{
                    color: element.textColor || '#4b5563'
                  }}>
                    {element.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'image_carousel':
        return (
          <div className="space-y-4 p-4 border-2 border-pink-200 rounded-lg bg-pink-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-pink-800">🎠 Carrossel de Imagens</span>
            </div>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {(element.images || [
                  "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Imagem+1",
                  "https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Imagem+2",
                  "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Imagem+3"
                ]).map((image: string, index: number) => (
                  <div key={index} className="flex-shrink-0">
                    <img 
                      src={image} 
                      alt={`Slide ${index + 1}`} 
                      className="rounded-lg shadow-md"
                      style={{
                        width: element.slideWidth || '300px',
                        height: element.slideHeight || '200px',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </div>
              {element.showDots && (
                <div className="flex justify-center gap-2 mt-4">
                  {(element.images || [1, 2, 3]).map((_, index) => (
                    <div key={index} className="w-2 h-2 rounded-full bg-gray-400"></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'share_quiz':
        return (
          <div className="space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-800">🔗 Compartilhar Quiz</span>
            </div>
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                {element.shareMessage || "Compartilhe este quiz com seus amigos!"}
              </p>
              <div className="flex justify-center gap-3">
                <button className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  📱
                </button>
                <button className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  📘
                </button>
                <button className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                  🐦
                </button>
                <button className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  ✉️
                </button>
              </div>
            </div>
          </div>
        );

      case 'animated_transition':
        return (
          <div className="space-y-4 p-6 border-2 border-gradient-to-r from-purple-500 to-pink-500 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-800">✨ Transição Animada</span>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto animate-pulse">
                ✨
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2" style={{
                  color: element.titleColor || '#1f2937'
                }}>
                  {element.transitionTitle || "Carregando..."}
                </h3>
                <p className="text-gray-600" style={{
                  color: element.textColor || '#4b5563'
                }}>
                  {element.transitionText || "Aguarde enquanto preparamos tudo para você"}
                </p>
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