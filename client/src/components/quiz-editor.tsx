import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Edit3, 
  Copy,
  Eye,
  Type,
  CheckSquare,
  Star,
  Image as ImageIcon
} from "lucide-react";

interface Question {
  id: number;
  type: "multiple_choice" | "text" | "rating" | "email" | "checkbox" | "date" | "phone" | "number" | "textarea" | "image_upload";
  question: string;
  description?: string;
  options?: string[];
  required?: boolean;
  fieldId?: string; // ID único para referências cruzadas
  placeholder?: string;
  min?: number;
  max?: number;
}

interface QuizEditorProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export function QuizEditor({ questions, onQuestionsChange }: QuizEditorProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [draggedQuestion, setDraggedQuestion] = useState<number | null>(null);

  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      id: Date.now(),
      type,
      question: "",
      description: "",
      options: type === "multiple_choice" || type === "checkbox" ? ["Opção 1", "Opção 2"] : undefined,
      required: true,
      fieldId: "",
      placeholder: ""
    };

    onQuestionsChange([...questions, newQuestion]);
    setSelectedQuestion(newQuestion.id);
  };

  const updateQuestion = (id: number, updates: Partial<Question>) => {
    const updatedQuestions = questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    onQuestionsChange(updatedQuestions);
  };

  const deleteQuestion = (id: number) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    onQuestionsChange(updatedQuestions);
    if (selectedQuestion === id) {
      setSelectedQuestion(null);
    }
  };

  const duplicateQuestion = (id: number) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (questionToDuplicate) {
      const newQuestion = {
        ...questionToDuplicate,
        id: Date.now(),
        question: questionToDuplicate.question + " (Cópia)"
      };
      onQuestionsChange([...questions, newQuestion]);
    }
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const updatedQuestions = [...questions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);
    onQuestionsChange(updatedQuestions);
  };

  const addOption = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options, `Opção ${question.options.length + 1}`];
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const questionTypes = [
    {
      type: "multiple_choice" as const,
      label: "Múltipla Escolha",
      icon: <CheckSquare className="w-4 h-4" />,
      description: "Opções para o usuário escolher"
    },
    {
      type: "text" as const,
      label: "Texto Curto",
      icon: <Type className="w-4 h-4" />,
      description: "Campo de texto pequeno"
    },
    {
      type: "textarea" as const,
      label: "Texto Longo",
      icon: <Type className="w-4 h-4" />,
      description: "Campo de texto grande"
    },
    {
      type: "email" as const,
      label: "Email",
      icon: <Type className="w-4 h-4" />,
      description: "Campo para capturar email"
    },
    {
      type: "phone" as const,
      label: "Telefone",
      icon: <Type className="w-4 h-4" />,
      description: "Campo para telefone"
    },
    {
      type: "number" as const,
      label: "Número",
      icon: <Type className="w-4 h-4" />,
      description: "Campo numérico"
    },
    {
      type: "date" as const,
      label: "Data",
      icon: <Type className="w-4 h-4" />,
      description: "Seletor de data"
    },
    {
      type: "rating" as const,
      label: "Avaliação",
      icon: <Star className="w-4 h-4" />,
      description: "Escala de 1 a 5 estrelas"
    },
    {
      type: "checkbox" as const,
      label: "Checkbox",
      icon: <CheckSquare className="w-4 h-4" />,
      description: "Múltiplas seleções"
    }
  ];

  const selectedQuestionData = questions.find(q => q.id === selectedQuestion);

  return (
    <div className="h-full flex">
      {/* Questions List */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Perguntas</h3>
          
          {/* Add Question Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {questionTypes.map((type) => (
              <Button
                key={type.type}
                variant="outline"
                size="sm"
                onClick={() => addQuestion(type.type)}
                className="h-auto p-2 flex flex-col items-center gap-1"
              >
                {type.icon}
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="p-4 space-y-2">
          {questions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma pergunta ainda</p>
              <p className="text-xs text-gray-400">Clique nos botões acima para adicionar</p>
            </div>
          ) : (
            questions.map((question, index) => (
              <Card
                key={question.id}
                className={`cursor-pointer transition-colors ${
                  selectedQuestion === question.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedQuestion(question.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <Badge variant="outline" className="text-xs">
                          {questionTypes.find(t => t.type === question.type)?.label}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {question.question || `Pergunta ${index + 1}`}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Pergunta {index + 1}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateQuestion(question.id);
                        }}
                        className="w-6 h-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuestion(question.id);
                        }}
                        className="w-6 h-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Question Editor */}
      <div className="flex-1 overflow-y-auto">
        {selectedQuestionData ? (
          <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Edit3 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Editar Pergunta
                </h2>
                <Badge variant="outline">
                  {questionTypes.find(t => t.type === selectedQuestionData.type)?.label}
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              {/* Question Text */}
              <div>
                <Label htmlFor="question">Pergunta</Label>
                <Input
                  id="question"
                  placeholder="Digite sua pergunta aqui..."
                  value={selectedQuestionData.question}
                  onChange={(e) => updateQuestion(selectedQuestionData.id, { question: e.target.value })}
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Adicione uma descrição ou contexto..."
                  value={selectedQuestionData.description || ""}
                  onChange={(e) => updateQuestion(selectedQuestionData.id, { description: e.target.value })}
                  className="mt-2"
                  rows={2}
                />
              </div>

              {/* Field ID for Cross References */}
              <div>
                <Label htmlFor="fieldId">ID do Campo (para referências)</Label>
                <Input
                  id="fieldId"
                  placeholder="ex: nome, empresa, telefone"
                  value={selectedQuestionData.fieldId || ""}
                  onChange={(e) => updateQuestion(selectedQuestionData.id, { fieldId: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_') })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use este ID para referenciar a resposta em outros textos: {"{"}
                  {selectedQuestionData.fieldId || "campo_id"}{"}"}
                </p>
              </div>

              {/* Options for Multiple Choice */}
              {selectedQuestionData.type === "multiple_choice" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Opções de Resposta</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(selectedQuestionData.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedQuestionData.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        <Input
                          value={option}
                          onChange={(e) => updateOption(selectedQuestionData.id, index, e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                          className="flex-1"
                        />
                        {selectedQuestionData.options && selectedQuestionData.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(selectedQuestionData.id, index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Scale Preview */}
              {selectedQuestionData.type === "rating" && (
                <div>
                  <Label>Escala de Avaliação</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center">
                          {rating}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              <div>
                <Label>Configurações</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={selectedQuestionData.required}
                      onChange={(e) => updateQuestion(selectedQuestionData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="required">Resposta obrigatória</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Selecione uma pergunta</h3>
              <p className="text-sm">
                Clique em uma pergunta da lista para editá-la, ou adicione uma nova pergunta.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
