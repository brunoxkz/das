import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { QuizPublicRenderer } from "@/components/quiz-public-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { generateAllPixelCodes, insertPixelCodes } from "@/utils/pixelCodeGenerator";

export default function QuizPublicPage() {
  const [match, params] = useRoute("/quiz/:id");
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (match && params?.id) {
      fetchQuiz(params.id);
    }
  }, [match, params?.id]);

  const trackQuizView = async (quizId: string) => {
    try {
      await fetch(`/api/analytics/${quizId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Quiz view tracked successfully');
    } catch (error) {
      console.error('Error tracking quiz view:', error);
    }
  };

  const insertTrackingPixels = (quizData: any) => {
    try {
      // Verificar se existem pixels configurados
      const hasPixels = quizData.trackingPixels && Array.isArray(quizData.trackingPixels) && quizData.trackingPixels.length > 0;
      
      if (!hasPixels) {
        console.log('Nenhum pixel configurado para este quiz');
        return;
      }

      // Gerar códigos de pixels
      const pixelCodes = generateAllPixelCodes(quizData.trackingPixels, quizData.pixelDelay || false);
      
      if (pixelCodes.trim()) {
        // Inserir códigos no head da página
        insertPixelCodes(pixelCodes);
        console.log(`✅ Pixels inseridos automaticamente: ${quizData.trackingPixels.length} pixels`);
        
        // Log detalhado dos pixels inseridos
        quizData.trackingPixels.forEach((pixel: any) => {
          console.log(`📊 Pixel ${pixel.name} (${pixel.type}): ${pixel.value} - Modo: ${pixel.mode}`);
        });
        
        if (quizData.pixelDelay) {
          console.log('⏱️ Delay de 3 segundos aplicado aos pixels para otimização de CPA');
        }
      }
    } catch (error) {
      console.error('Erro ao inserir pixels de rastreamento:', error);
    }
  };

  const fetchQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/quiz/${quizId}/public`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Quiz não encontrado");
        } else {
          setError("Erro ao carregar o quiz");
        }
        return;
      }
      
      const quizData = await response.json();
      
      // Check if quiz is published
      if (!quizData.isPublished) {
        setError("Este quiz não está publicado");
        return;
      }
      
      setQuiz(quizData);
      
      // Track view when quiz is loaded successfully
      trackQuizView(quizId);
      
      // Inserir códigos de pixels automaticamente apenas na URL pública
      insertTrackingPixels(quizData);
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError("Erro ao carregar o quiz");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Ops!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizPublicRenderer quiz={quiz} />
    </div>
  );
}