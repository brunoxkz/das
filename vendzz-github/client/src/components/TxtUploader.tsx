/**
 * COMPONENTE DE UPLOAD .TXT PARA SMS E WHATSAPP
 * 
 * Interface completa e segura para upload de arquivos
 * Suporte para disparo em massa
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, CheckCircle, AlertCircle, Phone, MapPin } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TxtUploaderProps {
  type: 'sms' | 'whatsapp';
  onUploadComplete?: (phones: string[], stats: any) => void;
}

interface UploadStats {
  totalLines: number;
  validPhones: number;
  duplicatesRemoved: number;
  invalidLines: number;
  invalidSamples: string[];
}

interface DetailedStats {
  total: number;
  brazilian: number;
  international: number;
  mobile: number;
  landline: number;
  regions: Record<string, number>;
}

export default function TxtUploader({ type, onUploadComplete }: TxtUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    phones: string[];
    stats: UploadStats;
    detailedStats: DetailedStats;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações do arquivo
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      setError('Apenas arquivos .txt são permitidos');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Arquivo muito grande (máximo 5MB)');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('txtFile', file);

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const endpoint = type === 'sms' 
        ? '/api/sms-campaigns/upload-txt'
        : '/api/whatsapp-campaigns/upload-txt';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok && data.success) {
        setUploadResult({
          phones: data.phones,
          stats: data.stats,
          detailedStats: data.detailedStats
        });
        
        toast({
          title: "Upload realizado com sucesso",
          description: `${data.phones.length} telefones válidos carregados`,
        });

        if (onUploadComplete) {
          onUploadComplete(data.phones, data.stats);
        }
      } else {
        setError(data.error || 'Erro no upload');
        toast({
          title: "Erro no upload",
          description: data.error || 'Erro desconhecido',
          variant: "destructive",
        });
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearResults = () => {
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatPhoneRegions = (regions: Record<string, number>) => {
    return Object.entries(regions)
      .sort(([,a], [,b]) => b - a) // Ordenar por quantidade
      .slice(0, 5) // Top 5 regiões
      .map(([ddd, count]) => ({ ddd, count }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload de Lista .TXT - {type.toUpperCase()}
        </CardTitle>
        <CardDescription>
          Faça upload de um arquivo .txt com lista de telefones para disparo em massa
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Área de Upload */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!isUploading ? (
            <div className="space-y-3">
              <Upload className="h-10 w-10 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium">Clique para selecionar arquivo .txt</p>
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 5MB • 10.000 telefones • Formatos aceitos: brasileiro e internacional
                </p>
              </div>
              <Button onClick={triggerFileSelect} variant="outline">
                Selecionar Arquivo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-10 w-10 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <div>
                <p className="text-sm font-medium">Processando arquivo...</p>
                <div className="mt-2 w-full max-w-xs mx-auto">
                  <Progress value={uploadProgress} className="h-2" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}% concluído</p>
              </div>
            </div>
          )}
        </div>

        {/* Instruções de Formato */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Formato Aceito</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• Um telefone por linha</p>
            <p>• Formatos: 11999887766, +5511999887766, (11) 99988-7766</p>
            <p>• Números brasileiros e internacionais</p>
            <p>• Duplicatas são removidas automaticamente</p>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Erro no Upload</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Resultado do Upload */}
        {uploadResult && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Upload Concluído</span>
              </div>
              
              {/* Estatísticas Principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-700">
                    {uploadResult.stats.validPhones.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600">Telefones Válidos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-700">
                    {uploadResult.stats.totalLines.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600">Total de Linhas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-700">
                    {uploadResult.stats.duplicatesRemoved.toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-600">Duplicatas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-700">
                    {uploadResult.stats.invalidLines.toLocaleString()}
                  </div>
                  <div className="text-xs text-red-600">Inválidos</div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Análise Detalhada */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-900">Análise Detalhada</h5>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <Phone className="h-3 w-3 mr-1" />
                    {uploadResult.detailedStats.brazilian} Brasileiros
                  </Badge>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    <MapPin className="h-3 w-3 mr-1" />
                    {uploadResult.detailedStats.international} Internacionais
                  </Badge>
                  <Badge variant="outline" className="text-purple-700 border-purple-300">
                    📱 {uploadResult.detailedStats.mobile} Celulares
                  </Badge>
                  <Badge variant="outline" className="text-gray-700 border-gray-300">
                    ☎️ {uploadResult.detailedStats.landline} Fixos
                  </Badge>
                </div>

                {/* Top Regiões (DDDs) */}
                {Object.keys(uploadResult.detailedStats.regions).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Principais Regiões (DDD):</p>
                    <div className="flex flex-wrap gap-1">
                      {formatPhoneRegions(uploadResult.detailedStats.regions).map(({ ddd, count }) => (
                        <Badge key={ddd} variant="secondary" className="text-xs">
                          {ddd}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Amostras de Números Inválidos */}
              {uploadResult.stats.invalidSamples.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                  <p className="text-xs font-medium text-yellow-800 mb-1">
                    Exemplos de números rejeitados:
                  </p>
                  <p className="text-xs text-yellow-700">
                    {uploadResult.stats.invalidSamples.slice(0, 3).join(', ')}
                    {uploadResult.stats.invalidSamples.length > 3 && '...'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={clearResults} variant="outline" size="sm">
                Novo Upload
              </Button>
              <Button 
                onClick={() => {
                  if (onUploadComplete) {
                    onUploadComplete(uploadResult.phones, uploadResult.stats);
                  }
                }}
                size="sm"
              >
                Usar Lista
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}