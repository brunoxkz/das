import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  Save, 
  RotateCcw,
  Eye,
  Settings,
  ArrowRight,
  MousePointer,
  Target,
  X,
  CheckCircle,
  AlertCircle,
  Link2
} from "lucide-react";

interface FlowNode {
  id: string;
  pageId: string;
  title: string;
  x: number;
  y: number;
  type: 'page' | 'condition' | 'end';
}

interface FlowConnection {
  id: string;
  from: string;
  to: string;
  condition?: {
    pageId: string;
    elementId: string;
    elementType: string;
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'option_selected' | 'image_clicked' | 'button_clicked';
    value: string;
    optionIndex?: number; // Para múltipla escolha
  };
  label?: string;
  fallback?: boolean;
}

interface FlowSystemData {
  enabled: boolean;
  nodes: FlowNode[];
  connections: FlowConnection[];
  defaultFlow: boolean;
}

interface QuizFlowEditorProps {
  pages: any[];
  flowSystem: FlowSystemData;
  onFlowChange: (flowSystem: FlowSystemData) => void;
  availableVariables: string[];
}

export const QuizFlowEditor: React.FC<QuizFlowEditorProps> = ({ 
  pages, 
  flowSystem, 
  onFlowChange,
  availableVariables = []
}) => {
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  // Estados simplificados - removido modal complexo
  const [connectionDrawing, setConnectionDrawing] = useState<{
    from: string;
    elementId?: string;
    optionIndex?: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sincronizar nodes com páginas do quiz (atualização em tempo real)
  useEffect(() => {
    if (flowSystem.enabled && pages.length > 0) {
      const existingNodeIds = new Set(flowSystem.nodes.map(n => n.pageId));
      const newNodes = [...flowSystem.nodes];
      let hasChanges = false;
      
      // Adicionar novas páginas
      pages.forEach((page, index) => {
        if (!existingNodeIds.has(page.id)) {
          newNodes.push({
            id: `node_${page.id}`,
            pageId: page.id,
            title: page.title || `Página ${index + 1}`,
            x: 100 + (newNodes.length * 250),
            y: 100,
            type: 'page'
          });
          hasChanges = true;
        }
      });
      
      // Atualizar títulos das páginas existentes
      const pageMap = new Map(pages.map(p => [p.id, p]));
      newNodes.forEach(node => {
        const page = pageMap.get(node.pageId);
        if (page && node.title !== (page.title || `Página ${pages.indexOf(page) + 1}`)) {
          node.title = page.title || `Página ${pages.indexOf(page) + 1}`;
          hasChanges = true;
        }
      });
      
      // Remover nodes de páginas deletadas
      const validPageIds = new Set(pages.map(p => p.id));
      const filteredNodes = newNodes.filter(node => validPageIds.has(node.pageId));
      if (filteredNodes.length !== newNodes.length) {
        hasChanges = true;
      }
      
      if (hasChanges) {
        onFlowChange({
          ...flowSystem,
          nodes: filteredNodes,
          connections: flowSystem.connections.filter(conn => {
            const fromExists = filteredNodes.some(n => n.id === conn.from);
            const toExists = filteredNodes.some(n => n.id === conn.to);
            return fromExists && toExists;
          })
        });
      }
    }
  }, [pages, flowSystem, onFlowChange]);

  const handleNodeDrag = (nodeId: string, deltaX: number, deltaY: number) => {
    const updatedNodes = flowSystem.nodes.map(node => 
      node.id === nodeId 
        ? { ...node, x: node.x + deltaX, y: node.y + deltaY }
        : node
    );
    
    onFlowChange({
      ...flowSystem,
      nodes: updatedNodes
    });
  };

  const handleEnableFlow = (enabled: boolean) => {
    onFlowChange({
      ...flowSystem,
      enabled,
      defaultFlow: !enabled
    });
  };

  // Extrair todos os elementos das páginas de forma detalhada
  const getAllPageElements = () => {
    const elements: Array<{
      pageId: string;
      pageTitle: string;
      elementId: string;
      elementType: string;
      elementTitle: string;
      fieldId?: string;
      options?: string[];
      hasClickableActions?: boolean;
    }> = [];
    
    pages.forEach((page) => {
      const pageTitle = page.title || `Página ${pages.indexOf(page) + 1}`;
      
      if (page.elements) {
        page.elements.forEach((element: any) => {
          const baseElement = {
            pageId: page.id,
            pageTitle,
            elementId: element.id,
            elementType: element.type,
            elementTitle: element.content || element.text || element.properties?.text || `Elemento ${element.type}`,
            fieldId: element.fieldId || element.properties?.fieldId
          };
          
          // Elementos com múltiplas opções
          if (element.type === 'multiple_choice' || element.type === 'checkbox') {
            const options = element.options || element.properties?.options || [];
            elements.push({
              ...baseElement,
              options: Array.isArray(options) ? options.map((opt: any) => typeof opt === 'string' ? opt : opt.text || opt.label) : []
            });
          }
          
          // Elementos clicáveis (imagem, botão, etc.)
          else if (['image', 'button', 'continue_button', 'image_upload'].includes(element.type)) {
            elements.push({
              ...baseElement,
              hasClickableActions: true
            });
          }
          
          // Outros elementos com input
          else if (['text', 'email', 'phone', 'number', 'textarea', 'rating', 'date', 'birth_date', 'height', 'current_weight', 'target_weight'].includes(element.type)) {
            elements.push(baseElement);
          }
        });
      }
    });
    
    return elements;
  };

  const validateConnection = (fromNodeId: string, elementId?: string) => {
    const pageConnections = flowSystem.connections.filter(conn => conn.from === fromNodeId);
    
    if (elementId) {
      // Tentando criar conexão específica de elemento/opção
      const pageRedirection = pageConnections.find(conn => !conn.condition?.elementId);
      if (pageRedirection) {
        alert('⚠️ CONFLITO DE REDIRECIONAMENTO\n\nEsta página já tem redirecionamento geral (verde) configurado.\n\nPara usar redirecionamentos específicos (azul), primeiro remova o redirecionamento da página.');
        return false;
      }
    } else {
      // Tentando criar conexão geral da página
      const elementRedirections = pageConnections.filter(conn => conn.condition?.elementId);
      if (elementRedirections.length > 0) {
        alert('⚠️ CONFLITO DE REDIRECIONAMENTO\n\nEsta página já tem redirecionamentos específicos (azul) configurados.\n\nPara usar redirecionamento geral da página (verde), primeiro remova todos os redirecionamentos específicos.');
        return false;
      }
    }
    
    return true;
  };

  const startConnection = (fromNodeId: string, event: React.MouseEvent, elementId?: string, optionIndex?: number) => {
    event.stopPropagation();
    
    // Validar se a conexão é permitida
    if (!validateConnection(fromNodeId, elementId)) {
      return;
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;
    
    setConnectionDrawing({
      from: fromNodeId,
      elementId: elementId,
      optionIndex: optionIndex,
      startX,
      startY,
      currentX: startX,
      currentY: startY
    });
    
    // Adicionar event listeners para desenhar a linha
    const handleMouseMove = (e: MouseEvent) => {
      if (!rect) return;
      
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      setConnectionDrawing(prev => prev ? {
        ...prev,
        currentX,
        currentY
      } : null);
    };
    
    const handleMouseUp = () => {
      setConnectionDrawing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const updateConnectionDrawing = (event: React.MouseEvent) => {
    if (!connectionDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    
    setConnectionDrawing({
      ...connectionDrawing,
      currentX,
      currentY
    });
  };

  const finishConnection = (toNodeId: string) => {
    if (!connectionDrawing || connectionDrawing.from === toNodeId) return;
    
    const fromNode = flowSystem.nodes.find(n => n.id === connectionDrawing.from);
    const toNode = flowSystem.nodes.find(n => n.id === toNodeId);
    
    if (!fromNode || !toNode) return;
    
    // NOVA LÓGICA: Permitir múltiplas conexões para a mesma página
    // Apenas verificar se a conexão específica já existe (elementId + optionIndex)
    const duplicateConnection = flowSystem.connections.find(conn => 
      conn.from === connectionDrawing.from &&
      conn.to === toNodeId &&
      conn.condition?.elementId === connectionDrawing.elementId &&
      conn.condition?.optionIndex === connectionDrawing.optionIndex
    );
    
    // Se a conexão exata já existe, não criar duplicata
    if (duplicateConnection) {
      setConnectionDrawing(null);
      return;
    }
    
    const newConnection: FlowConnection = {
      id: `conn_${Date.now()}`,
      from: connectionDrawing.from,
      to: toNodeId,
      condition: connectionDrawing.elementId ? {
        pageId: fromNode.pageId,
        elementId: connectionDrawing.elementId,
        elementType: 'multiple_choice',
        field: `field_${connectionDrawing.elementId}`,
        operator: connectionDrawing.optionIndex !== undefined ? 'option_selected' : 'exists',
        value: connectionDrawing.optionIndex !== undefined ? `option_${connectionDrawing.optionIndex}` : 'true',
        optionIndex: connectionDrawing.optionIndex
      } : undefined,
      label: 'redireciona para'
    };
    
    // Adicionar nova conexão SEM remover existentes
    const updatedFlowSystem = {
      ...flowSystem,
      connections: [...flowSystem.connections, newConnection]
    };
    
    onFlowChange(updatedFlowSystem);
    setConnectionDrawing(null);
  };

  // Funções removidas - sistema simplificado

  const updateConnection = (connectionId: string, updates: Partial<FlowConnection>) => {
    const updatedConnections = flowSystem.connections.map(conn =>
      conn.id === connectionId ? { ...conn, ...updates } : conn
    );
    
    onFlowChange({
      ...flowSystem,
      connections: updatedConnections
    });
  };

  const removeConnection = (connectionId: string) => {
    const filteredConnections = flowSystem.connections.filter(conn => conn.id !== connectionId);
    onFlowChange({
      ...flowSystem,
      connections: filteredConnections
    });
  };

  const testFlow = () => {
    // Sugerir publicação do quiz para teste
    const confirmTest = confirm(
      '🚀 Para testar o fluxo, publique o quiz primeiro!\n\n' +
      '✅ Clique em "Publicar Quiz" no canto superior direito\n' +
      '🔗 Depois acesse a URL pública para testar o fluxo\n\n' +
      'Deseja ir para as configurações de publicação agora?'
    );
    
    if (confirmTest) {
      // Disparar evento para ir para a aba de configurações
      const event = new CustomEvent('switchToConfigTab');
      window.dispatchEvent(event);
    }
  };

  const resetFlow = () => {
    if (confirm('Tem certeza que deseja resetar o fluxo para o padrão linear?')) {
      onFlowChange({
        enabled: false,
        nodes: [],
        connections: [],
        defaultFlow: true
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Fluxo (Avançado)</h2>
            </div>
            <Badge variant={flowSystem.enabled ? "default" : "secondary"}>
              {flowSystem.enabled ? "PRIORIDADE ATIVA" : "ORDEM PADRÃO"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={flowSystem.enabled ? "destructive" : "default"}
              size="sm"
              onClick={() => handleEnableFlow(!flowSystem.enabled)}
            >
              {flowSystem.enabled ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Desativar Fluxo
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Ativar Fluxo
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={testFlow}
              disabled={!flowSystem.enabled}
            >
              <Eye className="w-4 h-4 mr-2" />
              Testar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFlow}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
          </div>
        </div>
      </div>

      {/* Alerta de status */}
      <div className={`mx-4 mt-2 mb-4 p-3 rounded-lg border ${
        flowSystem.enabled 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
      }`}>
        <div className="flex items-center gap-2">
          {flowSystem.enabled ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <div className="flex-1">
            <span className="text-sm font-medium block">
              {flowSystem.enabled 
                ? "Fluxo ativo: O sistema seguirá as conexões personalizadas criadas no fluxo (PRIORIDADE)"
                : "Fluxo inativo: O sistema seguirá a ordem padrão do editor (página 1 → página 2 → página 3...)"
              }
            </span>
            {!flowSystem.enabled && (
              <span className="text-xs font-medium text-yellow-700 mt-1 block">
                ⚠️ IMPORTANTE: SOMENTE ATIVE O FLUXO SE SEU QUIZ TIVER MAIS DE 1 CAMINHO, se não mantenha desativado.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative overflow-auto bg-gray-50" ref={canvasRef}>
          {!flowSystem.enabled ? (
            // Modo desativado - mostrar instruções
            <div className="h-full flex items-center justify-center">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    Sistema de Fluxo Avançado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Crie caminhos condicionais inteligentes baseados nas respostas dos usuários. 
                    Transforme seu quiz linear em uma experiência dinâmica e personalizada.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-yellow-900 text-sm mb-1">⚠️ IMPORTANTE</h4>
                        <p className="text-xs text-yellow-800 font-medium">
                          SOMENTE ATIVE O FLUXO SE SEU QUIZ TIVER MAIS DE 1 CAMINHO, se não mantenha desativado.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Ramificações condicionais</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ArrowRight className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Interface visual tipo mind map</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Teste em tempo real</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Integração com variáveis</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleEnableFlow(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ativar Sistema de Fluxo
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Modo ativo - mostrar canvas com nodes
            <div className="relative w-full h-full min-h-[600px]"
                 onMouseMove={updateConnectionDrawing}
                 onMouseUp={() => setConnectionDrawing(null)}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Render connections */}
                {flowSystem.connections.map((connection) => {
                  const fromNode = flowSystem.nodes.find(n => n.id === connection.from);
                  const toNode = flowSystem.nodes.find(n => n.id === connection.to);
                  
                  if (!fromNode || !toNode) return null;
                  
                  const fromX = fromNode.x + 150; // meio do node
                  const fromY = fromNode.y + 50;
                  const toX = toNode.x + 150;
                  const toY = toNode.y + 50;
                  
                  return (
                    <g key={connection.id} className="cursor-pointer">
                      <line
                        x1={fromX}
                        y1={fromY}
                        x2={toX}
                        y2={toY}
                        stroke={connection.condition ? "#10b981" : "#6b7280"}
                        strokeWidth="2"
                        strokeDasharray={connection.fallback ? "5,5" : "none"}
                        markerEnd="url(#arrowhead)"
                        className="pointer-events-auto"
                        onClick={() => editCondition(connection)}
                      />
                      {/* Texto da conexão "redirecionar" */}
                      <text
                        x={(fromX + toX) / 2}
                        y={(fromY + toY) / 2 - 5}
                        textAnchor="middle"
                        className="text-xs fill-gray-600 pointer-events-auto cursor-pointer"
                        onClick={() => editCondition(connection)}
                      >
                        redirecionar
                      </text>
                      
                      {/* Botão lixeira para remover conexão */}
                      <g>
                        <circle
                          cx={(fromX + toX) / 2 + 35}
                          cy={(fromY + toY) / 2 + 8}
                          r="10"
                          fill="#ef4444"
                          className="cursor-pointer hover:fill-red-600 pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeConnection(connection.id);
                          }}
                        />
                        {/* Ícone de lixeira */}
                        <g transform={`translate(${(fromX + toX) / 2 + 35}, ${(fromY + toY) / 2 + 8})`}>
                          <rect
                            x="-3"
                            y="-4"
                            width="6"
                            height="7"
                            fill="none"
                            stroke="white"
                            strokeWidth="1"
                            className="pointer-events-none"
                          />
                          <rect
                            x="-2"
                            y="-5"
                            width="4"
                            height="1"
                            fill="white"
                            className="pointer-events-none"
                          />
                          <line
                            x1="-1"
                            y1="-2"
                            x2="-1"
                            y2="1"
                            stroke="white"
                            strokeWidth="0.5"
                            className="pointer-events-none"
                          />
                          <line
                            x1="1"
                            y1="-2"
                            x2="1"
                            y2="1"
                            stroke="white"
                            strokeWidth="0.5"
                            className="pointer-events-none"
                          />
                        </g>
                      </g>
                    </g>
                  );
                })}
                
                {/* Connection being drawn */}
                {connectionDrawing && (
                  <line
                    x1={connectionDrawing.startX}
                    y1={connectionDrawing.startY}
                    x2={connectionDrawing.currentX}
                    y2={connectionDrawing.currentY}
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                  />
                )}
                
                {/* Arrow marker */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#6b7280"
                    />
                  </marker>
                </defs>
              </svg>
              
              {/* Render nodes */}
              {flowSystem.nodes.map((node) => {
                const pageElements = getAllPageElements().filter(el => el.pageId === node.pageId);
                
                return (
                  <div
                    key={node.id}
                    className={`absolute w-80 bg-white rounded-lg shadow-lg border-2 ${
                      selectedNode === node.id ? 'border-green-500' : 'border-gray-200'
                    } ${draggedNode === node.id ? 'scale-105 z-50' : 'scale-100'}`}
                    style={{
                      left: node.x,
                      top: node.y,
                      transition: draggedNode === node.id ? 'none' : 'all 0.2s ease'
                    }}
                    onClick={() => setSelectedNode(node.id)}
                    onMouseDown={(e) => {
                      if (e.detail === 2) return; // Ignore double clicks
                      
                      setDraggedNode(node.id);
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const initialX = node.x;
                      const initialY = node.y;
                      
                      const handleMouseMove = (e: MouseEvent) => {
                        const deltaX = e.clientX - startX;
                        const deltaY = e.clientY - startY;
                        handleNodeDrag(node.id, deltaX, deltaY);
                      };
                      
                      const handleMouseUp = () => {
                        setDraggedNode(null);
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2" title={node.title}>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-sm">{node.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Botão VERDE para redirecionamento geral da página */}
                          <div 
                            className="w-6 h-6 bg-green-500 hover:bg-green-600 rounded-full cursor-crosshair flex items-center justify-center transition-all shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              startConnection(node.id, e);
                            }}
                            title="Redirecionamento da página (verde) - todas as respostas vão para o mesmo destino"
                          >
                            <Link2 className="w-3 h-3 text-white" />
                          </div>
                          <MousePointer className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          ID: {node.pageId}
                        </p>
                        
                        {pageElements.length > 0 && (
                          <div className="border-t pt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              Elementos ({pageElements.length}):
                            </p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {pageElements.map((element, idx) => {
                                const isMultipleChoice = element.type === 'multiple_choice';
                                const isCheckbox = element.type === 'checkbox';
                                const isClickable = ['continue_button', 'button', 'image', 'image_upload', 'wheel', 'scratch', 'color_pick', 'brick_break', 'memory_cards', 'slot_machine', 'share_quiz'].includes(element.type);
                                
                                // Verificar se elemento já tem conexão
                                const hasConnection = flowSystem.connections.some(conn => 
                                  conn.from === node.id && conn.condition?.elementId === element.id
                                );
                                
                                return (
                                  <div key={idx} className="relative">
                                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                      <span className="text-xs truncate">
                                        {element.type}: {element.properties?.text || element.content || 'Sem texto'}
                                      </span>
                                      
                                      {/* Bolinha de conexão do elemento - AZUL para elementos específicos */}
                                      <div 
                                        className={`w-4 h-4 border-2 border-white rounded-full cursor-crosshair flex-shrink-0 hover:scale-110 transition-all ${
                                          hasConnection 
                                            ? 'bg-gray-400 hover:bg-gray-500 shadow-lg' 
                                            : 'bg-blue-500 hover:bg-blue-600 shadow-lg'
                                        }`}
                                        title={hasConnection 
                                          ? "Já conectado - arrastar para reconectar" 
                                          : "Criar redirecionamento específico (azul) - arrastar para conectar elemento"}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          startConnection(node.id, e, element.id);
                                        }}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                      />
                                    </div>
                                    
                                    {/* Opções de múltipla escolha com bolinhas individuais */}
                                    {(isMultipleChoice || isCheckbox) && element.properties?.options && Array.isArray(element.properties.options) && (
                                      <div className="ml-2 mt-1 space-y-1">
                                        {element.properties.options.map((option, optIdx) => {
                                          const optionHasConnection = flowSystem.connections.some(conn => 
                                            conn.from === node.id && 
                                            conn.condition?.elementId === element.id && 
                                            conn.condition?.optionIndex === optIdx
                                          );
                                          
                                          return (
                                            <div key={optIdx} className="flex items-center justify-between text-xs bg-green-50 p-1 rounded">
                                              <span className="truncate text-xs">
                                                Opção {optIdx + 1}: {typeof option === 'string' ? option : option.text || option.label || 'Sem texto'}
                                              </span>
                                              <div 
                                                className={`w-3 h-3 border-2 border-white rounded-full cursor-crosshair flex-shrink-0 hover:scale-110 transition-all shadow-md ${
                                                  optionHasConnection 
                                                    ? 'bg-gray-400 hover:bg-gray-500' 
                                                    : 'bg-green-500 hover:bg-green-600'
                                                }`}
                                                onMouseDown={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  startConnection(node.id, e, element.id, optIdx);
                                                }}
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                }}
                                                title={optionHasConnection 
                                                  ? `🔗 Já conectado - arrastar para reconectar: ${typeof option === 'string' ? option : option.text || option.label}`
                                                  : `🔗 Arrastar para conectar: ${typeof option === 'string' ? option : option.text || option.label}`}
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    
                                    {/* Indicador visual para elementos clicáveis */}
                                    {isClickable && (
                                      <div className="ml-2 mt-1">
                                        <div className="text-xs text-orange-600 bg-orange-50 p-1 rounded">
                                          ⚡ Elemento clicável - pode redirecionar o fluxo
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Pontos de entrada e saída visuais */}
                    {/* Ponto de entrada (lado esquerdo) */}
                    <div 
                      className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-400 border-2 border-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors"
                      title="Ponto de entrada"
                      onMouseUp={() => {
                        if (connectionDrawing && connectionDrawing.from !== node.id) {
                          finishConnection(node.id);
                        }
                      }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Ponto de saída principal (lado direito) */}
                    <div 
                      className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-green-500 border-3 border-white rounded-full flex items-center justify-center cursor-crosshair hover:bg-green-600 hover:scale-110 transition-all shadow-lg"
                      title="🔗 Arrastar para conectar página"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startConnection(node.id, e);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Drop zone for connections - apenas quando arrastando */}
                    {connectionDrawing && connectionDrawing.from !== node.id && (
                      <div
                        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                        onMouseUp={() => {
                          if (connectionDrawing && connectionDrawing.from !== node.id) {
                            finishConnection(node.id);
                          }
                        }}
                      >
                        <div className="absolute inset-0 bg-green-100 border-2 border-green-400 border-dashed rounded-lg flex items-center justify-center pointer-events-auto">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        {flowSystem.enabled && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Configurações gerais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Configurações do Fluxo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Sistema Ativo</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEnableFlow(false)}
                    >
                      Desativar
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    <p>Páginas: {flowSystem.nodes.length}</p>
                    <p>Conexões: {flowSystem.connections.length}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Variáveis disponíveis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Variáveis Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableVariables.length > 0 ? (
                      availableVariables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {variable}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">
                        Nenhuma variável detectada no quiz
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Node selecionado */}
              {selectedNode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Página Selecionada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(() => {
                        const node = flowSystem.nodes.find(n => n.id === selectedNode);
                        if (!node) return null;
                        
                        return (
                          <div>
                            <p className="text-sm font-medium">{node.title}</p>
                            <p className="text-xs text-gray-500">ID: {node.pageId}</p>
                            <div className="mt-2 space-y-1">
                              <div className="text-xs text-gray-500">
                                Use as bolinhas coloridas para arrastar e conectar as páginas:
                                <ul className="mt-1 space-y-1">
                                  <li>🔵 Azul: Elementos normais</li>
                                  <li>🟢 Verde: Opções múltipla escolha</li>
                                  <li>🟠 Laranja: Elementos clicáveis</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Conexões */}
              {flowSystem.connections.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Conexões Criadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {flowSystem.connections.map((connection) => (
                        <div key={connection.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="text-xs font-medium">{connection.label || `${connection.from} → ${connection.to}`}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConnection(connection.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal removido - sistema simplificado */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Editar Condição</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConditionEditor(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">De (Página)</Label>
                    <Select
                      value={editingConnection.from}
                      onValueChange={(value) =>
                        setEditingConnection({
                          ...editingConnection,
                          from: value
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {flowSystem.nodes.map((node) => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Para (Página)</Label>
                    <Select
                      value={editingConnection.to}
                      onValueChange={(value) =>
                        setEditingConnection({
                          ...editingConnection,
                          to: value
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {flowSystem.nodes.map((node) => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Página com Elemento</Label>
                  <Select
                    value={editingConnection.condition?.pageId || ''}
                    onValueChange={(value) => {
                      const pageElements = getAllPageElements().filter(el => el.pageId === value);
                      const firstElement = pageElements[0];
                      
                      setEditingConnection({
                        ...editingConnection,
                        condition: {
                          ...editingConnection.condition!,
                          pageId: value,
                          elementId: firstElement?.elementId || '',
                          elementType: firstElement?.elementType || 'text',
                          field: firstElement?.fieldId || firstElement?.elementId || '',
                          operator: firstElement?.options ? 'option_selected' : 'equals',
                          value: firstElement?.options ? firstElement.options[0] : ''
                        }
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma página" />
                    </SelectTrigger>
                    <SelectContent>
                      {pages.map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                          {page.title || `Página ${pages.indexOf(page) + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editingConnection.condition?.pageId && (
                  <div>
                    <Label className="text-sm font-medium">Elemento</Label>
                    <Select
                      value={editingConnection.condition.elementId}
                      onValueChange={(value) => {
                        const element = getAllPageElements().find(el => el.elementId === value);
                        if (element) {
                          setEditingConnection({
                            ...editingConnection,
                            condition: {
                              ...editingConnection.condition!,
                              elementId: value,
                              elementType: element.elementType,
                              field: element.fieldId || element.elementId,
                              operator: element.options ? 'option_selected' : 'equals',
                              value: element.options ? element.options[0] : ''
                            }
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um elemento" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllPageElements()
                          .filter(el => el.pageId === editingConnection.condition?.pageId)
                          .map((element) => (
                            <SelectItem key={element.elementId} value={element.elementId}>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                <span>{element.elementType}: {element.elementTitle}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Operador</Label>
                    <Select
                      value={editingConnection.condition?.operator || 'equals'}
                      onValueChange={(value) =>
                        setEditingConnection({
                          ...editingConnection,
                          condition: {
                            ...editingConnection.condition!,
                            operator: value as any
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Igual a</SelectItem>
                        <SelectItem value="not_equals">Diferente de</SelectItem>
                        <SelectItem value="contains">Contém</SelectItem>
                        <SelectItem value="greater_than">Maior que</SelectItem>
                        <SelectItem value="less_than">Menor que</SelectItem>
                        <SelectItem value="exists">Existe</SelectItem>
                        <SelectItem value="option_selected">Opção selecionada</SelectItem>
                        <SelectItem value="image_clicked">Imagem clicada</SelectItem>
                        <SelectItem value="button_clicked">Botão clicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Valor</Label>
                    {editingConnection.condition?.operator === 'option_selected' ? (
                      <Select
                        value={editingConnection.condition?.value || ''}
                        onValueChange={(value) => {
                          const element = getAllPageElements().find(el => el.elementId === editingConnection.condition?.elementId);
                          const optionIndex = element?.options?.findIndex(opt => opt === value) || 0;
                          
                          setEditingConnection({
                            ...editingConnection,
                            condition: {
                              ...editingConnection.condition!,
                              value,
                              optionIndex
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllPageElements()
                            .find(el => el.elementId === editingConnection.condition?.elementId)
                            ?.options?.map((option, index) => (
                              <SelectItem key={index} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={editingConnection.condition?.value || ''}
                        onChange={(e) =>
                          setEditingConnection({
                            ...editingConnection,
                            condition: {
                              ...editingConnection.condition!,
                              value: e.target.value
                            }
                          })
                        }
                        placeholder="Digite o valor"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Rótulo da Conexão</Label>
                  <Input
                    value={editingConnection.label || ''}
                    onChange={(e) =>
                      setEditingConnection({
                        ...editingConnection,
                        label: e.target.value
                      })
                    }
                    placeholder="Ex: Se resposta for 'Sim'"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConditionEditor(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => saveCondition(editingConnection)}
                  >
                    Salvar Condição
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};