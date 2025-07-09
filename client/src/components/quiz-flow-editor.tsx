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
  Target
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
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
    value: string;
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
  const [showConditionEditor, setShowConditionEditor] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Inicializar nodes baseado nas páginas se estiver vazio
  useEffect(() => {
    if (flowSystem.nodes.length === 0 && pages.length > 0) {
      const initialNodes: FlowNode[] = pages.map((page, index) => ({
        id: `node_${page.id}`,
        pageId: page.id,
        title: page.title || `Página ${index + 1}`,
        x: 100 + (index * 250),
        y: 100,
        type: 'page'
      }));
      
      const initialConnections: FlowConnection[] = [];
      for (let i = 0; i < initialNodes.length - 1; i++) {
        initialConnections.push({
          id: `conn_${i}`,
          from: initialNodes[i].id,
          to: initialNodes[i + 1].id,
          fallback: true,
          label: 'Próxima'
        });
      }
      
      onFlowChange({
        ...flowSystem,
        nodes: initialNodes,
        connections: initialConnections
      });
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

  const addCondition = (fromNodeId: string, toNodeId: string) => {
    const newConnection: FlowConnection = {
      id: `conn_${Date.now()}`,
      from: fromNodeId,
      to: toNodeId,
      condition: {
        field: availableVariables[0] || 'nome',
        operator: 'equals',
        value: ''
      },
      label: 'Se condição'
    };
    
    onFlowChange({
      ...flowSystem,
      connections: [...flowSystem.connections, newConnection]
    });
  };

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
    // Simulação de teste do fluxo
    alert('Simulação de teste do fluxo - funcionalidade será implementada');
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
              {flowSystem.enabled ? "Ativo" : "Desativado"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testFlow}
              disabled={!flowSystem.enabled}
            >
              <Play className="w-4 h-4 mr-2" />
              Testar Fluxo
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
            <div className="relative w-full h-full min-h-[600px]">
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
                    <g key={connection.id}>
                      <line
                        x1={fromX}
                        y1={fromY}
                        x2={toX}
                        y2={toY}
                        stroke={connection.condition ? "#10b981" : "#6b7280"}
                        strokeWidth="2"
                        strokeDasharray={connection.fallback ? "5,5" : "none"}
                        markerEnd="url(#arrowhead)"
                      />
                      {connection.label && (
                        <text
                          x={(fromX + toX) / 2}
                          y={(fromY + toY) / 2 - 5}
                          textAnchor="middle"
                          className="text-xs fill-gray-600"
                        >
                          {connection.label}
                        </text>
                      )}
                    </g>
                  );
                })}
                
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
              {flowSystem.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute w-72 bg-white rounded-lg shadow-lg border-2 cursor-move ${
                    selectedNode === node.id ? 'border-green-500' : 'border-gray-200'
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    transform: draggedNode === node.id ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onClick={() => setSelectedNode(node.id)}
                  onMouseDown={(e) => {
                    setDraggedNode(node.id);
                    const startX = e.clientX;
                    const startY = e.clientY;
                    
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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-sm">{node.title}</span>
                      </div>
                      <MousePointer className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">
                      ID: {node.pageId} | Tipo: {node.type}
                    </p>
                    <div className="mt-2 text-xs text-gray-600">
                      Posição: ({node.x}, {node.y})
                    </div>
                  </div>
                </div>
              ))}
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setShowConditionEditor(true)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Condição
                              </Button>
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
                    <CardTitle className="text-sm">Conexões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {flowSystem.connections.map((connection) => (
                        <div key={connection.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="text-xs font-medium">{connection.label}</p>
                            {connection.condition && (
                              <p className="text-xs text-gray-500">
                                {connection.condition.field} {connection.condition.operator} {connection.condition.value}
                              </p>
                            )}
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
    </div>
  );
};