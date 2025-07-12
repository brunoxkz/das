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
  ChevronRight
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