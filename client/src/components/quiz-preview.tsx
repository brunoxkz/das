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
  Calendar
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

  const renderBasicElement = (element: any) => {
    switch (element.type) {
      case 'heading':
        return (
          <div style={{
            fontSize: element.fontSize || '24px',
            fontWeight: element.fontWeight || 'bold',
            textAlign: element.textAlign || 'left',
            color: element.color || '#000',
            marginBottom: element.marginBottom || '16px'
          }}>
            {element.content || "Título"}
          </div>
        );

      case 'paragraph':
        return (
          <div style={{
            fontSize: element.fontSize || '16px',
            textAlign: element.textAlign || 'left',
            color: element.color || '#000',
            lineHeight: element.lineHeight || '1.5',
            marginBottom: element.marginBottom || '16px'
          }}>
            {element.content || "Texto do parágrafo"}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">{element.question || "Pergunta de múltipla escolha"}</h3>
            <div className="space-y-2">
              {(element.options || ['Opção 1', 'Opção 2', 'Opção 3']).map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`question-${element.id || 'default'}`}
                    value={option}
                    className="form-radio"
                  />
                  <label className="text-sm">{option}</label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="space-y-2 p-4 border rounded-lg">
            <label className="text-sm font-medium">
              {element.question || `Campo ${element.type}`}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type={element.type === 'email' ? 'email' : element.type === 'phone' ? 'tel' : element.type === 'number' ? 'number' : 'text'}
              placeholder={element.placeholder || `Digite ${element.type}`}
              required={element.required}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2 p-4 border rounded-lg">
            <div className="text-center">
              {element.src ? (
                <img 
                  src={element.src} 
                  alt={element.alt || "Imagem"} 
                  className="max-w-full h-auto rounded-lg"
                  style={{
                    maxWidth: element.maxWidth || '100%',
                    height: element.height || 'auto'
                  }}
                />
              ) : (
                <div className="bg-gray-200 p-8 rounded-lg">
                  <p className="text-gray-500">Imagem não carregada</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-2 p-4 border rounded-lg">
            <div className="text-center">
              {element.src ? (
                <video 
                  controls 
                  className="w-full rounded-lg"
                  style={{
                    maxWidth: element.maxWidth || '100%',
                    height: element.height || 'auto'
                  }}
                >
                  <source src={element.src} type="video/mp4" />
                  Seu navegador não suporta vídeos.
                </video>
              ) : (
                <div className="bg-gray-200 p-8 rounded-lg">
                  <p className="text-gray-500">Vídeo não carregado</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'continue_button':
        return (
          <div className="text-center p-4">
            <Button
              style={{
                backgroundColor: element.backgroundColor || '#007bff',
                color: element.textColor || 'white',
                fontSize: element.fontSize || '16px',
                padding: element.padding || '12px 24px',
                borderRadius: element.borderRadius || '8px'
              }}
            >
              {element.content || "Continuar"}
            </Button>
          </div>
        );

      default:
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-500">Elemento: {element.type}</p>
            <p className="text-xs text-gray-400">Não implementado ainda</p>
          </div>
        );
    }
  };

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
            <h1 className="text-2xl font-bold">{quiz?.title || "Preview do Quiz"}</h1>
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
              onClick={() => setCurrentStep(Math.min((quiz?.structure?.length || 1) - 1, currentStep + 1))}
              disabled={currentStep >= ((quiz?.structure?.length || 1) - 1)}
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