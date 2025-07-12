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
        
      default:
        return null;
    }
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