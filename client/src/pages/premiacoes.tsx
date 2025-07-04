import { Trophy, TrendingUp, TrendingDown, Crown, Medal, Award } from "lucide-react";
import { StatsCard } from "@/components/stats-card";

// Dados fake das premiações
const topVendedores = [
  {
    id: 1,
    nome: "Marina Santos",
    vendas: 287,
    premio: 15000,
    posicao: 1,
    grafico: [45, 52, 48, 61, 55, 67, 73, 78, 82, 89, 94, 98, 102, 108, 115], // Últimos 15 dias
    tendencia: "up",
    avatar: "MS"
  },
  {
    id: 2,
    nome: "Carlos Oliveira",
    vendas: 264,
    premio: 12000,
    posicao: 2,
    grafico: [38, 42, 39, 45, 48, 52, 55, 58, 61, 64, 67, 70, 73, 76, 79],
    tendencia: "up",
    avatar: "CO"
  },
  {
    id: 3,
    nome: "Ana Paula Lima",
    vendas: 241,
    premio: 10000,
    posicao: 3,
    grafico: [32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65, 68, 71, 74],
    tendencia: "up",
    avatar: "AL"
  },
  {
    id: 4,
    nome: "Roberto Silva",
    vendas: 218,
    premio: 8500,
    posicao: 4,
    grafico: [28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70],
    tendencia: "up",
    avatar: "RS"
  },
  {
    id: 5,
    nome: "Juliana Costa",
    vendas: 195,
    premio: 7000,
    posicao: 5,
    grafico: [25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64, 67],
    tendencia: "up",
    avatar: "JC"
  },
  {
    id: 6,
    nome: "Fernando Alves",
    vendas: 172,
    premio: 6000,
    posicao: 6,
    grafico: [22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64],
    tendencia: "up",
    avatar: "FA"
  },
  {
    id: 7,
    nome: "Camila Rodrigues",
    vendas: 149,
    premio: 5000,
    posicao: 7,
    grafico: [19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61],
    tendencia: "up",
    avatar: "CR"
  },
  {
    id: 8,
    nome: "Diego Pereira",
    vendas: 126,
    premio: 4000,
    posicao: 8,
    grafico: [16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58],
    tendencia: "up",
    avatar: "DP"
  },
  {
    id: 9,
    nome: "Larissa Martins",
    vendas: 103,
    premio: 3000,
    posicao: 9,
    grafico: [13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55],
    tendencia: "up",
    avatar: "LM"
  }
];

const MiniGrafico = ({ dados, tendencia }: { dados: number[]; tendencia: string }) => {
  const max = Math.max(...dados);
  const min = Math.min(...dados);
  const range = max - min;
  
  const pontos = dados.map((valor, index) => {
    const x = (index / (dados.length - 1)) * 100;
    const y = 100 - ((valor - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-20 h-8 relative">
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
        <polyline
          points={pontos}
          fill="none"
          stroke={tendencia === "up" ? "#10B981" : "#EF4444"}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  );
};

const getIconePosicao = (posicao: number) => {
  switch (posicao) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return <Trophy className="w-6 h-6 text-gray-600" />;
  }
};

export default function Premiacoes() {
  const totalPremios = topVendedores.reduce((sum, vendedor) => sum + vendedor.premio, 0);
  const totalVendas = topVendedores.reduce((sum, vendedor) => sum + vendedor.vendas, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏆 Premiações de Julho</h1>
          <p className="text-gray-600 mt-1">
            Ranking dos top vendedores do mês com premiações em dinheiro
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total em premiações</div>
          <div className="text-2xl font-bold text-green-600">
            R$ {totalPremios.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total de Vendas"
          value={totalVendas}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-blue-500"
          description="Vendas realizadas no mês"
        />
        <StatsCard
          title="Premiações Distribuídas"
          value={`R$ ${totalPremios.toLocaleString('pt-BR')}`}
          icon={<Trophy className="w-5 h-5" />}
          color="bg-green-500"
          description="Valor total em prêmios"
        />
        <StatsCard
          title="Vendedores Premiados"
          value={9}
          icon={<Crown className="w-5 h-5" />}
          color="bg-yellow-500"
          description="Top 9 do ranking"
        />
      </div>

      {/* Ranking dos vendedores */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">🥇 Ranking de Vendedores</h2>
          <p className="text-gray-600 text-sm mt-1">
            Top 9 vendedores de julho com gráfico de performance dos últimos 15 dias
          </p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {topVendedores.map((vendedor, index) => (
            <div 
              key={vendedor.id} 
              className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {getIconePosicao(vendedor.posicao)}
                  <div className="text-lg font-bold text-gray-900 min-w-[2rem]">
                    #{vendedor.posicao}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {vendedor.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{vendedor.nome}</div>
                    <div className="text-sm text-gray-500">{vendedor.vendas} vendas</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Últimos 15 dias</div>
                  <div className="flex items-center space-x-2">
                    <MiniGrafico dados={vendedor.grafico} tendencia={vendedor.tendencia} />
                    {vendedor.tendencia === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500">Premiação</div>
                  <div className="text-xl font-bold text-green-600">
                    R$ {vendedor.premio.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <Trophy className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">Critérios de Premiação</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <strong>• Período:</strong> 1º a 31 de julho de 2025
          </div>
          <div>
            <strong>• Critério:</strong> Número total de vendas realizadas
          </div>
          <div>
            <strong>• Premiação:</strong> Valores decrescentes de R$ 15.000 a R$ 3.000
          </div>
          <div>
            <strong>• Pagamento:</strong> Até o 5º dia útil do mês seguinte
          </div>
        </div>
      </div>
    </div>
  );
}