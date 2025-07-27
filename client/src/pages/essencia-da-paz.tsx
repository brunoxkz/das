import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, ThumbsUp, ThumbsDown, Share2, MoreHorizontal } from 'lucide-react';

export default function EssenciaDaPaz() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [viewerCount, setViewerCount] = useState(54994);
  const [comments, setComments] = useState<Array<{
    id: string;
    name: string;
    avatar: string;
    message: string;
    time: number;
    visible: boolean;
  }>>([]);

  // Lista de comentários automáticos com timing exato (mesmo do site original)
  const autoComments = [
    { id: '1', name: 'Maria Silva', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face', message: 'Que benção essa oração! 🙏', time: 15 },
    { id: '2', name: 'João Santos', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', message: 'Padre Fernando é incrível! Sempre nos ensinando', time: 32 },
    { id: '3', name: 'Ana Costa', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', message: 'Santo Antônio interceda por nós! ✨', time: 48 },
    { id: '4', name: 'Carlos Oliveira', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', message: 'Essa oração realmente funciona, já recebi 3 milagres!', time: 65 },
    { id: '5', name: 'Fernanda Lima', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face', message: 'Amém! Que o Senhor nos abençoe 🕊️', time: 83 },
    { id: '6', name: 'Roberto Pereira', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', message: 'Padre, o senhor é uma bênção para todos nós', time: 102 },
    { id: '7', name: 'Juliana Ferreira', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face', message: 'Que emoção! Estou chorando aqui 😭❤️', time: 125 },
    { id: '8', name: 'Pedro Almeida', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=40&h=40&fit=crop&crop=face', message: 'Santo Antônio é muito poderoso mesmo!', time: 148 },
    { id: '9', name: 'Luciana Rodrigues', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=40&h=40&fit=crop&crop=face', message: 'Já compartilhei com toda minha família 🙏', time: 170 },
    { id: '10', name: 'Marcos Souza', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=40&h=40&fit=crop&crop=face', message: 'Que live maravilhosa! Deus abençoe Padre Fernando', time: 195 },
  ];

  // Atualizar contador de visualizações
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sistema de comentários automáticos
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        
        // Verificar se algum comentário deve aparecer
        autoComments.forEach(comment => {
          if (comment.time === newTime) {
            setComments(prevComments => {
              const newComment = { ...comment, visible: true };
              const updatedComments = [newComment, ...prevComments.slice(0, 9)];
              return updatedComments;
            });
          }
        });

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header YouTube */}
      <header className="bg-[#212121] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <span className="text-xl font-bold">YouTube</span>
          </div>
        </div>
        <div className="flex-1 max-w-2xl mx-8">
          <div className="bg-[#121212] border border-[#303030] rounded-full px-4 py-2">
            <input 
              type="text" 
              placeholder="Pesquisar" 
              className="bg-transparent w-full outline-none text-white"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            {/* Player de Vídeo */}
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <div className="relative aspect-video">
                <img 
                  src="https://images.converteai.net/f901d856-8c9b-4e04-8c81-48e3fb975062/players/68719ec3237c355e66274510/thumbnail.jpg"
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
                
                {/* Controles do Player */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <button 
                    onClick={togglePlay}
                    className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </button>
                </div>

                {/* Barra de Progresso */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="bg-gray-600 h-1 rounded-full mb-2">
                    <div 
                      className="bg-red-600 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${(currentTime / 300) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span>{formatTime(currentTime)} / 5:00</span>
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <Maximize className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Vídeo */}
            <div className="mb-4">
              <h1 className="text-xl font-bold mb-3">
                Padre Fernando Lisboa | A oração de Santo Antônio escondida pela Maçonaria por mais de 800 anos que tem trazido milagres a mais de 59 mil pessoas | Live Ao Vivo às 21:50, 26/07/2025.
              </h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src="https://oracaosagrada.viveremharmonia.com/wp-content/uploads/2025/05/osa_foto_perfil_padre.webp"
                    alt="Fernando Lisboa"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">Fernando Lisboa</div>
                    <div className="text-sm text-gray-400">96 mil inscritos</div>
                  </div>
                  <button className="bg-red-600 px-4 py-2 rounded-full font-semibold hover:bg-red-700">
                    Inscrever-se
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 bg-[#272727] px-4 py-2 rounded-full hover:bg-[#3f3f3f]">
                    <ThumbsUp className="w-4 h-4" />
                    <span>2.1K</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-[#272727] px-4 py-2 rounded-full hover:bg-[#3f3f3f]">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                  <button className="flex items-center space-x-2 bg-[#272727] px-4 py-2 rounded-full hover:bg-[#3f3f3f]">
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </button>
                  <button className="bg-[#272727] p-2 rounded-full hover:bg-[#3f3f3f]">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-6 rounded-lg mb-6">
              <h2 className="text-2xl font-bold mb-3 text-center">
                🙏 Receba a Oração Sagrada de Santo Antônio
              </h2>
              <p className="text-center mb-4">
                A oração que mudou a vida de mais de 59 mil pessoas!
              </p>
              <div className="text-center">
                <a 
                  href="https://blog.infinitaprosperidade.com/click/1?sub16=ML14"
                  className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
                >
                  Quero a Oração Sagrada de Santo Antônio
                </a>
              </div>
            </div>
          </div>

          {/* Chat Ao Vivo */}
          <div className="lg:col-span-1">
            <div className="bg-[#212121] rounded-lg overflow-hidden">
              <div className="bg-[#272727] p-4 border-b border-[#3f3f3f]">
                <h3 className="font-semibold">Chat Ao Vivo</h3>
                <div className="text-sm text-gray-400 mt-1">
                  {viewerCount.toLocaleString()} assistindo agora
                </div>
              </div>

              {/* Emojis */}
              <div className="p-3 border-b border-[#3f3f3f]">
                <div className="flex space-x-2 text-xl">
                  {['😊', '😀', '😁', '😂', '😍', '😎', '🤔', '😜', '🙃'].map((emoji, index) => (
                    <button key={index} className="hover:scale-110 transition-transform">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Comentários */}
              <div className="h-96 overflow-y-auto p-3 space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 animate-fadeIn">
                    <img 
                      src={comment.avatar}
                      alt={comment.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-semibold text-blue-400">{comment.name}</span>
                        <span className="ml-2 text-gray-300">{comment.message}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de Comentário */}
              <div className="p-3 border-t border-[#3f3f3f]">
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    placeholder="Diga algo..."
                    className="flex-1 bg-[#121212] border border-[#3f3f3f] rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <button className="text-blue-500 font-semibold text-sm">
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}