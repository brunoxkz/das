// Som de venda moderno 2025 - Geração via Web Audio API
class ModernSaleSound {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('🔊 Sistema de áudio moderno inicializado');
    } catch (error) {
      console.warn('❌ Erro ao inicializar áudio:', error);
    }
  }

  // Som de venda moderno - combinação de tons harmoniosos
  async playModernSaleSound() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Som principal - tom positivo ascendente (C5 -> E5 -> G5)
    this.createTone(523.25, currentTime, 0.15, 0.3); // C5
    this.createTone(659.25, currentTime + 0.1, 0.15, 0.25); // E5  
    this.createTone(783.99, currentTime + 0.2, 0.2, 0.4); // G5

    // Harmônico suave (oitava acima)
    this.createTone(1046.50, currentTime + 0.15, 0.1, 0.15); // C6
    
    // Bass suave para profundidade
    this.createTone(130.81, currentTime, 0.35, 0.1); // C3

    // Efeito sparkle final
    this.createSparkle(currentTime + 0.3);
  }

  createTone(frequency, startTime, duration, volume) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Waveform suave e moderno
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    // Filtro para suavizar
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, startTime);
    filter.Q.setValueAtTime(1, startTime);

    // Envelope ADSR suave
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, startTime + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  createSparkle(startTime) {
    // Efeito de "brilho" final com tons altos
    const frequencies = [1760, 2093, 2637]; // A6, C7, E7
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, startTime);
      
      const volume = 0.1;
      gainNode.gain.setValueAtTime(0, startTime + index * 0.02);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + index * 0.02 + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.02 + 0.08);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(startTime + index * 0.02);
      oscillator.stop(startTime + index * 0.02 + 0.08);
    });
  }

  // Som alternativo - mais sutil
  async playSubtlePing() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Tom suave único
    this.createTone(880, currentTime, 0.3, 0.2); // A5
    this.createTone(1320, currentTime + 0.05, 0.2, 0.1); // E6
  }

  // Som mais energético para vendas importantes
  async playEnergeticSuccess() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Sequência ascendente energética
    const melody = [392, 440, 494, 523, 587, 659, 698]; // G4 -> F5
    
    melody.forEach((freq, index) => {
      this.createTone(freq, currentTime + index * 0.08, 0.12, 0.25);
    });

    // Acorde final
    setTimeout(() => {
      this.createTone(784, currentTime + 0.6, 0.4, 0.3); // G5
      this.createTone(988, currentTime + 0.6, 0.4, 0.2); // B5
      this.createTone(1175, currentTime + 0.6, 0.4, 0.15); // D6
    }, 600);
  }
}

// Classe disponível globalmente
window.ModernSaleSound = ModernSaleSound;

// Instância global
window.modernSaleSound = new ModernSaleSound();

// Função helper para uso fácil
window.playNotificationSound = async (type = 'default') => {
  try {
    switch(type) {
      case 'sale':
        await window.modernSaleSound.playModernSaleSound();
        break;
      case 'subtle':
        await window.modernSaleSound.playSubtlePing();
        break;
      case 'energetic':
        await window.modernSaleSound.playEnergeticSuccess();
        break;
      default:
        await window.modernSaleSound.playModernSaleSound();
    }
    console.log('🔊 Som de notificação reproduzido:', type);
  } catch (error) {
    console.warn('❌ Erro ao reproduzir som:', error);
  }
};