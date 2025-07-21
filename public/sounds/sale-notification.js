// Som de venda moderno 2025 - Sistema Universal iOS/Android
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

  // Som energético para momentos de alta conversão
  async playEnergeticSuccess() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Sequência ascendente rápida e motivadora
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    notes.forEach((freq, index) => {
      this.createTone(freq, currentTime + (index * 0.08), 0.12, 0.4);
      this.createTone(freq * 2, currentTime + (index * 0.08), 0.06, 0.2); // Oitava
    });

    // Final explosivo
    this.createTone(1046.50, currentTime + 0.32, 0.3, 0.5); // C6
    this.createSparkle(currentTime + 0.4);
  }

  // NOVOS SONS PARA iOS E ANDROID - COMPATIBILIDADE UNIVERSAL
  
  // Som de notificação iPhone estilo iOS
  async playiOSNotification() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Tri-tone característico do iPhone (C6-D#6-G5)
    this.createTone(1046.50, currentTime, 0.15, 0.6); // C6
    this.createTone(1244.51, currentTime + 0.1, 0.15, 0.5); // D#6  
    this.createTone(783.99, currentTime + 0.2, 0.4, 0.4); // G5
  }

  // Som de WhatsApp/Telegram estilo
  async playMessengerPop() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Pop característico (E5 -> C5 rápido)
    this.createTone(659.25, currentTime, 0.08, 0.8); // E5
    this.createTone(523.25, currentTime + 0.06, 0.15, 0.6); // C5
    this.createSparkle(currentTime + 0.12);
  }

  // Som de cash register / dinheiro
  async playCashRegister() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Simulação de cash register
    this.createTone(880.00, currentTime, 0.05, 0.4); // A5 - "cha"
    this.createTone(1108.73, currentTime + 0.05, 0.05, 0.4); // C#6 - "ching"
    
    // Fundo harmônico rico
    this.createTone(440.00, currentTime, 0.2, 0.2); // A4
    this.createTone(659.25, currentTime + 0.1, 0.3, 0.3); // E5
  }

  // Som de slot machine / jackpot
  async playJackpot() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Sequência de jackpot ascendente
    const frequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
    
    frequencies.forEach((freq, index) => {
      this.createTone(freq, currentTime + (index * 0.04), 0.08, 0.5);
    });

    // Final grandioso
    this.createTone(1567.98, currentTime + 0.4, 0.4, 0.7); // G6
    this.createSparkle(currentTime + 0.5);
    this.createSparkle(currentTime + 0.6);
  }

  // Som de ding de elevador / atenção
  async playAttentionDing() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Ding duplo elegante
    this.createTone(1046.50, currentTime, 0.2, 0.6); // C6
    this.createTone(1318.51, currentTime + 0.15, 0.25, 0.5); // E6
    
    // Reverb simulado
    this.createTone(523.25, currentTime + 0.1, 0.4, 0.1); // C5 baixo
  }

  // Som de notificação Android estilo Material Design
  async playMaterialNotification() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Tom suave característico do Android
    this.createTone(587.33, currentTime, 0.12, 0.5); // D5
    this.createTone(698.46, currentTime + 0.08, 0.18, 0.4); // F5
    this.createTone(880.00, currentTime + 0.16, 0.25, 0.3); // A5
  }

  // Som de sucesso estilo video game
  async playGameSuccess() {
    await this.init();
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    
    // Sequência de video game clássica
    const melody = [
      { freq: 523.25, time: 0, duration: 0.1 }, // C5
      { freq: 659.25, time: 0.1, duration: 0.1 }, // E5
      { freq: 783.99, time: 0.2, duration: 0.1 }, // G5
      { freq: 1046.50, time: 0.3, duration: 0.2 } // C6
    ];
    
    melody.forEach(note => {
      this.createTone(note.freq, currentTime + note.time, note.duration, 0.6);
      this.createTone(note.freq * 2, currentTime + note.time, note.duration * 0.5, 0.2); // Harmônico
    });
  }
}

// Classe disponível globalmente
window.ModernSaleSound = ModernSaleSound;

// Instância global
window.modernSaleSound = new ModernSaleSound();

// Função helper expandida para uso fácil
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
      case 'ios':
        await window.modernSaleSound.playiOSNotification();
        break;
      case 'messenger':
        await window.modernSaleSound.playMessengerPop();
        break;
      case 'cash':
        await window.modernSaleSound.playCashRegister();
        break;
      case 'jackpot':
        await window.modernSaleSound.playJackpot();
        break;
      case 'ding':
        await window.modernSaleSound.playAttentionDing();
        break;
      case 'android':
        await window.modernSaleSound.playMaterialNotification();
        break;
      case 'game':
        await window.modernSaleSound.playGameSuccess();
        break;
      default:
        await window.modernSaleSound.playModernSaleSound();
    }
    console.log('🔊 Som de notificação reproduzido:', type);
  } catch (error) {
    console.warn('❌ Erro ao reproduzir som:', error);
  }
};